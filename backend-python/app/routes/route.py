from fastapi import APIRouter, Depends, status,Query
from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy import func
from pydantic import BaseModel
from app.database.database import get_db
from app.database import models
from typing import Optional
from app.utils.auth_utils import get_current_user

router = APIRouter(prefix="/api/routes", tags=["Routes"])

class RouteSchema(BaseModel):
    departure_city: str
    arrival_city: str

# 1. CREATE
@router.post("/", status_code=status.HTTP_201_CREATED)

def create_route(data: RouteSchema, db: Session = Depends(get_db),current_user: dict = Depends(get_current_user)):
    # Check route is already exist on db 

   
    if data.departure_city.strip().lower() == data.arrival_city.strip().lower():
        return {"success": False, "message": "Departure city and arrival city cannot be the same"}


    existing_route = db.query(models.Route).filter(
        func.lower(models.Route.departure_city) == func.lower(data.departure_city),
        func.lower(models.Route.arrival_city) == func.lower(data.arrival_city)
    ).first()

    if existing_route:
        if existing_route.is_deleted:
            existing_route.is_deleted = False
            existing_route.departure_city = data.departure_city
            existing_route.arrival_city = data.arrival_city
            db.commit()
            return {"success": True, "message": "Route re-activated", "data": existing_route}
        return {"success": False, "message": "Route already exists"}

    new_route = models.Route(
        departure_city=data.departure_city,
        arrival_city=data.arrival_city
    )
    db.add(new_route)
    db.commit()
    db.refresh(new_route)
    return {"success": True, "message": "Route created", "data": new_route}

# 2. READ ALL
@router.get("/")
def get_routes(
    skip: int = 0, 
    limit: int = 5, 
    search: Optional[str] = Query(None), # accept search as optional query
    db: Session = Depends(get_db)
):
    # Base query
    query = db.query(models.Route).filter(models.Route.is_deleted == False)
    
    # search city name on db
    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            (models.Route.departure_city.like(search_filter)) | 
            (models.Route.arrival_city.like(search_filter))
        )
        
    # calculate total after filter
    total_count = query.count()
    
    # Paginate
    routes = query.offset(skip).limit(limit).all()
    
    return {
        "success": True,
        "data": routes,
        "pagination": {
            "total": total_count,
            "skip": skip,
            "limit": limit
        }
    }

# 3. UPDATE
@router.put("/{id}")
def update_route(id: int, data: RouteSchema, db: Session = Depends(get_db),current_user: dict = Depends(get_current_user)):
    route = db.query(models.Route).filter(
        models.Route.route_id == id,
        models.Route.is_deleted == False
    ).first()

    if not route:
        return {"success": False, "message": "Route not found"}

    
    if data.departure_city.strip().lower() == data.arrival_city.strip().lower():
        return {"success": False, "message": "Departure city and arrival city cannot be the same"}

    duplicate = db.query(models.Route).filter(
        func.lower(models.Route.departure_city) == func.lower(data.departure_city),
        func.lower(models.Route.arrival_city) == func.lower(data.arrival_city),
        models.Route.route_id != id,
        models.Route.is_deleted == False
    ).first()

    if duplicate:
        return {"success": False, "message": "Route already exists"}

    route.departure_city = data.departure_city
    route.arrival_city = data.arrival_city
    db.commit()
    return {"success": True, "message": "Route updated successfully", "data": route}

# 4. DELETE (Soft Delete)
@router.delete("/{id}")
def delete_route(id: int, db: Session = Depends(get_db),current_user: dict = Depends(get_current_user)):
    route = db.query(models.Route).filter(
        models.Route.route_id == id,
        models.Route.is_deleted == False
    ).first()

    if not route:
        return {"success": False, "message": "Route not found or deleted"}

   
    linked_schedule = db.query(models.RouteSchedule).filter(
        models.RouteSchedule.route_id == id,
        models.RouteSchedule.is_deleted == False
    ).first()

    if linked_schedule:
        return {
            "success": False,
            "message": "Cannot delete this route because it still has active schedules associated with it."
        }

    route.is_deleted = True
    db.commit()
    return {"success": True, "message": "Route marked as deleted"}