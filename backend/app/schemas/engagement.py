from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CommentCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=5_000)
    parent_id: Optional[UUID] = None


class CommentUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    username: Optional[str] = None
    full_name: Optional[str] = None


class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
    content_id: UUID
    text: str
    parent_id: Optional[UUID] = None
    created_at: datetime
    user: CommentUserResponse


class LikeResponse(BaseModel):
    is_liked: bool
    likes_count: int


class ShareRequest(BaseModel):
    platform: Optional[str] = Field(None, max_length=50)
