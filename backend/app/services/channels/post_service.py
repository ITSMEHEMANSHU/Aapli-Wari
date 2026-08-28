from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from backend.app.models.channel import Channel
from backend.app.models.channel_post import ChannelPost
from backend.app.models.content import Content
from backend.app.models.user import User


def ensure_can_post(channel: Channel, user: User) -> None:
    if channel.status != "active":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Channel is inactive")
    if channel.created_by_user_id != user.id and not any(member.id == user.id for member in channel.contributors):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the channel owner or an assigned contributor can post",
        )


def list_channel_posts(db: Session, channel_id: UUID) -> list[dict]:
    text_posts = list(
        db.scalars(
            select(ChannelPost)
            .where(ChannelPost.channel_id == channel_id)
            .options(joinedload(ChannelPost.user))
            .order_by(ChannelPost.created_at.asc())
        ).all()
    )
    media_posts = list(
        db.scalars(
            select(Content)
            .where(Content.channel_id == channel_id)
            .options(joinedload(Content.user))
            .order_by(Content.created_at.asc())
        ).all()
    )
    feed = [
        {
            "id": post.id, "channel_id": post.channel_id, "user_id": post.user_id,
            "message": post.message, "title": None, "description": post.message,
            "content_type": None, "file_url": None, "verified": True,
            "status": "published", "created_at": post.created_at,
            "updated_at": post.updated_at, "user": post.user,
        }
        for post in text_posts
    ]
    feed.extend(
        {
            "id": content.id, "channel_id": content.channel_id, "user_id": content.user_id,
            "message": content.description, "title": content.title,
            "description": content.description, "content_type": content.content_type.value,
            "file_url": content.file_url, "verified": content.verified,
            "status": content.status.value, "created_at": content.created_at,
            "updated_at": content.updated_at, "user": content.user,
        }
        for content in media_posts
    )
    return sorted(feed, key=lambda item: item["created_at"])


def create_channel_post(db: Session, channel: Channel, user: User, message: str) -> ChannelPost:
    ensure_can_post(channel, user)
    post = ChannelPost(channel_id=channel.id, user_id=user.id, message=message.strip())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post