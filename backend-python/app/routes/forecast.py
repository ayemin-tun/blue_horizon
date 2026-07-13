"""
app/routes/forecast.py
-----------------------
API layer for forecast/analytics endpoints. This file is the ONLY place
that knows about HTTP (FastAPI router, status codes). All the actual
SQL + COBOL logic lives in app/services/*.py — this file just calls
those functions and shapes the HTTP response.
"""

from fastapi import APIRouter, HTTPException

from app.services.route_analytics import get_route_demand_forecast
from app.services.agent_analytics import get_agent_performance
from app.services.season_analytics import get_season_trends
from app.services.airline_analytics import get_airline_share

router = APIRouter(prefix="/api/forecast", tags=["Forecast"])


@router.get("/route-demand")
def route_demand():
    """
    demand level (HIGH/MEDIUM/LOW), next-month forecast.
    """
    try:
        return get_route_demand_forecast()
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/agent-performance")
def agent_performance():
    """
    
    total revenue, performance tier (TOP/AVERAGE/LOW).
    """
    try:
        return get_agent_performance()
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/season-trends")
def season_trends():
    """
    season level (PEAK/NORMAL/LOW), month-over-month growth %,
    next-month forecast.
    """
    try:
        return get_season_trends()
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/airline-share")
def airline_share():
    """
    total revenue, share tier (DOMINANT/MODERATE/MINOR).
    """
    try:
        return get_airline_share()
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))