from fastapi import APIRouter, Depends, status,Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Any
from app.database.database import get_db
from app.database import models

router = APIRouter(prefix="/api/airlines", tags=["Airlines"])

# --- Schema ---
class AirlineSchema(BaseModel):
    airline_name: str
    country: str

# --- 1. CREATE ---
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_airline(data: AirlineSchema, db: Session = Depends(get_db)):
    # check same name is already exist on db (include soft delete)
    existing_airline = db.query(models.Airline).filter(
        models.Airline.airline_name == data.airline_name
    ).first()

    if existing_airline:
        if existing_airline.is_deleted:
            # if airline is delete (Re-activate)
            existing_airline.is_deleted = False
            existing_airline.country = data.country # country အသစ်ကို Update လုပ်ပေးမယ်
            db.commit()
            return {"success": True, "message": "Airline re-activated", "data": existing_airline}
        else:
            # if not delete show already exist
            return {"success": False, "message": "Airline name already exists and active"}

    # if not exist, create new 
    new_airline = models.Airline(airline_name=data.airline_name, country=data.country)
    db.add(new_airline)
    db.commit()
    return {"success": True, "message": "Airline created", "data": new_airline}

# --- 2. READ ALL ---
@router.get("/")
def get_airlines(
    skip: int = 0, 
    limit: int = 5, 
    search: Optional[str] = Query(None), # accept search as optional query
    db: Session = Depends(get_db)
):
    # Base query
    query = db.query(models.Airline).filter(models.Airline.is_deleted == False)
    
    # search airline name on db
    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            (models.Airline.airline_name.like(search_filter)) | 
            (models.Airline.country.like(search_filter))
        )
        
    # calculate total after filter
    total_count = query.count()
    
    # Paginate
    airline = query.offset(skip).limit(limit).all()
    
    return {
        "success": True,
        "data": airline,
        "pagination": {
            "total": total_count,
            "skip": skip,
            "limit": limit
        }
    }

# --- 3. UPDATE ---
@router.put("/{id}")
def update_airline(id: int, data: AirlineSchema, db: Session = Depends(get_db)):
    airline = db.query(models.Airline).filter(models.Airline.airline_id == id).first()
    if not airline:
        return {"success": False, "message": "Airline not found"}
    
    airline.airline_name = data.airline_name
    airline.country = data.country
    db.commit()
    return {"success": True, "message": "Airline updated"}

# --- 4. DELETE (soft delete) ---
@router.delete("/{id}") 
def delete_airline(id: int, db: Session = Depends(get_db)):
    airline = db.query(models.Airline).filter(
        models.Airline.airline_id == id,
        models.Airline.is_deleted == False 
    ).first()
    
    if not airline:
        return {"success": False, "message": "Airline not found or already deleted"}
    
    # check airline is connect to other model
    linked_flights = db.query(models.Flight).filter(
        models.Flight.airline_id == id
    ).first()
    
    if linked_flights:
        return {
            "success": False, 
            "message": "Cannot delete this airline because it still has active flights that associated with it."
        }

    airline.is_deleted = True 
    db.commit()
    return {"success": True, "message": "Airline deleted successfully"}