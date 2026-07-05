from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Any, Optional, List
from datetime import datetime, timedelta

from app.database.database import get_db
from app.database import models

router = APIRouter(prefix="/api/schedule-instances", tags=["Schedule Instances"])
from app.schemas.schedules_instance_schema import InstanceUpdate, ApiResponse


# ─── 1. READ ALL SCHEDULE INSTANCES WITH METRICS ─────────────────────────────

"""
Endpoint: GET /api/schedule-instances
Description:
    Fetches a list of flight instances filtered by operational query criteria 
    such as date ranges, statuses, specific routes, or textual search query parameters.
    The business logic handles string-to-datetime parsing securely in memory to counter
    SQL string comparison flaws. It computes operational performance metrics 
    (total scheduled, departed, cancelled) based specifically on the dynamically selected 
    date constraints, followed by strict memory pagination for secure structural output.
    Additionally, it screens out faulty override promotional prices (e.g., zero prices), 
    falling back securely to master base prices.
"""
@router.get("", response_model=ApiResponse)
def get_schedule_instances(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by Flight No or Airline Name"),
    route_id: Optional[int] = Query(None, description="Filter by exact Route ID"),
    status: Optional[str] = Query(None, description="Filter by Instance Status (e.g., SCHEDULED)"),
    from_date: Optional[str] = Query(None, description="Start date (DD/MM/YYYY). Defaults to TODAY."),
    to_date: Optional[str] = Query(None, description="End date (DD/MM/YYYY). Defaults to TODAY."),
    db: Session = Depends(get_db)
):
    try:
        # Helper function for safe float conversion
        def to_float(val, fallback):
            try:
                if val is not None and float(val) > 0:
                    return float(val)
            except (ValueError, TypeError):
                pass
            return float(fallback) if fallback is not None else 0.0

        # Base query fetching active instances
        base_query = db.query(models.FlightInstance).options(
            joinedload(models.FlightInstance.schedule).joinedload(models.RouteSchedule.route),
            joinedload(models.FlightInstance.schedule).joinedload(models.RouteSchedule.flight).joinedload(models.Flight.airline)
        ).filter(models.FlightInstance.is_deleted == 0)

        # 1. Filters
        if route_id:
            base_query = base_query.join(models.FlightInstance.schedule).filter(models.RouteSchedule.route_id == route_id)

        if status:
            base_query = base_query.filter(func.upper(models.FlightInstance.status) == status.strip().upper())

        if search:
            search_param = f"%{search.strip().lower()}%"
            base_query = base_query.join(models.FlightInstance.schedule)\
                                   .join(models.RouteSchedule.flight)\
                                   .join(models.Flight.airline)\
                                   .filter(
                (func.lower(models.Flight.flight_no).like(search_param)) |
                (func.lower(models.Airline.airline_name).like(search_param))
            )

        all_matches = base_query.all()

        # 2. Date Filtering
        today_str = datetime.now().strftime("%d/%m/%Y")
        start_date_obj = datetime.strptime(from_date.strip() if from_date else today_str, "%d/%m/%Y")
        end_date_obj = datetime.strptime(to_date.strip() if to_date else today_str, "%d/%m/%Y")

        filtered_instances = []
        metric_scheduled = metric_departed = metric_cancelled = 0

        for inst in all_matches:
            inst_date_obj = datetime.strptime(inst.flight_date, "%d/%m/%Y")
            if start_date_obj <= inst_date_obj <= end_date_obj:
                filtered_instances.append(inst)
                s = (inst.status or "SCHEDULED").upper()
                if s == "SCHEDULED": metric_scheduled += 1
                elif s == "DEPARTED": metric_departed += 1
                elif s == "CANCELLED": metric_cancelled += 1

        # 3. Pagination
        paginated_instances = filtered_instances[skip : skip + limit]

        # 4. Data Mapping
        formatted_instances = []
        for inst in paginated_instances:
            sch = inst.schedule
            formatted_instances.append({
                "instance_id": inst.instance_id,
                "schedule_id": inst.schedule_id,
                "flight_no": sch.flight.flight_no if sch and sch.flight else "-",
                "airline_name": sch.flight.airline.airline_name if sch and sch.flight and sch.flight.airline else "-",
                "route_id": sch.route_id if sch else None,
                "route_details": f"{sch.route.departure_city} ➔ {sch.route.arrival_city}" if sch and sch.route else "-",
                "flight_date": inst.flight_date,
                "departure_time": inst.base_departure_time,
                "arrival_time": inst.base_arrival_time,
                "status": inst.status or "SCHEDULED",
                "economy_seats_occupied": inst.economy_seats_occupied,
                "business_seats_occupied": inst.business_seats_occupied,
                "economy_price": to_float(inst.override_economy_price, inst.base_economy_price),
                "business_price": to_float(inst.override_business_price, inst.base_business_price)
            })

        return {
            "success": True,
            "message": "Flight instances fetched successfully",
            "data": {
                "metrics": {
                    "total_instances": len(filtered_instances),
                    "total_scheduled": metric_scheduled,
                    "total_departed": metric_departed,
                    "total_cancelled": metric_cancelled
                },
                "instances": formatted_instances,
                "pagination": {"total": len(filtered_instances), "skip": skip, "limit": limit}
            },
            "error": None
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Failed to fetch flight instances",
            "data": None,
            "error": {"code": "SERVER_ERROR", "details": str(e)}
        }
