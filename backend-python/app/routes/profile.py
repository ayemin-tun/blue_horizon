from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Any

from app.database.database import get_db
from app.database import models

# ✨ Auth Utilities မှ Password စစ်ဆေးရန်နှင့် Hash လုပ်ရန် ကိရိယာများကို ခေါ်ယူလိုက်ပါတယ်
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
    # ✨ Admin ဘက်က Password ပြောင်းချင်ရင် ထည့်ပေးရမယ့် Field အသစ် ၂ ခု (Optional အဖြစ် ထားထားပါတယ်)
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
        # Token ကနေမယူတော့ဘဲ လှမ်းပို့လိုက်တဲ့ user_id နဲ့ Database ထဲမှာ တိုက်ရိုက်ပတ်ရှာမယ်
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
            
        # [၁] ပုံမှန် Profile အချက်အလက်များကို အရင် Update လုပ်ခြင်း (Admin ရော Agent ရော ရပါမယ်)
        user.username = data.username.strip()
        user.email = data.email.strip()
        
        if data.phone_no is not None:
            user.phone_no = data.phone_no.strip()
            
        # [၂] ROLE-BASED PASSWORD UPDATE LOGIC
        # Frontend ကနေ Password အသစ် (`new_password`) လှမ်းပို့လာတဲ့အခါမှသာ ဒီ Logic ထဲ ဝင်ပါမယ်
        if data.new_password:
            # ⚠️ စစ်ဆေးချက် - User ရဲ့ Role က 'admin' ဟုတ်၊ မဟုတ် စစ်ဆေးခြင်း
            # (အစ်ကိုကြီးတို့ DB မော်ဒယ်ထဲက Role ကော်လံနာမည် user.role ပေါ်မူတည်ပြီး လိုအပ်ရင် ပြင်ပေးပါ)
            if hasattr(user, 'role') and user.role.lower() == 'admin':
                
                # Password အသစ်ပြောင်းရင် အဟောင်းပါ မဖြစ်မနေ စစ်ဆေးဖို့ တောင်းဆိုခြင်း
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
                hashed_pwd = get_password_hash(user.password)
                # Password အဟောင်း မှန်၊ မမှန် စစ်ဆေးခြင်း (user.password နေရာတွင် မိမိတို့ DB ကော်လံနာမည် သုံးရန်)
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
                
                # အားလုံး ကိုက်ညီမှုရှိရင် Password အသစ်ကို စနစ်တကျ Hash လုပ်ပြီး DB ထဲ ထည့်သွင်းခြင်း
                user.password = get_password_hash(data.new_password)
                
            else:
                # ⚠️ စစ်ဆေးချက် - Admin မဟုတ်ဘဲ Agent က Password လှမ်းပို့လာရင် ပိတ်ချပစ်ပါမယ်
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
                "role": user.role if hasattr(user, 'role') else "unknown", # UI မှာ Role ပြန်စစ်လို့ရအောင် ထည့်ပေးထားပါတယ်
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