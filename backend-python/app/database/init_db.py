import sqlite3
import os
import sys

# add root path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Password Hash Function Call 
from app.utils.auth_utils import get_password_hash
from datetime import datetime

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
        email TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'agent')) NOT NULL,
        phone_no TEXT,                                     
        status TEXT CHECK(status IN ('ACTIVE', 'INACTIVE')) DEFAULT 'ACTIVE', 
        joined_date TEXT,
        is_deleted INTEGER DEFAULT 0
    )''')

    cursor.execute('''
    CREATE UNIQUE INDEX IF NOT EXISTS idx_active_user_email 
    ON USERS (email) 
    WHERE is_deleted = 0;
    ''')

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
        flight_no TEXT NOT NULL,
        total_seats INTEGER NOT NULL,
        is_deleted INTEGER DEFAULT 0, 
        FOREIGN KEY (airline_id) REFERENCES AIRLINES(airline_id)
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

    # 9. PASSWORD_RESET_REQUESTS Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS PASSWORD_RESET_REQUESTS (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        status TEXT CHECK(status IN ('PENDING', 'RESOLVED')) DEFAULT 'PENDING' NOT NULL, 
        is_deleted INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    # ---------------------------------------------------------
    # 🚀 Insert Mock Data
    # ---------------------------------------------------------
    
    admin_hashed_password = get_password_hash("admin@123")
    agent_hashed_password = get_password_hash("agent@123")
    current_date_str = datetime.now().strftime("%d/%m/%Y")

    # 1. Default User 
    cursor.execute(
        "INSERT OR IGNORE INTO USERS (user_id, username, password, email, role,phone_no,status,joined_date,is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (1, 'admin', admin_hashed_password, 'admin@bluehorizon.com', 'admin', '09-123456789', 'ACTIVE', current_date_str, 0)
    )
    cursor.execute(
        "INSERT OR IGNORE INTO USERS (user_id, username, password, email, role,phone_no,status,joined_date,is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (2, 'agent01', agent_hashed_password, 'agent01@bluehorizon.com', 'agent', '09-987654321', 'ACTIVE', current_date_str, 0)
    )

    # 2. Sample Airline & Route
    cursor.execute("INSERT OR IGNORE INTO AIRLINES (airline_id, airline_name,country,is_deleted) VALUES (1, 'Blue Horizon','Myanmar',0)")
    cursor.execute("INSERT OR IGNORE INTO ROUTES (route_id, departure_city, arrival_city,is_deleted) VALUES (1, 'Yangon', 'Mandalay',0)")

    # 3. Sample Flight
    cursor.execute('''
    INSERT OR IGNORE INTO FLIGHTS (flight_id, airline_id, flight_no, total_seats,is_deleted)
    VALUES (1, 1, 'BH-101', 120, 0) 
    ''')

    conn.commit()
    conn.close()
    print("🎉 USERS Table created Successfully!")

if __name__ == '__main__':
    init_database()