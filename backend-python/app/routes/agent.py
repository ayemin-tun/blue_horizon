from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime, timedelta

from app.database.database import get_db
from app.database import models
from sqlalchemy import cast, String

router = APIRouter(prefix="/api/agents", tags=["Agent Management"])

# --- UNIFIED RESPONSE SCHEMA  ---
class ApiResponse(BaseModel):
    success: bool  
    message: str
    data: Optional[Any] = None
    error: Optional[dict] = None

class AgentCreateSchema(BaseModel):
    username: str
    email: str
    password: str
    phone_no: Optional[str] = None
    status: Optional[str] = "ACTIVE"


# --- 1. READ ALL AGENTS API (With Status Filter) ---    
@router.get("", response_model=ApiResponse)
def get_agents(
    skip: int = 0, 
    limit: int = 10, 
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        # base query for agents (role = agent and is_deleted = 0)
        base_query = db.query(models.User).filter(models.User.role == "agent", models.User.is_deleted == 0)
        
        # check if status filter is provided and apply it to the base query
        if status:
            formatted_status = status.strip().upper()
            base_query = base_query.filter(models.User.status == formatted_status)

        #  Search Keyword with email or user_name
        if search:
            search_filter = f"%{search.strip()}%"
            base_query = base_query.filter(
                (models.User.email.like(search_filter)) | # Email
                (models.User.username.like(search_filter)) # Name / Username 
            )

        # metrics calculation
        total_count = db.query(models.User).filter(models.User.role == "agent", models.User.is_deleted == 0).count()
        active_count = db.query(models.User).filter(models.User.role == "agent", models.User.is_deleted == 0, models.User.status == "ACTIVE").count()
        inactive_count = db.query(models.User).filter(models.User.role == "agent", models.User.is_deleted == 0, models.User.status == "INACTIVE").count()
        
        # Recent Joined
        recent_joined_count = 0
        all_agents = db.query(models.User).filter(models.User.role == "agent", models.User.is_deleted == 0).all()
        current_time = datetime.now()
        for agent in all_agents:
            if agent.joined_date:
                try:
                    joined_dt = datetime.strptime(agent.joined_date, "%d/%m/%Y")
                    if current_time - joined_dt <= timedelta(days=30):
                        recent_joined_count += 1
                except ValueError:
                    continue

        # Filtered Total Count and pagination ---
       
        filtered_total = base_query.count() 
        
        agents = (
            base_query
            .offset(skip)
            .limit(limit)
            .all()
        )
        
        # Data Mapping
        formatted_agents = [
            {
                "agent_id": user.user_id,
                "username": user.username,
                "email": user.email,
                "phone_no": user.phone_no if user.phone_no else "-",
                "status": user.status,
                "joined_date": user.joined_date if user.joined_date else "-"
            } for user in agents
        ]
        
        return {
            "success": True,
            "message": "Agents fetched successfully",
            "data": {
                "metrics": {
                    "total": total_count,
                    "active": active_count,
                    "inactive": inactive_count,
                    "recent_joined": recent_joined_count
                },
                "agents": formatted_agents,
                "pagination": {
                    "total": filtered_total, 
                    "skip": skip,
                    "limit": limit
                }
            },
            "error": None
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Failed to fetch agents",
            "data": None,
            "error": {
                "code": "SERVER_ERROR",
                "details": str(e)
            }
        }

# --- 2. RETRIEVE (GET AGENT ) ---
@router.get("/{id}", response_model=ApiResponse)
def get_agent_by_id(id: int, db: Session = Depends(get_db)):
    try:
        # check role is agent and id 
        agent = db.query(models.User).filter(
            models.User.user_id == id,
            models.User.role == "agent",
            models.User.is_deleted == 0
        ).first()
        
        # not found agent
        if not agent:
            return {
                "success": False,
                "message": "Agent not found",
                "data": None,
                "error": {
                    "code": "AGENT_NOT_FOUND",
                    "details": f"Agent does not exist."
                }
            }
            
        # data mapping
        formatted_agent = {
            "agent_id": agent.user_id,
            "username": agent.username,
            "email": agent.email,
            "phone_no": agent.phone_no if agent.phone_no else "-",
            "status": agent.status,
            "joined_date": agent.joined_date if agent.joined_date else "-"
        }
        
        return {
            "success": True,
            "message": "Agent details fetched successfully",
            "data": formatted_agent,
            "error": None
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Failed to fetch agent details",
            "data": None,
            "error": {
                "code": "SERVER_ERROR",
                "details": str(e)
            }
        }

#----- 3. DELETE AGENT (SOFT DELETE) ---
@router.delete("/{id}", response_model=ApiResponse)
def delete_agent(id: int, db: Session = Depends(get_db)):
    try:
        agent = db.query(models.User).filter(
            models.User.user_id == id,
            models.User.role == "agent",
            models.User.is_deleted == 0
        ).first()
        
        if not agent:
            return {
                "success": False, 
                "message": "Agent not found", 
                "data": None,
                "error": {
                    "code": "AGENT_NOT_FOUND",
                    "details": f"Active agent with ID {id} does not exist."
                }
            }
            
        agent.is_deleted = 1 
        db.commit()
        
        return {
            "success": True, 
            "message": "Agent deleted successfully",
            "data": None,
            "error": None
        }
        
    except Exception as e:
        return {
            "success": False, 
            "message": "Failed to delete agent", 
            "data": None,
            "error": {
                "code": "SERVER_ERROR",
                "details": str(e)
            }
        }
    
# --- 4. CREATE AGENT API Partial Unique index ---
@router.post("", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
def create_agent(data: AgentCreateSchema, db: Session = Depends(get_db)):
    try:
        # check email is active and already registered (is_deleted = 0)
        existing_active_user = db.query(models.User).filter(
            models.User.email == data.email,
            models.User.is_deleted == 0 
        ).first()

        if existing_active_user:
            return {
                "success": False,
                "message": "Registration failed",
                "data": None,
                "error": {
                    "code": "EMAIL_ALREADY_EXISTS", 
                    "details": "Email already registered and active."
                }
            }

        from app.utils.auth_utils import get_password_hash
        hashed_pwd = get_password_hash(data.password)
        current_date_str = datetime.now().strftime("%d/%m/%Y")

        new_agent = models.User(
            username=data.username,
            email=data.email,
            password=hashed_pwd,
            role="agent",
            phone_no=data.phone_no,
            status=data.status if data.status else "ACTIVE",
            joined_date=current_date_str,
            is_deleted=0
        )
        
        db.add(new_agent)
        db.commit()
        db.refresh(new_agent)
        
        return {
            "success": True,
            "message": "Agent created successfully",
            "data": {
                "agent_id": new_agent.user_id,
                "username": new_agent.username,
                "email": new_agent.email,
                "status": new_agent.status
            },
            "error": None
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Failed to create agent",
            "data": None,
            "error": {
                "code": "SERVER_ERROR",
                "details": str(e)
            }
        }


class AgentStatusUpdateSchema(BaseModel):
    status: str 


# --- 5. UPDATE AGENT STATUS API ---
@router.patch("/{id}/status", response_model=ApiResponse)
def update_agent_status(id: int, data: AgentStatusUpdateSchema, db: Session = Depends(get_db)):
    try:
        # check role is agent and not soft delete
        agent = db.query(models.User).filter(
            models.User.user_id == id,
            models.User.role == "agent",
            models.User.is_deleted == 0
        ).first()
        
        # if agent not found show error 
        if not agent:
            return {
                "success": False,
                "message": "Agent not found",
                "data": None,
                "error": {
                    "code": "AGENT_NOT_FOUND",
                    "details": f"Active agent with ID {id} does not exist."
                }
            }
        
        # format status
        new_status = data.status.strip().upper()
        
        if new_status not in ["ACTIVE", "INACTIVE"]:
            return {
                "success": False,
                "message": "Invalid status value",
                "data": None,
                "error": {
                    "code": "INVALID_STATUS",
                    "details": "Status must be either 'ACTIVE' or 'INACTIVE'."
                }
            }
            
        agent.status = new_status
        db.commit()
        db.refresh(agent)
        
        return {
            "success": True,
            "message": f"Agent status updated to {new_status} successfully",
            "data": {
                "agent_id": agent.user_id,
                "username": agent.username,
                "status": agent.status
            },
            "error": None
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Failed to update agent status",
            "data": None,
            "error": {
                "code": "SERVER_ERROR",
                "details": str(e)
            }
        }

class AgentUpdateSchema(BaseModel):
    username: str
    email: str
    phone_no: Optional[str] = None
    status: Optional[str] = "ACTIVE"

# --- 6. UPDATE AGENT ALL DATA API (🌟 အသစ်ဖြည့်စွက်လိုက်သည့်အချက်) ---
@router.put("/{id}", response_model=ApiResponse)
def update_agent(id: int, data: AgentUpdateSchema, db: Session = Depends(get_db)):
    try:
        # Check agent is on db
        agent = db.query(models.User).filter(
            models.User.user_id == id,
            models.User.role == "agent",
            models.User.is_deleted == 0
        ).first()
        
        if not agent:
            return {
                "success": False,
                "message": "Agent not found",
                "data": None,
                "error": {
                    "code": "AGENT_NOT_FOUND",
                    "details": f"Active agent with ID {id} does not exist."
                }
            }
            
        # Check email is already exist
        if data.email != agent.email:
            email_exists = db.query(models.User).filter(
                models.User.email == data.email,
                models.User.user_id != id,  
                models.User.is_deleted == 0
            ).first()
            
            if email_exists:
                return {
                    "success": False,
                    "message": "Update failed",
                    "data": None,
                    "error": {
                        "code": "EMAIL_ALREADY_EXISTS",
                        "details": "This email is already registered by another active user."
                    }
                }

        # check status value
        formatted_status = data.status.strip().upper() if data.status else "ACTIVE"
        if formatted_status not in ["ACTIVE", "INACTIVE"]:
            return {
                "success": False,
                "message": "Invalid status value",
                "data": None,
                "error": {
                    "code": "INVALID_STATUS",
                    "details": "Status must be either 'ACTIVE' or 'INACTIVE'."
                }
            }

        # updae
        agent.username = data.username.strip()
        agent.email = data.email.strip()
        agent.phone_no = data.phone_no.strip() if data.phone_no else None
        agent.status = formatted_status
        
        db.commit()
        db.refresh(agent)
        
        return {
            "success": True,
            "message": "Agent information updated successfully",
            "data": {
                "agent_id": agent.user_id,
                "username": agent.username,
                "email": agent.email,
                "phone_no": agent.phone_no if agent.phone_no else "-",
                "status": agent.status
            },
            "error": None
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Failed to update agent details",
            "data": None,
            "error": {
                "code": "SERVER_ERROR",
                "details": str(e)
            }
        }