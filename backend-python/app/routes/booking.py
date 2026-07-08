from fastapi import APIRouter, Depends, Query,status
import secrets
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database import models
from typing import List
from app.schemas.booking_schema import ApiResponse,CreateBookingRequest
from datetime import datetime

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])

@router.get("/cities")
def get_cities(db: Session = Depends(get_db)):
    routes = db.query(models.Route.departure_city, models.Route.arrival_city).all()
    
    cities = set()
    for r in routes:
        cities.add(r.departure_city)
        cities.add(r.arrival_city)
    
    all_cities = sorted(list(cities))
    
    target_city = "Yangon"
    if target_city in all_cities:
        all_cities.remove(target_city)    
        all_cities.insert(0, target_city) 
    
    return {"success": True, "cities": all_cities}


"""
Search Flight API
-----------------
This endpoint allows users to search for available flight instances based on the travel date, 
departure city, and arrival city. 

Business Logic applied:
1. Filters flights based on provided search criteria and active status.
2. If the search date is today, it filters out flights that have already departed.
3. Excludes flights where the total number of occupied seats reaches or exceeds total capacity.
4. Calculates flight duration based on departure and arrival times.
"""
@router.get("/search") 
def search_flights(
    date: str,
    departure_city: str,
    arrival_city: str,
    skip: int = Query(0, ge=0),   
    limit: int = Query(5, ge=1),  
    db: Session = Depends(get_db)
):
    # 1. Database Query
    results = db.query(
        models.FlightInstance, models.RouteSchedule, models.Route, models.Flight, models.Airline
    ).join(models.RouteSchedule, models.FlightInstance.schedule_id == models.RouteSchedule.schedule_id
    ).join(models.Route, models.RouteSchedule.route_id == models.Route.route_id
    ).join(models.Flight, models.RouteSchedule.flight_id == models.Flight.flight_id
    ).join(models.Airline, models.Flight.airline_id == models.Airline.airline_id
    ).filter(
        models.FlightInstance.flight_date == date.strip(),
        models.Route.departure_city.ilike(departure_city.strip()),
        models.Route.arrival_city.ilike(arrival_city.strip()),
        models.FlightInstance.is_deleted == 0,
        models.FlightInstance.status == 'SCHEDULED'
    ).all()

    all_filtered_flights = [] 
    now = datetime.now()
    today_str = now.strftime("%d/%m/%Y")

    #Business Capacity default 20 ───
    FIXED_BUSINESS_CAPACITY = 20

    for instance, schedule, route, flight, airline in results:
        # A. Time Check
        if instance.flight_date == today_str:
            departure_time = datetime.strptime(instance.base_departure_time, "%H:%M").time()
            if departure_time < now.time():
                continue

        # B. Class base Capacity and Available Seat Calculation
        total_seats = flight.total_seats
        
        business_available = max(0, FIXED_BUSINESS_CAPACITY - instance.business_seats_occupied)
        
        total_economy_capacity = total_seats - FIXED_BUSINESS_CAPACITY
        economy_available = max(0, total_economy_capacity - instance.economy_seats_occupied)

        if economy_available <= 0 and business_available <= 0:
            continue

        # C. Duration Calculation
        fmt = "%H:%M"
        d_time = datetime.strptime(instance.base_departure_time, fmt)
        a_time = datetime.strptime(instance.base_arrival_time, fmt)
        duration = a_time - d_time
        duration_str = str(duration)

        # D. Append to Array
        all_filtered_flights.append({
            "flight_instance_id": instance.instance_id, # 💡 Frontend အတွက် Foreign Key ID ထည့်ပေးထားပါတယ်
            "airline_name": airline.airline_name,
            "flight_no": flight.flight_no,
            "departure_time": instance.base_departure_time,
            "arrival_time": instance.base_arrival_time,
            "duration": duration_str,
            "departure_city": route.departure_city,
            "arrival_city": route.arrival_city,
            "flight_date": instance.flight_date,
            "economy_price": instance.override_economy_price or instance.base_economy_price,
            "business_price": instance.override_business_price or instance.base_business_price,
            
            "economy_seats_available": economy_available,
            "business_seats_available": business_available,
            "seats_available": economy_available + business_available 
        })

    total_count = len(all_filtered_flights)
    paginated_flights = all_filtered_flights[skip : skip + limit]

    if not paginated_flights:
        return {
            "success": False, 
            "message": "No flights found", 
            "data": [],
            "pagination": {"total": total_count, "skip": skip, "limit": limit}
        }

    return {
        "success": True, 
        "message": "Flights found", 
        "data": paginated_flights,
        "pagination": {
            "total": total_count,
            "skip": skip,
            "limit": limit
        }
    }

