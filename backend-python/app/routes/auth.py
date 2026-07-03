from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Any, Optional

from app.database.database import get_db
from app.database import models
from app.utils.auth_utils import get_password_hash, verify_password, create_access_token
from datetime import datetime

router = APIRouter(
    prefix="/api",
    tags=["Authentication"]
)

# ---  1. REQUEST SCHEMAS ---
class RegisterSchema(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

# --- 2. UNIFIED RESPONSE SCHEMA ---
class ApiResponse(BaseModel):
    success: bool  
    message: str
    data: Optional[Any] = None
    error: Optional[dict] = None


# ---  1. REGISTER API ---
@router.post("/register", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: RegisterSchema, db: Session = Depends(get_db)):

    #check email is already register
    db_user = db.query(models.User).filter(
        models.User.email == user_data.email,
        models.User.is_deleted == 0 # 🌟 ဒီတစ်လိုင်း တိုးပေးပါ
    ).first()
    
    if db_user:
        return {
            "success": False,
            "message": "Registration failed",
            "data": None,
            "error": {"code": "EMAIL_ALREADY_EXISTS", "details": "Email already registered"}
        }
    
    #password hash
    hashed_pwd = get_password_hash(user_data.password)
    
    #catch register date
    current_date_str = datetime.now().strftime("%d/%m/%Y")
    new_user = models.User(
        username=user_data.username,
        email=user_data.email,
        password=hashed_pwd,
        role="agent",
        joined_date=current_date_str,
        status="ACTIVE"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "success": True,
        "message": "User registered successfully",
        "data": {"username": new_user.username, "email": new_user.email},
        "error": None  
    }


# --- 2. LOGIN API ---
@router.post("/login", response_model=ApiResponse)
def login_user(login_data: LoginSchema, db: Session = Depends(get_db)):
    # chcek email and user is on db
    db_user = db.query(models.User).filter(
        models.User.email == login_data.email,
        models.User.is_deleted == 0 
    ).first()

    if not db_user:
        return {
            "success": False,
            "message": "Login failed",
            "data": None,
            "error": {"code": "INVALID_CREDENTIALS", "details": "Invalid Email or Password"}
        }
    
    # Change passwrod to hash password
    if not verify_password(login_data.password, db_user.password):
        return {
            "success": False,
            "message": "Login failed",
            "data": None,
            "error": {"code": "INVALID_CREDENTIALS", "details": "Invalid Email or Password"}
        }
    
    if db_user.status != "ACTIVE":
        return {
            "success": False,
            "message": "Login failed",
            "data": None,
            "error": {
                "code": "ACCOUNT_INACTIVE", 
                "details": "Your account has been deactivated. Please contact the administrator."
            }
        }

    if db_user.is_deleted != 0:
        return {
            "success": False,
            "message": "Login failed",
            "data": None,
            "error": {
                "code": "ACCOUNT_INACTIVE Or Deleted", 
                "details": "Your account has been deactivated or deleted. Please contact the administrator."
            }
        }

    # generate jwt token 
    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role})
    
    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "access_token": access_token,
            "token_type": "bearer",
            "role": db_user.role,
            "username": db_user.username,
            "email": db_user.email
        },
        "error": None
    }

# =====================================================================
#  NEW CODES FOR FORGOT PASSWORD 
# =====================================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database import models

class ForgotPasswordSchema(BaseModel):
    email: EmailStr

