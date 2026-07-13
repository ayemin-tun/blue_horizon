"""
app/services/sales_summary.py
--------------------------------
Sales & Revenue Summary Report — pure Python/SQL (no COBOL involved).
Ticket-level listing with date-range filter, ticket-id search, sort,
and pagination, plus summary cards (Total Revenue, Ticket Issues,
Average Ticket Sale) computed over the FULL filtered scope.
"""

import sqlite3
import os
from typing import Optional

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, '..', '..', 'data', 'blue_horizon.db')

# flight_date is stored as DD/MM/YYYY text (see FLIGHT_INSTANCE schema).
# Rebuild it to YYYY-MM-DD inline so it compares correctly against ISO
# date_from/date_to (e.g. "2022-02-20") coming from a <input type="date">.
_ISO_FLIGHT_DATE = (
    "substr(fi.flight_date,7,4) || '-' || substr(fi.flight_date,4,2) "
    "|| '-' || substr(fi.flight_date,1,2)"
)

_ALLOWED_SORT = {
    "status": "b.status",
    "date": "fi.flight_date",
    "price": "b.total_price",
}

_JOIN = """
    FROM BOOKINGS b
    JOIN FLIGHT_INSTANCE fi   ON b.instance_id = fi.instance_id
    JOIN ROUTE_SCHEDULE rs    ON fi.schedule_id = rs.schedule_id
    JOIN ROUTES r             ON rs.route_id = r.route_id
"""


def _connect():
    return sqlite3.connect(DB_PATH)


def _where_clause(date_from: Optional[str], date_to: Optional[str], search: Optional[str]):
    where = ["1=1"]
    params = []

    if date_from:
        where.append(f"{_ISO_FLIGHT_DATE} >= ?")
        params.append(date_from)
    if date_to:
        where.append(f"{_ISO_FLIGHT_DATE} <= ?")
        params.append(date_to)
    if search:
        where.append("b.ticket_code LIKE ?")
        params.append(f"%{search}%")

    return " AND ".join(where), params


def _row_to_dict(row):
    ticket_code, flight_date, dep, arr, seat_class, price, status = row
    return {
        "ticket_id": ticket_code,
        "date": flight_date,
        "route": f"{dep} \u2192 {arr}",
        "class": seat_class,
        "price": price,
        "status": status,
    }


def get_sales_summary(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "status",
    skip: int = 0,
    limit: int = 20,
):
    sort_col = _ALLOWED_SORT.get(sort_by, "b.status")
    where_clause, params = _where_clause(date_from, date_to, search)

    conn = _connect()
    try:
        # summary cards over the FULL filtered scope (not just this page)
        ticket_issues, total_revenue, confirmed_count = conn.execute(
            f"""
            SELECT
                COUNT(*),
                COALESCE(SUM(CASE WHEN b.status = 'CONFIRMED' THEN b.total_price ELSE 0 END), 0),
                SUM(CASE WHEN b.status = 'CONFIRMED' THEN 1 ELSE 0 END)
            {_JOIN}
            WHERE {where_clause}
            """,
            params,
        ).fetchone()

        confirmed_count = confirmed_count or 0
        average_ticket_sale = (total_revenue / confirmed_count) if confirmed_count else 0

        total_count = conn.execute(
            f"SELECT COUNT(*) {_JOIN} WHERE {where_clause}", params
        ).fetchone()[0]

        rows = conn.execute(
            f"""
            SELECT b.ticket_code, fi.flight_date, r.departure_city, r.arrival_city,
                   b.seat_class, b.total_price, b.status
            {_JOIN}
            WHERE {where_clause}
            ORDER BY {sort_col}
            LIMIT ? OFFSET ?
            """,
            params + [limit, skip],
        ).fetchall()
    finally:
        conn.close()

    return {
        "success": True,
        "summary": {
            "total_revenue": total_revenue,
            "ticket_issues": ticket_issues,
            "average_ticket_sale": round(average_ticket_sale, 2),
        },
        "data": [_row_to_dict(row) for row in rows],
        "pagination": {"total": total_count, "skip": skip, "limit": limit},
    }


def get_sales_summary_rows_for_export(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "status",
):
    """Same filters as get_sales_summary but NO pagination — the CSV
    download always contains every row that matches the filters."""
    sort_col = _ALLOWED_SORT.get(sort_by, "b.status")
    where_clause, params = _where_clause(date_from, date_to, search)

    conn = _connect()
    try:
        rows = conn.execute(
            f"""
            SELECT b.ticket_code, fi.flight_date, r.departure_city, r.arrival_city,
                   b.seat_class, b.total_price, b.status
            {_JOIN}
            WHERE {where_clause}
            ORDER BY {sort_col}
            """,
            params,
        ).fetchall()
    finally:
        conn.close()

    return [
        {
            "Ticket Id": ticket_code,
            "Date": flight_date,
            "Route": f"{dep} \u2192 {arr}",
            "Class": seat_class,
            "Price": price,
            "Status": status,
        }
        for ticket_code, flight_date, dep, arr, seat_class, price, status in rows
    ]


if __name__ == "__main__":
    import json
    print(json.dumps(get_sales_summary(), indent=2, ensure_ascii=False))