# ─── 2. RETRIEVE SINGLE INSTANCE DETAIL ──────────────────────────────────────

"""
Endpoint: GET /api/schedule-instances/{id}
Description:
    Extracts individual, deeply relational elements belonging to a specific Flight Instance.
    This acts as a dedicated micro-view needed for detailed administrative review windows. 
    Additionally, it filters dynamic promotions to avoid critical zero pricing flaws.
"""
@router.get("/{id}", response_model=ApiResponse)
def get_schedule_instance_by_id(id: int, db: Session = Depends(get_db)):
    try:
        inst = db.query(models.FlightInstance).options(
            joinedload(models.FlightInstance.schedule).joinedload(models.RouteSchedule.route),
            joinedload(models.FlightInstance.schedule).joinedload(models.RouteSchedule.flight).joinedload(models.Flight.airline)
        ).filter(models.FlightInstance.instance_id == id, models.FlightInstance.is_deleted == 0).first()

        if not inst:
            return {
                "success": False,
                "message": "Flight instance not found",
                "data": None,
                "error": {"code": "INSTANCE_NOT_FOUND", "details": f"Active instance with ID {id} does not exist."}
            }

        sch = inst.schedule

        # 💰 SAFE PRICING LOGIC: Fallback to base price if override is 0 or None
        final_economy_price = (
            inst.override_economy_price 
            if (inst.override_economy_price is not None and inst.override_economy_price > 0) 
            else inst.base_economy_price
        )
        final_business_price = (
            inst.override_business_price 
            if (inst.override_business_price is not None and inst.override_business_price > 0) 
            else inst.base_business_price
        )

        formatted_detail = {
            "instance_id": inst.instance_id,
            "schedule_id": inst.schedule_id,
            "flight_no": sch.flight.flight_no if sch and sch.flight else "-",
            "airline_name": sch.flight.airline.airline_name if sch and sch.flight and sch.flight.airline else "-",
            "route_details": f"{sch.route.departure_city} ➔ {sch.route.arrival_city}" if sch and sch.route else "-",
            "flight_date": inst.flight_date,
            "departure_time": inst.base_departure_time,
            "arrival_time": inst.base_arrival_time,
            "status": inst.status,
            "economy_seats_occupied": inst.economy_seats_occupied,
            "business_seats_occupied": inst.business_seats_occupied,
            "economy_price": final_economy_price,
            "business_price": final_business_price,
            "passengers": []  
        }

        return {
            "success": True, 
            "message": "Instance detail fetched successfully", 
            "data": formatted_detail, 
            "error": None
        }

    except Exception as e:
        return {
            "success": False, 
            "message": "Failed to fetch instance detail", 
            "data": None, 
            "error": {"code": "SERVER_ERROR", "details": str(e)}
        }
    
# ─── 3. UPDATE INSTANCE WITH BUSINESS INTEGRITY RULES ───────────────────────

