from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: UUID

    username: str | None

    email: str

    full_name: str | None

    role_id: UUID

    role: str | None = None

    is_active: bool

    created_at: datetime

    updated_at: datetime


class UserProfileUpdate(BaseModel):

    username: str | None = None

    full_name: str | None = None

    bio: str | None = None

    palkhi_affiliation: str | None = None