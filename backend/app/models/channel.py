import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Table, Column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.db.base import Base


channel_followers = Table(
    "channel_followers",
    Base.metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column(
        "channel_id",
        UUID(as_uuid=True),
        ForeignKey("channels.id", ondelete="CASCADE"),
        nullable=False,
    ),
    Column(
        "user_id",
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    ),
    Column(
        "created_at",
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    ),
)


channel_contributors = Table(
    "channel_contributors",
    Base.metadata,

    Column(
        "channel_id",
        UUID(as_uuid=True),
        ForeignKey(
            "channels.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),

    Column(
        "user_id",
        UUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),

    Column(
        "assigned_at",
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    ),
)


class Channel(Base):
    __tablename__ = "channels"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    palkhi_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "palkhis.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        unique=True,
    )

    created_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="active",
        server_default="active",
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

    palkhi = relationship(
        "Palkhi",
        back_populates="channel",
    )

    created_by = relationship(
        "User",
        foreign_keys=[created_by_user_id],
    )

    contributors = relationship(
        "User",
        secondary=channel_contributors,
    )

    followers = relationship(
        "User",
        secondary="channel_followers",
        primaryjoin="Channel.id == channel_followers.c.channel_id",
        secondaryjoin="User.id == channel_followers.c.user_id",
        viewonly=True,
    )

    @property
    def followers_count(self) -> int:
        try:
            return len(self.followers or [])
        except Exception:
            return 0

    @property
    def owner_name(self) -> str | None:
        if self.palkhi and getattr(self.palkhi, "owner", None):
            owner = self.palkhi.owner
            return owner.full_name or owner.username or self.palkhi.name

        if self.created_by:
            created_by = self.created_by
            return created_by.full_name or created_by.username or (self.palkhi.name if self.palkhi else None)

        return self.palkhi.name if self.palkhi else None

    @property
    def created_by_name(self) -> str | None:
        if self.created_by:
            created_by = self.created_by
            return created_by.full_name or created_by.username or (self.palkhi.name if self.palkhi else None)

        if self.palkhi and getattr(self.palkhi, "owner", None):
            owner = self.palkhi.owner
            return owner.full_name or owner.username or self.palkhi.name

        return self.palkhi.name if self.palkhi else None

    @property
    def emergency_contact_name(self):
        return self.palkhi.emergency_contact_name if self.palkhi else None

    @property
    def emergency_contact_phone(self):
        return self.palkhi.emergency_contact_phone if self.palkhi else None

    @property
    def emergency_contact_role(self):
        return self.palkhi.emergency_contact_role if self.palkhi else None

    @property
    def followers_count(self):
        return len(self.followers) if self.followers is not None else 0

    @property
    def owner_name(self):
        if self.created_by is None:
            return None
        return self.created_by.full_name or self.created_by.username

    @property
    def created_by_name(self):
        return self.owner_name