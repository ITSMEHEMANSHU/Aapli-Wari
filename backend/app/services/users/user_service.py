from uuid import UUID

from sqlalchemy.orm import Session

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