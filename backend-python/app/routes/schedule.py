from fastapi import APIRouter, Depends, status, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Any, Optional, List
from datetime import datetime, timedelta

from app.database.database import get_db
from app.database import models
from app.schemas.schedules_schema import ScheduleCreate 
from app.routes.schedule_instance_utils import (
    generate_30_days_instances, 
    sync_future_instances_on_update, 
    clean_future_instances_on_delete,
    reactivate_and_sync_future_instances
)

router = APIRouter(prefix="/api/schedules", tags=["Schedules"])

# --- UNIFIED RESPONSE SCHEMA 
class ApiResponse(BaseModel):
    success: bool  
    message: str
    data: Optional[Any] = None
    error: Optional[dict] = None


# ─── BUSINESS LOGIC HELPER ──────────────────────────────────────────────────
def validate_schedule_business_logic(
    db: Session, 
    current_route_id: int, 
    new_departure_time: str, 
    new_arrival_time: str,
    new_flight_type: str,
    companion_schedules: List[models.RouteSchedule]
) -> Optional[dict]:
    
    if not companion_schedules:
        return None  

    companion_schedule = companion_schedules[0]
    
    # Checko inbound/outbound
    if companion_schedule.flight_type.strip().upper() == new_flight_type.strip().upper():
        return {
            "code": "DUPLICATE_FLIGHT_TYPE",
            "details": f"Flight ID already has an '{companion_schedule.flight_type}' schedule. Each flight must have exactly one OUTBOUND and one INBOUND schedule."
        }
    
    # rule 1 : Inbound-Outbout city checking
    current_route = db.query(models.Route).filter(models.Route.route_id == current_route_id).first()
    companion_route = db.query(models.Route).filter(models.Route.route_id == companion_schedule.route_id).first()
    
    if not current_route or not companion_route:
        return {"code": "ROUTE_NOT_FOUND", "details": "Route data missing."}

    is_valid_return = (
        current_route.departure_city.strip().lower() == companion_route.arrival_city.strip().lower() and
        current_route.arrival_city.strip().lower() == companion_route.departure_city.strip().lower()
    )

    if not is_valid_return:
        return {
            "code": "INVALID_RETURN_ROUTE",
            "details": "Route conflict. Route must match the exact return route."
        }

    time_fmt = "%H:%M"
    display_fmt = "%I:%M %p"
    
    # rule 2: check time for (Inbound)
    if new_flight_type.strip().upper() == "INBOUND":
        first_arrival = datetime.strptime(companion_schedule.arrival_time, time_fmt)
        return_departure = datetime.strptime(new_departure_time, time_fmt)
        
        min_allowed_time_obj = first_arrival + timedelta(minutes=180)
        
        if return_departure < first_arrival:
            return {
                "code": "BACKWARD_TIME_ERROR",
                "details": f"The return flight departure ({return_departure.strftime(display_fmt)}) cannot be earlier than the first flight arrival ({first_arrival.strftime(display_fmt)}). The earliest available departure time is {min_allowed_time_obj.strftime(display_fmt)}."
            }
            
        time_difference = (return_departure - first_arrival).total_seconds() / 60
        if time_difference < 180:
            return {
                "code": "INSUFFICIENT_TURNAROUND_TIME",
                "details": f"The companion flight arrives at {first_arrival.strftime(display_fmt)}. The return flight must depart at least 3 hours (180 mins) later. Earliest available departure time is {min_allowed_time_obj.strftime(display_fmt)}."
            }
            
    # rule3: Checking time for (Outbound)
    else:
        first_arrival = datetime.strptime(new_arrival_time, time_fmt)
        return_departure = datetime.strptime(companion_schedule.departure_time, time_fmt)
        
        max_allowed_arrival_obj = return_departure - timedelta(minutes=180)
        
        if return_departure < first_arrival:
            return {
                "code": "FORWARD_TIME_ERROR",
                "details": f"The first flight arrival ({first_arrival.strftime(display_fmt)}) cannot be later than the return flight departure ({return_departure.strftime(display_fmt)}). Your flight must arrive by {max_allowed_arrival_obj.strftime(display_fmt)}."
            }
            
        time_difference = (return_departure - first_arrival).total_seconds() / 60
        
        if time_difference < 180:
            return {
                "code": "INSUFFICIENT_TURNAROUND_TIME",
                "details": f"Insufficient turnaround time. The inbound flight departs at {return_departure.strftime(display_fmt)}. "
                           f"If this outbound flight arrives at {first_arrival.strftime(display_fmt)}, the aircraft will only have {int(time_difference)} minutes to rest. "
                           f"The outbound flight must arrive by {max_allowed_arrival_obj.strftime(display_fmt)} to ensure a 3-hour breakdown."
            }

    return None


