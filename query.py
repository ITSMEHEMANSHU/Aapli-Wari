import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from backend.app.db.database import engine

with engine.connect() as conn:
    print("Checking route permissions for apply endpoints...")
    routes = conn.execute(text("""
        SELECT rp.route_path, p.name 
        FROM route_permissions rp
        JOIN permissions p ON p.id = rp.permission_id
        WHERE rp.route_path LIKE '%apply%'
    """)).fetchall()
    for r in routes:
        print(f"Route: {r[0]}, Permission: {r[1]}")
        
    print("\nChecking role permissions for 'user' role...")
    user_role = conn.execute(text("SELECT id FROM roles WHERE name = 'user'")).fetchone()
    if user_role:
        role_perms = conn.execute(text("""
            SELECT p.name 
            FROM role_permissions rp
            JOIN permissions p ON p.id = rp.permission_id
            WHERE rp.role_id = :role_id
        """), {"role_id": user_role[0]}).fetchall()
        print([r[0] for r in role_perms])
        
    print("\nChecking if /users/me/permissions exists...")
    users_me = conn.execute(text("SELECT route_path, is_active FROM route_permissions WHERE route_path LIKE '%/users/me%'")).fetchall()
    for r in users_me:
        print(f"Route: {r[0]}, Active: {r[1]}")
