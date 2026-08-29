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
from backend.app.db.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.palkhi import Palkhi
from backend.app.models.palkhi_pramukh_profile import PalkhiPramukhProfile
from backend.app.models.rbac import Role, VerificationStatus

async def run_palkhi_pramukh_verification():
    print("==========================================================")
    print("STARTING VERIFICATION OF PALKHI PRAMUKH REGISTRATION FLOW")
    print("==========================================================\n")

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver", timeout=30.0) as client:
        uid = uuid.uuid4().hex[:6]
        user_email = f"pramukh_applicant_{uid}@example.com"
        test_password = "Password123!"
        palkhi_name = f"Sant Sopandev Maharaj Palkhi {uid}"
        palkhi_desc = f"Official historical procession route for {uid}"

        print("--- 1. Register a standard user ---")
        signup_res = await client.post("/auth/signup", json={
            "username": f"pramukh_app_{uid}",
            "full_name": f"Palkhi Pramukh Applicant {uid}",
            "email": user_email,
            "password": test_password
        })
        assert signup_res.status_code == 200, f"Signup failed: {signup_res.text}"
        user_info = signup_res.json()
        print(f"[PASS] Standard user registered: {user_email}, role: {user_info.get('role')}")
        assert user_info["role"] == "user"

        print("\n--- 2. Login to obtain access token ---")
        login_res = await client.post("/auth/login", json={
            "email": user_email,
            "password": test_password
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token_data = login_res.json()
        token = token_data["access_token"]
        assert token_data["role"] == "user"
        print("[PASS] User logged in with access token")

        print("\n--- 3. Test apply-palkhi-pramukh without auth (should return 401) ---")
        unauth_res = await client.post("/auth/apply-palkhi-pramukh", json={
            "palkhi_name": palkhi_name,
            "palkhi_description": palkhi_desc,
            "consent": True
        })
        assert unauth_res.status_code == 401, f"Expected 401, got {unauth_res.status_code}"
        print("[PASS] Unauthenticated apply-palkhi-pramukh rejected with 401")

        print("\n--- 4. Apply as Palkhi Pramukh (POST /auth/apply-palkhi-pramukh) ---")
        apply_res = await client.post(
            "/auth/apply-palkhi-pramukh",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "palkhi_name": palkhi_name,
                "palkhi_description": palkhi_desc,
                "consent": True
            }
        )
        assert apply_res.status_code == 200, f"Apply palkhi pramukh failed: {apply_res.text}"
        apply_data = apply_res.json()
        print("Apply response:", apply_data)
        assert apply_data["role"] == "palkhi_pramukh"
        assert "palkhi" in apply_data
        assert apply_data["palkhi"]["name"] == palkhi_name
        palkhi_id = apply_data["palkhi"]["id"]
        print(f"[PASS] Palkhi Pramukh registration succeeded, Palkhi ID: {palkhi_id}")

        print("\n--- 5. Verify Database updates (users, palkhis, palkhi_pramukh_profiles) ---")
        db = SessionLocal()
        try:
            db_user = db.get(User, uuid.UUID(user_info["id"]))
            assert db_user is not None
            assert db_user.role == "palkhi_pramukh"
            print(f"[PASS] User table updated: role={db_user.role}")

            profile = db.get(PalkhiPramukhProfile, db_user.id)
            assert profile is not None
            assert profile.verification_status == "approved"
            print(f"[PASS] PalkhiPramukhProfile created: status={profile.verification_status}")

            db_palkhi = db.get(Palkhi, uuid.UUID(palkhi_id))
            assert db_palkhi is not None
            assert str(db_palkhi.owner_user_id) == user_info["id"]

            appr_status = db.scalar(select(VerificationStatus).where(VerificationStatus.name == "approved"))
            assert db_palkhi.verification_status_id == appr_status.id
            print(f"[PASS] Palkhi record verified in DB with auto-approved status ID: {db_palkhi.verification_status_id}")
        finally:
            db.close()

        print("\n--- 6. Verify GET /auth/me returns updated role 'palkhi_pramukh' ---")
        me_res = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200
        me_data = me_res.json()
        print("Profile from /auth/me:", me_data)
        assert me_data["role"] == "palkhi_pramukh"
        print("[PASS] /auth/me returns updated role='palkhi_pramukh'")

        print("\n--- 7. Verify GET /channels/palkhis/me retrieves user's Palkhi ---")
        my_palkhi_res = await client.get("/channels/palkhis/me", headers={"Authorization": f"Bearer {token}"})
        assert my_palkhi_res.status_code == 200
        my_palkhi_data = my_palkhi_res.json()
        print("My Palkhi response:", my_palkhi_data)
        assert my_palkhi_data["id"] == palkhi_id
        print("[PASS] GET /channels/palkhis/me successfully returned the user's Palkhi")

        print("\n--- 8. Create Channel using the newly registered Palkhi ---")
        channel_res = await client.post(
            "/channels",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": f"Official {palkhi_name} Channel",
                "description": "Live Darshan and Route Updates",
                "palkhi_id": palkhi_id
            }
        )
        assert channel_res.status_code in (200, 201), f"Create channel failed: {channel_res.text}"
        channel_data = channel_res.json()
        print("Created Channel:", channel_data)
        assert channel_data["palkhi_id"] == palkhi_id
        print("[PASS] Channel created successfully by the new Palkhi Pramukh!")

        print("\n==========================================================")
        print("ALL PALKHI PRAMUKH FLOW TESTS COMPLETED & VERIFIED!")
        print("==========================================================")

if __name__ == "__main__":
    asyncio.run(run_palkhi_pramukh_verification())