@router.post("/auth/forgot-password", response_model=ApiResponse)
def forgot_password_request(request_data: ForgotPasswordSchema, db: Session = Depends(get_db)):
    
    db_user = db.query(models.User).filter(
        models.User.email == request_data.email,
        models.User.is_deleted == 0
    ).first()

    if not db_user:
        return {
            "success": False,
            "message": "Request failed",
            "data": None,
            "error": {
                "code": "AGENT_NOT_FOUND", 
                "details": "Agent not found"
            }
        }
        
    if db_user.role and db_user.role.lower() == "admin":
        return {
            "success": False,
            "message": "Request failed",
            "data": None,
            "error": {
                "code": "ADMIN_RESTRICTION",
                "details": "Administrators are not allowed to request password resets."
            }
        }

    existing_request = db.query(models.PasswordResetRequest).filter(
        models.PasswordResetRequest.email == request_data.email,
        models.PasswordResetRequest.status == "PENDING",
        models.PasswordResetRequest.is_deleted == 0
    ).first()

    if existing_request:
        return {
            "success": False,
            "message": "Request already exists",
            "data": None,
            "error": {
                "code": "PENDING_REQUEST_EXISTS", 
                "details": "You have already requested a password reset. Please wait for Admin approval."
            }
        }

    new_request = models.PasswordResetRequest(
        email=request_data.email,
        status="PENDING"
    )
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return {
        "success": True,
        "message": "Password reset request submitted successfully to admin.",
        "data": {"email": new_request.email, "status": new_request.status},
        "error": None
    }


@router.get("/admin/password-requests", response_model=ApiResponse)
def get_all_password_requests(
    page: int = 1, 
    limit: int = 10, 
    status: Optional[str] = None,
    search: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    pending_count = db.query(models.PasswordResetRequest).filter(
        models.PasswordResetRequest.status == "PENDING",
        models.PasswordResetRequest.is_deleted == 0
    ).count()

    resolved_count = db.query(models.PasswordResetRequest).filter(
        models.PasswordResetRequest.status == "RESOLVED",
        models.PasswordResetRequest.is_deleted == 0
    ).count()

    base_query = db.query(models.PasswordResetRequest, models.User.username).\
        outerjoin(models.User, (models.User.email == models.PasswordResetRequest.email) & (models.User.is_deleted == 0)).\
        filter(models.PasswordResetRequest.is_deleted == 0)

    if status:
        base_query = base_query.filter(models.PasswordResetRequest.status == status)

    if search:
        base_query = base_query.filter(
            (models.PasswordResetRequest.email.contains(search)) |
            (models.User.username.contains(search))
        )

    total_items = base_query.count()
    offset = (page - 1) * limit
    
    results = base_query.order_by(models.PasswordResetRequest.id.desc()).offset(offset).limit(limit).all()

    formatted_list = []
    for request, username in results:
        formatted_list.append({
            "id": request.id,
            "email": request.email,
            "username": username or "Unknown Agent",
            "status": request.status,
            "created_at": request.created_at,
            "updated_at": request.updated_at
        })

    return {
        "success": True,
        "message": "Password requests retrieved successfully",
        "data": {
            "requests": formatted_list,
            "metrics": {
                "total_pending": pending_count,
                "total_resolved": resolved_count,
                "total_all": pending_count + resolved_count
            },
            "pagination": {
                "page": page,
                "limit": limit,
                "total_items": total_items
            }
        },
        "error": None
    }


@router.get("/admin/password-requests/{request_id}", response_model=ApiResponse)
def get_password_request_detail(request_id: int, db: Session = Depends(get_db)):
    
    result = db.query(models.PasswordResetRequest, models.User).\
        outerjoin(models.User, (models.User.email == models.PasswordResetRequest.email) & (models.User.is_deleted == 0)).\
        filter(models.PasswordResetRequest.id == request_id, models.PasswordResetRequest.is_deleted == 0).first()

    if not result:
        return {
            "success": False,
            "message": "Request not found",
            "data": None,
            "error": {"code": "REQUEST_NOT_FOUND", "details": "The password request ID does not exist."}
        }

    request, user = result
    
    formatted_data = {
        "id": request.id,
        "email": request.email,
        "status": request.status,
        "created_at": request.created_at,
        "updated_at": request.updated_at,
        "user_details": {
            "username": user.username if user else "Unknown Agent",
            "role": user.role if user else None,
            "status": user.status if user else None,
            "joined_date": user.joined_date if user else None
        }
    }

    return {
        "success": True,
        "message": "Password request detail retrieved successfully",
        "data": formatted_data,
        "error": None
    }