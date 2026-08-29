import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from backend.app.db.database import engine

with engine.connect() as conn:
    print("Updating requires_auth to TRUE for apply endpoints...")
    conn.execute(text("""
        UPDATE route_permissions 
        SET requires_auth = true 
        WHERE route_path IN ('/auth/apply-contributor', '/auth/apply-palkhi-pramukh')
    """))
    conn.commit()
    print("Done. Verification:")
    routes = conn.execute(text("SELECT route_path, requires_auth FROM route_permissions WHERE route_path LIKE '%apply%'")).fetchall()
    for r in routes:
        print(f"{r[0]} - requires_auth: {r[1]}")
