from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.core.security import authorize_request
from backend.app.db.database import get_db
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
    current_user: User = Depends(authorize_request),
):
    return current_user


@router.patch(
    "/me",
    response_model=UserResponse,
)
def update_my_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(authorize_request),
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