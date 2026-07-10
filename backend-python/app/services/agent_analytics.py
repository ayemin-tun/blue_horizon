"""
agent_analytics.py
-------------------
Agent Performance analysis: Python <-> COBOL (AGENT100) integration.
Same unique-file-per-request pattern as route_analytics.py.
"""

import sqlite3
import subprocess
import os
import uuid
import platform

# See route_analytics.py for why this is detected at runtime.
_BIN_EXT = ".exe" if platform.system() == "Windows" else ""

# this file lives at: backend-python/app/services/agent_analytics.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# backend-python/data/blue_horizon.db
DB_PATH = os.path.join(BASE_DIR, '..', '..', 'data', 'blue_horizon.db')

# backend-cobol/bin/agent_performance(.exe)  (sibling of backend-python at project root)
COBOL_EXE = os.path.join(
    BASE_DIR, '..', '..', '..', 'backend-cobol', 'bin', f'agent_performance{_BIN_EXT}'
)

# backend-python/bin/batch  (temp input/output exchange folder with COBOL)
TMP_DIR = os.path.join(BASE_DIR, '..', '..', 'bin', 'batch')

os.makedirs(TMP_DIR, exist_ok=True)


def _fetch_grouped_rows(conn):
    """agent_id, agent_name, year_month('YYYYMM'), booking_count, revenue"""
    query = """
        SELECT
            u.user_id,
            u.username,
            substr(fi.flight_date, 7, 4) || substr(fi.flight_date, 4, 2) AS year_month,
            COUNT(*) AS booking_count,
            SUM(b.total_price) AS revenue
        FROM BOOKINGS b
        JOIN USERS u            ON b.user_id = u.user_id
        JOIN FLIGHT_INSTANCE fi ON b.instance_id = fi.instance_id
        WHERE b.status = 'CONFIRMED'
          AND u.role = 'agent'
          AND u.is_deleted = 0
        GROUP BY u.user_id, year_month
        ORDER BY u.user_id, year_month
    """
    return conn.execute(query).fetchall()


def _write_input_file(rows, path):
    # newline='' — see route_analytics.py for why this matters on Windows.
    with open(path, 'w', encoding='ascii', newline='') as f:
        for agent_id, agent_name, year_month, count, revenue in rows:
            revenue_cents = int(round((revenue or 0) * 100))
            line = (
                str(agent_id).zfill(4)
                + agent_name.ljust(20)[:20]
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
            agent_id = int(line[0:4])
            agent_name = line[4:24].strip()
            total_bookings = int(line[24:31])
            revenue_cents = int(line[31:43])
            tier = line[43:51].strip()
            results.append({
                "agent_id": agent_id,
                "agent_name": agent_name,
                "total_bookings": total_bookings,
                "total_revenue": revenue_cents / 100.0,
                "performance_tier": tier,
            })
    return results


def get_agent_performance():
    request_id = uuid.uuid4().hex[:8]
    input_path = os.path.join(TMP_DIR, f"agent_in_{request_id}.dat")
    output_path = os.path.join(TMP_DIR, f"agent_out_{request_id}.dat")

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
                f"AGENT100 failed (exit {result.returncode}): {result.stderr}"
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
    print(json.dumps(get_agent_performance(), indent=2, ensure_ascii=False))