# ─── 1. READ ALL SCHEDULES API (With Metrics & Pagination) ───────────────────
@router.get("", response_model=ApiResponse)
def get_schedules(
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = Query(None),
    route_id: Optional[int] = Query(None),
    flight_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        # Active Schedule query filtering
        base_query = db.query(models.RouteSchedule).options(
            joinedload(models.RouteSchedule.route),
            joinedload(models.RouteSchedule.flight).joinedload(models.Flight.airline)
        ).filter(models.RouteSchedule.is_deleted == 0)

        if route_id:
            base_query = base_query.filter(models.RouteSchedule.route_id == route_id)

        #  Flight Type Filter (INBOUND / OUTBOUND)
        if flight_type:
            base_query = base_query.filter(
                func.upper(models.RouteSchedule.flight_type) == flight_type.strip().upper()
            )

        if search:
            search_filter = f"%{search.strip().lower()}%"
            base_query = base_query.join(models.RouteSchedule.flight).filter(
                func.lower(models.Flight.flight_no).like(search_filter)
            )

        # Metric Calculations
        total_active_schedules = db.query(models.RouteSchedule).filter(models.RouteSchedule.is_deleted == 0).count()
        total_outbound = db.query(models.RouteSchedule).filter(models.RouteSchedule.is_deleted == 0, func.upper(models.RouteSchedule.flight_type) == "OUTBOUND").count()
        total_inbound = db.query(models.RouteSchedule).filter(models.RouteSchedule.is_deleted == 0, func.upper(models.RouteSchedule.flight_type) == "INBOUND").count()

        # Pagination & Query execution
        filtered_total = base_query.count()
        raw_schedules = base_query.offset(skip).limit(limit).all()

        # Data Mapping 
        formatted_schedules = []
        for s in raw_schedules:
            formatted_schedules.append({
                "schedule_id": s.schedule_id,
                "flight_id": s.flight_id,
                "flight_no": s.flight.flight_no if s.flight else "-",
                "airline_name": s.flight.airline.airline_name if s.flight and s.flight.airline else "-",
                "route_id": s.route_id,
                "route_details": f"{s.route.departure_city} ➔ {s.route.arrival_city}" if s.route else "-",
                "departure_time": s.departure_time,
                "arrival_time": s.arrival_time,
                "flight_type": s.flight_type,
                "economy_price": s.economy_price,
                "business_price": s.business_price
            })

        return {
            "success": True,
            "message": "Schedules fetched successfully",
            "data": {
                "metrics": {
                    "total_schedules": total_active_schedules,
                    "total_outbound": total_outbound,
                    "total_inbound": total_inbound
                },
                "schedules": formatted_schedules,
                "pagination": {
                    "total": filtered_total,
                    "skip": skip,
                    "limit": limit
                }
            },
            "error": None
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Failed to fetch schedules",
            "data": None,
            "error": {"code": "SERVER_ERROR", "details": str(e)}
        }


# ─── 2. RETRIEVE SINGLE SCHEDULE (DETAIL VIEW) ───────────────────────────────
@router.get("/{id}", response_model=ApiResponse)
def get_schedule_by_id(id: int, db: Session = Depends(get_db)):
    try:
        schedule = db.query(models.RouteSchedule).options(
            joinedload(models.RouteSchedule.route),
            joinedload(models.RouteSchedule.flight).joinedload(models.Flight.airline)
        ).filter(
            models.RouteSchedule.schedule_id == id, 
            models.RouteSchedule.is_deleted == 0
        ).first()

        if not schedule:
            return {
                "success": False,
                "message": "Schedule not found",
                "data": None,
                "error": {"code": "SCHEDULE_NOT_FOUND", "details": f"Active schedule with ID {id} does not exist."}
            }

        formatted_schedule = {
            "schedule_id": schedule.schedule_id,
            "flight_id": schedule.flight_id,
            "flight_no": schedule.flight.flight_no if schedule.flight else "-",
            "airline_name": schedule.flight.airline.airline_name if schedule.flight and schedule.flight.airline else "-",
            "route_id": schedule.route_id,
            "departure_city": schedule.route.departure_city if schedule.route else "-",
            "arrival_city": schedule.route.arrival_city if schedule.route else "-",
            "departure_time": schedule.departure_time,
            "arrival_time": schedule.arrival_time,
            "flight_type": schedule.flight_type,
            "economy_price": schedule.economy_price,
            "business_price": schedule.business_price
        }

        return {
            "success": True,
            "message": "Schedule detail fetched successfully",
            "data": formatted_schedule,
            "error": None
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Failed to fetch schedule detail",
            "data": None,
            "error": {"code": "SERVER_ERROR", "details": str(e)}
        }


# ─── 3. CREATE ROUTE SCHEDULE (REACTIVE VERSION) ────────────────────────────
@router.post("", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
def create_schedule(data: ScheduleCreate, db: Session = Depends(get_db)):
    try:
        if not db.query(models.Route).filter(models.Route.route_id == data.route_id, models.Route.is_deleted == 0).first():
            return {"success": False, "message": "Invalid route_id", "data": None, "error": {"code": "ROUTE_NOT_FOUND", "details": "Route does not exist."}}
        if not db.query(models.Flight).filter(models.Flight.flight_id == data.flight_id, models.Flight.is_deleted == 0).first():
            return {"success": False, "message": "Invalid flight_id", "data": None, "error": {"code": "FLIGHT_NOT_FOUND", "details": "Flight does not exist."}}

        all_history_schedules = db.query(models.RouteSchedule).filter(models.RouteSchedule.flight_id == data.flight_id).all()
        active_schedules = [s for s in all_history_schedules if s.is_deleted == 0]
        deleted_schedules = [s for s in all_history_schedules if s.is_deleted == 1]

        if len(active_schedules) >= 2:
            return {
                "success": False, 
                "message": "Schedule limitation exceeded", 
                "data": None, 
                "error": {"code": "SCHEDULE_LIMIT_REACHED", "details": f"Flight ID {data.flight_id} already has 2 active schedules."}
            }

        existing_deleted_match = None
        for ds in deleted_schedules:
            if ds.flight_type.strip().upper() == data.flight_type.strip().upper():
                existing_deleted_match = ds
                break

        # Case A: Reactive Restore 
        if existing_deleted_match:
            business_error = validate_schedule_business_logic(
                db, data.route_id, data.departure_time, data.arrival_time, data.flight_type, active_schedules
            )
            if business_error:
                return {"success": False, "message": "Validation failed for restore", "data": None, "error": business_error}

            existing_deleted_match.route_id = data.route_id
            existing_deleted_match.departure_time = data.departure_time.strip()
            existing_deleted_match.arrival_time = data.arrival_time.strip()
            existing_deleted_match.economy_price = data.economy_price
            existing_deleted_match.business_price = data.business_price
            existing_deleted_match.is_deleted = 0

            reactivate_and_sync_future_instances(db,existing_deleted_match)

            db.commit()
            db.refresh(existing_deleted_match)

            return {
                "success": True, 
                "message": "Existing deleted schedule restored and updated successfully", 
                "data": {"schedule_id": existing_deleted_match.schedule_id, "flight_type": existing_deleted_match.flight_type}, 
                "error": None
            }

        # Case B: Create New Schedule
        else:
            business_error = validate_schedule_business_logic(
                db, data.route_id, data.departure_time, data.arrival_time, data.flight_type, active_schedules
            )
            if business_error:
                return {"success": False, "message": "Validation failed", "data": None, "error": business_error}

            new_schedule = models.RouteSchedule(**data.model_dump())
            db.add(new_schedule)

            #🛠️ ADDED: Flush to generate the schedule_id from DB before passing to utility
            db.flush() 

            # 🛠️ ADDED: Generate 30 days instances for the newly created schedule
            generate_30_days_instances(db, new_schedule)

            db.commit()
            db.refresh(new_schedule)

            return {
                "success": True, 
                "message": "Route schedule created successfully", 
                "data": {"schedule_id": new_schedule.schedule_id, "flight_type": new_schedule.flight_type}, 
                "error": None
            }

    except Exception as e:
        return {"success": False, "message": "Failed to create schedule", "data": None, "error": {"code": "SERVER_ERROR", "details": str(e)}}


# ─── 4. UPDATE ROUTE SCHEDULE (PUT) ──────────────────────────────────────────
@router.put("/{id}", response_model=ApiResponse)
def update_schedule(id: int, data: ScheduleCreate, db: Session = Depends(get_db)):
    try:
        schedule = db.query(models.RouteSchedule).filter(models.RouteSchedule.schedule_id == id, models.RouteSchedule.is_deleted == 0).first()
        if not schedule:
            return {"success": False, "message": "Schedule not found", "data": None, "error": {"code": "SCHEDULE_NOT_FOUND", "details": f"Active schedule with ID {id} does not exist."}}

        if not db.query(models.Route).filter(models.Route.route_id == data.route_id, models.Route.is_deleted == 0).first() or not db.query(models.Flight).filter(models.Flight.flight_id == data.flight_id, models.Flight.is_deleted == 0).first():
            return {"success": False, "message": "Invalid route_id or flight_id", "data": None, "error": {"code": "VALIDATION_ERROR", "details": "Target route or flight does not exist."}}

        # Check other schedules for the same flight_id, excluding the current schedule being updated
        other_schedules = db.query(models.RouteSchedule).filter(
            models.RouteSchedule.flight_id == data.flight_id, 
            models.RouteSchedule.is_deleted == 0, 
            models.RouteSchedule.schedule_id != id
        ).all()

        if len(other_schedules) >= 2:
            return {"success": False, "message": "Update failed", "data": None, "error": {"code": "SCHEDULE_LIMIT_REACHED", "details": f"Target Flight ID {data.flight_id} already has 2 active schedules."}}

        # Logic Gap Fix: if no other schedules found, check for potential companion schedule based on route matching
        if not other_schedules:
            current_route = db.query(models.Route).filter(models.Route.route_id == data.route_id).first()
            potential_companion = db.query(models.RouteSchedule).join(models.RouteSchedule.route).filter(
                models.RouteSchedule.is_deleted == 0,
                models.RouteSchedule.schedule_id != id,
                models.RouteSchedule.flight_id == data.flight_id, # for the same flight_id
                func.lower(models.Route.departure_city) == func.lower(current_route.arrival_city),
                func.lower(models.Route.arrival_city) == func.lower(current_route.departure_city)
            ).first()
            if potential_companion:
                other_schedules = [potential_companion]

        # check business logic validation with the other schedules 
        business_error = validate_schedule_business_logic(
            db, data.route_id, data.departure_time, data.arrival_time, data.flight_type, other_schedules
        )
        if business_error:
            return {"success": False, "message": "Update validation failed", "data": None, "error": business_error}

        # Data Save
        schedule.route_id = data.route_id
        schedule.flight_id = data.flight_id
        schedule.flight_type = data.flight_type.strip().upper()
        schedule.departure_time = data.departure_time.strip()
        schedule.arrival_time = data.arrival_time.strip()
        schedule.economy_price = data.economy_price
        schedule.business_price = data.business_price

        sync_future_instances_on_update(db, id, schedule)

        db.commit()
        db.refresh(schedule)

        return {
            "success": True, 
            "message": "Schedule updated successfully", 
            "data": {"schedule_id": schedule.schedule_id, "flight_type": schedule.flight_type}, 
            "error": None
        }

    except Exception as e:
        return {"success": False, "message": "Failed to update schedule", "data": None, "error": {"code": "SERVER_ERROR", "details": str(e)}}
    
# ─── 5. DELETE ROUTE SCHEDULE (SOFT DELETE) ──────────────────────────────────
@router.delete("/{id}", response_model=ApiResponse)
def delete_schedule(id: int, db: Session = Depends(get_db)):
    try:
        schedule = db.query(models.RouteSchedule).filter(models.RouteSchedule.schedule_id == id, models.RouteSchedule.is_deleted == 0).first()

        if not schedule:
            return {
                "success": False,
                "message": "Schedule not found",
                "data": None,
                "error": {"code": "SCHEDULE_NOT_FOUND", "details": f"Active schedule with ID {id} does not exist or has already been deleted."}
            }
        
        tomorrow = datetime.now() + timedelta(days=1)
        extended_future_dates = [(tomorrow + timedelta(days=i)).strftime("%d/%m/%Y") for i in range(90)]

        has_active_bookings = db.query(models.FlightInstance).filter(
            models.FlightInstance.schedule_id == id,
            models.FlightInstance.flight_date.in_(extended_future_dates),
            models.FlightInstance.is_deleted == 0,
            (models.FlightInstance.economy_seats_occupied > 0) | (models.FlightInstance.business_seats_occupied > 0)
        ).first()

        if has_active_bookings:
            return {
                "success": False,
                "message": "Cannot delete schedule",
                "data": None,
                "error": {
                    "code": "ACTIVE_BOOKINGS_EXIST",
                    "details": f"This schedule has active passenger bookings in upcoming flights (e.g., on {has_active_bookings.flight_date}). Please manage or refund passengers before deleting."
                }
            }
        
        schedule.is_deleted = 1
        clean_future_instances_on_delete(db, id)
        db.commit()

        return {"success": True, "message": "Schedule deleted successfully", "data": None, "error": None}

    except Exception as e:
        return {"success": False, "message": "Failed to delete schedule", "data": None, "error": {"code": "SERVER_ERROR", "details": str(e)}}