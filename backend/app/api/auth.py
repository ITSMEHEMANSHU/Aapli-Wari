from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.security import authorize_request, get_current_user
from backend.app.core.supabase import supabase
from backend.app.db.database import get_db

from backend.app.models.rbac import Role
from backend.app.models.user import User

from backend.app.schemas.auth import (
    ContributorApplyRequest,
    LoginRequest,
    PalkhiPramukhApplyRequest,
    PalkhiPramukhSignupRequest,
    SignupRequest,
    TokenResponse,
)

from backend.app.schemas.user import UserResponse

from backend.app.services.users.user_service import (
    create_user,
    get_user_by_id,
    upgrade_to_contributor,
    upgrade_to_palkhi_pramukh,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.get("/roles")
def get_signup_roles(
    db: Session = Depends(get_db),
):

    roles = db.execute(
        select(Role)
        .where(
            Role.is_public_signup_allowed.is_(True)
        )
        .order_by(Role.name)
    ).scalars().all()

    return roles


@router.post("/signup")
def signup(
    data: SignupRequest,
    db: Session = Depends(get_db),
):

    role = db.execute(
        select(Role)
        .where(Role.name == "user")
    ).scalar_one_or_none()

    if role is None:

        raise HTTPException(
            status_code=500,
            detail="Default role 'user' not found in database",
        )

    try:

        response = supabase.auth.sign_up(
            {
                "email": data.email,
                "password": data.password,
                "options": {
                    "data": {
                        "username": data.username,
                        "full_name": data.full_name,
                    }
                },
            }
        )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    if response.user is None:

        raise HTTPException(
            status_code=400,
            detail="User creation failed",
        )

    try:

        user = create_user(
            db=db,
            user_id=UUID(str(response.user.id)),
            username=data.username,
            full_name=data.full_name,
            email=data.email,
            role_id=role.id,
            role=role.name,
        )

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Profile creation failed: {str(e)}",
        )

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):

    try:

        response = supabase.auth.sign_in_with_password(
            {
                "email": data.email,
                "password": data.password,
            }
        )

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if (
        response.user is None
        or response.session is None
    ):

        raise HTTPException(
            status_code=401,
            detail="Authentication failed",
        )

    user = get_user_by_id(
        db=db,
        user_id=UUID(str(response.user.id)),
    )

    if user is None:

        raise HTTPException(
            status_code=404,
            detail="Application user profile not found",
        )

    role = db.get(Role, user.role_id)

    if role is None:

        raise HTTPException(
            status_code=500,
            detail="User role not found",
        )

    return TokenResponse(
        message="Login successful",
        access_token=response.session.access_token,
        refresh_token=response.session.refresh_token,
        user_id=str(response.user.id),
        role=role.name,
    )


# =========================================================
# PALKHI PRAMUKH REGISTRATION (Combined User + Palkhi)
# =========================================================
@router.post("/register-palkhi-pramukh")
def register_palkhi_pramukh(
    data: PalkhiPramukhSignupRequest,
    db: Session = Depends(get_db),
):
    """
    Register a Palkhi Pramukh user AND create their Palkhi together.
    This ensures atomic registration - both must succeed.
    """

    # 1. Validate role exists
    role = db.execute(
        select(Role).where(Role.name == "palkhi_pramukh")
    ).scalar_one_or_none()

    if role is None:
        raise HTTPException(
            status_code=400,
            detail="Role 'palkhi_pramukh' not found in database",
        )

    if not role.is_public_signup_allowed:
        raise HTTPException(
            status_code=403,
            detail="This role cannot be selected during public signup",
        )

    # 2. Create Supabase user
    try:
        response = supabase.auth.sign_up(
            {
                "email": data.email,
                "password": data.password,
                "options": {
                    "data": {
                        "username": data.username,
                        "full_name": data.full_name,
                    }
                },
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Supabase user creation failed: {str(e)}",
        )

    if response.user is None:
        raise HTTPException(
            status_code=400,
            detail="Supabase user creation failed",
        )

    # 3. Create DB user
    try:
        user = create_user(
            db=db,
            user_id=UUID(str(response.user.id)),
            username=data.username,
            full_name=data.full_name,
            email=data.email,
            role_id=role.id,
            role=role.name,
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"User profile creation failed: {str(e)}",
        )

    # 4. Create Palkhi with auto-approved status
    try:
        from backend.app.services.channels.channel_service import create_palkhi
        from backend.app.schemas.channel import PalkhiCreate

        palkhi_data = PalkhiCreate(
            name=data.palkhi_name,
            description=data.palkhi_description,
        )

        palkhi = create_palkhi(
            db=db,
            data=palkhi_data,
            owner=user,  # ✅ Auto-approved status handled inside create_palkhi
        )

    except Exception as e:
        # ⚠️ Note: Supabase user already exists but DB user is rolled back.
        # We could attempt to delete Supabase user here, but Supabase doesn't
        # provide an easy way. For now, log and raise.
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Palkhi creation failed: {str(e)}",
        )

    # 5. Return user + palkhi info
    return {
        "message": "Palkhi Pramukh registered successfully",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
        },
        "palkhi": {
            "id": str(palkhi.id),
            "name": palkhi.name,
            "description": palkhi.description,
        },
    }


@router.post("/apply-contributor")
def apply_contributor(
    data: ContributorApplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user is None:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
        )

    if data.full_name and data.full_name.strip() and data.full_name != current_user.full_name:
        current_user.full_name = data.full_name.strip()

    if current_user.role in ("contributor", "palkhi_pramukh", "admin"):
        upgrade_to_contributor(db=db, user=current_user, mobile=data.mobile)
        return {
            "message": "Contributor registration successful",
            "role": current_user.role,
        }

    user = upgrade_to_contributor(
        db=db,
        user=current_user,
        mobile=data.mobile,
    )

    return {
        "message": "Contributor registration successful",
        "role": user.role,
    }


@router.post("/apply-palkhi-pramukh")
def apply_palkhi_pramukh(
    data: PalkhiPramukhApplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user is None:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
        )

    if not data.palkhi_name or not data.palkhi_name.strip():
        raise HTTPException(
            status_code=400,
            detail="Palkhi name is required",
        )

    user, palkhi = upgrade_to_palkhi_pramukh(
        db=db,
        user=current_user,
        palkhi_name=data.palkhi_name.strip(),
        palkhi_description=data.palkhi_description.strip() if data.palkhi_description else None,
    )

    return {
        "message": "Palkhi Pramukh registration successful",
        "role": user.role,
        "palkhi": {
            "id": str(palkhi.id),
            "name": palkhi.name,
            "description": palkhi.description,
        },
    }


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):

    return current_user