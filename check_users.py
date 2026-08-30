import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from backend.app.db.database import engine

with engine.connect() as conn:
    print("Checking users and roles...")
    users = conn.execute(text("SELECT email, role, is_contributor FROM users")).fetchall()
    for u in users:
        print(f"User {u[0]}: role={u[1]}, is_contributor={u[2]}")
        
    print("\nChecking contributor profiles...")
    profiles = conn.execute(text("SELECT user_id, is_verified FROM contributor_profiles")).fetchall()
    for p in profiles:
        print(f"Profile: user_id={p[0]}, verified={p[1]}")
