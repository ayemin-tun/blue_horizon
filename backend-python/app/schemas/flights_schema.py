# app/schemas/flight.py
from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal

# Request Body (Data request)
class FlightCreate(BaseModel):
    airline_id: int
    route_id: int
    flight_no: str
    departure_time: datetime
    arrival_time: datetime
    total_seats: int
    economy_price: Decimal
    business_price: Decimal

# Response Body (Data response)
class FlightResponse(BaseModel):
    flight_id: int
    airline_id: int
    route_id: int
    flight_no: str
    departure_time: datetime
    arrival_time: datetime
    total_seats: int
    available_seats: int
    economy_price: Decimal
    business_price: Decimal
    is_deleted: bool

    class Config:
        from_attributes = True