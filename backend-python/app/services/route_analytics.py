"""
route_analytics.py
-------------------
Route Demand forecast: Python <-> COBOL (ROUTE100) integration.

Flow (matches the pattern already agreed on):
  1. SQL GROUP BY -> aggregated (route, year_month, count) rows
  2. Write fixed-width input file (unique name per request)
  3. Run compiled ROUTE100 COBOL program via subprocess
  4. Read fixed-width output file -> JSON
  5. Delete both temp files (finally block)
"""

import sqlite3
import subprocess
import os
import uuid
import platform

# Native-Windows GnuCOBOL builds default to a .exe suffix; Mac/Linux (and
# WSL, which uses the Linux build) use no suffix. Detecting this at runtime
# means the SAME code works regardless of which OS compiled the binary.
_BIN_EXT = ".exe" if platform.system() == "Windows" else ""

# this file lives at: backend-python/app/services/route_analytics.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# backend-python/data/blue_horizon.db
DB_PATH = os.path.join(BASE_DIR, '..', '..', 'data', 'blue_horizon.db')

# backend-cobol/bin/route_demand(.exe)  (sibling of backend-python at project root)
COBOL_EXE = os.path.join(
    BASE_DIR, '..', '..', '..', 'backend-cobol', 'bin', f'route_demand{_BIN_EXT}'
)

# backend-python/bin/batch  (temp input/output exchange folder with COBOL)
TMP_DIR = os.path.join(BASE_DIR, '..', '..', 'bin', 'batch')

os.makedirs(TMP_DIR, exist_ok=True)


def _fetch_grouped_rows(conn):
    """route_id, dep_city, arr_city, year_month('YYYYMM'), booking_count"""
    query = """
        SELECT
            r.route_id,
            r.departure_city,
            r.arrival_city,
            substr(fi.flight_date, 7, 4) || substr(fi.flight_date, 4, 2) AS year_month,
            COUNT(*) AS booking_count
        FROM BOOKINGS b
        JOIN FLIGHT_INSTANCE fi   ON b.instance_id = fi.instance_id
        JOIN ROUTE_SCHEDULE rs    ON fi.schedule_id = rs.schedule_id
        JOIN ROUTES r             ON rs.route_id = r.route_id
        WHERE b.status = 'CONFIRMED'
          AND r.is_deleted = 0
        GROUP BY r.route_id, year_month
        ORDER BY r.route_id, year_month
    """
    return conn.execute(query).fetchall()


def _write_input_file(rows, path):
    # newline='' stops Python from translating \n -> \r\n on Windows.
    # COBOL LINE SEQUENTIAL parsing assumes a consistent, known line
    # ending; without this, byte offsets can drift on Windows.
    with open(path, 'w', encoding='ascii', newline='') as f:
        for route_id, dep_city, arr_city, year_month, count in rows:
            line = (
                str(route_id).zfill(4)
                + dep_city.ljust(15)[:15]
                + arr_city.ljust(15)[:15]
                + str(year_month).zfill(6)
                + str(count).zfill(5)
            )
            f.write(line + "\n")


def _parse_output_file(path):
    results = []
    with open(path, 'r', encoding='ascii') as f:
        for line in f:
            if not line.strip():
                continue
            route_id = int(line[0:4])
            dep_city = line[4:19].strip()
            arr_city = line[19:34].strip()
            total_bookings = int(line[34:41])
            demand_level = line[41:47].strip()
            forecast_next_month = int(line[47:52])
            results.append({
                "route_id": route_id,
                "route": f"{dep_city} → {arr_city}",
                "total_bookings": total_bookings,
                "demand_level": demand_level,
                "forecast_next_month": forecast_next_month,
            })
    return results


def get_route_demand_forecast():
    request_id = uuid.uuid4().hex[:8]
    input_path = os.path.join(TMP_DIR, f"route_in_{request_id}.dat")
    output_path = os.path.join(TMP_DIR, f"route_out_{request_id}.dat")

    conn = sqlite3.connect(DB_PATH)
    try:
        rows = _fetch_grouped_rows(conn)
        if not rows:
            return {"success": True, "data": []}

        _write_input_file(rows, input_path)

        # ensure the output file starts empty for this request
        open(output_path, 'w').close()

        result = subprocess.run(
            [COBOL_EXE, input_path, output_path],
            capture_output=True, text=True, timeout=30
        )

        if result.returncode != 0:
            raise RuntimeError(
                f"ROUTE100 failed (exit {result.returncode}): {result.stderr}"
            )

        data = _parse_output_file(output_path)
        data.sort(key=lambda d: d["total_bookings"], reverse=True)
        return {"success": True, "data": data}

    finally:
        conn.close()
        # for p in (input_path, output_path):
        #     if os.path.exists(p):
        #         os.remove(p)


if __name__ == "__main__":
    import json
    print(json.dumps(get_route_demand_forecast(), indent=2, ensure_ascii=False))