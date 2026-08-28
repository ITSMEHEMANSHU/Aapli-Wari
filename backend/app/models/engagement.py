from sqlalchemy import Column, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import backref, relationship
from sqlalchemy.sql import func
import uuid

from backend.app.db.base import Base


class Like(Base):
    __tablename__ = "likes"

    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    content_id = Column(PGUUID(as_uuid=True), ForeignKey("contents.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])
    content = relationship("Content", foreign_keys=[content_id])

    __table_args__ = (Index("ix_likes_content_id", "content_id"),)


class Comment(Base):
    __tablename__ = "comments"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content_id = Column(PGUUID(as_uuid=True), ForeignKey("contents.id", ondelete="CASCADE"), nullable=False)
    text = Column(Text, nullable=False)
    parent_id = Column(PGUUID(as_uuid=True), ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])
    content = relationship("Content", foreign_keys=[content_id])
    replies = relationship(
        "Comment",
        backref=backref("parent", remote_side=[id]),
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("ix_comments_content_id", "content_id"),
        Index("ix_comments_parent_id", "parent_id"),
    )


class Share(Base):
    __tablename__ = "shares"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    content_id = Column(PGUUID(as_uuid=True), ForeignKey("contents.id", ondelete="CASCADE"), nullable=False)
    platform = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])
    content = relationship("Content", foreign_keys=[content_id])

    __table_args__ = (Index("ix_shares_content_id", "content_id"),)


class Download(Base):
    __tablename__ = "downloads"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    content_id = Column(PGUUID(as_uuid=True), ForeignKey("contents.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])
    content = relationship("Content", foreign_keys=[content_id])

    __table_args__ = (Index("ix_downloads_content_id", "content_id"),)
