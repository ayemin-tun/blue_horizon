import sqlite3
import csv
import os
import subprocess
from datetime import datetime
# pyrefly: ignore [missing-import]
from fastapi import APIRouter

router = APIRouter(prefix="/api/forecast", tags=["Forecast"])

# ── Shared helpers ──────────────────────────────────────────────────────────────

def get_db_path():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_dir, '..', '..', 'data', 'blue_horizon.db')

def get_db_conn():
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    return conn

def run_cobol_program(program_name, input_filename, output_filename, rows):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(base_dir, '..', '..', 'data', input_filename)
    txt_output_path = os.path.join(base_dir, '..', '..', 'data', output_filename)
    
    cobol_src = os.path.abspath(os.path.join(base_dir, '..', '..', '..', 'backend-cobol', 'src', f'{program_name}.cbl'))
    cobol_bin = os.path.abspath(os.path.join(base_dir, '..', '..', '..', 'backend-cobol', 'bin', program_name))

    # Write CSV
    with open(csv_path, 'w', newline='\n', encoding='utf-8') as f:
        writer = csv.writer(f, lineterminator='\n')
        writer.writerows([[str(col).strip() for col in row] for row in rows])
        
    # Clear output file
    with open(txt_output_path, 'w', encoding='utf-8') as f:
        f.write('')
        
    # Compile
    os.makedirs(os.path.dirname(cobol_bin), exist_ok=True)
    compile_res = subprocess.run(['cobc', '-x', cobol_src, '-o', cobol_bin], capture_output=True, text=True)
    if compile_res.returncode != 0:
        raise Exception(f"Compile Failed for {program_name}: {compile_res.stderr}")
        
    # Run
    run_res = subprocess.run([cobol_bin], cwd=os.path.dirname(cobol_bin), capture_output=True, text=True)
    if run_res.returncode != 0:
        raise Exception(f"Execution Failed for {program_name}: {run_res.stderr}")
        
    # Read output
    if os.path.exists(txt_output_path):
        with open(txt_output_path, 'r', encoding='utf-8') as f:
            return [line.strip() for line in f.readlines() if line.strip()]
    return []


