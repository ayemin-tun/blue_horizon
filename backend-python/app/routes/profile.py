from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Any

from app.database.database import get_db
from app.database import models

from app.utils.auth_utils import verify_password, get_password_hash 

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
    current_password: Optional[str] = None  
    new_password: Optional[str] = None      

# --- UPDATE PROFILE API (TESTING WITH ID) ---
@router.put("/{user_id}", response_model=ApiResponse)
def update_profile(
    user_id: int, 
    data: ProfileUpdateSchema, 
    db: Session = Depends(get_db)
):
    try:
        user = db.query(models.User).filter(models.User.user_id == user_id).first()
        
        # Check if the user exists and is not soft-deleted
        if not user or user.is_deleted != 0:
            return {
                "success": False,
                "message": "Profile update failed",
                "data": None,
                "error": {
                    "code": "USER_NOT_FOUND",
                    "details": f"User account with ID {user_id} does not exist or has been deleted."
                }
            }
            
        input_email = data.email.strip()
        existing_email_user = db.query(models.User).filter(
            models.User.email == input_email,
            models.User.user_id != user_id, 
            models.User.is_deleted == 0     
        ).first()
        
        if existing_email_user:
            return {
                "success": False,
                "message": "Profile update failed",
                "data": None,
                "error": {
                    "code": "EMAIL_ALREADY_EXISTS",
                    "details": f"The email '{input_email}' is already taken by another user."
                }
            }
            
        # 🟢 ၂။ ဒေတာများကို စတင် Update လုပ်ခြင်း
        user.username = data.username.strip()
        user.email = input_email
        
        if data.phone_no is not None:
            user.phone_no = data.phone_no.strip()
            
        # ROLE-BASED PASSWORD UPDATE LOGIC
        if data.new_password:

            if hasattr(user, 'role') and user.role.lower() == 'admin':
                
                if not data.current_password:
                    return {
                        "success": False,
                        "message": "Current password is required to change password",
                        "data": None,
                        "error": {
                            "code": "PASSWORD_REQUIRED",
                            "details": "Admin must provide current password."
                        }
                    }
                
                if not verify_password(data.current_password, user.password):
                    return {
                        "success": False,
                        "message": "Incorrect current password",
                        "data": None,
                        "error": {
                            "code": "INVALID_PASSWORD",
                            "details": "The current password provided is incorrect."
                        }
                    }
                
                user.password = get_password_hash(data.new_password)
                
            else:
                return {
                    "success": False,
                    "message": "Permission denied",
                    "data": None,
                    "error": {
                        "code": "ACCESS_DENIED",
                        "details": "Agents are not allowed to change password through this endpoint."
                    }
                }
            
        db.commit()
        db.refresh(user)
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "data": {
                "user_id": user.user_id,
                "role": user.role if hasattr(user, 'role') else "unknown", 
                "username": user.username,
                "email": user.email,
                "phone_no": user.phone_no if user.phone_no else "-"
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