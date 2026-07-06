# app/utils/instance_utils.py
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import models
from sqlalchemy import func

def generate_30_days_instances(db: Session, schedule: models.RouteSchedule):
    """
    Generates 30 days of flight instances starting from tomorrow 
    for a given schedule and performs a bulk insert into the database.
    """
    # Start generating instances from tomorrow onwards
    start_date = datetime.now() + timedelta(days=1)
    instances_to_create = []
    
    for i in range(30):
        current_instance_date = start_date + timedelta(days=i)
        formatted_date = current_instance_date.strftime("%d/%m/%Y") # e.g., "04/07/2026"
        
        new_instance = models.FlightInstance(
            schedule_id=schedule.schedule_id,
            flight_date=formatted_date,
            economy_seats_occupied=0,
            business_seats_occupied=0,
            base_departure_time=schedule.departure_time.strip(),
            base_arrival_time=schedule.arrival_time.strip(),
            base_economy_price=schedule.economy_price,
            base_business_price=schedule.business_price,
            override_economy_price=None,
            override_business_price=None,
            status="SCHEDULED",
            is_deleted=0
        )
        instances_to_create.append(new_instance)
        
    # Bulk insert all generated instances for optimal performance
    db.add_all(instances_to_create)

def reactivate_and_sync_future_instances(db: Session, schedule: models.RouteSchedule):
    """
    Reactivates and updates future flight instances when a Master Schedule is soft-restored.
    Targets only previously soft-deleted instances within the next 30 days and updates them 
    with the new schedule details, switching their status back to active (is_deleted=0).
    """
    # Generate an array of date strings for the next 30 days starting from tomorrow
    tomorrow = datetime.now() + timedelta(days=1)
    future_dates = [(tomorrow + timedelta(days=i)).strftime("%d/%m/%Y") for i in range(30)]
    
    # Find previously soft-deleted future instances and perform a bulk update
    db.query(models.FlightInstance).filter(
        models.FlightInstance.schedule_id == schedule.schedule_id,
        models.FlightInstance.flight_date.in_(future_dates),
        models.FlightInstance.is_deleted == 1  # Target only soft-deleted instances
    ).update({
        "base_departure_time": schedule.departure_time.strip(),
        "base_arrival_time": schedule.arrival_time.strip(),
        "base_economy_price": schedule.economy_price,
        "base_business_price": schedule.business_price,
        "is_deleted": 0  # Reactivate the instance
    }, synchronize_session=False)


def sync_future_instances_on_update(db: Session, schedule_id: int, updated_schedule: models.RouteSchedule):
    """
    Updates future scheduled instances linked to a modified Master Schedule,
    targeting only those without any passenger bookings (seats occupied == 0).
    """
    db.query(models.FlightInstance).filter(
        models.FlightInstance.schedule_id == schedule_id,
        models.FlightInstance.economy_seats_occupied == 0,
        models.FlightInstance.business_seats_occupied == 0,
        models.FlightInstance.status == "SCHEDULED",
        models.FlightInstance.is_deleted == 0
    ).update({
        "base_departure_time": updated_schedule.departure_time.strip(),
        "base_arrival_time": updated_schedule.arrival_time.strip(),
        "base_economy_price": updated_schedule.economy_price,
        "base_business_price": updated_schedule.business_price
    }, synchronize_session=False)


def clean_future_instances_on_delete(db: Session, schedule_id: int):
    """
    Soft deletes future scheduled instances linked to a deleted Master Schedule,
    targeting only those without any passenger bookings (seats occupied == 0).
    """

    # get next 90 day for delete
    tomorrow = datetime.now() + timedelta(days=1)
    extended_future_dates = [(tomorrow + timedelta(days=i)).strftime("%d/%m/%Y") for i in range(90)]

    db.query(models.FlightInstance).filter(
        models.FlightInstance.schedule_id == schedule_id,
        models.FlightInstance.flight_date.in_(extended_future_dates), 
        models.FlightInstance.economy_seats_occupied == 0,
        models.FlightInstance.business_seats_occupied == 0,
        models.FlightInstance.status == "SCHEDULED"
    ).update({"is_deleted": 1}, synchronize_session=False)