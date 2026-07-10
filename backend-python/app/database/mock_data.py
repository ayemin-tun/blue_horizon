"""
mock_data.py
------------
Blue Horizon Airlines - Forecast Analytics  Mock Data Seeder


ထည့်ပေးမယ့် data:
  - AIRLINES      : +4  (Blue Horizon 5)
  - ROUTES        : +7  (Yangon-Mandalay 8)
  - FLIGHTS       : +14 (BH-101 15 )  (airline share test)
  - ROUTE_SCHEDULE: flight  schedule (route weight )
  - FLIGHT_INSTANCE: Jan-Jun 2026  month-weight (April=Thingyan high season)
  - USERS (agent) : +4 (agent01  5) - weight difference (agent performance test)
  - PASSENGERS    : 300
  - BOOKINGS      : 200 (status: 92% CONFIRMED / 8% CANCELLED)
  - BOOKING_PASSENGERS : booking (1 or 2)

Run:  python mock_data.py
"""

import sqlite3
import os
import sys
import random
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from app.utils.auth_utils import get_password_hash

random.seed(42) 

# ---------------------------------------------------------------------------
# DB connection
# ---------------------------------------------------------------------------

def get_conn():
    db_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
    db_path = os.path.join(db_dir, 'blue_horizon.db')
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    print(f"Connected to: {db_path}")
    return conn

# ---------------------------------------------------------------------------
# Reference data
# ---------------------------------------------------------------------------

NEW_AIRLINES = [
    ("Myanmar National Airlines", "Myanmar"),
    ("Air KBZ", "Myanmar"),
    ("Yangon Airways", "Myanmar"),
    ("FMI Air", "Myanmar"),
]

NEW_ROUTES = [
    ("Yangon", "Mawlamyine"),
    ("Yangon", "Nay Pyi Taw"),
    ("Yangon", "Heho"),
    ("Yangon", "Sittwe"),
    ("Yangon", "Myitkyina"),
    ("Mandalay", "Bagan"),
    ("Mandalay", "Nay Pyi Taw"),
]

ROUTE_WEIGHTS = {
    ("Yangon", "Mandalay"): 30,       # HIGH
    ("Yangon", "Nay Pyi Taw"): 22,    # HIGH-MED
    ("Mandalay", "Bagan"): 18,        # MEDIUM
    ("Yangon", "Heho"): 14,           # MEDIUM
    ("Yangon", "Mawlamyine"): 10,     # MEDIUM-LOW
    ("Mandalay", "Nay Pyi Taw"): 8,   # LOW
    ("Yangon", "Sittwe"): 6,          # LOW
    ("Yangon", "Myitkyina"): 4,       # LOW
}

AIRLINE_CODE = {
    "Blue Horizon": "BH",
    "Myanmar National Airlines": "UB",
    "Air KBZ": "K7",
    "Yangon Airways": "YH",
    "FMI Air": "FM",
}

AIRLINE_FLIGHT_COUNT = {
    "Blue Horizon": 4,              
    "Myanmar National Airlines": 3,
    "Air KBZ": 3,
    "Yangon Airways": 2,
    "FMI Air": 2,
}

MONTH_WEIGHTS = {1: 18, 2: 10, 3: 10, 4: 25, 5: 10, 6: 15}

FIRST_NAMES = [
    "Aung", "Zaw", "Thura", "Kyaw", "Htet", "Nay", "Min", "Kaung", "Thet", "Soe",
    "Ye", "Wai", "Zin", "Hein", "Phyo", "Yan", "Naing", "Tun", "Aye", "Moe",
]
MIDDLE_NAMES = [
    "Myint", "Win", "Htoo", "Lin", "Oo", "San", "Thu", "Ko", "Hlaing", "Zaw",
]
LAST_NAMES = [
    "Kyaw", "Aung", "Htun", "Maung", "Thein", "Naing", "Lwin", "Swe", "Han", "Nyunt",
]
FEMALE_FIRST = [
    "Su", "Thandar", "Ei", "Khin", "Cho", "Yamin", "Hnin", "Mya", "Zar", "Aye",
]

