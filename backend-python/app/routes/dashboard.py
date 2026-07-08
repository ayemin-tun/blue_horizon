from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.database import get_db
from app.database import models

router = APIRouter(prefix="/api/admin/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Admin Overview Panel Endpoint: Aggregates key business metrics —
    total revenue, active flights, total tickets sold, active agents,
    and total registered users.
    """
    try:
        # 1. Total Revenue — sum of CONFIRMED bookings only
        total_revenue = db.query(
            func.coalesce(func.sum(models.Booking.total_price), 0)
        ).filter(models.Booking.status == "CONFIRMED").scalar()

        # 2. Active Flights — currently SCHEDULED flight instances (not deleted)
        active_flights = db.query(func.count(models.FlightInstance.instance_id)).filter(
            models.FlightInstance.status == "SCHEDULED",
            models.FlightInstance.is_deleted == 0
        ).scalar()

        # 3. Total Sale Count — total tickets (passengers) sold under CONFIRMED bookings
        total_sale_count = db.query(func.count(models.BookingPassenger.bp_id)).join(
            models.Booking, models.BookingPassenger.booking_id == models.Booking.booking_id
        ).filter(models.Booking.status == "CONFIRMED").scalar()

        # 4. Active Agents — role='agent', status='ACTIVE', not deleted
        active_agents = db.query(func.count(models.User.user_id)).filter(
            models.User.role == "agent",
            models.User.status == "ACTIVE",
            models.User.is_deleted == 0
        ).scalar()

        # 5. Total Users — all non-deleted accounts (admin + agent)
        total_users = db.query(func.count(models.User.user_id)).filter(
            models.User.is_deleted == 0
        ).scalar()

        return {
            "success": True,
            "message": "Dashboard statistics retrieved successfully",
            "data": {
                "total_revenue": float(total_revenue or 0),
                "active_flights": active_flights or 0,
                "total_sale_count": total_sale_count or 0,
                "active_agents": active_agents or 0,
                "total_users": total_users or 0,
            },
            "error": None
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Failed to retrieve dashboard statistics",
            "data": {
                "total_revenue": 0,
                "active_flights": 0,
                "total_sale_count": 0,
                "active_agents": 0,
                "total_users": 0,
            },
            "error": {"code": "INTERNAL_SERVER_ERROR", "details": str(e)}
        }