"""
Endpoint: PUT /api/schedule-instances/{id}
Description:
    Updates pricing modifiers or structural status settings of an active instance under strict constraints.
    It executes a 2-Hour Operational Lock by evaluating system times against departure points, 
    protecting historical datasets and preventing live transaction synchronization failures. 
    Additionally, it runs an active occupant block constraint; if a flight has one or more seats 
    occupied, it completely denies manual cancellations until formal refund workflows are built, 
    thereby preserving relational and operational data integrity.
"""
@router.put("/{id}", response_model=ApiResponse)
def update_schedule_instance(id: int, data: InstanceUpdate, db: Session = Depends(get_db)):
    try:
        # Extract target instance from relational tables
        inst = db.query(models.FlightInstance).filter(
            models.FlightInstance.instance_id == id, 
            models.FlightInstance.is_deleted == 0
        ).first()
        
        if not inst:
            return {
                "success": False, 
                "message": "Instance not found", 
                "data": None, 
                "error": {"code": "INSTANCE_NOT_FOUND", "details": "Target instance does not exist."}
            }

        # RULE 1: Time-Based Departure and Operational Lock Check
        try:
            departure_datetime_str = f"{inst.flight_date} {inst.base_departure_time.strip()}"
            departure_datetime_obj = datetime.strptime(departure_datetime_str, "%d/%m/%Y %H:%M")
        except ValueError:
            return {
                "success": False,
                "message": "Data anomaly detected",
                "data": None,
                "error": {"code": "INVALID_DATETIME_FORMAT", "details": "Instance date or time format is corrupted in DB."}
            }

        # Enforce Real-World Industry Standard 2-Hour Buffer Window
        lock_time_obj = departure_datetime_obj - timedelta(hours=2)
        current_datetime = datetime.now()

        # Block updates if the lock window is active or if flight has already departed
        if current_datetime >= lock_time_obj or inst.status.strip().upper() == "DEPARTED":
            display_lock_time = lock_time_obj.strftime("%I:%M %p")
            return {
                "success": False,
                "message": "Update rejected (Operational Lock Active)",
                "data": None,
                "error": {
                    "code": "FLIGHT_LOCKED_FOR_OPERATIONS",
                    "details": f"This flight is locked for operations. Manual changes are strictly prohibited within 2 hours of departure. "
                               f"Operational lock for this flight started at {display_lock_time}."
                }
            }

        # RULE 2: Status Transition Validation and Occupancy Checking
        if data.status:
            new_status = data.status.strip().upper()
            if new_status not in ["CANCELLED", "SCHEDULED"]:
                return {
                    "success": False,
                    "message": "Invalid status transition",
                    "data": None,
                    "error": {
                        "code": "INVALID_STATUS",
                        "details": f"Admin can only transition status to 'CANCELLED' or 'SCHEDULED'. '{new_status}' is not allowed."
                    }
                }
            
            # Prevent flight cancellation if passengers have already secured booking seats
            if new_status == "CANCELLED":
                total_occupied_seats = inst.economy_seats_occupied + inst.business_seats_occupied
                if total_occupied_seats > 0:
                    return {
                        "success": False,
                        "message": "Cancellation rejected",
                        "data": None,
                        "error": {
                            "code": "ACTIVE_BOOKINGS_EXIST",
                            "details": f"Cannot cancel this flight because it already has {total_occupied_seats} active passenger booking(s). "
                                       f"Please clear bookings or handle passengers manually before setting to CANCELLED."
                        }
                    }
            inst.status = new_status

        #  RULE 3: Pricing Modification Restrictions
        # Prohibit manual price overrides if the flight has been designated as CANCELLED
        if inst.status.strip().upper() == "CANCELLED" and (data.override_economy_price or data.override_business_price):
             return {
                "success": False,
                "message": "Pricing update rejected",
                "data": None,
                "error": {"code": "FLIGHT_CANCELLED", "details": "Cannot update pricing for a cancelled flight."}
            }

        if data.override_economy_price is not None:
            inst.override_economy_price = data.override_economy_price

        if data.override_business_price is not None:
            inst.override_business_price = data.override_business_price


        # Transaction Commit and State Synchronization
        db.commit()
        db.refresh(inst)

        return {
            "success": True,
            "message": "Flight instance updated successfully",
            "data": {
                "instance_id": inst.instance_id, 
                "status": inst.status,
                "current_pricing": {
                    "economy": inst.override_economy_price if inst.override_economy_price is not None else inst.base_economy_price,
                    "business": inst.override_business_price if inst.override_business_price is not None else inst.base_business_price
                }
            },
            "error": None
        }

    except Exception as e:
        return {
            "success": False, 
            "message": "Failed to update instance", 
            "data": None, 
            "error": {"code": "SERVER_ERROR", "details": str(e)}
        }