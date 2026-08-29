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
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    emergency_contact_role: str | None = None


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
    followers_count: int = 0
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    emergency_contact_role: str | None = None


class ChannelPostCreate(BaseModel):
    message: str


class AnnouncementCreate(BaseModel):
    message: str
    is_pinned: bool = False


class EmergencyContactUpdate(BaseModel):
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    emergency_contact_role: str | None = None


class ChannelFollowResponse(BaseModel):
    message: str
    is_following: bool


class ChannelFollowStatusResponse(BaseModel):
    is_following: bool


class ChannelPostUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: str | None
    full_name: str | None


class ChannelPostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    channel_id: uuid.UUID
    user_id: uuid.UUID
    message: str
    is_announcement: bool = False
    is_pinned: bool = False
    created_at: datetime
    updated_at: datetime
    user: ChannelPostUserResponse


class ChannelFeedItemResponse(BaseModel):
    id: uuid.UUID
    channel_id: uuid.UUID
    user_id: uuid.UUID
    message: str | None = None
    title: str | None = None
    description: str | None = None
    content_type: str | None = None
    file_url: str | None = None
    verified: bool = False
    status: str | None = None
    is_announcement: bool = False
    is_pinned: bool = False
    created_at: datetime
    updated_at: datetime
    user: ChannelPostUserResponse


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