AGENT_USERNAMES = ["agent02", "agent03", "agent04", "agent05"]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def weighted_choice(items, weights):
    return random.choices(items, weights=weights, k=1)[0]

def random_myanmar_name(gender):
    if gender == "M":
        return f"{random.choice(FIRST_NAMES)} {random.choice(MIDDLE_NAMES)} {random.choice(LAST_NAMES)}"
    return f"{random.choice(FEMALE_FIRST)} {random.choice(MIDDLE_NAMES)} {random.choice(LAST_NAMES)}"

def random_phone():
    return f"09-{random.randint(200000000, 999999999)}"

def random_nrc():
    regions = ["12", "1", "5", "9", "7", "14"]
    codes = ["AhLaNa", "MaHtaNa", "SaKaNa", "ThaKaNa", "PaThaNa"]
    return f"{random.choice(regions)}/{random.choice(codes)}(N){random.randint(100000, 999999)}"

def random_dob(min_age=18, max_age=65):
    today = datetime(2026, 7, 9)
    age = random.randint(min_age, max_age)
    dob = today - timedelta(days=age * 365 + random.randint(0, 364))
    return dob.strftime("%d/%m/%Y")

def random_flight_date_2026():
    
    months = list(MONTH_WEIGHTS.keys())
    weights = list(MONTH_WEIGHTS.values())
    month = weighted_choice(months, weights)
    day = random.randint(1, 28)  
    return datetime(2026, month, day)

def fmt_ddmmyyyy(dt):
    return dt.strftime("%d/%m/%Y")

# ---------------------------------------------------------------------------
# Seed functions
# ---------------------------------------------------------------------------

def seed_airlines(cur):
    for name, country in NEW_AIRLINES:
        cur.execute(
            "INSERT INTO AIRLINES (airline_name, country, is_deleted) VALUES (?, ?, 0)",
            (name, country),
        )
    cur.execute("SELECT airline_id, airline_name FROM AIRLINES WHERE is_deleted = 0")
    airline_map = {name: aid for aid, name in cur.fetchall()}
    print(f"Airlines ready: {airline_map}")
    return airline_map


def seed_routes(cur):
    for dep, arr in NEW_ROUTES:
        cur.execute(
            "INSERT INTO ROUTES (departure_city, arrival_city, is_deleted) VALUES (?, ?, 0)",
            (dep, arr),
        )
    cur.execute("SELECT route_id, departure_city, arrival_city FROM ROUTES WHERE is_deleted = 0")
    route_map = {}
    for rid, dep, arr in cur.fetchall():
        route_map[(dep, arr)] = rid
    print(f"Routes ready: {route_map}")
    return route_map


