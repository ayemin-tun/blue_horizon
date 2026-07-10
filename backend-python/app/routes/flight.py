from fastapi import APIRouter, Depends, status, Query
from sqlalchemy import func,desc
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database import models
from app.schemas.flights_schema import FlightCreate, ApiResponse
from typing import Optional

router = APIRouter(prefix="/api/flights", tags=["Flights"])

# ─── 1. CREATE OR REACTIVATE FLIGHT ─────────────────────────────────────────
@router.post("", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
def create_flight(data: FlightCreate, db: Session = Depends(get_db)):
    try:
        from app.schemas.flights_schema import FlightResponse
        
        # Check airline exist
        airline_exists = db.query(models.Airline).filter(models.Airline.airline_id == data.airline_id).first()
        if not airline_exists:
            return {
                "success": False,
                "message": "Invalid airline_id: airline does not exist.",
                "data": None,
                "error": {
                    "code": "AIRLINE_NOT_FOUND",
                    "details": f"Airline with ID {data.airline_id} does not exist."
                }
            }

        # Check flight is already exist or not (Case-insensitive using func.lower)
        existing_flight = db.query(models.Flight).filter(
            func.lower(models.Flight.flight_no) == func.lower(data.flight_no)
        ).first()

        if existing_flight:
            if existing_flight.is_deleted:
                # If soft-deleted, reactivate with updated parameters and capital flight_no
                existing_flight.is_deleted = False
                existing_flight.airline_id = data.airline_id
                existing_flight.flight_no = data.flight_no.strip().upper()  #store on uppercase
                existing_flight.total_seats = data.total_seats
                
                db.commit()
                db.refresh(existing_flight)
                
                return {
                    "success": True,
                    "message": "Flight re-activated and updated successfully",
                    "data": FlightResponse.model_validate(existing_flight).model_dump(),
                    "error": None
                }
                
            return {
                "success": False,
                "message": "Flight registration failed",
                "data": None,
                "error": {
                    "code": "FLIGHT_ALREADY_EXISTS",
                    "details": f"Flight number '{data.flight_no}' is already registered and active."
                }
            }

        # Create New Flight with capitalized flight_no
        flight_data = data.model_dump()
        flight_data["flight_no"] = flight_data["flight_no"].strip().upper()  #id store on upper case

        new_flight = models.Flight(**flight_data)
        db.add(new_flight)
        db.commit()
        db.refresh(new_flight)
        
        return {
            "success": True,
            "message": "Flight created successfully",
            "data": FlightResponse.model_validate(new_flight).model_dump(),
            "error": None
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Failed to create flight",
            "data": None,
            "error": {
                "code": "SERVER_ERROR",
                "details": str(e)
            }
        }
    
# ─── 2. READ ALL FLIGHTS (WITH PAGINATION & METRICS) ────────────────────────
@router.get("", response_model=ApiResponse)
def get_flights(
    skip: int = 0, 
    limit: int = 5, 
    search: Optional[str] = Query(None), 
    db: Session = Depends(get_db)
):
    try:
        base_query = db.query(models.Flight).filter(models.Flight.is_deleted == False)
        
        metrics_total_flights = base_query.count()
        recent_flight_total = base_query.order_by(models.Flight.flight_id.desc()).limit(5).count()
        
        from app.schemas.flights_schema import FlightResponse
        
        # Handle Search Filter for Paginated List
        query = base_query
        if search:
            # for search change to lower case for all
            search_filter = f"%{search.strip().lower()}%"
            query = query.filter(func.lower(models.Flight.flight_no).like(search_filter))
            
        # Total count for the current query (used for pagination)
        total_count = query.count()
        query = query.order_by(desc(models.Flight.flight_id))
        raw_flights = query.offset(skip).limit(limit).all()
        
        serialized_flights = [FlightResponse.model_validate(f).model_dump() for f in raw_flights]
        
        return {
            "success": True,
            "message": "Flights fetched successfully",
            "data": {
                 "metrics": { 
                    "total_flight": metrics_total_flights,
                    "recently_joined": recent_flight_total
                },
                "flights": serialized_flights,  
                "pagination": {
                    "total": total_count,
                    "skip": skip,
                    "limit": limit
                },
            },
            "error": None
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": "Failed to fetch flights",
            "data": None,
            "error": {
                "code": "SERVER_ERROR",
                "details": str(e)
            }
        }

# ─── 3. UPDATE FLIGHT ───────────────────────────────────────────────────────
@router.put("/{id}", response_model=ApiResponse)
def update_flight(id: int, data: FlightCreate, db: Session = Depends(get_db)):
    try:
        flight = db.query(models.Flight).filter(
            models.Flight.flight_id == id,
            models.Flight.is_deleted == 0
        ).first()

        if not flight:
            return {
                "success": False,
                "message": "Flight not found",
                "data": None,
                "error": {
                    "code": "FLIGHT_NOT_FOUND",
                    "details": f"Active flight with ID {id} does not exist."
                }
            }

        # Check airline exists
        airline_exists = db.query(models.Airline).filter(models.Airline.airline_id == data.airline_id).first()
        if not airline_exists:
            return {
                "success": False,
                "message": "Invalid airline_id",
                "data": None,
                "error": {
                    "code": "AIRLINE_NOT_FOUND",
                    "details": f"Airline with ID {data.airline_id} does not exist."
                }
            }

        # Check duplicate flight number (Case-insensitive check using func.lower)
        duplicate_flight_no = db.query(models.Flight).filter(
            func.lower(models.Flight.flight_no) == func.lower(data.flight_no),
            models.Flight.flight_id != id,
            models.Flight.is_deleted == 0
        ).first()

        if duplicate_flight_no:
            return {
                "success": False,
                "message": "Update failed",
                "data": None,
                "error": {
                    "code": "FLIGHT_ALREADY_EXISTS",
                    "details": f"Flight number '{data.flight_no}' is already taken by another active flight."
                }
            }

        # Update fields with capitalized flight_no
        flight.airline_id = data.airline_id
        flight.flight_no = data.flight_no.strip().upper()  
        flight.total_seats = data.total_seats
        
        db.commit()
        db.refresh(flight)
        
        from app.schemas.flights_schema import FlightResponse
        return {
            "success": True,
            "message": "Flight updated successfully",
            "data": FlightResponse.model_validate(flight).model_dump(),
            "error": None
        }
            
    except Exception as e:
        return {
            "success": False,
            "message": "Failed to update flight",
            "data": None,
            "error": {
                "code": "SERVER_ERROR",
                "details": str(e)
            }
        }

# ─── 4. DELETE FLIGHT (SOFT DELETE) ─────────────────────────────────────────
@router.delete("/{id}", response_model=ApiResponse)
def delete_flight(id: int, db: Session = Depends(get_db)):
    try:
        flight = db.query(models.Flight).filter(
            models.Flight.flight_id == id,
            models.Flight.is_deleted == False
        ).first()

        if not flight:
            return {
                "success": False,
                "message": "Flight not found",
                "data": None,
                "error": {
                    "code": "FLIGHT_NOT_FOUND",
                    "details": f"Active flight with ID {id} does not exist or has already been deleted."
                }
            }

        # ဒီ flight ကို ROUTE_SCHEDULE က active ဖြစ်ဖြစ် သုံးနေလား စစ်မယ်
        linked_schedule = db.query(models.RouteSchedule).filter(
            models.RouteSchedule.flight_id == id,
            models.RouteSchedule.is_deleted == False
        ).first()

        if linked_schedule:
            return {
                "success": False,
                "message": "Delete failed",
                "data": None,
                "error": {
                    "code": "FLIGHT_HAS_ACTIVE_SCHEDULE",
                    "details": "Cannot delete this flight because it still has active route schedules associated with it."
                }
            }

        flight.is_deleted = True
        db.commit()
        
        return {
            "success": True,
            "message": "Flight deleted successfully",
            "data": None,
            "error": None
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": "Failed to delete flight",
            "data": None,
            "error": {
                "code": "SERVER_ERROR",
                "details": str(e)
            }
        }