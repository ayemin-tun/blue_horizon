import sqlite3
import os
import sys

# add root path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Password Hash Function Call 
from app.utils.auth_utils import get_password_hash

def init_database():

    # Database location (backend-python/data/blue_horizon.db)
    db_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
    os.makedirs(db_dir, exist_ok=True)
    db_path = os.path.join(db_dir, 'blue_horizon.db')
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print(f"Connecting to database at: {db_path}")

    # Foreign Key support is ON
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. USERS Table (
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS USERS (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT CHECK(role IN ('admin', 'agent')) NOT NULL
    )''')

    # 2. AIRLINES Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS AIRLINES (
        airline_id INTEGER PRIMARY KEY AUTOINCREMENT,
        airline_name TEXT NOT NULL,
        country TEXT NOT NULL,
        is_deleted INTEGER DEFAULT 0
    )''')

    # 3. ROUTES Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS ROUTES (
        route_id INTEGER PRIMARY KEY AUTOINCREMENT,
        departure_city TEXT NOT NULL,
        arrival_city TEXT NOT NULL,
        is_deleted INTEGER DEFAULT 0
    )''')

    # 4. FLIGHTS Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS FLIGHTS (
        flight_id INTEGER PRIMARY KEY AUTOINCREMENT,
        airline_id INTEGER NOT NULL,
        route_id INTEGER NOT NULL,
        flight_no TEXT NOT NULL,
        departure_time DATETIME NOT NULL,
        arrival_time DATETIME NOT NULL,
        total_seats INTEGER NOT NULL,
        available_seats INTEGER NOT NULL,
        economy_price DECIMAL(10, 2) NOT NULL,
        business_price DECIMAL(10, 2) NOT NULL,
        is_deleted INTEGER DEFAULT 0, 
        FOREIGN KEY (airline_id) REFERENCES AIRLINES(airline_id),
        FOREIGN KEY (route_id) REFERENCES ROUTES(route_id)
    )''')

    # made flight no is unique if the is_delete is 0 (not soft delete) if the flight is soft delete it can be use on other flight (no is not unique for soft delete data)
    cursor.execute('''
    CREATE UNIQUE INDEX IF NOT EXISTS idx_active_flight_no 
    ON FLIGHTS (flight_no) 
    WHERE is_deleted = 0;
    ''')

    # 5. BOOKINGS Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS BOOKINGS (
        booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        flight_id INTEGER NOT NULL,
        booking_date DATETIME NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES USERS(user_id),
        FOREIGN KEY (flight_id) REFERENCES FLIGHTS(flight_id)
    )''')

    # 6. PASSENGERS Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS PASSENGERS (
        passenger_id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        date_of_birth DATE NOT NULL,
        Gender TEXT NOT NULL,
        type TEXT NOT NULL,
        email TEXT NOT NULL,
        phone_no TEXT NOT NULL,
        passport_no TEXT NOT NULL,
        nationality TEXT NOT NULL
    )''')

    # 7. BOOKING_PASSENGERS Table (Many-to-Many Bridge Table)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS BOOKING_PASSENGERS (
        bp_id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        passenger_id INTEGER NOT NULL,
        FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id),
        FOREIGN KEY (passenger_id) REFERENCES PASSENGERS(passenger_id)
    )''')

    # 8. FLIGHT_MANAGEMENT_LOG Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS FLIGHT_MANAGEMENT_LOG (
        log_id INTEGER PRIMARY KEY AUTOINCREMENT,
        flight_id INTEGER NOT NULL,
        admin_id INTEGER NOT NULL,
        action_type TEXT NOT NULL,
        action_date DATETIME NOT NULL,
        FOREIGN KEY (flight_id) REFERENCES FLIGHTS(flight_id),
        FOREIGN KEY (admin_id) REFERENCES USERS(user_id)
    )''')

    # ---------------------------------------------------------
    # 🚀 Insert Mock Data
    # ---------------------------------------------------------
    
    admin_hashed_password = get_password_hash("admin@123")
    agent_hashed_password = get_password_hash("agent@123")

    # 1. Default User 
    cursor.execute(
        "INSERT OR IGNORE INTO USERS (user_id, username, password, email, role) VALUES (?, ?, ?, ?, ?)",
        (1, 'admin', admin_hashed_password, 'admin@bluehorizon.com', 'admin')
    )
    cursor.execute(
        "INSERT OR IGNORE INTO USERS (user_id, username, password, email, role) VALUES (?, ?, ?, ?, ?)",
        (2, 'agent01', agent_hashed_password, 'agent01@bluehorizon.com', 'agent')
    )

    # 2. Sample Airline & Route
    cursor.execute("INSERT OR IGNORE INTO AIRLINES (airline_id, airline_name,country,is_deleted) VALUES (1, 'MAI','Myanmar',0)")
    cursor.execute("INSERT OR IGNORE INTO ROUTES (route_id, departure_city, arrival_city,is_deleted) VALUES (1, 'Yangon', 'Mandalay',0)")

    # 3. Sample Flight
    cursor.execute('''
    INSERT OR IGNORE INTO FLIGHTS (flight_id, airline_id, route_id, flight_no, departure_time, arrival_time, total_seats, available_seats, economy_price, business_price, is_deleted)
    VALUES (1, 1, 1, 'UB-101', '2026-07-01 08:00:00', '2026-07-01 09:00:00', 120, 120, 150000.00, 250000.00, 0) 
    ''')

    conn.commit()
    conn.close()
    print("🎉 USERS Table created Successfully!")

if __name__ == '__main__':
    init_database()