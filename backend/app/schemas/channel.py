import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PalkhiCreate(BaseModel):
    name: str
    description: str | None = None


class PalkhiResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None
    owner_user_id: uuid.UUID
    verification_status_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class ChannelCreate(BaseModel):
    name: str
    description: str | None = None
    palkhi_id: uuid.UUID


class ChannelUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class ChannelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None
    palkhi_id: uuid.UUID
    created_by_user_id: uuid.UUID
    status: str
    created_at: datetime
    updated_at: datetime


class ContributorAssignment(BaseModel):
    user_id: uuid.UUID


class ChannelJoinRequestCreate(BaseModel):
    pass


class ChannelJoinRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    channel_id: uuid.UUID
    user_id: uuid.UUID
    status: str
    created_at: datetime
    updated_at: datetime


class ChannelJoinRequestUserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str | None
    username: str | None


class ChannelJoinRequestDetailResponse(BaseModel):
    id: uuid.UUID
    channel_id: uuid.UUID
    user_id: uuid.UUID
    status: str
    created_at: datetime
    updated_at: datetime
    user: ChannelJoinRequestUserResponse


class JoinRequestDecision(BaseModel):
    action: str