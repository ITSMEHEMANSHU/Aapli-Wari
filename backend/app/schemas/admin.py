from pydantic import BaseModel
from uuid import UUID
from typing import Optional, List
from datetime import datetime


class StatsResponse(BaseModel):
    total_users: int
    active_users: int
    total_channels: int
    active_channels: int
    total_content: int
    published_content: int
    pending_review: int


class UserListResponse(BaseModel):
    id: UUID
    username: Optional[str]
    email: str
    full_name: Optional[str]
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UsersResponse(BaseModel):
    total: int
    users: List[UserListResponse]


class RoleUpdateRequest(BaseModel):
    role: str


class StatusUpdateRequest(BaseModel):
    is_active: bool


class ChannelStatusUpdateRequest(BaseModel):
    status: str  # active or inactive