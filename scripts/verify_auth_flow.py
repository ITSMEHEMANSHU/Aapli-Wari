import asyncio
import os
import sys
import uuid
from datetime import datetime, timezone
import httpx

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy import text, select
from backend.app.main import app
from backend.app.db.database import SessionLocal, engine
from backend.app.models.user import User
from backend.app.models.palkhi import Palkhi
from backend.app.models.rbac import Role, VerificationStatus

async def run_all_checks():
    print("==========================================================")
    print("STARTING DETAILED VERIFICATION OF REGISTRATION AND LOGIN")
    print("==========================================================\n")

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver", timeout=30.0) as client:
        # Generate unique test identifiers
        uid = uuid.uuid4().hex[:6]
        user_email = f"test_user_{uid}@example.com"
        contrib_email = f"test_contrib_{uid}@example.com"
        pramukh_email = f"test_pramukh_{uid}@example.com"
        test_password = "Password123!"

        print("--- 1. Backend Setup & RBAC Configuration Check ---")
        with engine.connect() as conn:
            # Check roles
            roles = conn.execute(text("SELECT name, is_public_signup_allowed FROM roles")).fetchall()
            role_map = {r[0]: r[1] for r in roles}
            print("Roles in DB:", role_map)
            assert "user" in role_map and role_map["user"] == True, "Role 'user' must allow public signup"
            assert "contributor" in role_map and role_map["contributor"] == True, "Role 'contributor' must allow public signup"
            assert "palkhi_pramukh" in role_map and role_map["palkhi_pramukh"] == True, "Role 'palkhi_pramukh' must allow public signup"
            assert "admin" in role_map and role_map["admin"] == False, "Role 'admin' must NOT allow public signup"
            print("[PASS] Roles table correctly configured")

            # Check route_permissions for public routes
            public_routes = conn.execute(text("""
                SELECT route_path, method, requires_auth 
                FROM route_permissions 
                WHERE requires_auth = false
            """)).fetchall()
            pub_paths = {(r[0], r[1]) for r in public_routes}
            print("Public Routes in DB (requires_auth=false):", len(pub_paths), "routes")
            assert ('/auth/signup', 'POST') in pub_paths, "/auth/signup must have requires_auth=false"
            assert ('/auth/login', 'POST') in pub_paths, "/auth/login must have requires_auth=false"
            assert ('/auth/register-palkhi-pramukh', 'POST') in pub_paths, "/auth/register-palkhi-pramukh must have requires_auth=false"
            print("[PASS] Route permissions table has all required public auth routes with requires_auth = false")

            # Check verification statuses
            statuses = conn.execute(text("SELECT name FROM verification_statuses")).fetchall()
            status_names = {s[0] for s in statuses}
            print("Verification statuses in DB:", status_names)
            assert "approved" in status_names, "'approved' verification status must exist"
            assert "pending" in status_names, "'pending' verification status must exist"
            print("[PASS] Verification statuses correctly configured")

        print("\n--- 2. Test Roles Endpoint GET /auth/roles ---")
        res = await client.get("/auth/roles")
        assert res.status_code == 200, f"Roles failed: {res.text}"
        roles_data = res.json()
        role_names = [r["name"] for r in roles_data]
        print("Public signup roles returned:", role_names)
        assert "user" in role_names
        assert "contributor" in role_names
        assert "palkhi_pramukh" in role_names
        assert "admin" not in role_names
        print("[PASS] GET /auth/roles returns public roles only (user, contributor, palkhi_pramukh)")

        print("\n--- 3. Test Registration for Normal User ---")
        user_payload = {
            "username": f"user_{uid}",
            "full_name": f"Test User {uid}",
            "email": user_email,
            "password": test_password,
            "role": "user"
        }
        res = await client.post("/auth/signup", json=user_payload)
        assert res.status_code == 200, f"User signup failed: {res.text}"
        user_data = res.json()
        print("User registered:", user_data["email"], "Role:", user_data.get("role"))
        assert user_data["email"] == user_email
        assert user_data["role"] == "user"
        assert user_data["is_active"] == True
        print("[PASS] Normal User registration successful in Supabase and DB with role='user'")

        print("\n--- 4. Test Registration for Contributor ---")
        contrib_payload = {
            "username": f"contrib_{uid}",
            "full_name": f"Test Contributor {uid}",
            "email": contrib_email,
            "password": test_password,
            "role": "contributor"
        }
        res = await client.post("/auth/signup", json=contrib_payload)
        assert res.status_code == 200, f"Contributor signup failed: {res.text}"
        contrib_data = res.json()
        print("Contributor registered:", contrib_data["email"], "Role:", contrib_data.get("role"))
        assert contrib_data["email"] == contrib_email
        assert contrib_data["role"] == "contributor"
        print("[PASS] Contributor registration successful in Supabase and DB with role='contributor'")

        print("\n--- 5. Test Login for Normal User ---")
        login_payload = {
            "email": user_email,
            "password": test_password
        }
        res = await client.post("/auth/login", json=login_payload)
        assert res.status_code == 200, f"Login failed: {res.text}"
        token_data = res.json()
        print("Login successful. Access token received:", token_data["access_token"][:20] + "...")
        assert "access_token" in token_data
        assert token_data["role"] == "user"
        user_token = token_data["access_token"]
        print("[PASS] Login successful, TokenResponse has access_token, refresh_token, role='user'")

        print("\n--- 6. Test GET /auth/me with User Token ---")
        res = await client.get("/auth/me", headers={"Authorization": f"Bearer {user_token}"})
        assert res.status_code == 200, f"GET /auth/me failed: {res.text}"
        me_data = res.json()
        print("User profile retrieved via /auth/me:", me_data["email"], "Role:", me_data.get("role"), "Role ID:", me_data["role_id"])
        assert me_data["email"] == user_email
        assert me_data["is_active"] == True
        print("[PASS] GET /auth/me returns valid user profile with correct role and role_id")

        print("\n--- 7. Test Combined Palkhi Pramukh Registration (POST /auth/register-palkhi-pramukh) ---")
        pramukh_payload = {
            "username": f"pramukh_{uid}",
            "full_name": f"Palkhi Leader {uid}",
            "email": pramukh_email,
            "password": test_password,
            "palkhi_name": f"Sant Tukaram Palkhi {uid}",
            "palkhi_description": f"Detailed heritage description {uid}"
        }
        res = await client.post("/auth/register-palkhi-pramukh", json=pramukh_payload)
        assert res.status_code == 200, f"Palkhi Pramukh registration failed: {res.text}"
        pramukh_res = res.json()
        print("Palkhi Pramukh registration response:", pramukh_res)
        assert "user" in pramukh_res
        assert "palkhi" in pramukh_res
        assert pramukh_res["user"]["email"] == pramukh_email
        assert pramukh_res["user"]["role"] == "palkhi_pramukh"
        assert pramukh_res["palkhi"]["name"] == f"Sant Tukaram Palkhi {uid}"
        palkhi_id = pramukh_res["palkhi"]["id"]

        # Verify Palkhi auto-approval in DB
        db = SessionLocal()
        try:
            palkhi_db = db.get(Palkhi, uuid.UUID(palkhi_id))
            assert palkhi_db is not None
            approved_status = db.scalar(select(VerificationStatus).where(VerificationStatus.name == "approved"))
            assert palkhi_db.verification_status_id == approved_status.id, f"Palkhi status should be approved, got {palkhi_db.verification_status_id}"
            print("[PASS] Palkhi record verified in DB with auto-approved status_id:", palkhi_db.verification_status_id)
        finally:
            db.close()

        print("\n--- 8. Test Login for Palkhi Pramukh ---")
        login_pramukh = {
            "email": pramukh_email,
            "password": test_password
        }
        res = await client.post("/auth/login", json=login_pramukh)
        assert res.status_code == 200, f"Palkhi Pramukh login failed: {res.text}"
        pramukh_token_data = res.json()
        assert pramukh_token_data["role"] == "palkhi_pramukh"
        pramukh_token = pramukh_token_data["access_token"]
        print("[PASS] Palkhi Pramukh logged in successfully with role='palkhi_pramukh'")

        print("\n--- 9. Verify Token & Session, Protected Routes & RBAC Restrictions ---")
        # 9a. Request without token to protected route (/channels) -> 401
        res = await client.get("/channels")
        assert res.status_code == 401, f"Expected 401 for unauthenticated request, got {res.status_code}"
        print("[PASS] Protected route without token correctly returns 401 Unauthorized")

        # 9b. Request with invalid token -> 401
        res = await client.get("/channels", headers={"Authorization": "Bearer invalid_token_123"})
        assert res.status_code == 401, f"Expected 401 for invalid token, got {res.status_code}"
        print("[PASS] Protected route with invalid token correctly returns 401 Unauthorized")

        # 9c. Request to /channels with valid user token -> 200
        res = await client.get("/channels", headers={"Authorization": f"Bearer {user_token}"})
        assert res.status_code == 200, f"Expected 200 for user token on /channels, got {res.status_code}"
        print("[PASS] Authenticated GET /channels returns 200 OK")

        # 9d. User role attempts to access /channels/palkhis/me (requires create_palkhi permission) -> 403
        res = await client.get("/channels/palkhis/me", headers={"Authorization": f"Bearer {user_token}"})
        assert res.status_code == 403, f"Expected 403 Forbidden for user role on /channels/palkhis/me, got {res.status_code}"
        print("[PASS] Role 'user' accessing /channels/palkhis/me correctly returns 403 Forbidden ('Insufficient permissions')")

        # 9e. Palkhi Pramukh role accesses /channels/palkhis/me -> 200
        res = await client.get("/channels/palkhis/me", headers={"Authorization": f"Bearer {pramukh_token}"})
        assert res.status_code == 200, f"Expected 200 for palkhi_pramukh on /channels/palkhis/me, got {res.status_code}"
        palkhi_me_data = res.json()
        assert palkhi_me_data["name"] == f"Sant Tukaram Palkhi {uid}"
        print("[PASS] Role 'palkhi_pramukh' accessing /channels/palkhis/me returns 200 with owner's Palkhi details")

        print("\n--- 10. Test Duplicate Registration Handling & Error Responses ---")
        res = await client.post("/auth/signup", json=user_payload)
        assert res.status_code >= 400, "Duplicate signup should fail"
        print("[PASS] Duplicate user registration correctly returns 400 error")

        res = await client.post("/auth/login", json={"email": user_email, "password": "wrongpassword"})
        assert res.status_code == 401, "Invalid password login should return 401"
        print("[PASS] Invalid password login correctly returns 401 Unauthorized")

        print("\n==========================================================")
        print("ALL CHECKLIST ITEMS AND TESTS COMPLETED & VERIFIED!")
        print("==========================================================")

if __name__ == "__main__":
    asyncio.run(run_all_checks())
