from fastapi import APIRouter, Depends, status, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from app.database.database import get_db
from app.database import models
from app.schemas.schedules_schema import ScheduleCreate, ApiResponse, ScheduleResponse  
from typing import Optional, List
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/schedules", tags=["Schedules"])
def validate_schedule_business_logic(
    db: Session, 
    current_route_id: int, 
    new_departure_time: str, 
    new_arrival_time: str,
    new_flight_type: str,
    companion_schedules: List[models.RouteSchedule]
) -> Optional[dict]:
    
    if not companion_schedules:
        return None  # Schedule တစ်ခုမှ မရှိသေးပါက Pass

    companion_schedule = companion_schedules[0]
    
    # 🌟 🌟 🌟 ဉာဏ်ကောင်းသော စစ်ဆေးမှု (အသစ်): flight_type ချင်း တူနေရင် တားဆီးခြင်း
    # ဥပမာ- OUTBOUND ရှိပြီးသားကို နောက်ထပ် OUTBOUND ထပ်ထည့်တာမျိုး လုံးဝ ခွင့်မပြုပါ
    if companion_schedule.flight_type.strip().upper() == new_flight_type.strip().upper():
        return {
            "code": "DUPLICATE_FLIGHT_TYPE",
            "details": f"Flight ID already has an '{companion_schedule.flight_type}' schedule. Each flight must have exactly one OUTBOUND and one INBOUND schedule."
        }
    
    # ─── RULE 1: လမ်းကြောင်း အသွားအပြန် စစ်ဆေးခြင်း ───
    current_route = db.query(models.Route).filter(models.Route.route_id == current_route_id).first()
    companion_route = db.query(models.Route).filter(models.Route.route_id == companion_schedule.route_id).first()
    
    if not current_route or not companion_route:
        return {"code": "ROUTE_NOT_FOUND", "details": "Route data missing."}

    is_valid_return = (
        current_route.departure_city.strip().lower() == companion_route.arrival_city.strip().lower() and
        current_route.arrival_city.strip().lower() == companion_route.departure_city.strip().lower()
    )

    if not is_valid_return:
        return {
            "code": "INVALID_RETURN_ROUTE",
            "details": "Route conflict. Route must match the exact return route."
        }

    # အချိန် Format များ ပြင်ဆင်ခြင်း
    time_fmt = "%H:%M"
    display_fmt = "%I:%M %p"
    
    # ─── RULE 2: INBOUND (အပြန်ခရီးစဉ်) အတွက် နောက်ကြောင်းပြန်မဖြစ်စေရန် စစ်ဆေးခြင်း ───
    if new_flight_type == "INBOUND":
        # လက်ရှိသွင်းတာ INBOUND ဆိုရင် Companion က သေချာပေါက် OUTBOUND ဖြစ်ရမည်
        first_arrival = datetime.strptime(companion_schedule.arrival_time, time_fmt) # Outbound ဆင်းချိန်
        return_departure = datetime.strptime(new_departure_time, time_fmt)          # Inbound ထွက်ချိန်
        
        min_allowed_time_obj = first_arrival + timedelta(minutes=180)
        
        if return_departure < first_arrival:
            return {
                "code": "BACKWARD_TIME_ERROR",
                "details": f"The return flight departure ({return_departure.strftime(display_fmt)}) cannot be earlier than the first flight arrival ({first_arrival.strftime(display_fmt)}). The earliest available departure time is {min_allowed_time_obj.strftime(display_fmt)}."
            }
            
        time_difference = (return_departure - first_arrival).total_seconds() / 60
        if time_difference < 180:
            return {
                "code": "INSUFFICIENT_TURNAROUND_TIME",
                "details": f"The companion flight arrives at {first_arrival.strftime(display_fmt)}. The return flight must depart at least 3 hours (180 mins) later. Earliest available departure time is {min_allowed_time_obj.strftime(display_fmt)}."
            }
            
    # ─── RULE 3: OUTBOUND (အသွားခရီးစဉ်) အတွက် အချိန်ကျော်မသွားစေရန် စစ်ဆေးခြင်း ───
    else:
        # လက်ရှိသွင်းတာ OUTBOUND ဆိုရင် Companion က သေချာပေါက် INBOUND ဖြစ်ရမည်
        first_arrival = datetime.strptime(new_arrival_time, time_fmt)                 # Outbound ဆင်းချိန်
        return_departure = datetime.strptime(companion_schedule.departure_time, time_fmt) # Inbound ထွက်ချိန်
        
        # 🌟 (အချိန်တွက်ချက်မှု ပြင်ဆင်ခြင်း) 
        # Outbound ဆင်းပြီး ၃ နာရီကြာမှ Inbound ထွက်ရမှာဖြစ်လို့... 
        # Outbound ရဲ့ အနောက်ဆုံးထား ဆင်းရမယ့်အချိန်က = Inbound ထွက်ချိန် - ၃ နာရီ
        max_allowed_arrival_obj = return_departure - timedelta(minutes=180)
        
        # အကယ်၍ Outbound ဆင်းချိန်က Inbound ထွက်ချိန်ထက် နောက်ကျနေရင်
        if return_departure < first_arrival:
            return {
                "code": "FORWARD_TIME_ERROR",
                "details": f"The first flight arrival ({first_arrival.strftime(display_fmt)}) cannot be later than the return flight departure ({return_departure.strftime(display_fmt)}). Your flight must arrive by {max_allowed_arrival_obj.strftime(display_fmt)}."
            }
            
        time_difference = (return_departure - first_arrival).total_seconds() / 60  # ကျန်ရှိမည့် နားချိန် မိနစ်
        
        if time_difference < 180:
            return {
                "code": "INSUFFICIENT_TURNAROUND_TIME",
                # 🌟 Message ကို လုံးဝ ရှင်းရှင်းလင်းလင်း ပြောင်းလဲလိုက်ပါသည်
                "details": f"Insufficient turnaround time. The inbound flight departs at {return_departure.strftime(display_fmt)}. "
                           f"If this outbound flight arrives at {first_arrival.strftime(display_fmt)}, the aircraft will only have {int(time_difference)} minutes to rest. "
                           f"The outbound flight must arrive by {max_allowed_arrival_obj.strftime(display_fmt)} to ensure a 3-hour breakdown."
            }

    return None

