from pydantic import BaseModel
from typing import List, Optional, Any

# ─── 📦 API Error Schema ─────────────────────────────────────────────
class ApiError(BaseModel):
    code: str
    details: str

# ─── 📦 Standard API Response Schema ──────────────────────────────────
class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    error: Optional[ApiError] = None

    class Config:
        from_attributes = True

# ─── 📊 Pydantic Schemas For Request Body ─────────────────────────────
class PassengerPostSchema(BaseModel):
    name: str
    nrc: str
    dob: str
    gender: str
    phone: str

class CreateBookingRequest(BaseModel):
    flight_instance_id: int
    user_id: int
    seat_class: str          # e.g., 'economy' or 'business'
    total_price: float
    passengers: List[PassengerPostSchema]
    booked_at: str

# ─── 📦 Booking Response Data Structure ──────────────────────────────
class BookingResponseData(BaseModel):
    booking_id: int
    ticket_id: str
    flight_instance_id: int
    seat_class: str
    total_price: float
    booked_at: str
    passengers: List[dict]