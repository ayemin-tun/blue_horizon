import re
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, Any
from datetime import datetime

# --- RELATIONSHIP SUB-SCHEMAS (For Eager Loading in Detail/List) ---
class RouteDetailResponse(BaseModel):
    route_id: int
    departure_city: str
    arrival_city: str
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

class RouteScheduleDetailResponse(BaseModel):
    schedule_id: int
    flight_id: int
    route_id: int
    flight_type: str
    route: Optional[RouteDetailResponse] = None
    flight: Optional[FlightDetailResponse] = None
    model_config = {"from_attributes": True}


# ─── MAIN SCHEDULE INSTANCE SCHEMAS ───

class InstanceBase(BaseModel):
    """
    Base structural definition for Flight Instances, holding basic field validators.
    """
    status: str = Field("SCHEDULED", description="Status of the flight instance (e.g., SCHEDULED, DEPARTED, CANCELLED)")
    flight_date: str = Field(..., description="Flight operation date in DD/MM/YYYY format")
    base_departure_time: str = Field(..., description="Base departure time in HH:MM format")
    base_arrival_time: str = Field(..., description="Base arrival time in HH:MM format")

    # Date Format Validator (DD/MM/YYYY)
    @field_validator('flight_date')
    @classmethod
    def validate_date_format(cls, v: str) -> str:
        v_clean = v.strip()
        date_regex = r"^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/(19|20)\d\d$"
        if not re.match(date_regex, v_clean):
            raise ValueError("flight_date must be in valid DD/MM/YYYY format, e.g., '05/07/2026'")
        return v_clean

    # Time Format Validator (HH:MM)
    @field_validator('base_departure_time', 'base_arrival_time')
    @classmethod
    def validate_time_format(cls, v: str, info) -> str:
        v_clean = v.strip()
        time_regex = r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
        if not re.match(time_regex, v_clean):
            raise ValueError(f"{info.field_name} must be in valid 24-hour format (HH:MM), e.g., '16:30'")
        parts = v_clean.split(":")
        return f"{int(parts[0]):02d}:{int(parts[1]):02d}"

    # Status Uppercase Normalizer
    @field_validator('status')
    @classmethod
    def uppercase_status(cls, v: str) -> str:
        return v.strip().upper() if isinstance(v, str) else v


class InstanceUpdate(BaseModel):
    """
    DTO for updating specific operations elements. 
    Validates that pricing updates cannot be zero/negative, and enforces that 
    Business class prices must always be higher than Economy class prices.
    """
    status: Optional[str] = None
    override_economy_price: Optional[float] = Field(None, gt=0, description="Override price must be greater than 0")
    override_business_price: Optional[float] = Field(None, gt=0, description="Override price must be greater than 0")

    # 1️⃣ Status Uppercase Normalizer
    @field_validator('status')
    @classmethod
    def uppercase_update_status(cls, v: Optional[str]) -> Optional[str]:
        return v.strip().upper() if v else v

    # 2️⃣ Multi-Field Cross Validator (Economy vs Business Price Check)
    @model_validator(mode='after')
    def validate_business_price_greater_than_economy(self) -> 'InstanceUpdate':
        eco_p = self.override_economy_price
        biz_p = self.override_business_price

        if eco_p is not None and biz_p is not None:
            if biz_p <= eco_p:
                raise ValueError(
                    f"override_business_price ({biz_p}) must be greater than override_economy_price ({eco_p})."
                )
        return self


class InstanceResponse(InstanceBase):
    """
    Standard serialized structural response output for individual instance operations.
    """
    instance_id: int
    schedule_id: int
    is_deleted: int
    
    # Pricing fields handling base/override configurations
    base_economy_price: float
    base_business_price: float
    override_economy_price: Optional[float] = None
    override_business_price: Optional[float] = None
    
    # Occupancy Metrics
    economy_seats_occupied: int
    business_seats_occupied: int
    
    # Nested Master Schedule Relations
    schedule: Optional[RouteScheduleDetailResponse] = None

    model_config = {"from_attributes": True}

    # ─── GLOBAL RESPONSE SCHEMA ──────────────────────────────────────────────────

class ApiResponse(BaseModel):
    """
    Unified API response format used across the system to maintain consistency
    for frontend parsing and structured error handling.
    """
    success: bool  
    message: str
    data: Optional[Any] = None
    error: Optional[dict] = None

    model_config = {"from_attributes": True}