# ─── 1. CREATE ROUTE SCHEDULE (REACTIVE/UPSERT VERSION) ───────────────────
@router.post("", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
def create_schedule(data: ScheduleCreate, db: Session = Depends(get_db)):
    try:
        # လမ်းကြောင်းနှင့် လေယာဉ် ရှိမရှိ အရင်စစ်ဆေးခြင်း
        if not db.query(models.Route).filter(models.Route.route_id == data.route_id, models.Route.is_deleted == 0).first():
            return {"success": False, "message": "Invalid route_id", "data": None, "error": {"code": "ROUTE_NOT_FOUND", "details": "Route does not exist."}}
        if not db.query(models.Flight).filter(models.Flight.flight_id == data.flight_id, models.Flight.is_deleted == 0).first():
            return {"success": False, "message": "Invalid flight_id", "data": None, "error": {"code": "FLIGHT_NOT_FOUND", "details": "Flight does not exist."}}

        # 🌟 ၁။ ဒေတာဘေ့စ်ထဲမှာ ဖျက်ထားတာရော၊ မဖျက်ထားတာရော (is_deleted မပါဘဲ) သမိုင်းကြောင်းအကုန်လုံးကို ဆွဲထုတ်လိုက်မယ်
        all_history_schedules = db.query(models.RouteSchedule).filter(
            models.RouteSchedule.flight_id == data.flight_id
        ).all()

        # Active ဖြစ်နေတဲ့ကောင်များနှင့် Deleted ဖြစ်နေတဲ့ကောင်များကို ခွဲထုတ်ခြင်း
        active_schedules = [s for s in all_history_schedules if s.is_deleted == 0]
        deleted_schedules = [s for s in all_history_schedules if s.is_deleted == 1]

        # 🌟 ၂။ လက်ရှိ Active ဖြစ်နေတာက ၂ ခုလုံး ပြည့်နေရင် အသစ်လုံးဝ ပေးမဆောက်တော့ဘူး
        if len(active_schedules) >= 2:
            return {
                "success": False, 
                "message": "Schedule limitation exceeded", 
                "data": None, 
                "error": {"code": "SCHEDULE_LIMIT_REACHED", "details": f"Flight ID {data.flight_id} already has 2 active schedules."}
            }

        # 🌟 ၃။ [Reactive အပိုင်း] - ဖျက်ထားတဲ့အထဲမှာ အခုသွင်းမယ့် flight_type (ဥပမာ- INBOUND) နဲ့ ကိုက်ညီတာ ရှိမရှိ စစ်မယ်
        existing_deleted_match = None
        for ds in deleted_schedules:
            if ds.flight_type.strip().upper() == data.flight_type.strip().upper():
                existing_deleted_match = ds
                break

        # ─── ကိစ္စ (က) ဖျက်ထားတဲ့ကောင် ရှိနေရင် အသစ်မဆောက်တော့ဘဲ Reactive လုပ်မယ် ───
        if existing_deleted_match:
            # Active ဖြစ်နေတဲ့ ကျန်တဲ့တစ်ဖက် (ဥပမာ- OUTBOUND) နဲ့ အချိန် ကိုက်မကိုက် အရင်စစ်မယ်
            business_error = validate_schedule_business_logic(
                db, data.route_id, data.departure_time, data.arrival_time, data.flight_type, active_schedules
            )
            if business_error:
                return {"success": False, "message": "Validation failed for restore", "data": None, "error": business_error}

            # အချက်အလက်အသစ်တွေ အစားထိုးပြီး ၎င်းကို Active ပြန်လုပ်ပေးလိုက်ခြင်း
            existing_deleted_match.route_id = data.route_id
            existing_deleted_match.departure_time = data.departure_time.strip()
            existing_deleted_match.arrival_time = data.arrival_time.strip()
            existing_deleted_match.economy_price = data.economy_price
            existing_deleted_match.business_price = data.business_price
            existing_deleted_match.is_deleted = 0  # 🌟 Reactive Reactivate!

            db.commit()
            db.refresh(existing_deleted_match)

            return {
                "success": True, 
                "message": "Existing deleted schedule restored and updated successfully", 
                "data": ScheduleResponse.model_validate(existing_deleted_match).model_dump(), 
                "error": None
            }

        # ─── ကိစ္စ (ခ) ဖျက်ထားတဲ့ကောင်လည်း မရှိဘူးဆိုမှ သန့်သန့်ရှင်းရှင်း အသစ်ဆောက်မယ် ───
        else:
            business_error = validate_schedule_business_logic(
                db, data.route_id, data.departure_time, data.arrival_time, data.flight_type, active_schedules
            )
            if business_error:
                return {"success": False, "message": "Validation failed", "data": None, "error": business_error}

            new_schedule = models.RouteSchedule(**data.model_dump())
            db.add(new_schedule)
            db.commit()
            db.refresh(new_schedule)

            return {
                "success": True, 
                "message": "Route schedule created successfully", 
                "data": ScheduleResponse.model_validate(new_schedule).model_dump(), 
                "error": None
            }

    except Exception as e:
        return {"success": False, "message": "Failed to create schedule", "data": None, "error": {"code": "SERVER_ERROR", "details": str(e)}}

# ─── 2. READ ALL SCHEDULES (WITH RELATIONSHIP DETAILS) ──────────────────────
@router.get("", response_model=ApiResponse)
def get_schedules(
    skip: int = 0,
    limit: int = 5,
    search: Optional[str] = Query(None),
    route_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(models.RouteSchedule).options(
            joinedload(models.RouteSchedule.route),
            joinedload(models.RouteSchedule.flight).joinedload(models.Flight.airline)
        ).filter(models.RouteSchedule.is_deleted == 0)

        if route_id:
            query = query.filter(models.RouteSchedule.route_id == route_id)

        if search:
            search_filter = f"%{search.strip().lower()}%"
            query = query.join(models.RouteSchedule.flight).filter(
                func.lower(models.Flight.flight_no).like(search_filter)
            )

        total_count = query.count()
        raw_schedules = query.offset(skip).limit(limit).all()

        serialized_schedules = [ScheduleResponse.model_validate(s).model_dump() for s in raw_schedules]

        return {
            "success": True,
            "message": "Schedules fetched successfully",
            "data": {
                "metrics": {"total_schedules": total_count},
                "schedules": serialized_schedules,
                "pagination": {"total": total_count, "skip": skip, "limit": limit}
            },
            "error": None
        }

    except Exception as e:
        return {"success": False, "message": "Failed to fetch schedules", "data": None, "error": {"code": "SERVER_ERROR", "details": str(e)}}

# ─── 2.5. READ SINGLE SCHEDULE BY ID (DETAIL VIEW) ──────────────────────────
@router.get("/{id}", response_model=ApiResponse)
def get_schedule_by_id(id: int, db: Session = Depends(get_db)):
    try:
        # ID ဖြင့် ရှာဖွေပြီး Relationship data များကို တစ်ခါတည်း ဆွဲယူခြင်း (Eager Loading)
        schedule = db.query(models.RouteSchedule).options(
            joinedload(models.RouteSchedule.route),
            joinedload(models.RouteSchedule.flight).joinedload(models.Flight.airline)
        ).filter(
            models.RouteSchedule.schedule_id == id, 
            models.RouteSchedule.is_deleted == 0
        ).first()

        # တကယ်လို့ ရှာမတွေ့ခဲ့ရင် သို့မဟုတ် Soft Delete ဖြစ်နေရင် 
        if not schedule:
            return {
                "success": False,
                "message": "Schedule not found",
                "data": None,
                "error": {
                    "code": "SCHEDULE_NOT_FOUND",
                    "details": f"Active schedule with ID {id} does not exist."
                }
            }

        # Pydantic v2 သုံးပြီး Serialize လုပ်ခြင်း
        serialized_schedule = ScheduleResponse.model_validate(schedule).model_dump()

        return {
            "success": True,
            "message": "Schedule detail fetched successfully",
            "data": serialized_schedule,
            "error": None
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Failed to fetch schedule detail",
            "data": None,
            "error": {
                "code": "SERVER_ERROR",
                "details": str(e)
            }
        }
    
# ─── 3. UPDATE ROUTE SCHEDULE ───────────────────────────────────────────────
@router.put("/{id}", response_model=ApiResponse)
def update_schedule(id: int, data: ScheduleCreate, db: Session = Depends(get_db)):
    try:
        schedule = db.query(models.RouteSchedule).filter(models.RouteSchedule.schedule_id == id, models.RouteSchedule.is_deleted == 0).first()
        if not schedule:
            return {"success": False, "message": "Schedule not found", "data": None, "error": {"code": "SCHEDULE_NOT_FOUND", "details": f"Active schedule with ID {id} does not exist."}}

        if not db.query(models.Route).filter(models.Route.route_id == data.route_id, models.Route.is_deleted == 0).first() or not db.query(models.Flight).filter(models.Flight.flight_id == data.flight_id, models.Flight.is_deleted == 0).first():
            return {"success": False, "message": "Invalid route_id or flight_id", "data": None, "error": {"code": "VALIDATION_ERROR", "details": "Target route or flight does not exist."}}

        # မိမိမဟုတ်သော အခြား schedule ကို ရှာဖွေခြင်း
        other_schedules = db.query(models.RouteSchedule).filter(
            models.RouteSchedule.flight_id == data.flight_id, models.RouteSchedule.is_deleted == 0, models.RouteSchedule.schedule_id != id
        ).all()

        if len(other_schedules) >= 2:
            return {"success": False, "message": "Update failed", "data": None, "error": {"code": "SCHEDULE_LIMIT_REACHED", "details": f"Target Flight ID {data.flight_id} already has 2 active schedules."}}

        # Logic Gap Fix: တကယ်လို့ Flight ID အသစ်ပြောင်းလိုက်လို့ concurrent schedule မရှိတော့ရင်တောင် 
        # ပြောင်းလဲလိုက်တဲ့ Route ရဲ့ ပြန်လမ်း Companion ကို DB ထဲမှာ ရှာဖွေပေးခြင်း
        if not other_schedules:
            current_route = db.query(models.Route).filter(models.Route.route_id == data.route_id).first()
            potential_companion = db.query(models.RouteSchedule).join(models.RouteSchedule.route).filter(
                models.RouteSchedule.is_deleted == 0,
                models.RouteSchedule.schedule_id != id,
                func.lower(models.Route.departure_city) == func.lower(current_route.arrival_city),
                func.lower(models.Route.arrival_city) == func.lower(current_route.departure_city)
            ).first()
            if potential_companion:
                other_schedules = [potential_companion]

        # 🌟 Helper ခေါ်ဆိုမှုတွင် ပြင်ဆင်လိုက်သော data ထဲမှ အချက်အလက်များ အကုန်ထည့်သွင်းပေးလိုက်ခြင်း
        business_error = validate_schedule_business_logic(
            db, data.route_id, data.departure_time, data.arrival_time, data.flight_type, other_schedules
        )
        if business_error:
            return {"success": False, "message": "Update validation failed", "data": None, "error": business_error}

        # Update and Commit
        schedule.route_id = data.route_id
        schedule.flight_id = data.flight_id
        schedule.flight_type = data.flight_type  # 🌟 flight_type ကိုပါ တစ်ခါတည်း update လုပ်ပေးခြင်း
        schedule.departure_time = data.departure_time.strip()
        schedule.arrival_time = data.arrival_time.strip()
        schedule.economy_price = data.economy_price
        schedule.business_price = data.business_price

        db.commit()
        db.refresh(schedule)

        return {"success": True, "message": "Schedule updated successfully", "data": ScheduleResponse.model_validate(schedule).model_dump(), "error": None}

    except Exception as e:
        return {"success": False, "message": "Failed to update schedule", "data": None, "error": {"code": "SERVER_ERROR", "details": str(e)}}

# ─── 4. DELETE ROUTE SCHEDULE (SOFT DELETE) ─────────────────────────────────
@router.delete("/{id}", response_model=ApiResponse)
def delete_schedule(id: int, db: Session = Depends(get_db)):
    try:
        schedule = db.query(models.RouteSchedule).filter(
            models.RouteSchedule.schedule_id == id,
            models.RouteSchedule.is_deleted == 0
        ).first()

        if not schedule:
            return {
                "success": False,
                "message": "Schedule not found",
                "data": None,
                "error": {"code": "SCHEDULE_NOT_FOUND", "details": f"Active schedule with ID {id} does not exist or has already been deleted."}
            }

        schedule.is_deleted = 1
        db.commit()

        return {"success": True, "message": "Schedule deleted successfully", "data": None, "error": None}

    except Exception as e:
        return {"success": False, "message": "Failed to delete schedule", "data": None, "error": {"code": "SERVER_ERROR", "details": str(e)}}