# ══════════════════════════════════════════════════════════════════════════════
# 1. COBOL Revenue Engine  (/api/forecast/run-engine)
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/run-engine")
def run_cobol_engine():
    """Run the COBOL revenue calculation engine and return the report lines."""
    base_dir = os.path.dirname(os.path.abspath(__file__))

    db_path          = os.path.join(base_dir, '..', '..', 'data', 'blue_horizon.db')
    csv_path         = os.path.join(base_dir, '..', '..', 'data', 'cobol_input.csv')
    txt_output_path  = os.path.join(base_dir, '..', '..', 'data', 'cobol_output.txt')

    cobol_src = os.path.abspath(os.path.join(base_dir, '..', '..', '..', 'backend-cobol', 'src', 'REVENUE-CALC.cbl'))
    cobol_bin = os.path.abspath(os.path.join(base_dir, '..', '..', '..', 'backend-cobol', 'bin', 'REVENUE-CALC'))

    try:
        # 1. Export DB → CSV (Unix LF line endings — COBOL LINE SEQUENTIAL requirement)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT b.booking_id, fi.flight_date, fi.base_departure_time,
                   b.total_price, b.status, p.type
            FROM BOOKINGS b
            JOIN FLIGHT_INSTANCE fi ON b.instance_id = fi.instance_id
            JOIN BOOKING_PASSENGERS bp ON b.booking_id = bp.booking_id
            JOIN PASSENGERS p ON bp.passenger_id = p.passenger_id
        ''')
        rows = cursor.fetchall()
        conn.close()

        with open(csv_path, 'w', newline='\n', encoding='utf-8') as f:
            writer = csv.writer(f, lineterminator='\n')
            writer.writerows([[str(col).strip() for col in row] for row in rows])

        # Clear stale output file
        with open(txt_output_path, 'w', encoding='utf-8') as f:
            f.write('')

        # 2. Compile COBOL
        os.makedirs(os.path.dirname(cobol_bin), exist_ok=True)
        compile_res = subprocess.run(
            ['cobc', '-x', cobol_src, '-o', cobol_bin],
            capture_output=True, text=True
        )
        if compile_res.returncode != 0:
            return {"success": False, "message": "Compile Failed", "error": compile_res.stderr}

        # 3. Execute COBOL binary from its directory (relative paths in .cbl are resolved here)
        run_res = subprocess.run(
            [cobol_bin],
            cwd=os.path.dirname(cobol_bin),
            capture_output=True, text=True
        )
        if run_res.returncode != 0:
            return {"success": False, "message": "Execution Failed", "error": run_res.stderr}

        # 4. Read output
        if os.path.exists(txt_output_path):
            with open(txt_output_path, 'r', encoding='utf-8') as f:
                report = [line.strip() for line in f.readlines() if line.strip()]
            return {"success": True, "data": report}

        return {"success": False, "message": "Output file not generated"}

    except Exception as e:
        return {"success": False, "message": str(e)}


# ══════════════════════════════════════════════════════════════════════════════
# 2. ROUTE DEMAND INDEX  (/api/forecast/route-demand)
# ══════════════════════════════════════════════════════════════════════════════

# IATA-style airport codes for known cities
CITY_CODES = {
    "Yangon":    "RGN",
    "Mandalay":  "MDY",
    "NayPyiTaw": "NPT",
    "Naypyitaw": "NPT",
    "Bagan":     "NYU",
    "Heho":      "HEH",
    "Ann":       "ANN",
    "Thandwe":   "SNW",
    "Myitkyina": "MYT",
}

def city_code(name: str) -> str:
    return CITY_CODES.get(name, name[:3].upper())


@router.get("/route-demand")
def get_route_demand():
    """
    1. ROUTE DEMAND INDEX
    Returns seat utilisation per route based on confirmed bookings vs total capacity.
    """
    try:
        conn = get_db_conn()
        cursor = conn.cursor()

        # Total seats occupied (confirmed bookings) per route
        cursor.execute('''
            SELECT
                r.route_id,
                r.departure_city,
                r.arrival_city,
                SUM(fi.economy_seats_occupied + fi.business_seats_occupied) AS total_occupied,
                SUM(f.total_seats)                                           AS total_capacity,
                COUNT(DISTINCT fi.instance_id)                               AS flight_count,
                SUM(CASE WHEN b.status = 'CONFIRMED' THEN b.total_price ELSE 0 END) AS confirmed_revenue
            FROM ROUTES r
            JOIN ROUTE_SCHEDULE rs  ON rs.route_id  = r.route_id  AND rs.is_deleted = 0
            JOIN FLIGHTS f          ON f.flight_id  = rs.flight_id AND f.is_deleted  = 0
            JOIN FLIGHT_INSTANCE fi ON fi.schedule_id = rs.schedule_id AND fi.is_deleted = 0
            LEFT JOIN BOOKINGS b    ON b.instance_id = fi.instance_id
            WHERE r.is_deleted = 0
            GROUP BY r.route_id
            ORDER BY total_occupied DESC
        ''')
        rows = cursor.fetchall()
        conn.close()

        # Build CSV input rows for COBOL
        csv_rows = []
        for row in rows:
            dep_city = row['departure_city']
            arr_city = row['arrival_city']
            capacity = row['total_capacity'] or 1
            occupied = row['total_occupied'] or 0
            flight_count = row['flight_count']
            revenue = row['confirmed_revenue'] or 0
            csv_rows.append([
                dep_city, arr_city, city_code(dep_city), city_code(arr_city),
                occupied, capacity, flight_count, revenue
            ])

        # Run COBOL program
        cobol_output = run_cobol_program('ROUTE-DEMAND', 'route_demand_input.csv', 'route_demand_output.txt', csv_rows)

        routes = []
        for line in cobol_output:
            if not line.startswith('ROUTE|'):
                continue
            parts = line.split('|')
            if len(parts) >= 11:
                # ROUTE|dep_city|arr_city|dep_code|arr_code|load_factor|status|flights|occupied|capacity|revenue
                dep_city = parts[1]
                arr_city = parts[2]
                dep_code = parts[3]
                arr_code = parts[4]
                load_factor = float(parts[5])
                status = parts[6]
                flight_count = int(parts[7])
                occupied = int(parts[8])
                capacity = int(parts[9])
                revenue = float(parts[10])

                # Presentation logic (colors and insights)
                if status == 'HIGH':
                    color = "#2563EB"
                    insight = f"Seat Utilisation: {load_factor}% average | Load Factor projection looks highly optimal."
                elif status == 'MEDIUM':
                    color = "#D97706"
                    insight = f"Mid-week demand is consistent; weekend schedules show slight dip to {max(load_factor - 15, 0):.0f}%."
                else:
                    color = "#DC2626"
                    insight = f"Corporate bookings showing positive trajectory. Recommending ticket price increment."

                routes.append({
                    "departure_city": dep_city,
                    "departure_code": dep_code,
                    "arrival_city":   arr_city,
                    "arrival_code":   arr_code,
                    "load_factor":    load_factor,
                    "total_occupied": occupied,
                    "total_capacity": capacity,
                    "flight_count":   flight_count,
                    "confirmed_revenue": revenue,
                    "color":          color,
                    "insight":        insight,
                })

        return {
            "success": True,
            "status_label": "ACTIVE",
            "data": routes
        }

    except Exception as e:
        return {"success": False, "message": str(e)}


# ══════════════════════════════════════════════════════════════════════════════
# 3. AGENT PERFORMANCE  (/api/forecast/agent-performance)
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/agent-performance")
def get_agent_performance():
    """
    2. AGENT PERFORMANCE
    Returns predictive success rate and projected monthly sales per agent,
    derived from each agent's historical booking confirmation ratio and revenue.
    """
    try:
        conn = get_db_conn()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT
                u.user_id,
                u.username,
                COUNT(b.booking_id)                                              AS total_bookings,
                SUM(CASE WHEN b.status = 'CONFIRMED' THEN 1 ELSE 0 END)         AS confirmed,
                SUM(CASE WHEN b.status = 'CANCELLED' THEN 1 ELSE 0 END)         AS cancelled,
                COALESCE(SUM(CASE WHEN b.status = 'CONFIRMED' THEN b.total_price ELSE 0 END), 0) AS revenue,
                MIN(b.booking_date) AS first_booking,
                MAX(b.booking_date) AS last_booking
            FROM USERS u
            LEFT JOIN BOOKINGS b ON b.user_id = u.user_id
            WHERE u.role = 'agent' AND u.is_deleted = 0
            GROUP BY u.user_id
            ORDER BY revenue DESC
        ''')
        rows = cursor.fetchall()
        conn.close()

        # Prepare CSV inputs
        csv_rows = []
        for row in rows:
            user_id = row['user_id']
            agent_code = f"BH-AGENT-{user_id:02d}"
            username = row['username']
            
            total_bookings = row['total_bookings']
            confirmed = row['confirmed']
            cancelled = row['cancelled']
            revenue = row['revenue'] or 0

            # Calculate days active for projection base
            days_active = 1
            if row['first_booking'] and row['last_booking']:
                d1 = datetime.strptime(row['first_booking'], "%Y-%m-%d %H:%M:%S")
                d2 = datetime.strptime(row['last_booking'], "%Y-%m-%d %H:%M:%S")
                days_active = max((d2 - d1).days, 1)

            csv_rows.append([
                user_id, agent_code, username, total_bookings, confirmed, cancelled, revenue, days_active
            ])

        # Run COBOL program
        cobol_output = run_cobol_program('AGENT-PERF', 'agent_perf_input.csv', 'agent_perf_output.txt', csv_rows)

        agents = []
        for line in cobol_output:
            if not line.startswith('AGENT|'):
                continue
            parts = line.split('|')
            if len(parts) >= 11:
                # AGENT|user_id|agent_code|username|success_rate|projected_monthly|total_bookings|confirmed|cancelled|revenue|badge
                user_id = int(parts[1])
                agent_code = parts[2]
                username = parts[3]
                success_rate = float(parts[4])
                projected_monthly = float(parts[5])
                total_bookings = int(parts[6])
                confirmed = int(parts[7])
                cancelled = int(parts[8])
                revenue = float(parts[9])
                badge = parts[10]
                
                # Presentation logic
                if badge == 'GREEN':
                    color = "#22C55E"
                    insight = f"Outstanding conversion. Projected monthly sales of MMK {int(projected_monthly):,}"
                elif badge == 'AMBER':
                    color = "#F59E0B"
                    insight = f"Average conversion. Projected monthly sales of MMK {int(projected_monthly):,}"
                else:
                    color = "#EF4444"
                    insight = f"High cancellation rate. Review required."

                agents.append({
                    "agent_code": agent_code,
                    "username": username,
                    "success_rate": int(success_rate),
                    "projected_monthly_sales": int(projected_monthly),
                    "total_bookings": total_bookings,
                    "confirmed_bookings": confirmed,
                    "cancelled_bookings": cancelled,
                    "revenue": revenue,
                    "badge_color": color,
                    "insight": insight
                })

        return {
            "success": True,
            "status_label": "PREDICTIVE",
            "data": agents
        }

    except Exception as e:
        return {"success": False, "message": str(e)}


