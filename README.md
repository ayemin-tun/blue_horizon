# Blue_Horizon
# ✈️ Blue Horizon - Air Ticket Analytics System

Blue Horizon is a web-based Air Ticket Analytics System designed to track, manage, and analyze airline ticket sales and data. Built with Role-Based Access Control (RBAC), the system provides detailed dashboard analytics and insights tailored for Admins, Providers (Agents), and regular Users.

---

## 📂 Project Structure

```text
air-ticket-analytics-system/
├── frontend-nextjs/          # Next.js (Frontend UI & App Router)
│   ├── app/                  # Authentication & Dashboard Pages
│   ├── components/           # Reusable UI Components (Input, Buttons, etc.)
│   └── public/               # Static Assets (Logos, Icons)
│
├── backend-python/           # FastAPI (Backend RESTful APIs)
│   ├── app/
│   │   ├── database/         # Database Connection, Models & Mock Data
│   │   │   ├── database.py
│   │   │   ├── models.py
│   │   │   └── init_db.py    # Database Initialization & Seed Script
│   │   ├── routes/           # API Endpoints (auth.py, etc.)
│   │   └── utils/            # Shared Helper Utilities
│   │       └── auth_utils.py # Password Hashing & JWT Token Utilities
│   ├── data/                 # Local SQLite Database Folder (Auto-generated)
│   ├── venv/                 # Python Virtual Environment (Local only)
│   ├── requirements.txt      # Python Dependencies & Libraries List
│   └── run.py                # Main FastAPI Application Entry & Docs Security
│
├── backend-Cobol/            # Legacy COBOL Processing Core
│
└── README.md                 # Project Documentation
```

## 🛠️ Tech Stack

### Frontend
- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS

### Backend
- Framework: FastAPI (Python)
- Database: SQLite (SQLAlchemy ORM)
- Authentication: JWT (JSON Web Tokens) & Passlib (Bcrypt)

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.10 or higher)

---

### 1. Frontend Setup (Next.js)

Navigate to the frontend-nextjs directory:
```bash
cd frontend-nextjs
```

Install the required dependencies:

```bash 
npm install
```

Start the development server:

```bash 
npm run dev
```

Open `http://localhost:3000 `in your browser to view the application.

---

## 2. Backend & Database Setup (Python/SQLite)
Navigate to the backend-python directory:
```bash 
cd backend-python
```

## 🔌 Virtual Environment Setup
It is highly recommended to use a virtual environment to manage dependencies:

```bash 

# Create Virtual Environment
python3 -m venv venv

# Activate on MacOS/Linux
source venv/bin/box/activate

# Activate on Windows
venv\Scripts\activate

```

## 📦 Dependencies Installation
Install all required libraries including specified secure bcrypt versions:

```bash 
pip install -r requirements.txt
```
(Note: If you manually update libraries, run ``pip freeze > requirements.txt`` to sync the dependencies file.)

## 🗄️ Database Initialization & Seed Data 
Initialize and generate the database tables along with secure hashed mock data (``admin@bluehorizon.com`` and ``agent01@bluehorizon.com``):

```bash 
mkdir -p data
```

on MacOS/Linux
```bash 
python3 app/database/init_db.py
```

On Window 
```bash 
python app/database/init_db.py
```
(Note: If `python` doesn't work on Windows, try using `py app/database/init_db.py` instead.)
Note: If you ever need to reset or sync the database structure, manually delete the `data/blue_horizon.db` file and re-run this initialization script.)

---
## 🏃‍♂️ Running the Server
Start the FastAPI development backend server:

```bash 
python run.py 
```

or 

```bash 
uvicorn run:app --reload
```
The backend API server will start running at `http://127.0.0.1:8000`.

---
## 🛡️ API Documentation Security

The interactive API documentation (Swagger UI) is hosted at http://127.0.0.1:8000/docs.

To prevent unauthorized access and data manipulation in production environments, the documentation route is strictly protected via HTTP Basic Authentication. Please use the following credentials to access the Swagger UI panel:
- username: `bh_admin`
- password: `horizon@2026`

---
## Admin Access
use this email and password to login as admin role or you can manually add this admin on `init_db.py` mocked data file 

- email: `admin@bluehorizon.com`
- password: `admin@123`

---
## 📝 Git Workflow Notes
Before pushing any code changes, ensure that unwanted files (e.g., node_modules/, venv/, local database files) are properly ignored using the .gitignore file.

To commit and push your changes:

```bash 
git pull origin master
git add .
git commit -m "Your descriptive commit message"
git push origin master
```