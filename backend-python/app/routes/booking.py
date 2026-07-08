from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database import models
from typing import List
from app.schemas.booking_schema import ApiResponse
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

    # ─── 💡 Business Capacity ကို ပုံသေ ၂၀ သတ်မှတ်ခြင်း ───
    FIXED_BUSINESS_CAPACITY = 20

    for instance, schedule, route, flight, airline in results:
        # A. Time Check
        if instance.flight_date == today_str:
            departure_time = datetime.strptime(instance.base_departure_time, "%H:%M").time()
            if departure_time < now.time():
                continue

        # ─── 💡 B. Class အလိုက် Capacity နှင့် Available Seat တွက်ချက်ခြင်း ───
        total_seats = flight.total_seats
        
        # ၁။ Business အတွက် စုစုပေါင်း ၂၀ ထဲက လက်ရှိ Occupied ကိုနှုတ်မယ်
        business_available = max(0, FIXED_BUSINESS_CAPACITY - instance.business_seats_occupied)
        
        # ၂။ Economy အတွက် ကျန်တဲ့ ခုံအရေအတွက် (Total - 20) ထဲကမှ လက်ရှိ Occupied ကိုနှုတ်မယ်
        total_economy_capacity = total_seats - FIXED_BUSINESS_CAPACITY
        economy_available = max(0, total_economy_capacity - instance.economy_seats_occupied)

        # ၃။ အကယ်၍ ခုံနှစ်ခုလုံး (Economy ရော Business ရော) လုံးဝ ပြည့်နေပြီဆိုမှ ဒီ Flight ကို ချန်လှပ်ခဲ့မယ်
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
            
            # ─── 💡 Frontend ဘက်မှာ အလွယ်တကူ စစ်ဆေးသုံးစွဲနိုင်အောင် Key သီးသန့်စီ ထုတ်ပေးလိုက်ပါတယ် ───
            "economy_seats_available": economy_available,
            "business_seats_available": business_available,
            # မူလ UI တွေ မပျက်အောင် စုစုပေါင်း လက်ကျန်ခုံကိုပါ ပေါင်းပြပေးထားပါမယ်
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