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
                "error": {"code": "BAD_REQUEST", "details": "Seat class must be either 'ECONOMY' or 'BUSINESS'."}
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
        return {
            "success": False,
            "message": "Internal Server Error occurred",
            "data": None,
            "error": {"code": "INTERNAL_SERVER_ERROR", "details": str(e)}
        }
    
from sqlalchemy import case, func

@router.get("/admin/all")
def get_all_bookings_for_admin(
    search: str = Query(None, description="Search by Ticket Code, Departure City, or Arrival City"),
    status: str = Query(None, description="Filter by status (e.g., CONFIRMED, CANCELLED)"),
    seat_class: str = Query(None, description="Filter by seat class (e.g., ECONOMY, BUSINESS)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db)
):
    """
    Admin Endpoint: Retrieves all bookings across the entire system with global dashboard metrics,
    optional search parameters, and functional status/class filters.
    """
    try:
        # ─── 1. COMPUTE GLOBAL DASHBOARD METRICS ────────────────────────────
        # 🟢 Filter မသက်ရောက်ခင် တစ်ကျောင်းလုံးမှာရှိတဲ့ Booking Metrics အစစ်အမှန်ကို ရှာဖွေတွက်ချက်မယ်
        metrics_query = db.query(
            func.count(models.Booking.booking_id).label("total"),
            func.count(case((func.lower(models.Booking.status) == "confirmed", 1))).label("confirmed"),
            func.count(case((func.lower(models.Booking.status) == "cancelled", 1))).label("cancelled")
        ).first()

        metrics_data = {
            "total_booking": metrics_query.total or 0,
            "confirmed_booking": metrics_query.confirmed or 0,
            "cancelled_booking": metrics_query.cancelled or 0
        }

        # ─── 2. BASE PAGINATED LIST QUERY ───────────────────────────────────
        query = db.query(
            models.Booking, models.FlightInstance, models.RouteSchedule, models.Route, models.Flight, models.Airline
        ).join(models.FlightInstance, models.Booking.instance_id == models.FlightInstance.instance_id
        ).join(models.RouteSchedule, models.FlightInstance.schedule_id == models.RouteSchedule.schedule_id
        ).join(models.Route, models.RouteSchedule.route_id == models.Route.route_id
        ).join(models.Flight, models.RouteSchedule.flight_id == models.Flight.flight_id
        ).join(models.Airline, models.Flight.airline_id == models.Airline.airline_id)

        # Apply Status Filter
        if status:
            query = query.filter(models.Booking.status.ilike(status.strip()))

        # Apply Seat Class Filter
        if seat_class:
            query = query.filter(models.Booking.seat_class.ilike(seat_class.strip()))

        # Apply Search Filter (Dynamic text match across multiple attributes)
        if search:
            search_val = f"%{search.strip()}%"
            query = query.filter(
                (models.Booking.ticket_code.ilike(search_val)) |
                (models.Route.departure_city.ilike(search_val)) |
                (models.Route.arrival_city.ilike(search_val))
            )

        # Total count for the currently filtered query (used for pagination layout)
        filtered_total_count = query.count()
        results = query.order_by(models.Booking.booking_id.desc()).offset(skip).limit(limit).all()

        formatted_bookings = []
        for booking, instance, schedule, route, flight, airline in results:
            passenger_results = db.query(models.Passenger, models.BookingPassenger
            ).join(models.BookingPassenger, models.Passenger.passenger_id == models.BookingPassenger.passenger_id
            ).filter(models.BookingPassenger.booking_id == booking.booking_id).all()

            passengers_list = [{
                "passenger_id": p.passenger_id,
                "name": p.full_name,
                "nrc": p.nrc,
                "dob": p.date_of_birth,
                "gender": p.Gender,
                "phone": p.phone_no,
                "seat": bp.seat_no
            } for p, bp in passenger_results]

            formatted_bookings.append({
                "booking_id": booking.booking_id,
                "ticket_code": booking.ticket_code,
                "user_id": booking.user_id,
                "booking_date": booking.booking_date,
                "total_price": float(booking.total_price),
                "seat_class": booking.seat_class,
                "status": booking.status,
                "flight_details": {
                    "flight_instance_id": instance.instance_id,
                    "airline_name": airline.airline_name,
                    "flight_no": flight.flight_no,
                    "departure_city": route.departure_city,
                    "arrival_city": route.arrival_city,
                    "flight_date": instance.flight_date,
                    "departure_time": instance.base_departure_time,
                    "arrival_time": instance.base_arrival_time,
                },
                "passengers": passengers_list
            })

        # ─── 3. RETURN RESPONSE STRUCTURE ───────────────────────────────────
        return {
            "success": True,
            "message": "All bookings retrieved successfully for Admin",
            "data": {
                "metrics": metrics_data, 
                "bookings": formatted_bookings,
                "pagination": {
                    "total": filtered_total_count,
                    "skip": skip,
                    "limit": limit
                }
            },
            "error": None
        }
    except Exception as e:
        return {
            "success": False,
            "message": "Failed to retrieve admin bookings",
            "data": {
                "metrics": {"total_booking": 0, "confirmed_booking": 0, "cancelled_booking": 0},
                "bookings": [],
                "pagination": {"total": 0, "skip": skip, "limit": limit}
            },
            "error": {"code": "INTERNAL_SERVER_ERROR", "details": str(e)}
        }
@router.get("/agent/my-bookings")
def get_agent_bookings(
    user_id: str = Query(..., description="The ID of the current logged-in agent"),
    search: str = Query(None, description="Search by Ticket Code, Departure City, or Arrival City"),
    status: str = Query(None, description="Filter by status (e.g., CONFIRMED, CANCELLED)"),
    seat_class: str = Query(None, description="Filter by seat class (e.g., ECONOMY, BUSINESS)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db)
):
    """
    Agent Endpoint: Filters and fetches only the booking records submitted by 
    the active agent using their verified user_id, with extra search filters.
    """
    try:
        # Base query targeting specific agent record ownership
        query = db.query(
            models.Booking, models.FlightInstance, models.RouteSchedule, models.Route, models.Flight, models.Airline
        ).join(models.FlightInstance, models.Booking.instance_id == models.FlightInstance.instance_id
        ).join(models.RouteSchedule, models.FlightInstance.schedule_id == models.RouteSchedule.schedule_id
        ).join(models.Route, models.RouteSchedule.route_id == models.Route.route_id
        ).join(models.Flight, models.RouteSchedule.flight_id == models.Flight.flight_id
        ).join(models.Airline, models.Flight.airline_id == models.Airline.airline_id
        ).filter(models.Booking.user_id == user_id.strip())

        # Apply Status Filter
        if status:
            query = query.filter(models.Booking.status.ilike(status.strip()))

        # Apply Seat Class Filter
        if seat_class:
            query = query.filter(models.Booking.seat_class.ilike(seat_class.strip()))

        # Apply Search Filter (Dynamic text match across multiple attributes)
        if search:
            search_val = f"%{search.strip()}%"
            query = query.filter(
                (models.Booking.ticket_code.ilike(search_val)) |
                (models.Route.departure_city.ilike(search_val)) |
                (models.Route.arrival_city.ilike(search_val))
            )

        # Compute total count after checking parameters
        total_count = query.count()
        results = query.order_by(models.Booking.booking_id.desc()).offset(skip).limit(limit).all()

        formatted_bookings = []
        for booking, instance, schedule, route, flight, airline in results:
            passenger_results = db.query(models.Passenger, models.BookingPassenger
            ).join(models.BookingPassenger, models.Passenger.passenger_id == models.BookingPassenger.passenger_id
            ).filter(models.BookingPassenger.booking_id == booking.booking_id).all()

            passengers_list = [{
                "passenger_id": p.passenger_id,
                "name": p.full_name,
                "nrc": p.nrc,
                "dob": p.date_of_birth,
                "gender": p.Gender,
                "phone": p.phone_no,
                "seat": bp.seat_no
            } for p, bp in passenger_results]

            formatted_bookings.append({
                "booking_id": booking.booking_id,
                "ticket_code": booking.ticket_code,
                "booking_date": booking.booking_date,
                "total_price": float(booking.total_price),
                "seat_class": booking.seat_class,
                "status": booking.status,
                "flight_details": {
                    "flight_instance_id": instance.instance_id,
                    "airline_name": airline.airline_name,
                    "flight_no": flight.flight_no,
                    "departure_city": route.departure_city,
                    "arrival_city": route.arrival_city,
                    "flight_date": instance.flight_date,
                    "departure_time": instance.base_departure_time,
                    "arrival_time": instance.base_arrival_time,
                },
                "passengers": passengers_list
            })

        return {
            "success": True,
            "message": f"Bookings retrieved successfully for agent: {user_id}",
            "data": formatted_bookings,
            "pagination": {"total": total_count, "skip": skip, "limit": limit}
        }
    except Exception as e:
        return {
            "success": False,
            "message": "Failed to retrieve agent bookings",
            "data": [],
            "error": {"code": "INTERNAL_SERVER_ERROR", "details": str(e)}
        }
    
@router.get("/{booking_id}")
def get_booking_detail(booking_id: int, db: Session = Depends(get_db)):
    """
    Detail Endpoint: Fetches a single booking record together with its
    full flight and passenger details, for the booking detail page.

    NOTE: Must be registered AFTER '/admin/all' and '/agent/my-bookings'
    in this router, otherwise FastAPI will try to match those literal
    paths against this '/{booking_id}' pattern first.
    """
    try:
        result = db.query(
            models.Booking, models.FlightInstance, models.RouteSchedule,
            models.Route, models.Flight, models.Airline
        ).join(models.FlightInstance, models.Booking.instance_id == models.FlightInstance.instance_id
        ).join(models.RouteSchedule, models.FlightInstance.schedule_id == models.RouteSchedule.schedule_id
        ).join(models.Route, models.RouteSchedule.route_id == models.Route.route_id
        ).join(models.Flight, models.RouteSchedule.flight_id == models.Flight.flight_id
        ).join(models.Airline, models.Flight.airline_id == models.Airline.airline_id
        ).filter(models.Booking.booking_id == booking_id
        ).first()

        if not result:
            return {
                "success": False,
                "message": "Booking not found",
                "data": None,
                "error": {"code": "NOT_FOUND", "details": f"No booking exists with id {booking_id}."}
            }

        booking, instance, schedule, route, flight, airline = result

        passenger_results = db.query(models.Passenger, models.BookingPassenger
        ).join(models.BookingPassenger, models.Passenger.passenger_id == models.BookingPassenger.passenger_id
        ).filter(models.BookingPassenger.booking_id == booking.booking_id).all()

        passengers_list = [{
            "passenger_id": p.passenger_id,
            "name": p.full_name,
            "nrc": p.nrc,
            "dob": p.date_of_birth,
            "gender": p.Gender,
            "phone": p.phone_no,
            "seat": bp.seat_no
        } for p, bp in passenger_results]

        formatted_booking = {
            "booking_id": booking.booking_id,
            "ticket_code": booking.ticket_code,
            "user_id": booking.user_id,
            "booking_date": booking.booking_date,
            "total_price": float(booking.total_price),
            "seat_class": booking.seat_class,
            "status": booking.status,
            "flight_details": {
                "flight_instance_id": instance.instance_id,
                "airline_name": airline.airline_name,
                "flight_no": flight.flight_no,
                "departure_city": route.departure_city,
                "arrival_city": route.arrival_city,
                "flight_date": instance.flight_date,
                "departure_time": instance.base_departure_time,
                "arrival_time": instance.base_arrival_time,
            },
            "passengers": passengers_list
        }

        return {
            "success": True,
            "message": "Booking detail retrieved successfully",
            "data": formatted_booking,
            "error": None
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Failed to retrieve booking detail",
            "data": None,
            "error": {"code": "INTERNAL_SERVER_ERROR", "details": str(e)}
        }