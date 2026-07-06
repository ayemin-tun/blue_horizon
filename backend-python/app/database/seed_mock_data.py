import sqlite3
import os
import random
from datetime import datetime, timedelta

def seed_database():
    # Database လမ်းကြောင်း (init_db နဲ့ အတူတူပဲဖြစ်ရပါမယ်)
    db_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
    db_path = os.path.join(db_dir, 'blue_horizon.db')
    
    if not os.path.exists(db_path):
        print("❌ Database မတွေ့ပါ။ အရင်ဆုံး init_db ကို Run ပေးပါ။")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    print(f"🚀 Seeding mock data into: {db_path}")

    # ---------------------------------------------------------
    # ၁။ နောက်ထပ် Flight Instances အနည်းငယ် ထပ်ထည့်မည် (Bookings တွေ ဖြန့်ထည့်ဖို့)
    # ---------------------------------------------------------
    today = datetime.now()
    instance_ids = [1] # init_db မှာပါပြီးသား instance_id
    
    for i in range(1, 6): # နောက်ထပ် ၅ ရက်စာ ထပ်ထည့်မယ်
        flight_date = (today + timedelta(days=i)).strftime("%d/%m/%Y")
        cursor.execute('''
            INSERT INTO FLIGHT_INSTANCE (
                schedule_id, flight_date, base_departure_time, base_arrival_time, 
                base_economy_price, base_business_price, economy_seats_occupied, 
                business_seats_occupied, status, is_deleted
            ) VALUES (1, ?, '08:30', '10:00', 150000.00, 250000.00, 0, 0, 'SCHEDULED', 0)
        ''', (flight_date,))
        instance_ids.append(cursor.lastrowid)

    # ---------------------------------------------------------
    # ၂။ Random ခရီးသည် ၅၀ နှင့် Booking ၅၀ ထည့်သွင်းခြင်း
    # ---------------------------------------------------------
    first_names = ["Aung", "Kyaw", "Zaw", "Min", "Su", "Khaing", "Thiri", "Nilar", "Myo", "Tun", "John", "Sarah"]
    last_names = ["Htwe", "Myint", "Naing", "Lwin", "Wai", "Zin", "Oo", "Swe", "Smith", "Doe"]
    genders = ["Male", "Female"]
    nationalities = ["Myanmar", "Myanmar", "Myanmar", "Thai", "Singaporean", "American"]

    print("Generating 50 random bookings & passengers...")

    for i in range(50):
        # --- Create Passenger ---
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        full_name = f"{fname} {lname}"
        
        # အသက် Random တွက်ခြင်း (၁၉၆၀ မှ ၂၀၁၅ အတွင်း)
        dob = (today - timedelta(days=random.randint(3000, 23000))).strftime("%Y-%m-%d")
        gender = random.choice(genders)
        p_type = "ADULT" if random.randint(1, 10) > 2 else "CHILD"
        email = f"{fname.lower()}{i}@example.com"
        phone = f"09{random.randint(10000000, 99999999)}"
        passport = f"M{random.randint(100000, 999999)}" if random.randint(1,5) > 1 else f"F{random.randint(100000, 999999)}"
        nationality = random.choice(nationalities)

        cursor.execute('''
            INSERT INTO PASSENGERS (full_name, date_of_birth, Gender, type, email, phone_no, passport_no, nationality)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (full_name, dob, gender, p_type, email, phone, passport, nationality))
        
        passenger_id = cursor.lastrowid

        # --- Create Booking ---
        user_id = 2 # agent01 က လုပ်ပေးတယ်လို့ သဘောထားမယ်
        instance_id = random.choice(instance_ids)
        booking_date = (today - timedelta(days=random.randint(0, 10))).strftime("%Y-%m-%d %H:%M:%S")
        
        # Economy (80% chance) vs Business (20% chance)
        is_business = random.random() > 0.8
        total_price = 250000.00 if is_business else 150000.00
        
        # Status (90% Confirmed, 10% Cancelled)
        status = "CONFIRMED" if random.random() > 0.1 else "CANCELLED"

        cursor.execute('''
            INSERT INTO BOOKINGS (user_id, instance_id, booking_date, total_price, status)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, instance_id, booking_date, total_price, status))
        
        booking_id = cursor.lastrowid

        # --- Bridge Table (Booking_Passengers) ---
        cursor.execute('''
            INSERT INTO BOOKING_PASSENGERS (booking_id, passenger_id)
            VALUES (?, ?)
        ''', (booking_id, passenger_id))

        # --- Update Seats in Flight Instance (If Confirmed) ---
        if status == "CONFIRMED":
            if is_business:
                cursor.execute('''
                    UPDATE FLIGHT_INSTANCE 
                    SET business_seats_occupied = business_seats_occupied + 1 
                    WHERE instance_id = ?
                ''', (instance_id,))
            else:
                cursor.execute('''
                    UPDATE FLIGHT_INSTANCE 
                    SET economy_seats_occupied = economy_seats_occupied + 1 
                    WHERE instance_id = ?
                ''', (instance_id,))

    conn.commit()
    conn.close()
    print("✅ Mock Data 50 records successfully generated and linked!")

if __name__ == '__main__':
    seed_database()