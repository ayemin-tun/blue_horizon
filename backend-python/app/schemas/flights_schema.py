# app/schemas/flight.py
from typing import Optional,Any

from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from decimal import Decimal

# Request Body (Data request)
class FlightCreate(BaseModel):
    airline_id: int
    flight_no: str
    total_seats: int = Field(gt=0, description="Seats must be greater than 0")
    model_config = {
        "json_schema_extra": {
            "example": {
                "airline_id": 1,
                "flight_no": "UB-101",
                "total_seats": 120
            }
        }
    }

# --- UNIFIED RESPONSE SCHEMA ---
class ApiResponse(BaseModel):
    success: bool  
    message: str
    data: Optional[Any] = None
    error: Optional[dict] = None
    model_config = ConfigDict(from_attributes=True)

class AirlineInFlight(BaseModel):
    airline_id: int
    airline_name: str
    country: str

    class Config:
        from_attributes = True

# Response Body (Data response)
class FlightResponse(BaseModel):
    flight_id: int
    airline_id: int
    flight_no: str
    total_seats: int
    is_deleted: bool
    airline: Optional[AirlineInFlight] = None

    class Config:
        from_attributes = True