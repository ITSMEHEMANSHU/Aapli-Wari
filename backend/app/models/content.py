from sqlalchemy import Column, String, Text, UUID, ForeignKey, Enum, Integer, DateTime, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from enum import Enum as PyEnum

from app.db.base import Base


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
    VIDEO = "video"
    IMAGE = "image"
    AUDIO = "audio"
    PDF = "pdf"
    MANUSCRIPT = "manuscript"
    STORY = "story"


class Content(Base):
    __tablename__ = "contents"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    content_type = Column(Enum(ContentType), nullable=False)
    file_url = Column(String(500), nullable=True)  # URL in Supabase Storage
    thumbnail_url = Column(String(500), nullable=True)
    
    # Metadata
    language = Column(String(10), default="mr")  # mr, hi, en
    tags = Column(JSON, default=list)  # Array of tags
    duration = Column(Integer, nullable=True)  # For audio/video in seconds
    file_size = Column(Integer, nullable=True)  # In bytes
    
    # Status
    status = Column(Enum(ContentStatus), default=ContentStatus.UPLOADED)
    
    # AI Processing Results
    transcription = Column(Text, nullable=True)  # STT output
    extracted_text = Column(Text, nullable=True)  # OCR output
    entities = Column(JSON, nullable=True)  # Extracted entities
    translations = Column(JSON, default=dict)  # {lang: translated_text}
    vision_analysis = Column(JSON, nullable=True)  # Vision AI output
    
    # Verification
    verified = Column(Boolean, default=False)
    verification_notes = Column(Text, nullable=True)
    verified_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    channel_id = Column(PGUUID(as_uuid=True), ForeignKey("channels.id"), nullable=True)
    
    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    channel = relationship("Channel")
    versions = relationship("ContentVersion", back_populates="content", cascade="all, delete-orphan")
    reviews = relationship("ContentReview", back_populates="content", cascade="all, delete-orphan")


class ContentVersion(Base):
    __tablename__ = "content_versions"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_id = Column(PGUUID(as_uuid=True), ForeignKey("contents.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    file_url = Column(String(500), nullable=True)
    status = Column(Enum(ContentStatus), nullable=False)
    change_note = Column(Text, nullable=True)
    created_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    content = relationship("Content", back_populates="versions")
    creator = relationship("User")


class ContentReview(Base):
    __tablename__ = "content_reviews"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_id = Column(PGUUID(as_uuid=True), ForeignKey("contents.id"), nullable=False)
    reviewer_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    decision = Column(Enum(ContentStatus), nullable=False)  # approved/rejected/needs_revision
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    content = relationship("Content", back_populates="reviews")
    reviewer = relationship("User")