"""
airline_analytics.py
---------------------
Airline Share analysis: Python <-> COBOL (AIRLINE100) integration.
Same unique-file-per-request pattern as agent_analytics.py.
"""

import sqlite3
import subprocess
import os
import uuid
import platform

_BIN_EXT = ".exe" if platform.system() == "Windows" else ""

# this file lives at: backend-python/app/services/airline_analytics.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, '..', '..', 'data', 'blue_horizon.db')
COBOL_EXE = os.path.join(
    BASE_DIR, '..', '..', '..', 'backend-cobol', 'bin', f'airline_share{_BIN_EXT}'
)
TMP_DIR = os.path.join(BASE_DIR, '..', '..', 'bin', 'batch')

os.makedirs(TMP_DIR, exist_ok=True)


def _fetch_grouped_rows(conn):
    """airline_id, airline_name, year_month('YYYYMM'), booking_count, revenue"""
    query = """
        SELECT
            al.airline_id,
            al.airline_name,
            substr(fi.flight_date, 7, 4) || substr(fi.flight_date, 4, 2) AS year_month,
            COUNT(*) AS booking_count,
            SUM(b.total_price) AS revenue
        FROM BOOKINGS b
        JOIN FLIGHT_INSTANCE fi   ON b.instance_id = fi.instance_id
        JOIN ROUTE_SCHEDULE rs    ON fi.schedule_id = rs.schedule_id
        JOIN FLIGHTS fl           ON rs.flight_id = fl.flight_id
        JOIN AIRLINES al          ON fl.airline_id = al.airline_id
        WHERE b.status = 'CONFIRMED'
          AND al.is_deleted = 0
        GROUP BY al.airline_id, year_month
        ORDER BY al.airline_id, year_month
    """
    return conn.execute(query).fetchall()


def _write_input_file(rows, path):
    with open(path, 'w', encoding='ascii', newline='') as f:
        for airline_id, airline_name, year_month, count, revenue in rows:
            revenue_cents = int(round((revenue or 0) * 100))
            line = (
                str(airline_id).zfill(4)
                + airline_name.ljust(25)[:25]
                + str(year_month).zfill(6)
                + str(count).zfill(5)
                + str(revenue_cents).zfill(12)
            )
            f.write(line + "\n")


def _parse_output_file(path):
    results = []
    with open(path, 'r', encoding='ascii') as f:
        for line in f:
            if not line.strip():
                continue
            airline_id = int(line[0:4])
            airline_name = line[4:29].strip()
            total_bookings = int(line[29:36])
            revenue_cents = int(line[36:48])
            tier = line[48:56].strip()
            results.append({
                "airline_id": airline_id,
                "airline_name": airline_name,
                "total_bookings": total_bookings,
                "total_revenue": revenue_cents / 100.0,
                "share_tier": tier,
            })
    return results


def get_airline_share():
    request_id = uuid.uuid4().hex[:8]
    input_path = os.path.join(TMP_DIR, f"airline_in_{request_id}.dat")
    output_path = os.path.join(TMP_DIR, f"airline_out_{request_id}.dat")

    conn = sqlite3.connect(DB_PATH)
    try:
        rows = _fetch_grouped_rows(conn)
        if not rows:
            return {"success": True, "data": []}

        _write_input_file(rows, input_path)
        open(output_path, 'w').close()

        result = subprocess.run(
            [COBOL_EXE, input_path, output_path],
            capture_output=True, text=True, timeout=30
        )

        if result.returncode != 0:
            raise RuntimeError(
                f"AIRLINE100 failed (exit {result.returncode}): {result.stderr}"
            )

        data = _parse_output_file(output_path)
        data.sort(key=lambda d: d["total_bookings"], reverse=True)
        return {"success": True, "data": data}

    finally:
        conn.close()
        for p in (input_path, output_path):
            if os.path.exists(p):
                os.remove(p)


if __name__ == "__main__":
    import json
    print(json.dumps(get_airline_share(), indent=2, ensure_ascii=False))