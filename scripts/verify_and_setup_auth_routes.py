import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid
from sqlalchemy import text
from backend.app.db.database import engine

def setup_routes():
    with engine.connect() as conn:
        print("Checking route permissions...")
        existing = conn.execute(text("""
            SELECT id, method, route_path, requires_auth, is_active 
            FROM route_permissions 
            WHERE route_path = '/auth/register-palkhi-pramukh' AND method = 'POST'
        """)).fetchall()
        
        print("Existing:", existing)
        
        if not existing:
            perm = conn.execute(text("SELECT id FROM permissions WHERE name = 'public_access'")).fetchone()
            if perm:
                perm_id = perm[0]
                new_id = uuid.uuid4()
                conn.execute(text("""
                    INSERT INTO route_permissions (id, method, route_path, permission_id, requires_auth, is_active)
                    VALUES (:id, 'POST', '/auth/register-palkhi-pramukh', :perm_id, false, true)
                """), {"id": new_id, "perm_id": perm_id})
                conn.commit()
                print("Successfully added POST /auth/register-palkhi-pramukh to route_permissions with requires_auth=False")
            else:
                print("Error: public_access permission not found")
        else:
            print("Route permission already exists")

        # Query all public routes
        print("\nAll public routes (requires_auth = false):")
        public_routes = conn.execute(text("""
            SELECT method, route_path, requires_auth, is_active 
            FROM route_permissions 
            WHERE requires_auth = false
            ORDER BY route_path
        """)).fetchall()
        for r in public_routes:
            print(f"  {r[0]:6} {r[1]:40} (auth_required={r[2]}, active={r[3]})")

if __name__ == "__main__":
    setup_routes()
