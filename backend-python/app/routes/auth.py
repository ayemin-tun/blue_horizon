from fastapi import APIRouter, BackgroundTasks, Depends, status,Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Any, Optional
from email_validator import validate_email, EmailNotValidError
from app.database.database import get_db
from app.database import models
from app.utils.auth_utils import get_password_hash, verify_password, create_access_token
from datetime import datetime
from app.utils.reset_email_sender import send_email_notification
from app.utils.email_verification_utils import generate_verification_token, send_verification_email
from fastapi import BackgroundTasks  
from app.config import EMAIL_VERIFICATION_REQUIRED


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


@router.post("/register", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: RegisterSchema, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):

    db_user = db.query(models.User).filter(
        models.User.email == user_data.email,
        models.User.is_deleted == 0
    ).first()

    if db_user:
        return {
            "success": False,
            "message": "Registration failed",
            "data": None,
            "error": {"code": "EMAIL_ALREADY_EXISTS", "details": "Email already registered"}
        }

    hashed_pwd = get_password_hash(user_data.password)
    current_date_str = datetime.now().strftime("%d/%m/%Y")

    new_user = models.User(
        username=user_data.username,
        email=user_data.email,
        password=hashed_pwd,
        role="agent",
        joined_date=current_date_str,
        # 🆕 Flag-based behavior
        status="ACTIVE" if not EMAIL_VERIFICATION_REQUIRED else "INACTIVE",
        is_email_verified=1 if not EMAIL_VERIFICATION_REQUIRED else 0
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    response_message = "User registered successfully."

    # 🆕 Only generate token / send email if verification is required
    if EMAIL_VERIFICATION_REQUIRED:
        token = generate_verification_token(db, new_user.user_id)
        db.commit()
        background_tasks.add_task(
            send_verification_email,
            email=new_user.email,
            username=new_user.username,
            token=token
        )
        response_message = "Registered successfully. Please check your email to verify your account before logging in."

    return {
        "success": True,
        "message": response_message,
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
    
    if EMAIL_VERIFICATION_REQUIRED and db_user.role == "agent" and db_user.is_email_verified == 0:
        return {
        "success": False,
        "message": "Login failed",
        "data": None,
        "error": {
            "code": "EMAIL_NOT_VERIFIED",
            "details": "Please verify your email address before logging in. Check your inbox for the verification link."
        }
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
            "email": db_user.email,
            "phone_no":db_user.phone_no,
            "user_id":db_user.user_id
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
    # Check if the user status is ACTIVE (Only ACTIVE users can request password reset)
    formatted_user_status = db_user.status.strip().upper() if db_user.status else "ACTIVE"
    if formatted_user_status != "ACTIVE":
        return {
            "success": False,
            "message": "Request failed",
            "data": None,
            "error": {
                "code": "INVALID_STATUS",
                "details": f"Password reset is not allowed. Your account status is currently '{formatted_user_status}', but it must be 'ACTIVE'."
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
    skip: int = 0, 
    limit: int = 10, 
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None), 
    db: Session = Depends(get_db)
):
    try:
        # Base Query
        base_query = db.query(models.PasswordResetRequest, models.User.username, models.User.phone_no).\
        outerjoin(models.User, (models.User.email == models.PasswordResetRequest.email) & (models.User.is_deleted == 0)).\
        filter(models.PasswordResetRequest.is_deleted == 0)

        # Apply Filters
        if status:
            base_query = base_query.filter(models.PasswordResetRequest.status == status.strip().upper())
            
        if search:
            search_filter = f"%{search.strip()}%"
            base_query = base_query.filter(
                (models.PasswordResetRequest.email.like(search_filter)) | 
                (models.User.username.like(search_filter))
            )

        # Metrics Calculation
        total_pending = db.query(models.PasswordResetRequest).filter(models.PasswordResetRequest.status == "PENDING", models.PasswordResetRequest.is_deleted == 0).count()
        total_resolved = db.query(models.PasswordResetRequest).filter(models.PasswordResetRequest.status == "RESOLVED", models.PasswordResetRequest.is_deleted == 0).count()
        
        # Filtered Total Count (for pagination)
        total_items = base_query.count()
        
        # Fetch Paginated Data
        requests = base_query.order_by(models.PasswordResetRequest.id.desc()).offset(skip).limit(limit).all()

        # Data Mapping
        formatted_requests = [
            {
                "id": req.id,
                "email": req.email,
                "username": user_name or "Unknown Agent",
                "phone_no": phone_no or "-", 
                "status": req.status,
                "created_at": req.created_at.strftime("%d/%m/%Y %H:%M") if req.created_at else "-",
                "updated_at": req.updated_at.strftime("%d/%m/%Y %H:%M") if req.updated_at else "-"
            } for req, user_name, phone_no in requests
        ]

        return {
            "success": True,
            "message": "Password requests retrieved successfully",
            "data": {
                "metrics": {
                    "total_pending": total_pending,
                    "total_resolved": total_resolved,
                    "total_all": total_pending + total_resolved
                },
                "requests": formatted_requests,
                "pagination": {
                    "total": total_items, 
                    "skip": skip,
                    "limit": limit
                }
            },
            "error": None
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Failed to fetch password requests",
            "data": None,
            "error": {
                "code": "SERVER_ERROR",
                "details": str(e)
            }
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
            "phone_no": user.phone_no if user else '-',
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
# --- Request Schema for Resolving Password ---

class ResolvePasswordSchema(BaseModel):
    new_password: str

# --- 3. RESOLVE PASSWORD REQUEST API ---
@router.patch("/admin/password-requests/{request_id}/resolve", response_model=ApiResponse)
def resolve_password_request(
    request_id: int, 
    payload: ResolvePasswordSchema, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    # Find Password Request Record by ID and Ensure it's Not Deleted
    request_record = db.query(models.PasswordResetRequest).filter(
        models.PasswordResetRequest.id == request_id,
        models.PasswordResetRequest.is_deleted == 0
    ).first()

    if not request_record:
        return {"success": False, "message": "Request ID not found", "error": {"code": "REQUEST_NOT_FOUND"}}

    if request_record.status.upper() == "RESOLVED":
        return {"success": False, "message": "Already resolved", "error": {"code": "ALREADY_RESOLVED"}}

    # Search User in db
    db_user = db.query(models.User).filter(
        models.User.email == request_record.email,
        models.User.is_deleted == 0
    ).first()

    
    if not db_user:
        return {"success": False, "message": "User not found in database", "error": {"code": "USER_NOT_FOUND"}}

    # check email address is correct format 
    try:
        validate_email(db_user.email, check_deliverability=True)
    except EmailNotValidError:
        return {
            "success": False, 
            "message": "Invalid email address detected", 
            "error": {"code": "INVALID_EMAIL", "details": "The recipient email is not reachable."}
        }

    # 4. Password Update 
    hashed_pwd = get_password_hash(payload.new_password)
    db_user.password = hashed_pwd
    request_record.status = "RESOLVED"
    request_record.updated_at = datetime.now()

    db.commit()
    db.refresh(db_user)
    db.refresh(request_record)

    #Email send with background task
    background_tasks.add_task(
        send_email_notification, 
        email=db_user.email, 
        username=db_user.username,
        temp_password=payload.new_password
    )

    return {
        "success": True,
        "message": "Password reset successfully and email notification send to request email.",
        "data": {"request_id": request_record.id, "email": db_user.email}
    }

@router.get("/verify-email", response_model=ApiResponse)
def verify_email(token: str, db: Session = Depends(get_db)):

    token_record = db.query(models.EmailVerificationToken).filter(
        models.EmailVerificationToken.token == token,
        models.EmailVerificationToken.is_used == 0
    ).first()

    if not token_record:
        return {
            "success": False,
            "message": "Verification failed",
            "data": None,
            "error": {"code": "INVALID_TOKEN", "details": "This verification link is invalid or has already been used."}
        }

    if token_record.expires_at < datetime.now():
        return {
            "success": False,
            "message": "Verification failed",
            "data": None,
            "error": {"code": "TOKEN_EXPIRED", "details": "This verification link has expired. Please request a new one."}
        }

    user = db.query(models.User).filter(models.User.user_id == token_record.user_id).first()
    if not user:
        return {
            "success": False,
            "message": "Verification failed",
            "data": None,
            "error": {"code": "USER_NOT_FOUND", "details": "Associated user account no longer exists."}
        }

    user.is_email_verified = 1
    user.status = "ACTIVE"
    token_record.is_used = 1

    db.commit()

    return {
        "success": True,
        "message": "Email verified successfully. You can now log in.",
        "data": {"email": user.email},
        "error": None
    }

class ResendVerificationSchema(BaseModel):
    email: EmailStr

@router.post("/resend-verification", response_model=ApiResponse)
def resend_verification(data: ResendVerificationSchema, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):

    user = db.query(models.User).filter(
        models.User.email == data.email,
        models.User.is_deleted == 0
    ).first()

    if not user:
        return {"success": False, "message": "Request failed", "data": None, "error": {"code": "USER_NOT_FOUND", "details": "No account found with this email."}}

    if user.is_email_verified == 1:
        return {"success": False, "message": "Already verified", "data": None, "error": {"code": "ALREADY_VERIFIED", "details": "This email is already verified."}}

    token = generate_verification_token(db, user.user_id)
    db.commit()
    background_tasks.add_task(send_verification_email, email=user.email, username=user.username, token=token)

    return {"success": True, "message": "Verification email resent.", "data": {"email": user.email}, "error": None}