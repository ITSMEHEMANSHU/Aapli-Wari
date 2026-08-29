import asyncio
import io
import os
import sys
import uuid
import httpx

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from backend.app.main import app

async def run_verification():
    print("==================================================================")
    print("STARTING VERIFICATION: SEPARATE ROLE APPLICATIONS & PERMISSIONS")
    print("==================================================================\n")

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver", timeout=30.0) as client:
        test_pass = "Password123!"

        # -------------------------------------------------------------
        # 1. Base User (No Applications)
        # -------------------------------------------------------------
        print("--- 1. Testing Base User (No Applications) ---")
        uid1 = uuid.uuid4().hex[:6]
        email1 = f"base_user_{uid1}@example.com"
        s1 = await client.post("/auth/signup", json={
            "username": f"base_{uid1}", "full_name": f"Base {uid1}", "email": email1, "password": test_pass
        })
        assert s1.status_code == 200
        l1 = await client.post("/auth/login", json={"email": email1, "password": test_pass})
        t1 = l1.json()["access_token"]

        p1 = await client.get("/users/me/permissions", headers={"Authorization": f"Bearer {t1}"})
        assert p1.status_code == 200
        p1_data = p1.json()
        print(f"Base User Permissions: {p1_data}")
        assert p1_data["is_contributor_applied"] is False
        assert p1_data["is_palkhi_pramukh_applied"] is False
        assert p1_data["can_contribute"] is False
        assert p1_data["can_manage_channel"] is False

        # Attempt content upload -> should be 403
        fake_file = io.BytesIO(b"fake image bytes")
        up1 = await client.post(
            "/content/upload",
            headers={"Authorization": f"Bearer {t1}"},
            data={"title": "Test Title", "content_type": "image", "language": "en", "tags": "test"},
            files={"file": ("test.png", fake_file, "image/png")}
        )
        assert up1.status_code == 403, f"Expected 403, got {up1.status_code}: {up1.text}"
        print("[PASS] Base user blocked from uploading content (403)")

        # -------------------------------------------------------------
        # 2. Contributor ONLY User
        # -------------------------------------------------------------
        print("\n--- 2. Testing Contributor ONLY User ---")
        uid2 = uuid.uuid4().hex[:6]
        email2 = f"contrib_only_{uid2}@example.com"
        s2 = await client.post("/auth/signup", json={
            "username": f"contrib_{uid2}", "full_name": f"Contrib {uid2}", "email": email2, "password": test_pass
        })
        assert s2.status_code == 200
        l2 = await client.post("/auth/login", json={"email": email2, "password": test_pass})
        t2 = l2.json()["access_token"]

        # Apply as contributor
        app_c = await client.post("/auth/apply-contributor", headers={"Authorization": f"Bearer {t2}"}, json={
            "full_name": f"Contrib {uid2}", "email": email2, "mobile": "9876543210", "consent": True
        })
        assert app_c.status_code == 200

        p2 = await client.get("/users/me/permissions", headers={"Authorization": f"Bearer {t2}"})
        p2_data = p2.json()
        print(f"Contributor User Permissions: {p2_data}")
        assert p2_data["is_contributor_applied"] is True
        assert p2_data["is_palkhi_pramukh_applied"] is False
        assert p2_data["can_contribute"] is True
        assert p2_data["can_manage_channel"] is False

        # Attempt to access my palkhi -> 403
        pm2 = await client.get("/channels/palkhis/me", headers={"Authorization": f"Bearer {t2}"})
        assert pm2.status_code == 403
        print("[PASS] Contributor user can contribute but is blocked from palkhi/channel management (403)")

        # -------------------------------------------------------------
        # 3. Palkhi Pramukh ONLY User
        # -------------------------------------------------------------
        print("\n--- 3. Testing Palkhi Pramukh ONLY User ---")
        uid3 = uuid.uuid4().hex[:6]
        email3 = f"pramukh_only_{uid3}@example.com"
        s3 = await client.post("/auth/signup", json={
            "username": f"pramukh_{uid3}", "full_name": f"Pramukh {uid3}", "email": email3, "password": test_pass
        })
        assert s3.status_code == 200
        l3 = await client.post("/auth/login", json={"email": email3, "password": test_pass})
        t3 = l3.json()["access_token"]

        # Apply as palkhi pramukh
        app_p = await client.post("/auth/apply-palkhi-pramukh", headers={"Authorization": f"Bearer {t3}"}, json={
            "palkhi_name": f"Palkhi {uid3}", "palkhi_description": "Pramukh description", "consent": True
        })
        assert app_p.status_code == 200
        palkhi_id = app_p.json()["palkhi"]["id"]

        p3 = await client.get("/users/me/permissions", headers={"Authorization": f"Bearer {t3}"})
        p3_data = p3.json()
        print(f"Palkhi Pramukh User Permissions: {p3_data}")
        assert p3_data["is_contributor_applied"] is False
        assert p3_data["is_palkhi_pramukh_applied"] is True
        assert p3_data["can_contribute"] is False  # Cannot contribute without separate contributor form!
        assert p3_data["can_manage_channel"] is True

        # Can access my palkhi & create channel
        pm3 = await client.get("/channels/palkhis/me", headers={"Authorization": f"Bearer {t3}"})
        assert pm3.status_code == 200
        cc3 = await client.post("/channels", headers={"Authorization": f"Bearer {t3}"}, json={
            "name": f"Channel {uid3}", "description": "Desc", "palkhi_id": palkhi_id
        })
        assert cc3.status_code in (200, 201)
        print("[PASS] Palkhi Pramukh can manage channel")

        # BUT cannot upload content without contributor application!
        fake_file3 = io.BytesIO(b"fake image bytes")
        up3 = await client.post(
            "/content/upload",
            headers={"Authorization": f"Bearer {t3}"},
            data={"title": "Test Title", "content_type": "image", "language": "en", "tags": "test"},
            files={"file": ("test.png", fake_file3, "image/png")}
        )
        assert up3.status_code == 403, f"Expected 403 for pramukh without contributor profile, got {up3.status_code}"
        print("[PASS] Palkhi Pramukh without contributor application is correctly blocked from uploading content (403)")

        # -------------------------------------------------------------
        # 4. Dual Applied User (Both Contributor & Palkhi Pramukh)
        # -------------------------------------------------------------
        print("\n--- 4. Testing Dual Applied User (Both Applications Filled) ---")
        # Now pramukh applies for contributor as well
        app_c3 = await client.post("/auth/apply-contributor", headers={"Authorization": f"Bearer {t3}"}, json={
            "full_name": f"Pramukh {uid3}", "email": email3, "mobile": "9876543210", "consent": True
        })
        assert app_c3.status_code == 200

        p3_dual = await client.get("/users/me/permissions", headers={"Authorization": f"Bearer {t3}"})
        p3_dual_data = p3_dual.json()
        print(f"Dual User Permissions: {p3_dual_data}")
        assert p3_dual_data["is_contributor_applied"] is True
        assert p3_dual_data["is_palkhi_pramukh_applied"] is True
        assert p3_dual_data["can_contribute"] is True
        assert p3_dual_data["can_manage_channel"] is True
        print("[PASS] User with both profiles has both can_contribute and can_manage_channel permissions")

        print("\n==================================================================")
        print("ALL SEPARATE ROLE APPLICATION & PERMISSION CHECKS PASSED!")
        print("==================================================================")

if __name__ == "__main__":
    asyncio.run(run_verification())
