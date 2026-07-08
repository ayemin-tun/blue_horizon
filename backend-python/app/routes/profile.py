from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Any


from app.database.database import get_db
from app.database import models

from app.utils.auth_utils import get_current_user 

router = APIRouter(
    prefix="/api/profile",
    tags=["Profile Management"]
)

# --- UNIFIED RESPONSE SCHEMA ---
class ApiResponse(BaseModel):
    success: bool  
    message: str
    data: Optional[Any] = None
    error: Optional[dict] = None

# --- REQUEST SCHEMA ---
class ProfileUpdateSchema(BaseModel):
    username: str
    email: str
    phone_no: Optional[str] = None

# --- UPDATE PROFILE API ---
@router.put("", response_model=ApiResponse)
def update_profile(
    data: ProfileUpdateSchema, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    try:
        # Check if the user exists and is not soft-deleted
        if not current_user or current_user.is_deleted != 0:
            return {
                "success": False,
                "message": "Profile update failed",
                "data": None,
                "error": {
                    "code": "USER_NOT_FOUND",
                    "details": "User account does not exist or has been deleted."
                }
            }
            
        # Update the user profile fields
        current_user.username = data.username.strip()
        current_user.email = data.email.strip()
        
        if data.phone_no is not None:
            current_user.phone_no = data.phone_no.strip()
            
        db.commit()
        db.refresh(current_user)
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "data": {
                "user_id": current_user.user_id,
                "username": current_user.username,
                "email": current_user.email,
                "phone_no": current_user.phone_no if current_user.phone_no else "-"
            },
            "error": None
        }
        
    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "message": "Failed to update profile",
            "data": None,
            "error": {
                "code": "SERVER_ERROR",
                "details": str(e)
            }
        }