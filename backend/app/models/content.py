from sqlalchemy import Column, String, Text, ForeignKey, Enum, Integer, DateTime, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID as PGUUID
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
    ARTICLE = "text"       # ✅ Added for Knowledge Module
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
    vernacular_title = Column(String(255), nullable=True)  # ✅ e.g., संत तुकाराम
    description = Column(Text, nullable=True)
    content_body = Column(Text, nullable=True)             # ✅ Body text for articles/knowledge items
    
    content_type = Column(
        Enum(ContentType, values_callable=lambda enum_type: [item.value for item in enum_type]),
        nullable=False,
    )
    is_short = Column(Boolean, default=False, nullable=False)
    file_url = Column(String(500), nullable=True)          # Primary PDF/media URL or Optional header image
    thumbnail_url = Column(String(500), nullable=True)
    
    # Categorization & Archival Meta
    categories = Column(JSON, default=list)                # ✅ e.g., ["saints", "history", "abhanga"]
    quick_facts = Column(JSON, default=dict)              # ✅ Key-value metadata for quick facts drawer
    sources = Column(JSON, default=list)                  # ✅ References & citations [{title, author, year, type}]
    sections = Column(JSON, default=list)                 # ✅ Structured content sections [{id, title, content}]
    
    language = Column(String(10), default="mr")
    tags = Column(JSON, default=list)
    duration = Column(Integer, nullable=True)
    file_size = Column(Integer, nullable=True)
    
    status = Column(
        Enum(ContentStatus, values_callable=lambda enum_type: [item.value for item in enum_type]),
        default=ContentStatus.UPLOADED,
    )
    
    # AI & Analysis fields
    transcription = Column(Text, nullable=True)
    extracted_text = Column(Text, nullable=True)
    entities = Column(JSON, nullable=True)
    translations = Column(JSON, default=dict)
    vision_analysis = Column(JSON, nullable=True)
    
    # Verification & Moderation
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
    categories = Column(JSON, default=list)
    sources = Column(JSON, default=list)
    sections = Column(JSON, default=list)
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