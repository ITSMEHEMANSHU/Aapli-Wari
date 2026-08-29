from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.core.security import authorize_request, get_current_user
from backend.app.db.database import get_db
from backend.app.models.contributor_profile import ContributorProfile
from backend.app.models.palkhi_pramukh_profile import PalkhiPramukhProfile
from backend.app.models.user import User
from backend.app.schemas.user import (
    UserProfileUpdate,
    UserResponse,
)


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.get("/me/permissions")
def get_my_permissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    has_contributor_profile = db.query(ContributorProfile).filter(
        ContributorProfile.user_id == current_user.id
    ).first() is not None

    has_palkhi_pramukh_profile = db.query(PalkhiPramukhProfile).filter(
        PalkhiPramukhProfile.user_id == current_user.id
    ).first() is not None

    is_admin = current_user.role == "admin"

    return {
        "role": current_user.role,
        "is_contributor_applied": has_contributor_profile,
        "is_palkhi_pramukh_applied": has_palkhi_pramukh_profile,
        "can_contribute": has_contributor_profile or is_admin,
        "can_manage_channel": has_palkhi_pramukh_profile or is_admin,
    }


@router.patch(
    "/me",
    response_model=UserResponse,
)
def update_my_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    if data.full_name is not None:
        current_user.full_name = data.full_name

    if data.username is not None:
        current_user.username = data.username

    if data.bio is not None:
        current_user.bio = data.bio

    if data.palkhi_affiliation is not None:
        current_user.palkhi_affiliation = (
            data.palkhi_affiliation
        )

    db.commit()
    db.refresh(current_user)

    return current_user