from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Any, Optional

from app.database.database import get_db
from app.database import models
from app.utils.auth_utils import get_password_hash, verify_password, create_access_token

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
    db_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if db_user:
        return {
            "success": False,
            "message": "Registration failed",
            "data": None,
            "error": {"code": "EMAIL_ALREADY_EXISTS", "details": "Email already registered"}
        }
    
    #password hash
    hashed_pwd = get_password_hash(user_data.password)
    
    new_user = models.User(
        username=user_data.username,
        email=user_data.email,
        password=hashed_pwd,
        role="agent"
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
    db_user = db.query(models.User).filter(models.User.email == login_data.email).first()
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