# ───  Create Booking Endpoint ──────────────────────────────────────────
@router.post("", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
def create_booking(payload: CreateBookingRequest, db: Session = Depends(get_db)):
    """
    Creates a new flight booking transaction, inserts detailed passenger profiles, 
    and associates records dynamically into the bridge tables.
    """
    try:
        # 1. Fetch and validate existence of FlightInstance
        instance = db.query(models.FlightInstance).filter(
            models.FlightInstance.instance_id == payload.flight_instance_id,
            models.FlightInstance.is_deleted == 0
        ).first()

        if not instance:
            return {
                "success": False,
                "message": "Flight instance not found",
                "data": None,
                "error": {"code": "NOT_FOUND", "details": "The specified flight instance does not exist or has been deleted."}
            }
        # ticket code generate
        generated_ticket_code = f"BH-{secrets.token_hex(3).upper()}" 
        
        # check duplicate
        while db.query(models.Booking).filter(models.Booking.ticket_code == generated_ticket_code).first():
            generated_ticket_code = f"BH-{secrets.token_hex(3).upper()}"

        passenger_count = len(payload.passengers)
        target_seat_class = payload.seat_class.upper().strip()
        # 2. Persist dynamic master structural records into BOOKINGS table
        new_booking = models.Booking(
            ticket_code=generated_ticket_code,     
            user_id=payload.user_id, 
            instance_id=payload.flight_instance_id,
            booking_date=payload.booked_at,
            total_price=payload.total_price,
            seat_class=target_seat_class,
            status="CONFIRMED"
        )
        db.add(new_booking)
        db.flush()  

        inserted_passengers = []
        
        # 3. Handle data migration sequence loops for all relational passengers
        for p in payload.passengers:
            new_passenger = models.Passenger(
                full_name=p.name,
                date_of_birth=p.dob,
                Gender=p.gender,       
                phone_no=p.phone,
                nrc=p.nrc              
            )
            db.add(new_passenger)
            db.flush()  

            # Construct bridging record dependencies mapping tables together
            booking_passenger = models.BookingPassenger(
                booking_id=new_booking.booking_id,
                passenger_id=new_passenger.passenger_id,
                seat_no="Airport Check-in"      
            )
            db.add(booking_passenger)

            inserted_passengers.append({
                "passenger_id": new_passenger.passenger_id,
                "name": new_passenger.full_name,
                "nrc": new_passenger.nrc,
                "dob": new_passenger.date_of_birth,
                "gender": new_passenger.Gender,
                "phone": new_passenger.phone_no,
                "seat": "Airport Check-in"
            })

        # 4. Atomically adjust threshold configurations inside the target FlightInstance
        if payload.seat_class.upper() == "ECONOMY":
            instance.economy_seats_occupied += passenger_count
        elif payload.seat_class.upper() == "BUSINESS":
            instance.business_seats_occupied += passenger_count
        else:
            return {
                "success": False,
                "message": "Invalid seat class",
                "data": None,
                "error": {"code": "BAD_REQUEST", "details": "Seat class must be either 'ECOMONY' or 'BUSINESS'."}
            }

        # Safely commit transactions to disk storage
        db.commit()
        
        return {
            "success": True,
            "message": "Booking and passengers registered successfully under current Agent!",
            "data": {
                "booking_id": new_booking.booking_id,
                "ticket_id": new_booking.ticket_code,
                "flight_instance_id": new_booking.instance_id,
                "seat_class": new_booking.seat_class,
                "total_price": float(new_booking.total_price),
                "booked_at": new_booking.booking_date,
                "passengers": inserted_passengers
            },
            "error": None
        }

    except Exception as e:
        db.rollback()  
        # Unexpected Server Error များအတွက် ApiResponse Schema ပုံစံဖြင့် တုံ့ပြန်ခြင်း
        return {
            "success": False,
            "message": "Internal Server Error occurred",
            "data": None,
            "error": {"code": "INTERNAL_SERVER_ERROR", "details": str(e)}
        }