"""
batch_common.py
─────────────────────────────────────────────────────────────────────────────
Shared helpers used by both batch scripts:
  - roll_forward_instances.py  (run once per day)
  - update_departed_status.py  (run frequently, e.g. every 5-15 minutes)

NOTE: Check the import below. `SessionLocal` must match whatever the
sessionmaker is named in app/database/database.py. If it's named
differently in your project, update this one import line only.
"""

import sys
import os
from datetime import datetime, timedelta

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(PROJECT_ROOT)

os.chdir(PROJECT_ROOT)

from app.database.database import SessionLocal
from app.database import models

DATE_FMT = "%d/%m/%Y"
TIME_FMT = "%H:%M"


def get_session():
    """Returns a new DB session. Caller is responsible for closing it."""
    return SessionLocal()


def log(message: str):
    """Simple timestamped print, useful when redirecting output to a log file."""
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {message}")