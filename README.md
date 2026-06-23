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
│   ├── data/                 # SQLite Database (blue_horizon.db)
│   ├── auth_utils.py         # Password Hashing & JWT Token Utilities
│   └── run.py                # Main FastAPI Application Entry
|
── backend-Cobol/          
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
