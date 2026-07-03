from fastapi import APIRouter, Depends, status, Query
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

        # Check flight is already exist or not (including soft-deleted)
        existing_flight = db.query(models.Flight).filter(
            models.Flight.flight_no == data.flight_no
        ).first()

        if existing_flight:
            if existing_flight.is_deleted:
                # 🌟 If soft-deleted, reactivate with updated parameters (prices removed)
                existing_flight.is_deleted = False
                existing_flight.airline_id = data.airline_id
                existing_flight.total_seats = data.total_seats
                
                db.commit()
                db.refresh(existing_flight)
                return {
                    "success": True,
                    "message": "Flight re-activated and updated successfully",
                    "data": existing_flight,
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

        # Create New Flight
        new_flight = models.Flight(**data.model_dump())
        db.add(new_flight)
        db.commit()
        db.refresh(new_flight)
        
        return {
            "success": True,
            "message": "Flight created successfully",
            "data": new_flight,
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

# ─── 2. READ ALL FLIGHTS (WITH PAGINATION) ──────────────────────────────────
@router.get("", response_model=ApiResponse)
def get_flights(
    skip: int = 0, 
    limit: int = 5, 
    search: Optional[str] = Query(None), 
    db: Session = Depends(get_db)
):
    try:
        query = db.query(models.Flight).filter(models.Flight.is_deleted == False)
        
        if search:
            search_filter = f"%{search.strip()}%"
            query = query.filter(models.Flight.flight_no.like(search_filter))
            
        total_count = query.count()
        raw_flights = query.offset(skip).limit(limit).all()
        
        from app.schemas.flights_schema import FlightResponse
        serialized_flights = [FlightResponse.model_validate(f).model_dump() for f in raw_flights]
        
        return {
            "success": True,
            "message": "Flights fetched successfully",
            "data": {
                "flights": serialized_flights,  
                "pagination": {
                    "total": total_count,
                    "skip": skip,
                    "limit": limit
                }
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

        # Check duplicate flight number
        duplicate_flight_no = db.query(models.Flight).filter(
            models.Flight.flight_no == data.flight_no,
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

        # 🌟 Update fields (Prices fields removed)
        flight.airline_id = data.airline_id
        flight.flight_no = data.flight_no
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