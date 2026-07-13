"""
app/routes/reports.py
------------------------
Report Generation API layer:
- GET /api/reports/sales-summary          (paginated JSON, pure Python/SQL)
- GET /api/reports/sales-summary/export   (CSV, full filtered scope)
- GET /api/reports/<name>/export          (CSV wrapper around the 4
                                            existing COBOL-backed endpoints
                                            already exposed as JSON at
                                            /api/forecast/<name>)
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from app.services.sale_summary import get_sales_summary, get_sales_summary_rows_for_export
from app.services.csv_export import rows_to_csv_response

from app.services.route_analytics import get_route_demand_forecast
from app.services.agent_analytics import get_agent_performance
from app.services.season_analytics import get_season_trends
from app.services.airline_analytics import get_airline_share

router = APIRouter(prefix="/api/reports", tags=["Reports"])


# ─── Sales & Revenue Summary (pure Python/SQL) ─────────────────────────────

@router.get("/sales-summary")
def sales_summary(
    date_from: Optional[str] = Query(None, description="YYYY-MM-DD"),
    date_to: Optional[str] = Query(None, description="YYYY-MM-DD"),
    search: Optional[str] = Query(None, description="Search by ticket id"),
    sort_by: str = Query("status", description="status | date | price"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=200),
):
    return get_sales_summary(date_from, date_to, search, sort_by, skip, limit)


@router.get("/sales-summary/export")
def sales_summary_export(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("status"),
):
    rows = get_sales_summary_rows_for_export(date_from, date_to, search, sort_by)
    fieldnames = ["Ticket Id", "Date", "Route", "Class", "Price", "Status"]
    return rows_to_csv_response(rows, fieldnames, "sales_summary_report.csv")


# ─── CSV export for the 4 COBOL-backed analytics ───────────────────────────
# NOTE: these 4 don't yet support date_from/date_to — they aggregate the
# entire confirmed-booking history (same as their /api/forecast/* JSON
# counterparts). Let me know if you want date-range filtering added here
# too; it's a Python-side SQL WHERE change only, COBOL doesn't need to
# change since it already just aggregates whatever rows Python sends it.

@router.get("/route-demand/export")
def route_demand_export():
    try:
        result = get_route_demand_forecast()
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    fieldnames = ["route_id", "route", "total_bookings", "demand_level", "forecast_next_month"]
    return rows_to_csv_response(result["data"], fieldnames, "route_demand_report.csv")


@router.get("/agent-performance/export")
def agent_performance_export():
    try:
        result = get_agent_performance()
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    fieldnames = ["agent_id", "agent_name", "total_bookings", "total_revenue", "performance_tier"]
    return rows_to_csv_response(result["data"], fieldnames, "agent_performance_report.csv")


@router.get("/season-trends/export")
def season_trends_export():
    try:
        result = get_season_trends()
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    fieldnames = [
        "year_month", "month_label", "total_bookings", "total_revenue",
        "season_level", "mom_growth_pct", "forecast_next_month",
    ]
    return rows_to_csv_response(result["data"], fieldnames, "season_trends_report.csv")


@router.get("/airline-share/export")
def airline_share_export():
    try:
        result = get_airline_share()
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    fieldnames = ["airline_id", "airline_name", "total_bookings", "total_revenue", "share_tier"]
    return rows_to_csv_response(result["data"], fieldnames, "airline_share_report.csv")