"""
seed_mock_data.py
=================
Inserts realistic mock data into the Blue Horizon SQLite database so that
all four Forecast APIs return rich, meaningful results.

Run from backend-python/:
    python seed_mock_data.py

It is SAFE to run multiple times – existing rows are detected and skipped.
"""

import sqlite3
import hashlib
import os
import bcrypt
from datetime import datetime, timedelta
import random

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "blue_horizon.db")

random.seed(42)   # reproducible

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# ─────────────────────────────────────────────────────────────────────────────
# helpers
# ─────────────────────────────────────────────────────────────────────────────

def hash_pw(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()

def fmt_date(d: datetime) -> str:
    return d.strftime("%d/%m/%Y")

def fmt_dt(d: datetime) -> str:
    return d.strftime("%Y-%m-%d %H:%M:%S")

# ─────────────────────────────────────────────────────────────────────────────
# 0. PURGE OLD TRANSACTIONS (Enforce Clean Slate)
# ─────────────────────────────────────────────────────────────────────────────
print("→ CLEARING OLD DATA (Transactions & Schedules) ...")
tables_to_clear = ["BOOKING_PASSENGERS", "PASSENGERS", "BOOKINGS", "FLIGHT_INSTANCE", "ROUTE_SCHEDULE"]
for t in tables_to_clear:
    cur.execute(f"DELETE FROM {t}")
conn.commit()

# ─────────────────────────────────────────────────────────────────────────────
# 1. USERS  –  3 agents  (admin already exists)
# ─────────────────────────────────────────────────────────────────────────────
print("→ USERS ...")

agents = [
    # (username, email, phone, joined_days_ago)
    ("agent01", "agent01@bluehorizon.com", "09-111222333", 60),
    ("agent02", "agent02@bluehorizon.com", "09-444555666", 45),
    ("agent03", "agent03@bluehorizon.com", "09-777888999", 20),
]

agent_ids = {}
for username, email, phone, days_ago in agents:
    joined = fmt_date(datetime.now() - timedelta(days=days_ago))
    cur.execute("SELECT user_id FROM USERS WHERE username=? AND is_deleted=0", (username,))
    row = cur.fetchone()
    if row:
        agent_ids[username] = row["user_id"]
        print(f"   skip {username} (exists)")
    else:
        cur.execute(
            "INSERT INTO USERS (username,password,email,role,phone_no,status,joined_date,is_deleted) "
            "VALUES (?,?,?,?,?,?,?,0)",
            (username, hash_pw("pass1234"), email, "agent", phone, "ACTIVE", joined)
        )
        agent_ids[username] = cur.lastrowid
        print(f"   inserted {username} -> id={agent_ids[username]}")

conn.commit()

# ─────────────────────────────────────────────────────────────────────────────
# 2. AIRLINES  –  2 more airlines
# ─────────────────────────────────────────────────────────────────────────────
print("-> AIRLINES ...")

airlines_data = [
    ("Blue Horizon",                 "Myanmar"),   # id=1, already exists
    ("Myanmar National Airline",     "Myanmar"),
    ("Air Bagan",                    "Myanmar"),
]

airline_ids = {}
for name, country in airlines_data:
    cur.execute("SELECT airline_id FROM AIRLINES WHERE airline_name=? AND is_deleted=0", (name,))
    row = cur.fetchone()
    if row:
        airline_ids[name] = row["airline_id"]
        print(f"   skip {name}")
    else:
        cur.execute(
            "INSERT INTO AIRLINES (airline_name, country, is_deleted) VALUES (?,?,0)",
            (name, country)
        )
        airline_ids[name] = cur.lastrowid
        print(f"   inserted {name} -> id={airline_ids[name]}")

conn.commit()

# ─────────────────────────────────────────────────────────────────────────────
# 3. ROUTES  –  3 more routes (total 4)
# ─────────────────────────────────────────────────────────────────────────────
print("-> ROUTES ...")

routes_data = [
    ("Yangon",    "Mandalay"),    # route_id=1, already exists
    ("Yangon",    "NayPyiTaw"),
    ("Yangon",    "Heho"),
    ("Mandalay",  "Heho"),
]

route_ids = {}
for dep, arr in routes_data:
    cur.execute(
        "SELECT route_id FROM ROUTES WHERE departure_city=? AND arrival_city=? AND is_deleted=0",
        (dep, arr)
    )
    row = cur.fetchone()
    if row:
        route_ids[(dep, arr)] = row["route_id"]
        print(f"   skip {dep}->{arr}")
    else:
        cur.execute(
            "INSERT INTO ROUTES (departure_city, arrival_city, is_deleted) VALUES (?,?,0)",
            (dep, arr)
        )
        route_ids[(dep, arr)] = cur.lastrowid
        print(f"   inserted {dep}->{arr} -> id={route_ids[(dep, arr)]}")

conn.commit()
route_ids.setdefault(("Yangon", "Mandalay"), 1)

# ─────────────────────────────────────────────────────────────────────────────
# 4. FLIGHTS
# ─────────────────────────────────────────────────────────────────────────────
print("-> FLIGHTS ...")

flights_data = [
    ("Blue Horizon",             "BH-101",  120),   # already exists
    ("Blue Horizon",             "BH-202",  100),
    ("Myanmar National Airline", "MNA-301",  90),
    ("Air Bagan",                "AB-401",   80),
]

flight_ids = {}
for airline_name, flight_no, seats in flights_data:
    cur.execute("SELECT flight_id FROM FLIGHTS WHERE flight_no=? AND is_deleted=0", (flight_no,))
    row = cur.fetchone()
    if row:
        flight_ids[flight_no] = row["flight_id"]
        print(f"   skip {flight_no}")
    else:
        a_id = airline_ids[airline_name]
        cur.execute(
            "INSERT INTO FLIGHTS (airline_id, flight_no, total_seats, is_deleted) VALUES (?,?,?,0)",
            (a_id, flight_no, seats)
        )
        flight_ids[flight_no] = cur.lastrowid
        print(f"   inserted {flight_no} -> id={flight_ids[flight_no]}")

conn.commit()
flight_ids.setdefault("BH-101", 1)

# ─────────────────────────────────────────────────────────────────────────────
# 5. ROUTE_SCHEDULE
# ─────────────────────────────────────────────────────────────────────────────
print("-> ROUTE_SCHEDULE ...")

# Data format: (route_key, flight_no, out_dep, out_arr, in_dep, in_arr, eco_price, biz_price)
# Note: INBOUND departure times are strictly >= 3 hours (180 mins) after OUTBOUND arrival time
schedules_data = [
    (("Yangon",   "Mandalay"),  "BH-101", "08:30", "10:00", "13:30", "15:00", 150000, 250000),
    (("Yangon",   "NayPyiTaw"), "BH-202", "09:00", "10:15", "13:30", "14:45", 120000, 200000),
    (("Yangon",   "Heho"),      "MNA-301","11:00", "12:20", "15:30", "16:50", 130000, 210000),
    (("Mandalay", "Heho"),      "AB-401", "13:00", "14:00", "17:30", "18:30", 100000, 180000),
]

schedule_ids = {} # maps to (route_key, type)
for rkey, flight_no, o_dep, o_arr, i_dep, i_arr, eco, biz in schedules_data:
    r_id = route_ids[rkey]
    f_id = flight_ids[flight_no]
    
    # OUTBOUND
    cur.execute(
        "INSERT INTO ROUTE_SCHEDULE "
        "(route_id,flight_id,departure_time,arrival_time,economy_price,business_price,flight_type,is_deleted) "
        "VALUES (?,?,?,?,?,?,'OUTBOUND',0)",
        (r_id, f_id, o_dep, o_arr, eco, biz)
    )
    schedule_ids[(rkey, 'OUTBOUND')] = cur.lastrowid
    
    # INBOUND
    cur.execute(
        "INSERT INTO ROUTE_SCHEDULE "
        "(route_id,flight_id,departure_time,arrival_time,economy_price,business_price,flight_type,is_deleted) "
        "VALUES (?,?,?,?,?,?,'INBOUND',0)",
        (r_id, f_id, i_dep, i_arr, eco, biz)
    )
    schedule_ids[(rkey, 'INBOUND')] = cur.lastrowid
    
    print(f"   inserted 2 schedules for {rkey} (OUTBOUND & INBOUND)")

conn.commit()

# ─────────────────────────────────────────────────────────────────────────────
# 6. FLIGHT_INSTANCE  –  instances spread over past 60 days
# ─────────────────────────────────────────────────────────────────────────────
print("-> FLIGHT_INSTANCE ...")

BASE = datetime.now()

# Map schedule_id to meta data based on schedules_data
sched_meta = {}
for rkey, flight_no, o_dep, o_arr, i_dep, i_arr, eco, biz in schedules_data:
    seats = 0
    for name, f_no, s in flights_data:
        if f_no == flight_no:
            seats = s
            break
            
    out_id = schedule_ids[(rkey, 'OUTBOUND')]
    in_id = schedule_ids[(rkey, 'INBOUND')]
    sched_meta[out_id] = (o_dep, o_arr, eco, biz, seats)
    sched_meta[in_id] = (i_dep, i_arr, eco, biz, seats)

instance_ids = {}
new_instance_count = 0

for sched_id, (dep, arr, eco, biz, seats) in sched_meta.items():
    # Past 60 days to Future 30 days
    for day_offset in range(-60, 31, 2):
        d = BASE + timedelta(days=day_offset)
        date_str = fmt_date(d)
        
        # Determine Status
        status = "SCHEDULED"
        if day_offset < 0:
            status = random.choice(["DEPARTED", "DEPARTED", "CANCELLED"])
            
        month = d.month
        if status == "CANCELLED":
            eco_occ = 0
            biz_occ = 0
        else:
            if month == 4:
                eco_occ = int(seats * 0.85 * random.uniform(0.9, 1.0))
                biz_occ = int(10 * random.uniform(0.8, 1.0))
            elif month in (6, 7):
                eco_occ = int(seats * 0.30 * random.uniform(0.7, 1.0))
                biz_occ = int(5 * random.uniform(0.4, 0.8))
            else:
                eco_occ = int(seats * 0.60 * random.uniform(0.6, 1.0))
                biz_occ = int(8 * random.uniform(0.5, 1.0))

            eco_occ = max(0, min(eco_occ, seats - 10))
            biz_occ = max(0, min(biz_occ, 10))

        # Random overrides for future scheduled flights (10% chance)
        o_eco, o_biz = None, None
        if status == "SCHEDULED" and random.random() < 0.1:
            o_eco = round(eco * 0.9, 2)
            o_biz = round(biz * 0.9, 2)

        cur.execute(
            "INSERT INTO FLIGHT_INSTANCE "
            "(schedule_id,flight_date,economy_seats_occupied,business_seats_occupied,"
            "base_departure_time,base_arrival_time,base_economy_price,base_business_price,"
            "override_economy_price,override_business_price,status,is_deleted) "
            "VALUES (?,?,?,?,?,?,?,?,?,?,?,0)",
            (sched_id, date_str, eco_occ, biz_occ, dep, arr, eco, biz, o_eco, o_biz, status)
        )
        instance_ids[(sched_id, date_str)] = cur.lastrowid
        new_instance_count += 1

conn.commit()
print(f"   inserted {new_instance_count} new FLIGHT_INSTANCE rows")

# ─────────────────────────────────────────────────────────────────────────────
# 7. PASSENGERS + BOOKINGS + BOOKING_PASSENGERS  (~350 new bookings)
# ─────────────────────────────────────────────────────────────────────────────
print("-> BOOKINGS / PASSENGERS ...")

FIRST_NAMES = [
    "Kyaw","Aung","Min","Zaw","Htet","Nay","Thura","Pyae",
    "Aye","Su","Khin","Mya","Thida","Ni","Ei","Wai",
    "San","Thu","Nanda","Phyu"
]
LAST_NAMES = [
    "Myo","Lin","Zin","Lwin","Tun","Win","Htun","Naing",
    "Kyaw","Soe","Oo","Nwe","Htwe","Maung","Ko","Zaw"
]
NATIONALITIES = ["Myanmar","Myanmar","Myanmar","Thai","Chinese","Indian"]
GENDERS = ["Male","Female"]
TYPES = ["ADULT","ADULT","ADULT","CHILD"]
STATUSES = ["CONFIRMED","CONFIRMED","CONFIRMED","CONFIRMED","CANCELLED"]

# Only book on instances that are NOT CANCELLED
cur.execute("SELECT instance_id FROM FLIGHT_INSTANCE WHERE status != 'CANCELLED'")
valid_instances = [row['instance_id'] for row in cur.fetchall()]

agent_list = list(agent_ids.values())

new_booking_count = 0
new_pax_count = 0

for i in range(350):
    inst_id = random.choice(valid_instances)
    booking_dt = BASE - timedelta(
        days=random.randint(0, 60),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59)
    )
    agent_id = random.choice(agent_list)

    cur.execute(
        "SELECT base_economy_price, base_business_price FROM FLIGHT_INSTANCE WHERE instance_id=?",
        (inst_id,)
    )
    inst = cur.fetchone()
    if not inst:
        continue
    price = inst["base_business_price"] if random.random() < 0.15 else inst["base_economy_price"]
    status = random.choice(STATUSES)

    cur.execute(
        "INSERT INTO BOOKINGS (user_id, instance_id, booking_date, total_price, status) "
        "VALUES (?,?,?,?,?)",
        (agent_id, inst_id, fmt_dt(booking_dt), price, status)
    )
    booking_id = cur.lastrowid
    new_booking_count += 1

    fname = random.choice(FIRST_NAMES)
    lname = random.choice(LAST_NAMES)
    full_name = f"{fname} {lname}"
    dob = (datetime.now() - timedelta(days=random.randint(6570, 22000))).strftime("%Y-%m-%d")
    gender = random.choice(GENDERS)
    pax_type = random.choice(TYPES)
    nationality = random.choice(NATIONALITIES)
    email = f"{fname.lower()}.{lname.lower()}{random.randint(10,99)}@mail.com"
    phone = f"09-{random.randint(100000000, 999999999)}"
    passport = f"MC{random.randint(1000000, 9999999)}"

    cur.execute(
        "INSERT INTO PASSENGERS "
        "(full_name, date_of_birth, Gender, type, email, phone_no, passport_no, nationality) "
        "VALUES (?,?,?,?,?,?,?,?)",
        (full_name, dob, gender, pax_type, email, phone, passport, nationality)
    )
    pax_id = cur.lastrowid
    new_pax_count += 1

    cur.execute(
        "INSERT INTO BOOKING_PASSENGERS (booking_id, passenger_id) VALUES (?,?)",
        (booking_id, pax_id)
    )

conn.commit()
print(f"   inserted {new_booking_count} BOOKINGS")
print(f"   inserted {new_pax_count} PASSENGERS")

# ─────────────────────────────────────────────────────────────────────────────
# Final summary
# ─────────────────────────────────────────────────────────────────────────────
print("\nDone! Final row counts:")
for tbl in ["USERS","AIRLINES","ROUTES","FLIGHTS","ROUTE_SCHEDULE",
            "FLIGHT_INSTANCE","BOOKINGS","PASSENGERS","BOOKING_PASSENGERS"]:
    cur.execute(f"SELECT COUNT(*) as c FROM {tbl}")
    print(f"   {tbl:<22} {cur.fetchone()['c']:>4}")

conn.close()
