from sqlalchemy import Column, String, Text, ForeignKey, Enum, Integer, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB   # <-- JSONB added
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from enum import Enum as PyEnum

from backend.app.db.base import Base
from pgvector.sqlalchemy import Vector


class ContentStatus(PyEnum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    PROCESSED = "processed"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_REVISION = "needs_revision"
    PUBLISHED = "published"


class ContentType(PyEnum):
    ARTICLE = "text"
    VIDEO = "video"
    IMAGE = "image"
    AUDIO = "audio"
    PDF = "pdf"
    MANUSCRIPT = "manuscript"
    STORY = "story"
    SHORT = "short"


class Content(Base):
    __tablename__ = "contents"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    vernacular_title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    content_body = Column(Text, nullable=True)

    content_type = Column(
        Enum(ContentType, values_callable=lambda enum_type: [item.value for item in enum_type]),
        nullable=False,
    )
    is_short = Column(Boolean, default=False, nullable=False)
    file_url = Column(String(500), nullable=True)          # Primary PDF/media URL or Optional header image
    thumbnail_url = Column(String(500), nullable=True)

    # ============ ALL JSON columns changed to JSONB ============
    categories = Column(JSONB, default=list)          # was JSON
    quick_facts = Column(JSONB, default=dict)         # was JSON
    sources = Column(JSONB, default=list)             # was JSON
    sections = Column(JSONB, default=list)            # was JSON
    tags = Column(JSONB, default=list)                # was JSON
    entities = Column(JSONB, nullable=True)           # was JSON
    translations = Column(JSONB, default=dict)        # was JSON
    vision_analysis = Column(JSONB, nullable=True)    # was JSON
    # =========================================================

    language = Column(String(10), default="mr")
    duration = Column(Integer, nullable=True)
    file_size = Column(Integer, nullable=True)

    status = Column(
        Enum(ContentStatus, values_callable=lambda enum_type: [item.value for item in enum_type]),
        default=ContentStatus.UPLOADED,
    )

    transcription = Column(Text, nullable=True)
    extracted_text = Column(Text, nullable=True)

    verified = Column(Boolean, default=False)
    verification_notes = Column(Text, nullable=True)
    verified_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)

    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    channel_id = Column(PGUUID(as_uuid=True), ForeignKey("channels.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    embedding = Column(Vector(1024), nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    channel = relationship("Channel", foreign_keys=[channel_id])
    verifier = relationship("User", foreign_keys=[verified_by])
    versions = relationship("ContentVersion", back_populates="content", cascade="all, delete-orphan")
    reviews = relationship("ContentReview", back_populates="content", cascade="all, delete-orphan")


class ContentVersion(Base):
    __tablename__ = "content_versions"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_id = Column(PGUUID(as_uuid=True), ForeignKey("contents.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    vernacular_title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    content_body = Column(Text, nullable=True)
    file_url = Column(String(500), nullable=True)
    # Also change these to JSONB for consistency (not strictly required for filtering, but good practice)
    categories = Column(JSONB, default=list)
    sources = Column(JSONB, default=list)
    sections = Column(JSONB, default=list)
    status = Column(
        Enum(ContentStatus, values_callable=lambda enum_type: [item.value for item in enum_type]),
        nullable=False,
    )
    change_note = Column(Text, nullable=True)
    created_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    content = relationship("Content", back_populates="versions")
    creator = relationship("User", foreign_keys=[created_by])


class ContentReview(Base):
    __tablename__ = "content_reviews"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_id = Column(PGUUID(as_uuid=True), ForeignKey("contents.id"), nullable=False)
    reviewer_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    decision = Column(
        Enum(ContentStatus, values_callable=lambda enum_type: [item.value for item in enum_type]),
        nullable=False,
    )
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    content = relationship("Content", back_populates="reviews")
    reviewer = relationship("User", foreign_keys=[reviewer_id])