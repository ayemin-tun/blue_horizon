from pydantic import BaseModel
from typing import Optional, Any

class ApiError(BaseModel):
    code: str
    details: str

class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    error: Optional[ApiError] = None

    class Config:
        from_attributes = True