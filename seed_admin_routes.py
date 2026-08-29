import os
import sys
import uuid
from datetime import datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from backend.app.db.database import engine

routes_to_add = [
    ("GET", "/admin/stats"),
    ("GET", "/admin/users"),
    ("PATCH", "/admin/users/{user_id}/role"),
    ("PATCH", "/admin/users/{user_id}/status"),
    ("GET", "/admin/content"),
    ("DELETE", "/admin/content/{content_id}"),
    ("GET", "/admin/channels"),
    ("PATCH", "/admin/channels/{channel_id}/status"),
]

with engine.begin() as conn:
    print("Checking for admin_access permission...")
    perm = conn.execute(text("SELECT id FROM permissions WHERE name = 'admin_access'")).fetchone()
    if not perm:
        perm_id = str(uuid.uuid4())
        conn.execute(
            text("INSERT INTO permissions (id, name, created_at) VALUES (:id, :name, :created_at)"),
            {"id": perm_id, "name": "admin_access", "created_at": datetime.utcnow()}
        )
        print(f"Created permission admin_access with id {perm_id}")
    else:
        perm_id = str(perm[0])
        print(f"Found admin_access permission with id {perm_id}")

    print("Checking for admin role...")
    role = conn.execute(text("SELECT id FROM roles WHERE name = 'admin'")).fetchone()
    if role:
        role_id = str(role[0])
        print(f"Found admin role with id {role_id}")
        
        print("Ensuring admin role has admin_access permission...")
        has_perm = conn.execute(
            text("SELECT 1 FROM role_permissions WHERE role_id = :role_id AND permission_id = :perm_id"),
            {"role_id": role_id, "perm_id": perm_id}
        ).fetchone()
        
        if not has_perm:
            conn.execute(
                text("INSERT INTO role_permissions (role_id, permission_id) VALUES (:role_id, :perm_id)"),
                {"role_id": role_id, "perm_id": perm_id}
            )
            print("Added permission to admin role")
    else:
        print("Admin role not found!")

    for method, path in routes_to_add:
        exists = conn.execute(
            text("SELECT 1 FROM route_permissions WHERE method = :method AND route_path = :path"),
            {"method": method, "path": path}
        ).fetchone()
        
        if not exists:
            route_id = str(uuid.uuid4())
            conn.execute(
                text("""
                INSERT INTO route_permissions (id, method, route_path, permission_id, requires_auth, is_active)
                VALUES (:id, :method, :path, :perm_id, true, true)
                """),
                {"id": route_id, "method": method, "path": path, "perm_id": perm_id}
            )
            print(f"Added route permission for {method} {path}")
        else:
            print(f"Route permission for {method} {path} already exists")

print("Done!")
