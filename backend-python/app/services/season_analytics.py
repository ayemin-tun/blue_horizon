"""
season_analytics.py
--------------------
Season Trends analysis: Python <-> COBOL (SEASON100) integration.
Same unique-file-per-request pattern as route_analytics.py.
"""

import sqlite3
import subprocess
import os
import uuid
import platform

_BIN_EXT = ".exe" if platform.system() == "Windows" else ""

# this file lives at: backend-python/app/services/season_analytics.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, '..', '..', 'data', 'blue_horizon.db')
COBOL_EXE = os.path.join(
    BASE_DIR, '..', '..', '..', 'backend-cobol', 'bin', f'season_trends{_BIN_EXT}'
)
TMP_DIR = os.path.join(BASE_DIR, '..', '..', 'bin', 'batch')

os.makedirs(TMP_DIR, exist_ok=True)


def _fetch_grouped_rows(conn):
    """year_month('YYYYMM'), booking_count, revenue -- one row per month,
    ordered ascending so COBOL can compute month-over-month growth."""
    query = """
        SELECT
            substr(fi.flight_date, 7, 4) || substr(fi.flight_date, 4, 2) AS year_month,
            COUNT(*) AS booking_count,
            SUM(b.total_price) AS revenue
        FROM BOOKINGS b
        JOIN FLIGHT_INSTANCE fi ON b.instance_id = fi.instance_id
        WHERE b.status = 'CONFIRMED'
        GROUP BY year_month
        ORDER BY year_month
    """
    return conn.execute(query).fetchall()


def _write_input_file(rows, path):
    with open(path, 'w', encoding='ascii', newline='') as f:
        for year_month, count, revenue in rows:
            revenue_cents = int(round((revenue or 0) * 100))
            line = (
                str(year_month).zfill(6)
                + str(count).zfill(5)
                + str(revenue_cents).zfill(12)
            )
            f.write(line + "\n")


MONTH_NAMES = {
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
    "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
    "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
}


def _parse_output_file(path):
    results = []
    with open(path, 'r', encoding='ascii') as f:
        for line in f:
            if not line.strip():
                continue
            year_month = line[0:6]
            booking_count = int(line[6:11])
            revenue_cents = int(line[11:23])
            season_level = line[23:29].strip()

            mom_sign = line[29]
            mom_digits = int(line[30:35])
            mom_growth_pct = mom_digits / 100.0
            if mom_sign == '-':
                mom_growth_pct = -mom_growth_pct

            forecast_next_month = int(line[35:40])

            year, month = year_month[0:4], year_month[4:6]
            results.append({
                "year_month": year_month,
                "month_label": f"{MONTH_NAMES.get(month, month)} {year}",
                "total_bookings": booking_count,
                "total_revenue": revenue_cents / 100.0,
                "season_level": season_level,
                "mom_growth_pct": mom_growth_pct,
                "forecast_next_month": forecast_next_month,
            })
    return results


def get_season_trends():
    request_id = uuid.uuid4().hex[:8]
    input_path = os.path.join(TMP_DIR, f"season_in_{request_id}.dat")
    output_path = os.path.join(TMP_DIR, f"season_out_{request_id}.dat")

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
                f"SEASON100 failed (exit {result.returncode}): {result.stderr}"
            )

        data = _parse_output_file(output_path)
        data.sort(key=lambda d: d["year_month"])
        return {"success": True, "data": data}

    finally:
        conn.close()
        # for p in (input_path, output_path):
        #     if os.path.exists(p):
        #         os.remove(p)


if __name__ == "__main__":
    import json
    print(json.dumps(get_season_trends(), indent=2, ensure_ascii=False))