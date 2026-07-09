# ✈️ Blue Horizon — Air Ticket Analytics System

Blue Horizon is a web-based Air Ticket Analytics System designed to track, manage, and analyze airline ticket sales and data. Built with Role-Based Access Control (RBAC), the system provides detailed dashboard analytics and insights tailored for **Admins**, **Providers (Agents)**, and regular **Users**.

---

## 📑 Table of Contents

- [Project Structure](#-project-structure)
- [Tech Stack](#️-tech-stack)
- [Getting Started](#-getting-started-local-setup)
  - [Frontend Setup](#1-frontend-setup-nextjs)
  - [Backend & Database Setup](#2-backend--database-setup-pythonsqlite)
- [Running the Server](#️-running-the-server)
- [API Documentation Security](#️-api-documentation-security)
- [Admin Access](#-admin-access)
- [Batch Jobs](#-batch-jobs--how-to-run-blue-horizon)
- [Git Workflow Notes](#-git-workflow-notes)

---

## 📂 Project Structure

```text
air-ticket-analytics-system/
├── frontend-nextjs/          # Next.js (Frontend UI & App Router)
│   ├── app/                  # Authentication & Dashboard Pages
│   ├── components/           # Reusable UI Components (Input, Buttons, etc.)
│   └── public/                # Static Assets (Logos, Icons)
│
├── backend-python/            # FastAPI (Backend RESTful APIs)
│   ├── app/
│   │   ├── database/           # Database Connection, Models & Mock Data
│   │   │   ├── database.py
│   │   │   ├── models.py
│   │   │   └── init_db.py      # Database Initialization & Seed Script
│   │   ├── routes/              # API Endpoints (auth.py, etc.)
│   │   └── utils/                # Shared Helper Utilities
│   │       └── auth_utils.py     # Password Hashing & JWT Token Utilities
│   ├── data/                    # Local SQLite Database Folder (auto-generated)
│   ├── venv/                    # Python Virtual Environment (local only)
│   ├── requirements.txt         # Python Dependencies & Libraries List
│   └── run.py                   # Main FastAPI Application Entry & Docs Security
│
├── backend-Cobol/              # Legacy COBOL Processing Core
│
└── README.md                    # Project Documentation
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS

### Backend
- **Framework:** FastAPI (Python)
- **Database:** SQLite (SQLAlchemy ORM)
- **Authentication:** JWT (JSON Web Tokens) & Passlib (Bcrypt)

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.10 or higher)

---

### 1. Frontend Setup (Next.js)

Navigate to the `frontend-nextjs` directory:

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

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

### 2. Backend & Database Setup (Python/SQLite)

Navigate to the `backend-python` directory:

```bash
cd backend-python
```

#### 🔌 Virtual Environment Setup

It is highly recommended to use a virtual environment to manage dependencies:

```bash
# Create virtual environment
python3 -m venv venv

# Activate on macOS/Linux
source venv/bin/activate

# Activate on Windows
venv\Scripts\activate
```

#### 📦 Dependencies Installation

Install all required libraries, including the specified secure bcrypt version:

```bash
pip install -r requirements.txt
```

> **Note:** If you manually update libraries, run `pip freeze > requirements.txt` to sync the dependencies file.

#### 🗄️ Database Initialization & Seed Data

Initialize the database tables and generate secure hashed mock data (`admin@bluehorizon.com` and `agent01@bluehorizon.com`):

```bash
mkdir -p data
```

On macOS/Linux:

```bash
python3 app/database/init_db.py
```

On Windows:

```bash
python app/database/init_db.py
```

> **Note:** If `python` doesn't work on Windows, try `py app/database/init_db.py` instead.
>
> If you ever need to reset or resync the database structure, manually delete the `data/blue_horizon.db` file and re-run this initialization script.

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

The interactive API documentation (Swagger UI) is hosted at `http://127.0.0.1:8000/docs`.

To prevent unauthorized access and data manipulation in production environments, the documentation route is strictly protected via HTTP Basic Authentication. Use the following credentials to access the Swagger UI panel:

| Field | Value |
|---|---|
| Username | `bh_admin` |
| Password | `horizon@2026` |

---

## 👤 Admin Access

Use the following credentials to log in as an admin, or add this account manually in the `init_db.py` mock data file:

| Field | Value |
|---|---|
| Email | `admin@bluehorizon.com` |
| Password | `admin@123` |

---

## ⏱️ Batch Jobs — How to Run (Blue Horizon)

This folder contains scripts that keep flight instance data up to date:

| Script | Purpose | Frequency |
|---|---|---|
| `roll_forward_instances.py` | Extends each active schedule's instances by one more day | Once a day (around midnight) |
| `update_departed_status.py` | Flips `SCHEDULED` instances to `DEPARTED` once their departure time has passed | Frequently (every ~10 minutes) |
| `batch_common.py` | Shared DB session logic used by both scripts above | Not run directly |

Since these two jobs run on different schedules, we use a single **loop script** locally to run both automatically for testing, on the interval each one needs. There are two versions of this loop script depending on your OS, plus two "quick test" versions that just fire both scripts every 30 seconds.

| File | Platform | Purpose |
|---|---|---|
| `bash_run_loop.sh` | macOS / Linux | **Recommended.** Runs `update_departed_status.py` every 10 min, `roll_forward_instances.py` at midnight. |
| `batch_run_loop.ps1` | Windows | **Recommended.** Same dual-interval behavior as above, for Windows/PowerShell. |
| `test_run_loop.sh` | macOS / Linux | Quick test only — runs **both** scripts every 30 seconds, ignoring real intervals. |
| `test_run_loop.ps1` | Windows | Quick test only — Windows version of the above. |

Use `bash_run_loop.sh` / `batch_run_loop.ps1` for anything realistic. Use the `test_run_loop.*` scripts only if you just want to quickly confirm the scripts run without errors, without waiting 10 minutes.

### 1. Prerequisites (do this once)

Make sure the Python virtual environment is set up and dependencies installed:

```bash
cd backend-python
python3 -m venv venv          # if venv doesn't exist yet
source venv/bin/activate      # macOS/Linux
# venv\Scripts\activate       # Windows (PowerShell)
pip install -r requirements.txt
```

### 2. macOS / Linux

**Recommended (dual-interval, matches production behavior):**

```bash
cd backend-python/batch
chmod +x bash_run_loop.sh
./bash_run_loop.sh | tee test_run.log
```

- `update_departed_status.py` runs immediately on startup, then every 10 minutes.
- `roll_forward_instances.py` runs once, exactly at midnight.
- `| tee test_run.log` prints output to your terminal **and** saves it to `test_run.log` in the same folder, so you can review it later.
- Press `Ctrl+C` to stop.

**Quick test only (every 30 seconds, ignores real schedule):**

```bash
cd backend-python/batch
chmod +x test_run_loop.sh
./test_run_loop.sh | tee test_run.log
```

Use this only to sanity-check that both scripts run without errors. It does **not** reflect the real 10-minute / midnight schedule.

### 3. Windows (PowerShell)

If PowerShell blocks the script from running, allow it for the current session first:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

**Recommended (dual-interval, matches production behavior):**

```powershell
cd backend-python\batch
.\batch_run_loop.ps1 | Tee-Object -FilePath test_run.log
```

- Same behavior as the macOS/Linux version: status update every 10 min, roll-forward at midnight.
- `Tee-Object` does the same job as `tee` on macOS/Linux — shows output live and saves it to `test_run.log`.
- Press `Ctrl+C` to stop.

**Quick test only (every 30 seconds, ignores real schedule):**

```powershell
cd backend-python\batch
.\test_run_loop.ps1 | Tee-Object -FilePath test_run.log
```

> ⚠️ Check the `$PythonExe` path near the top of both `.ps1` files — it assumes your venv is at `..\venv\Scripts\python.exe`. Update it if your venv is somewhere else.

### 4. Reading the log

Whichever script you run, if you piped it through `tee` / `Tee-Object`, a `test_run.log` file will appear in `backend-python/batch/`. Open it to review what happened — every schedule/instance processed, any skips, and any errors are printed there.

If you don't use `tee` / `Tee-Object`, output only appears in the terminal and disappears once the window closes.

### 5. Stopping

All four scripts run in an infinite loop by design (for local testing). Press `Ctrl+C` in the terminal to stop them. This does not affect the database — anything already committed stays committed.

### 6. Production note

These loop scripts are for **local testing only**. In production, don't leave a terminal loop running — use:

- **macOS/Linux:** cron (`crontab -e`), with `roll_forward_instances.py` once daily and `update_departed_status.py` every 1 minute (cron's minimum interval).
- **Windows:** Task Scheduler, with the same two intervals (1-minute minimum repeat, same as cron).

Ask in the team channel if you need the exact cron / Task Scheduler entries — they're documented separately.

---

## 📝 Git Workflow Notes

Before pushing any code changes, ensure that unwanted files (e.g., `node_modules/`, `venv/`, local database files) are properly ignored using the `.gitignore` file.

To commit and push your changes:

```bash
git pull origin master
git add .
git commit -m "Your descriptive commit message"
git push origin master
```