import asyncio
import os
import sys
import uuid
import httpx

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy import select, text
from backend.app.main import app
from backend.app.db.database import SessionLocal, engine
from backend.app.models.user import User
from backend.app.models.rbac import Role, Permission, RolePermission

async def run_permission_checks():
    print("==========================================================")
    print("STARTING CUMULATIVE PERMISSION CHECKS ACROSS AAPLI WARI")
    print("==========================================================\n")

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver", timeout=30.0) as client:
        # Check 1: Database role permissions
        print("--- 1. Database Role Permission Mapping ---")
        db = SessionLocal()
        try:
            roles = db.scalars(select(Role)).all()
            for r in roles:
                role_perms = db.execute(text('''
                    SELECT p.name FROM permissions p
                    JOIN role_permissions rp ON p.id = rp.permission_id
                    WHERE rp.role_id = :role_id
                    ORDER BY p.name
                '''), {"role_id": str(r.id)}).scalars().all()
                print(f"Role '{r.name}': {role_perms}")

                if r.name == "contributor":
                    assert "contribute" in role_perms, "Contributor missing contribute permission"
                elif r.name == "palkhi_pramukh":
                    assert "contribute" in role_perms, "Palkhi Pramukh missing contribute permission"
                    assert "manage_channel" in role_perms, "Palkhi Pramukh missing manage_channel permission"
                    assert "create_palkhi" in role_perms, "Palkhi Pramukh missing create_palkhi permission"
            print("[PASS] Database role permissions verified for cumulative model")
        finally:
            db.close()

        # Check 2: Register user and verify RBAC access
        uid = uuid.uuid4().hex[:6]
        user_email = f"perm_user_{uid}@example.com"
        test_pass = "Password123!"

        signup_res = await client.post("/auth/signup", json={
            "username": f"user_{uid}",
            "full_name": f"User {uid}",
            "email": user_email,
            "password": test_pass
        })
        assert signup_res.status_code == 200
        user_id = signup_res.json()["id"]

        login_res = await client.post("/auth/login", json={"email": user_email, "password": test_pass})
        user_token = login_res.json()["access_token"]

        print("\n--- 2. Normal User Permission Access ---")
        # Can access channels
        channels_res = await client.get("/channels", headers={"Authorization": f"Bearer {user_token}"})
        assert channels_res.status_code == 200
        print("[PASS] Normal user can access /channels")

        # Cannot access /channels/palkhis/me (requires palkhi_pramukh)
        palkhi_me_res = await client.get("/channels/palkhis/me", headers={"Authorization": f"Bearer {user_token}"})
        assert palkhi_me_res.status_code == 403
        print("[PASS] Normal user correctly blocked from /channels/palkhis/me with 403 Forbidden")

        # Check 3: Upgrade to Contributor
        print("\n--- 3. Upgrading to Contributor ---")
        contrib_res = await client.post("/auth/apply-contributor", headers={"Authorization": f"Bearer {user_token}"}, json={
            "full_name": f"User {uid}",
            "email": user_email,
            "mobile": "+91 9876543210",
            "consent": True
        })
        assert contrib_res.status_code == 200
        assert contrib_res.json()["role"] == "contributor"
        print("[PASS] User upgraded to contributor")

        # Still blocked from /channels/palkhis/me
        palkhi_me_res2 = await client.get("/channels/palkhis/me", headers={"Authorization": f"Bearer {user_token}"})
        assert palkhi_me_res2.status_code == 403
        print("[PASS] Contributor correctly blocked from /channels/palkhis/me with 403 Forbidden")

        # Check 4: Upgrade to Palkhi Pramukh
        print("\n--- 4. Upgrading to Palkhi Pramukh ---")
        pramukh_res = await client.post("/auth/apply-palkhi-pramukh", headers={"Authorization": f"Bearer {user_token}"}, json={
            "palkhi_name": f"Palkhi {uid}",
            "palkhi_description": "Cumulative test description",
            "consent": True
        })
        assert pramukh_res.status_code == 200
        assert pramukh_res.json()["role"] == "palkhi_pramukh"
        palkhi_id = pramukh_res.json()["palkhi"]["id"]
        print("[PASS] Contributor upgraded to Palkhi Pramukh")

        # Now can access /channels/palkhis/me
        palkhi_me_res3 = await client.get("/channels/palkhis/me", headers={"Authorization": f"Bearer {user_token}"})
        assert palkhi_me_res3.status_code == 200
        assert palkhi_me_res3.json()["id"] == palkhi_id
        print("[PASS] Palkhi Pramukh can access /channels/palkhis/me successfully")

        # Palkhi Pramukh can create channel
        create_chan_res = await client.post("/channels", headers={"Authorization": f"Bearer {user_token}"}, json={
            "name": f"Channel {uid}",
            "description": "Desc",
            "palkhi_id": palkhi_id
        })
        assert create_chan_res.status_code in (200, 201)
        chan_id = create_chan_res.json()["id"]
        print("[PASS] Palkhi Pramukh can create channel")

        # Palkhi Pramukh can manage channel
        update_chan_res = await client.patch(f"/channels/{chan_id}", headers={"Authorization": f"Bearer {user_token}"}, json={
            "name": f"Channel {uid} Updated",
            "description": "Updated Desc"
        })
        assert update_chan_res.status_code == 200
        print("[PASS] Palkhi Pramukh can manage channel")

        print("\n==========================================================")
        print("ALL CUMULATIVE PERMISSION CHECKS PASSED SUCCESSFULLY!")
        print("==========================================================")

if __name__ == "__main__":
    asyncio.run(run_permission_checks())
