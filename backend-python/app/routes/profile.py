from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Any

from app.database.database import get_db
from app.database import models

from app.utils.auth_utils import verify_password, get_password_hash 
from app.config import EMAIL_VERIFICATION_REQUIRED



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

from app.utils.email_verification_utils import generate_verification_token, send_verification_email
from fastapi import BackgroundTasks  # add to existing imports

@router.put("/{user_id}", response_model=ApiResponse)
def update_profile(
    user_id: int,
    data: ProfileUpdateSchema,
    background_tasks: BackgroundTasks,   # 🆕 add this parameter
    db: Session = Depends(get_db)
):
    try:
        user = db.query(models.User).filter(models.User.user_id == user_id).first()

        if not user or user.is_deleted != 0:
            return {
                "success": False,
                "message": "Profile update failed",
                "data": None,
                "error": {"code": "USER_NOT_FOUND", "details": f"User account with ID {user_id} does not exist or has been deleted."}
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
                "error": {"code": "EMAIL_ALREADY_EXISTS", "details": f"The email '{input_email}' is already taken by another user."}
            }

        # 🆕 Detect whether the email is actually changing, BEFORE overwriting it
        email_is_changing = (input_email.lower() != user.email.lower())

        user.username = data.username.strip()
        user.email = input_email

        if data.phone_no is not None:
            user.phone_no = data.phone_no.strip()

        # ...and further down, where the verification email gets sent:
        if EMAIL_VERIFICATION_REQUIRED and email_is_changing and user.role == "agent":
            user.is_email_verified = 0
            user.status = "INACTIVE"
            token = generate_verification_token(db, user.user_id)
            db.commit()
            background_tasks.add_task(send_verification_email, email=user.email, username=user.username, token=token)

        # (existing password-change logic stays unchanged below)
        if data.new_password:
            if hasattr(user, 'role') and user.role.lower() == 'admin':
                if not data.current_password:
                    return {
                        "success": False,
                        "message": "Current password is required to change password",
                        "data": None,
                        "error": {"code": "PASSWORD_REQUIRED", "details": "Admin must provide current password."}
                    }
                if not verify_password(data.current_password, user.password):
                    return {
                        "success": False,
                        "message": "Incorrect current password",
                        "data": None,
                        "error": {"code": "INVALID_PASSWORD", "details": "The current password provided is incorrect."}
                    }
                user.password = get_password_hash(data.new_password)
            else:
                return {
                    "success": False,
                    "message": "Permission denied",
                    "data": None,
                    "error": {"code": "ACCESS_DENIED", "details": "Agents are not allowed to change password through this endpoint."}
                }

        db.commit()
        db.refresh(user)

        # 🆕 Send a fresh verification email AFTER commit (need the new user_id/email saved)
        if email_is_changing and user.role == "agent":
            token = generate_verification_token(db, user.user_id)
            db.commit()
            background_tasks.add_task(send_verification_email, email=user.email, username=user.username, token=token)

        return {
            "success": True,
            "message": "Profile updated successfully."
                        + (" Please verify your new email address before logging in again." if (email_is_changing and user.role == "agent") else ""),
            "data": {
                "user_id": user.user_id,
                "role": user.role if hasattr(user, 'role') else "unknown",
                "username": user.username,
                "email": user.email,
                "phone_no": user.phone_no if user.phone_no else "-",
                "is_email_verified": user.is_email_verified   # 🆕 useful for frontend to show a banner
            },
            "error": None
        }

    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "message": "Failed to update profile",
            "data": None,
            "error": {"code": "SERVER_ERROR", "details": str(e)}
        }