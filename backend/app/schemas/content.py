from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from backend.app.models.content import ContentType, ContentStatus


class ContentBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    content_type: ContentType
    language: str = "mr"
    tags: Optional[List[str]] = Field(default_factory=list)
    channel_id: Optional[UUID] = None


class ContentCreate(ContentBase):
    pass


class ContentUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    language: Optional[str] = None
    tags: Optional[List[str]] = None
    channel_id: Optional[UUID] = None
    status: Optional[ContentStatus] = None


class ContentResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    content_type: ContentType
    file_url: Optional[str]
    thumbnail_url: Optional[str]
    language: str
    tags: List[str]
    status: ContentStatus
    transcription: Optional[str]
    extracted_text: Optional[str]
    entities: Optional[Dict[str, Any]]
    translations: Dict[str, Any]
    verified: bool
    user_id: UUID
    channel_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    embedding: Optional[List[float]] = None

    class Config:
        from_attributes = True

    @classmethod
    def model_validate(cls, obj, **kwargs):
        if hasattr(obj, 'embedding') and obj.embedding is not None:
            try:
                obj.__dict__['embedding'] = list(obj.embedding)
            except Exception:
                obj.__dict__['embedding'] = None
        return super().model_validate(obj, **kwargs)


class ContentUploadResponse(BaseModel):
    id: UUID
    message: str
    status: ContentStatus


class ContentReviewRequest(BaseModel):
    decision: ContentStatus  # approved, rejected, needs_revision
    comments: Optional[str] = None


class ContentSearchParams(BaseModel):
    query: Optional[str] = None
    content_type: Optional[ContentType] = None
    language: Optional[str] = None
    tags: Optional[List[str]] = None
    channel_id: Optional[UUID] = None
    verified_only: bool = False
    limit: int = 20
    offset: int = 0