# ══════════════════════════════════════════════════════════════════════════════
# 4. SEASONALITY TRENDS  (/api/forecast/seasonality)
# ══════════════════════════════════════════════════════════════════════════════

# Static seasonality knowledge for Myanmar domestic aviation
SEASON_CONFIG = {
    "high": [
        {
            "label":        "April (Thingyan)",
            "months":       [4],
            "est_load_factor": 98.4,
            "description":  "Estimated load factor: 98.4%"
        },
        {
            "label":        "Oct - Dec (Tourism)",
            "months":       [10, 11, 12],
            "est_load_factor": 89.0,
            "description":  "Festivals driving consistent 89% load."
        },
    ],
    "low": [
        {
            "label":        "June & July",
            "months":       [6, 7],
            "est_load_factor": 42.0,
            "description":  "Monsoon season reduces local leisure travel.",
            "promo":        "Offer 15% Rainy Promo"
        },
    ]
}

@router.get("/seasonality")
def get_seasonality():
    """
    3. SEASONALITY TRENDS
    Returns 12-month seasonality analysis with high/low season periods,
    enriched with real monthly booking counts from the database, driven by COBOL.
    """
    try:
        conn = get_db_conn()
        cursor = conn.cursor()

        # Monthly confirmed booking count & revenue
        cursor.execute('''
            SELECT
                CAST(strftime('%m', booking_date) AS INTEGER) AS month,
                COUNT(*)                                      AS booking_count,
                SUM(total_price)                              AS revenue
            FROM BOOKINGS
            WHERE status = 'CONFIRMED'
            GROUP BY month
            ORDER BY month
        ''')
        monthly_rows = cursor.fetchall()
        conn.close()

        # Build a month→data lookup
        monthly_data = {row['month']: dict(row) for row in monthly_rows}

        month_names = [
            "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ]

        # Prepare CSV inputs
        csv_rows = []
        for m in range(1, 13):
            data = monthly_data.get(m, {})
            b_count = data.get('booking_count', 0)
            rev = data.get('revenue', 0)
            csv_rows.append([m, month_names[m], b_count, rev])

        # Run COBOL program
        cobol_output = run_cobol_program('SEASON-TREND', 'season_trend_input.csv', 'season_trend_output.txt', csv_rows)

        monthly_breakdown = []
        high_seasons_dict = {}
        low_seasons_dict = {}

        for line in cobol_output:
            if not line.startswith('MONTH|'):
                continue
            parts = line.split('|')
            if len(parts) >= 7:
                # MONTH|month_num|month_name|booking_count|revenue|trend_label|trend_description
                month_num = int(parts[1])
                month_name = parts[2]
                booking_count = int(parts[3])
                revenue = float(parts[4])
                trend_label = parts[5]
                trend_desc = parts[6]

                monthly_breakdown.append({
                    "month":         month_num,
                    "month_name":    month_name,
                    "booking_count": booking_count,
                    "revenue":       revenue,
                    "trend_label":   trend_label,
                    "trend_desc":    trend_desc
                })

                # Group by description to build high/low arrays
                if trend_label == 'HIGH':
                    if trend_desc not in high_seasons_dict:
                        high_seasons_dict[trend_desc] = {"label": trend_desc, "months": [], "est_load_factor": 89.0, "description": trend_desc}
                    high_seasons_dict[trend_desc]["months"].append(month_num)
                elif trend_label == 'LOW':
                    if trend_desc not in low_seasons_dict:
                        low_seasons_dict[trend_desc] = {"label": trend_desc, "months": [], "est_load_factor": 42.0, "description": trend_desc, "promo": "Offer 15% Rainy Promo"}
                    low_seasons_dict[trend_desc]["months"].append(month_num)

        return {
            "success":           True,
            "status_label":      "12-MONTH",
            "high_seasons":      list(high_seasons_dict.values()),
            "low_seasons":       list(low_seasons_dict.values()),
            "monthly_breakdown": monthly_breakdown,
        }

    except Exception as e:
        return {"success": False, "message": str(e)}


# ══════════════════════════════════════════════════════════════════════════════
# 5. AIRLINE SHARE PREFERENCE  (/api/forecast/airline-share)
# ══════════════════════════════════════════════════════════════════════════════

# Market share context (static industry intelligence)
COMPETITOR_SHARE = [
    {
        "airline":     "Myanmar National Airline (MNA)",
        "share":       23.5,
        "color":       "#6B7280",
        "description": "Retains strong state & corporate travel segments on government routes."
    },
    {
        "airline":     "Others",
        "share":       18.9,
        "color":       "#6B7280",
        "description": "Popular on leisure/vacation paths to Bagan and Heho."
    },
]

@router.get("/airline-share")
def get_airline_share():
    """
    4. AIRLINE SHARE PREFERENCE
    Returns Blue Horizon's market share vs competitors, computed by COBOL.
    """
    try:
        conn = get_db_conn()
        cursor = conn.cursor()

        # Blue Horizon confirmed booking revenue and count
        cursor.execute('''
            SELECT
                COUNT(*)       AS total_bookings,
                SUM(total_price) AS total_revenue
            FROM BOOKINGS
            WHERE status = 'CONFIRMED'
        ''')
        bh_row = cursor.fetchone()

        # All airlines registered in the system
        cursor.execute('''
            SELECT airline_id, airline_name FROM AIRLINES WHERE is_deleted = 0
        ''')
        airlines = cursor.fetchall()
        conn.close()

        bh_bookings = bh_row['total_bookings'] or 0
        bh_revenue  = bh_row['total_revenue']  or 0

        # Blue Horizon share is whatever remains after competitors
        competitor_total = sum(c['share'] for c in COMPETITOR_SHARE)
        bh_share = round(100.0 - competitor_total, 1)
        bh_name = airlines[0]['airline_name'] if airlines else "Blue Horizon"

        # Prepare CSV inputs
        csv_rows = []
        # Rank 1: Blue Horizon
        csv_rows.append([1, bh_name, bh_share, bh_bookings, bh_revenue])
        # Rank 2+ : Competitors
        for idx, comp in enumerate(COMPETITOR_SHARE, start=2):
            csv_rows.append([idx, comp['airline'], comp['share'], 0, 0])

        # Run COBOL program
        cobol_output = run_cobol_program('AIRLINE-SHARE', 'airline_share_input.csv', 'airline_share_output.txt', csv_rows)

        all_airlines = []
        for line in cobol_output:
            if not line.startswith('AIRLINE|'):
                continue
            parts = line.split('|')
            if len(parts) >= 7:
                # AIRLINE|rank|airline_name|share|total_bookings|total_revenue|position
                rank = int(parts[1])
                airline_name = parts[2]
                share = float(parts[3])
                total_bookings = int(parts[4])
                total_revenue = float(parts[5])
                position = parts[6]

                if position == 'LEADER':
                    color = "#2563EB"
                    desc = "Top preference due to dynamic schedule planning & competitive price models."
                elif position == 'SECOND':
                    color = "#6B7280"
                    desc = "Retains strong state & corporate travel segments on government routes."
                else:
                    color = "#6B7280"
                    desc = "Popular on leisure/vacation paths to Bagan and Heho."

                all_airlines.append({
                    "airline":          airline_name,
                    "share":            share,
                    "color":            color,
                    "description":      desc,
                    "total_bookings":   total_bookings,
                    "total_revenue":    total_revenue,
                })

        return {
            "success":       True,
            "status_label":  "COMPETITIVE",
            "data":          all_airlines,
        }

    except Exception as e:
        return {"success": False, "message": str(e)}