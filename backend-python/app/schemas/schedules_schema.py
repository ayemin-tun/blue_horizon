import re
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, Any, List, Literal  # 🌟 Literal ကို အသစ်ယူလိုက်ပါသည်
from decimal import Decimal
from datetime import datetime

# --- RELATIONSHIP SUB-SCHEMAS ---
class RouteDetailResponse(BaseModel):
    route_id: int
    departure_city: str
    arrival_city: str
    
    # 🌟 Pydantic v2 စတိုင် သို့ ပြောင်းလဲခြင်း
    model_config = {"from_attributes": True}

class AirlineDetailResponse(BaseModel):
    airline_id: int
    airline_name: str
    country: str
    
    model_config = {"from_attributes": True}

class FlightDetailResponse(BaseModel):
    flight_id: int
    airline_id: int
    flight_no: str
    total_seats: int
    airline: Optional[AirlineDetailResponse] = None  
    
    model_config = {"from_attributes": True}


# ─── MAIN SCHEDULE SCHEMAS ───
class ScheduleBase(BaseModel):
    route_id: int
    flight_id: int
    
    # 🌟 flight_type ကို OUTBOUND သို့မဟုတ် INBOUND သာ လက်ခံရန် Literal ဖြင့် ကန့်သတ်ခြင်း
    flight_type: Literal["OUTBOUND", "INBOUND"] = Field(
        ..., 
        description="Flight direction type: Must be 'OUTBOUND' or 'INBOUND'"
    )
    
    departure_time: str = Field(..., description="Departure time in HH:MM format (24-hour style)")
    arrival_time: str = Field(..., description="Arrival time in HH:MM format (24-hour style)")
    
    economy_price: Decimal = Field(..., gt=0, max_digits=10, decimal_places=2, description="Price must be greater than 0")
    business_price: Decimal = Field(..., gt=0, max_digits=10, decimal_places=2, description="Price must be greater than 0")

    # 🌟 တကယ်လို့ lowercase 'outbound' ပေးလာရင်လည်း UPPERCASE ပြောင်းပေးရန် Validator ထည့်ခြင်း
    @field_validator('flight_type', mode='before')
    @classmethod
    def uppercase_flight_type(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().upper()
        return v

    # ၁။ Individual Field Validator: အချိန် Format စစ်ဆေးခြင်း
    @field_validator('departure_time', 'arrival_time')
    @classmethod
    def validate_time_format(cls, v: str, info) -> str:
        v_clean = v.strip()
        time_regex = r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
        if not re.match(time_regex, v_clean):
            raise ValueError(f"{info.field_name} must be in valid 24-hour format (HH:MM), e.g., '08:30' or '23:15'")
            
        parts = v_clean.split(":")
        return f"{int(parts[0]):02d}:{int(parts[1]):02d}"

    # ၂။ Model-level Validator: Arrival က Departure ထက် ပိုကြီးရမည်ဟု စစ်ဆေးခြင်း
    @model_validator(mode='after')
    def validate_arrival_after_departure(self) -> 'ScheduleBase':
        dep_str = self.departure_time
        arr_str = self.arrival_time

        time_fmt = "%H:%M"
        dep_time = datetime.strptime(dep_str, time_fmt)
        arr_time = datetime.strptime(arr_str, time_fmt)

        if arr_time <= dep_time:
            raise ValueError(
                f"arrival_time ({arr_str}) must be later than departure_time ({dep_str})."
            )
            
        return self

    model_config = {
        "json_schema_extra": {
            "example": {
                "route_id": 1,
                "flight_id": 1,
                "flight_type": "OUTBOUND", # 🌟 Example ထဲတွင်ပါ ထည့်သွင်းပေးလိုက်ပါသည်
                "departure_time": "08:30",
                "arrival_time": "10:00",
                "economy_price": 150000.00,
                "business_price": 250000.00
            }
        }
    }


class ScheduleCreate(ScheduleBase):
    pass


# Nested Object များနှင့် Response ပုံစံ
class ScheduleResponse(ScheduleBase):
    schedule_id: int
    is_deleted: int
    route: Optional[RouteDetailResponse] = None   
    flight: Optional[FlightDetailResponse] = None 

    # 🌟 class Config မှ model_config သို့ ပြောင်းလဲခြင်း (schedule_id ပျောက်ဆုံးမှု မဖြစ်စေရန်)
    model_config = {"from_attributes": True}


# --- GLOBAL RESPONSE ---
class ApiError(BaseModel):
    code: str
    details: str

class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    error: Optional[ApiError] = None

    model_config = {"from_attributes": True}