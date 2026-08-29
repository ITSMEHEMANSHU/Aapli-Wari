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
from backend.app.models.contributor_profile import ContributorProfile
from backend.app.models.rbac import Role

async def run_contributor_verification():
    print("==========================================================")
    print("STARTING VERIFICATION OF CONTRIBUTOR REGISTRATION FLOW")
    print("==========================================================\n")

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver", timeout=30.0) as client:
        uid = uuid.uuid4().hex[:6]
        user_email = f"contrib_applicant_{uid}@example.com"
        test_password = "Password123!"
        test_mobile = "+91 9876543210"

        print("--- 1. Register a standard user ---")
        signup_res = await client.post("/auth/signup", json={
            "username": f"appuser_{uid}",
            "full_name": f"Applicant User {uid}",
            "email": user_email,
            "password": test_password
        })
        assert signup_res.status_code == 200, f"Signup failed: {signup_res.text}"
        user_info = signup_res.json()
        print(f"[PASS] User registered with email: {user_email}, role: {user_info.get('role')}")
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

        print("\n--- 3. Test apply-contributor without auth (should return 401) ---")
        unauth_res = await client.post("/auth/apply-contributor", json={
            "full_name": f"Applicant User {uid}",
            "email": user_email,
            "mobile": test_mobile,
            "consent": True
        })
        assert unauth_res.status_code == 401, f"Expected 401 for unauthenticated request, got {unauth_res.status_code}"
        print("[PASS] Unauthenticated apply-contributor correctly rejected with 401")

        print("\n--- 4. Apply as Contributor (POST /auth/apply-contributor) ---")
        apply_res = await client.post(
            "/auth/apply-contributor",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "full_name": f"Applicant User {uid} (Updated)",
                "email": user_email,
                "mobile": test_mobile,
                "consent": True
            }
        )
        assert apply_res.status_code == 200, f"Apply contributor failed: {apply_res.text}"
        apply_data = apply_res.json()
        print("Apply response:", apply_data)
        assert apply_data["role"] == "contributor"
        print("[PASS] POST /auth/apply-contributor succeeded with role='contributor'")

        print("\n--- 5. Verify Database updates (users & contributor_profiles) ---")
        db = SessionLocal()
        try:
            db_user = db.get(User, uuid.UUID(user_info["id"]))
            assert db_user is not None
            assert db_user.role == "contributor"
            assert db_user.is_contributor == True
            print(f"[PASS] User table updated: role={db_user.role}, is_contributor={db_user.is_contributor}")

            profile = db.get(ContributorProfile, db_user.id)
            assert profile is not None
            assert profile.mobile == test_mobile
            print(f"[PASS] ContributorProfile created in DB: mobile={profile.mobile}, verified={profile.is_verified}")
        finally:
            db.close()

        print("\n--- 6. Verify GET /auth/me returns updated role 'contributor' ---")
        me_res = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200
        me_data = me_res.json()
        print("Profile from /auth/me:", me_data)
        assert me_data["role"] == "contributor"
        print("[PASS] /auth/me returns updated role='contributor'")

        print("\n--- 7. Re-apply when already a contributor (idempotency check) ---")
        reapply_res = await client.post(
            "/auth/apply-contributor",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "full_name": f"Applicant User {uid}",
                "email": user_email,
                "mobile": "+91 9999999999",
                "consent": True
            }
        )
        assert reapply_res.status_code == 200
        print("[PASS] Re-applying as existing contributor succeeds gracefully")

        print("\n==========================================================")
        print("ALL CONTRIBUTOR FLOW TESTS COMPLETED & VERIFIED!")
        print("==========================================================")

if __name__ == "__main__":
    asyncio.run(run_contributor_verification())