def seed_flights_and_schedules(cur, airline_map, route_map):
    

    route_items = list(ROUTE_WEIGHTS.keys())
    route_weights_list = list(ROUTE_WEIGHTS.values())

    schedules = []  

    cur.execute("SELECT total_seats FROM FLIGHTS WHERE flight_id = 1")
    bh101_seats = cur.fetchone()[0]
    cur.execute(
        """INSERT INTO ROUTE_SCHEDULE
           (route_id, flight_id, departure_time, arrival_time, economy_price, business_price, flight_type, is_deleted)
           VALUES (?, ?, '08:30', '10:00', 150000.00, 250000.00, 'OUTBOUND', 0)""",
        (route_map[("Yangon", "Mandalay")], 1),
    )
    schedules.append({
        "schedule_id": cur.lastrowid,
        "route_id": route_map[("Yangon", "Mandalay")],
        "econ_price": 150000.00, "biz_price": 250000.00,
        "total_seats": bh101_seats,
    })

    for airline_name, flight_count in AIRLINE_FLIGHT_COUNT.items():
        airline_id = airline_map.get(airline_name)
        code = AIRLINE_CODE[airline_name]

        if airline_name == "Blue Horizon":
            start_num = 102  
        else:
            start_num = 101

        for i in range(flight_count):
            flight_no = f"{code}-{start_num + i}"
            total_seats = random.choice([100, 120, 150, 168, 180])
            cur.execute(
                "INSERT INTO FLIGHTS (airline_id, flight_no, total_seats, is_deleted) VALUES (?, ?, ?, 0)",
                (airline_id, flight_no, total_seats),
            )
            flight_id = cur.lastrowid

            dep, arr = weighted_choice(route_items, route_weights_list)
            route_id = route_map[(dep, arr)]

            dep_hour = random.randint(5, 18)
            dep_time = f"{dep_hour:02d}:{random.choice(['00','15','30','45'])}"
            arr_hour = (dep_hour + random.randint(1, 2)) % 24
            arr_time = f"{arr_hour:02d}:{random.choice(['00','15','30','45'])}"
            econ_price = round(random.uniform(80000, 180000), -3)
            biz_price = round(econ_price * random.uniform(1.5, 2.0), -3)

            cur.execute(
                """INSERT INTO ROUTE_SCHEDULE
                   (route_id, flight_id, departure_time, arrival_time, economy_price, business_price, flight_type, is_deleted)
                   VALUES (?, ?, ?, ?, ?, ?, 'OUTBOUND', 0)""",
                (route_id, flight_id, dep_time, arr_time, econ_price, biz_price),
            )
            schedules.append({
                "schedule_id": cur.lastrowid,
                "route_id": route_id,
                "econ_price": econ_price, "biz_price": biz_price,
                "total_seats": total_seats,
            })

    print(f"Flights + Schedules ready: {len(schedules)} schedules")
    return schedules


def seed_instances(cur, schedules):
   
    instances = []
    today = datetime(2026, 7, 9)

    for sch in schedules:
        n_instances = random.randint(12, 20)
        for _ in range(n_instances):
            flight_date = random_flight_date_2026()
            status = "DEPARTED" if flight_date < today else "SCHEDULED"
            cur.execute(
                """INSERT INTO FLIGHT_INSTANCE
                   (schedule_id, flight_date, economy_seats_occupied, business_seats_occupied,
                    base_departure_time, base_arrival_time, base_economy_price, base_business_price,
                    override_economy_price, override_business_price, status, is_deleted)
                   VALUES (?, ?, 0, 0, '08:00', '10:00', ?, ?, NULL, NULL, ?, 0)""",
                (sch["schedule_id"], fmt_ddmmyyyy(flight_date), sch["econ_price"], sch["biz_price"], status),
            )
            instances.append({
                "instance_id": cur.lastrowid,
                "route_id": sch["route_id"],
                "flight_date": flight_date,
                "econ_price": sch["econ_price"],
                "biz_price": sch["biz_price"],
                "total_seats": sch["total_seats"],
                "econ_occupied": 0,
                "biz_occupied": 0,
            })

    print(f"Flight instances ready: {len(instances)}")
    return instances


def seed_agents(cur):
    agent_hashed_password = get_password_hash("agent@123")
    current_date_str = "09/07/2026"
    agent_ids = [2]  # agent01 already exists (user_id=2)
    for username in AGENT_USERNAMES:
        cur.execute(
            """INSERT INTO USERS (username, password, email, role, phone_no, status, joined_date, is_deleted, is_email_verified)
               VALUES (?, ?, ?, 'agent', ?, 'ACTIVE', ?, 0, 1)""",
            (username, agent_hashed_password, f"{username}@bluehorizon.com", random_phone(), current_date_str),
        )
        agent_ids.append(cur.lastrowid)
    print(f"Agents ready: {agent_ids}")
    return agent_ids


