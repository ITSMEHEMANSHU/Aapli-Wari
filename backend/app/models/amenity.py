import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.db.base import Base


class Amenity(Base):
    __tablename__ = "amenities"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    service_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # food, stay, toilet, medical, water, rest, transport

    description: Mapped[str | None] = mapped_column(String, nullable=True)

    address: Mapped[str | None] = mapped_column(String(500), nullable=True)

    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)

    contact: Mapped[str | None] = mapped_column(String(100), nullable=True)

    is_free: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    contributor_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    contributor = relationship("User", foreign_keys=[contributor_id])
