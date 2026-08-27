from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.security import authorize_request
from backend.app.db.database import get_db
from backend.app.models.rbac import Role
from backend.app.models.user import User
from backend.app.schemas.admin import RoleUpdate
from backend.app.schemas.user import UserResponse


router = APIRouter(
    prefix="/admin",
    tags=["Administration"],
)


@router.patch(
    "/users/{user_id}/role",
    response_model=UserResponse,
)
def update_user_role(
    user_id: UUID,
    data: RoleUpdate,
    _: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):

    user = db.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    role = db.execute(
        db.query(Role)
        .filter(Role.name == data.role)
    ).scalar_one_or_none()

    if role is None:
        raise HTTPException(
            status_code=404,
            detail="Role not found",
        )

    user.role_id = role.id

    db.commit()
    db.refresh(user)

    return user