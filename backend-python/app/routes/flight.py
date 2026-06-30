from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database import models
from app.schemas.flights_schema import FlightCreate

router = APIRouter(prefix="/api/flights", tags=["Flights"])

# 1. CREATE FLIGHT
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_flight(data: FlightCreate, db: Session = Depends(get_db)):
    
    #check airline exist
    airline_exists = db.query(models.Airline).filter(models.Airline.airline_id == data.airline_id).first()
    if not airline_exists:
        return {"success": False, "message": f"Invalid airline_id: airline does not exist."}

    #check route exist
    route_exists = db.query(models.Route).filter(models.Route.route_id == data.route_id).first()
    if not route_exists:
        return {"success": False, "message": f"Invalid route_id: route does not exist."}

    # check departure_tiem < arrival time 
    if data.departure_time >= data.arrival_time:
        return {"success": False, "message": "Arrival time must be after departure time."}

    # Check flight is already exist or not 
    existing_flight = db.query(models.Flight).filter(
        models.Flight.flight_no == data.flight_no
    ).first()

    if existing_flight:
        if existing_flight.is_deleted:
            #if the flight is delete(soft) ,reactive this flight with new data
            existing_flight.is_deleted = False
            existing_flight.airline_id = data.airline_id
            existing_flight.route_id = data.route_id
            existing_flight.departure_time = data.departure_time
            existing_flight.arrival_time = data.arrival_time
            existing_flight.total_seats = data.total_seats
            existing_flight.available_seats = data.total_seats #first all of the seats is available
            existing_flight.economy_price = data.economy_price
            existing_flight.business_price = data.business_price
            db.commit()
            return {"success": True, "message": "Flight re-activated and updated", "data": existing_flight}
        return {"success": False, "message": "Flight number already exists"}

    #create 
    new_flight = models.Flight(
        **data.model_dump(),
        available_seats=data.total_seats #add availabe seat to total seat
    )
    db.add(new_flight)
    db.commit()
    db.refresh(new_flight)
    return {"success": True, "message": "Flight created successfully", "data": new_flight}

# 2. READ ALL WITH PAGINATION
@router.get("/")
def get_flights(skip: int = 0, limit: int = 5, db: Session = Depends(get_db)):
    total_count = db.query(models.Flight).filter(models.Flight.is_deleted == False).count()
    
    # use Relationship (join) to retrieve Airline and Route 
    flights = (
        db.query(models.Flight)
        .filter(models.Flight.is_deleted == False)
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return {
        "success": True,
        "data": flights,
        "pagination": {
            "total": total_count,
            "skip": skip,
            "limit": limit
        }
    }

# 3. UPDATE FLIGHT
@router.put("/{id}")
def update_flight(id: int, data: FlightCreate, db: Session = Depends(get_db)):
    # Check flight is already exist or not
    flight = db.query(models.Flight).filter(
        models.Flight.flight_id == id,
        models.Flight.is_deleted == 0
    ).first()

    if not flight:
        return {"success": False, "message": "Flight not found"}

    # check airline is already exist
    airline_exists = db.query(models.Airline).filter(models.Airline.airline_id == data.airline_id).first()
    if not airline_exists:
        return {"success": False, "message": f"Invalid airline_id: airline does not exist."}

    #check route is already exist
    route_exists = db.query(models.Route).filter(models.Route.route_id == data.route_id).first()
    if not route_exists:
        return {"success": False, "message": f"Invalid route_id: route does not exist."}

    # check flight no 
    duplicate_flight_no = db.query(models.Flight).filter(
        models.Flight.flight_no == data.flight_no,
        models.Flight.flight_id != id,
        models.Flight.is_deleted == 0
    ).first()

    if duplicate_flight_no:
        return {"success": False, "message": f"Flight number '{data.flight_no}' is already taken by another flight."}

    #check departure time < arriaval time 
    if data.departure_time >= data.arrival_time:
        return {"success": False, "message": "Arrival time must be after departure time."}

    # update data
    flight.airline_id = data.airline_id
    flight.route_id = data.route_id
    flight.flight_no = data.flight_no
    flight.departure_time = data.departure_time
    flight.arrival_time = data.arrival_time
    
    # adjust available seat
    if flight.total_seats != data.total_seats:
        flight.available_seats = data.total_seats
    flight.total_seats = data.total_seats
    
    flight.economy_price = data.economy_price
    flight.business_price = data.business_price
    
    db.commit()
    db.refresh(flight)
    
    return {"success": True, "message": "Flight updated successfully", "data": flight}

# 4. DELETE (Soft Delete)
@router.delete("/{id}")
def delete_flight(id: int, db: Session = Depends(get_db)):
    flight = db.query(models.Flight).filter(
        models.Flight.flight_id == id,
        models.Flight.is_deleted == False
    ).first()

    if not flight:
        return {"success": False, "message": "Flight not found or already deleted"}

    flight.is_deleted = True
    db.commit()
    return {"success": True, "message": "Flight deleted successfully"}