def seed_passengers(cur, count=300):
    passenger_ids = []
    for _ in range(count):
        gender = random.choice(["Male", "Female"])
        name = random_myanmar_name("M" if gender == "Male" else "F")
        cur.execute(
            """INSERT INTO PASSENGERS (full_name, date_of_birth, Gender, phone_no, nrc)
               VALUES (?, ?, ?, ?, ?)""",
            (name, random_dob(), gender, random_phone(), random_nrc()),
        )
        passenger_ids.append(cur.lastrowid)
    print(f"Passengers ready: {len(passenger_ids)}")
    return passenger_ids


def seed_bookings(cur, instances, agent_ids, passenger_ids, count=200):
    
    agent_weights = [0.35, 0.25, 0.18, 0.13, 0.09][: len(agent_ids)]

    booking_count = 0
    attempts = 0
    while booking_count < count and attempts < count * 5:
        attempts += 1
        inst = random.choice(instances)

        seat_class = weighted_choice(["ECONOMY", "BUSINESS"], [78, 22])
        n_pax = weighted_choice([1, 2], [70, 30])

        # seat capacity check (simple cap so occupancy stays realistic)
        econ_cap = int(inst["total_seats"] * 0.85)
        biz_cap = inst["total_seats"] - econ_cap
        if seat_class == "ECONOMY" and inst["econ_occupied"] + n_pax > econ_cap:
            continue
        if seat_class == "BUSINESS" and inst["biz_occupied"] + n_pax > biz_cap:
            continue

        unit_price = inst["econ_price"] if seat_class == "ECONOMY" else inst["biz_price"]
        total_price = unit_price * n_pax

        agent_id = weighted_choice(agent_ids, agent_weights)
        status = weighted_choice(["CONFIRMED", "CANCELLED"], [92, 8])

        days_before = random.randint(1, 45)
        booking_dt = inst["flight_date"] - timedelta(days=days_before)
        if booking_dt > datetime(2026, 7, 9):
            booking_dt = datetime(2026, 7, 8)

        ticket_code = f"BH{inst['flight_date'].year}{random.randint(100000, 999999)}"

        cur.execute(
            """INSERT INTO BOOKINGS
               (ticket_code, user_id, instance_id, booking_date, total_price, seat_class, status)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (ticket_code, agent_id, inst["instance_id"], booking_dt.strftime("%Y-%m-%d %H:%M:%S"),
             total_price, seat_class, status),
        )
        booking_id = cur.lastrowid

        # passengers attach
        chosen_pax = random.sample(passenger_ids, n_pax)
        for idx, pax_id in enumerate(chosen_pax):
            seat_no = f"{random.randint(1, 30)}{random.choice('ABCDEF')}"
            cur.execute(
                "INSERT INTO BOOKING_PASSENGERS (booking_id, passenger_id, seat_no) VALUES (?, ?, ?)",
                (booking_id, pax_id, seat_no),
            )

        if status == "CONFIRMED":
            if seat_class == "ECONOMY":
                inst["econ_occupied"] += n_pax
            else:
                inst["biz_occupied"] += n_pax

        booking_count += 1

    print(f"Bookings ready: {booking_count}")
    return booking_count


def update_instance_occupancy(cur, instances):
    for inst in instances:
        cur.execute(
            "UPDATE FLIGHT_INSTANCE SET economy_seats_occupied = ?, business_seats_occupied = ? WHERE instance_id = ?",
            (inst["econ_occupied"], inst["biz_occupied"], inst["instance_id"]),
        )
    print("Flight instance occupancy updated.")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def seed_mock_data():
    conn = get_conn()
    cur = conn.cursor()

    airline_map = seed_airlines(cur)
    route_map = seed_routes(cur)
    schedules = seed_flights_and_schedules(cur, airline_map, route_map)
    instances = seed_instances(cur, schedules)
    agent_ids = seed_agents(cur)
    passenger_ids = seed_passengers(cur, count=300)
    seed_bookings(cur, instances, agent_ids, passenger_ids, count=200)
    update_instance_occupancy(cur, instances)

    conn.commit()
    conn.close()
    print("\n✅ Mock data seeding complete!")


if __name__ == "__main__":
    seed_mock_data()