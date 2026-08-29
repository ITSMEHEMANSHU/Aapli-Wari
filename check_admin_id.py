import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from backend.app.db.database import engine

with engine.connect() as conn:
    print("Checking admin users...")
    users = conn.execute(text("SELECT id, email, role FROM users WHERE role = 'admin'")).fetchall()
    for u in users:
        print(f"User {u[1]}: id={u[0]}, role={u[2]}")
