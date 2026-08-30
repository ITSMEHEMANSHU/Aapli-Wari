from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.contributor_profile import ContributorProfile
from backend.app.models.palkhi import Palkhi
from backend.app.models.palkhi_pramukh_profile import PalkhiPramukhProfile
from backend.app.models.rbac import Role, VerificationStatus
from backend.app.models.user import User


def get_user_by_id(
    db: Session,
    user_id: UUID,
):
    return db.get(User, user_id)


def create_user(
    db: Session,
    user_id: UUID,
    username: str | None,
    full_name: str,
    email: str,
    role_id: UUID,
    role: str,
):

    user = User(
        id=user_id,
        username=username,
        full_name=full_name,
        email=email,
        role_id=role_id,
        role=role,
        is_active=True,
    )

    db.add(user)

    db.commit()

    db.refresh(user)

    return user


def upgrade_to_contributor(
    db: Session,
    user: User,
    mobile: str,
) -> User:

    # Only change base role to 'contributor' if user is not already a palkhi_pramukh or admin
    if user.role not in ("palkhi_pramukh", "admin"):
        contributor_role = db.scalar(
            select(Role).where(Role.name == "contributor")
        )

        if contributor_role is None:
            raise HTTPException(
                status_code=500,
                detail="Role 'contributor' not found in database",
            )

        user.role_id = contributor_role.id
        user.role = contributor_role.name

    user.is_contributor = True

    # Create or update contributor_profile
    profile = db.get(ContributorProfile, user.id)
    if profile is None:
        profile = ContributorProfile(
            user_id=user.id,
            mobile=mobile,
            is_verified=True,
        )
        db.add(profile)
    else:
        profile.mobile = mobile
        profile.is_verified = True

    db.commit()
    db.refresh(user)

    return user


def upgrade_to_palkhi_pramukh(
    db: Session,
    user: User,
    palkhi_name: str,
    palkhi_description: str | None = None,
) -> tuple[User, Palkhi]:

    pramukh_role = db.scalar(
        select(Role).where(Role.name == "palkhi_pramukh")
    )

    if pramukh_role is None:
        raise HTTPException(
            status_code=500,
            detail="Role 'palkhi_pramukh' not found in database",
        )

    # 1. Update user role
    user.role_id = pramukh_role.id
    user.role = pramukh_role.name

    # 2. Create or update palkhi_pramukh_profile
    pramukh_profile = db.get(PalkhiPramukhProfile, user.id)
    if pramukh_profile is None:
        pramukh_profile = PalkhiPramukhProfile(
            user_id=user.id,
            verification_status="approved",
        )
        db.add(pramukh_profile)
    else:
        pramukh_profile.verification_status = "approved"

    # 3. Look for approved verification status
    approved_status = db.scalar(
        select(VerificationStatus).where(VerificationStatus.name == "approved")
    )
    if approved_status is None:
        approved_status = db.scalar(
            select(VerificationStatus).where(VerificationStatus.name == "pending")
        )

    if approved_status is None:
        raise HTTPException(
            status_code=500,
            detail="Verification status 'approved' not found in database",
        )

    # 4. Check if user already owns a palkhi
    existing_palkhi = db.scalar(
        select(Palkhi).where(Palkhi.owner_user_id == user.id)
    )
    if existing_palkhi:
        palkhi = existing_palkhi
        if palkhi_name and palkhi.name != palkhi_name:
            palkhi.name = palkhi_name
        if palkhi_description:
            palkhi.description = palkhi_description
        palkhi.verification_status_id = approved_status.id
    else:
        palkhi = Palkhi(
            name=palkhi_name,
            description=palkhi_description,
            owner_user_id=user.id,
            verification_status_id=approved_status.id,
        )
        db.add(palkhi)

    db.commit()
    db.refresh(user)
    db.refresh(palkhi)

    return user, palkhi


def can_contribute(user: User, db: Session) -> bool:
    if user.role in ("admin", "contributor", "palkhi_pramukh"):
        return True
    if getattr(user, "is_contributor", False):
        return True
    profile = db.query(ContributorProfile).filter(ContributorProfile.user_id == user.id).first()
    if profile is not None:
        return True
    if getattr(user, "is_active", True):
        user.is_contributor = True
        new_prof = ContributorProfile(user_id=user.id, mobile="N/A", is_verified=False)
        db.add(new_prof)
        try:
            db.commit()
        except Exception:
            db.rollback()
        return True
    return False


def can_manage_channel(user: User, db: Session) -> bool:
    if user.role == "admin":
        return True
    profile = db.query(PalkhiPramukhProfile).filter(PalkhiPramukhProfile.user_id == user.id).first()
    return profile is not None