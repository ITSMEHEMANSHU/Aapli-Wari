from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.contributor_profile import ContributorProfile
from backend.app.models.rbac import Role
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