from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import UUID
from typing import Optional, List, Dict, Any

from backend.app.models.content import Content, ContentStatus, ContentType


def get_shorts(
    db: Session,
    limit: int = 20,
    offset: int = 0,
    content_type: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Get short-form content for Aapla Theva
    Only returns verified, published content with media
    """
    query = db.query(Content).filter(
    Content.verified == True,
    Content.status == ContentStatus.PUBLISHED,
    Content.file_url.isnot(None),   
    Content.content_type == ContentType.SHORT  # ✅ Only shorts
)

    # Filter by content type if provided
    if content_type:
        query = query.filter(Content.content_type == content_type)

    # Order by newest first
    query = query.order_by(desc(Content.created_at))

    # Paginate
    results = query.limit(limit).offset(offset).all()

    return [
        {
            'id': str(item.id),
            'title': item.title,
            'description': item.description,
            'content_type': item.content_type.value,
            'file_url': item.file_url,
            'thumbnail_url': item.thumbnail_url,
            'language': item.language,
            'verified': item.verified,
            'created_at': item.created_at.isoformat() if item.created_at else None,
            'user_id': str(item.user_id) if item.user_id else None,
            'channel_id': str(item.channel_id) if item.channel_id else None,
        }
        for item in results
    ]


def get_short_details(db: Session, short_id: UUID) -> Optional[Dict[str, Any]]:
    """Get single short content details"""
    content = db.query(Content).filter(
        Content.id == short_id,
        Content.verified == True,
        Content.status == ContentStatus.PUBLISHED,
        Content.file_url.isnot(None)
    ).first()

    if not content:
        return None

    return {
        'id': str(content.id),
        'title': content.title,
        'description': content.description,
        'content_type': content.content_type.value,
        'file_url': content.file_url,
        'thumbnail_url': content.thumbnail_url,
        'language': content.language,
        'verified': content.verified,
        'created_at': content.created_at.isoformat() if content.created_at else None,
        'user_id': str(content.user_id) if content.user_id else None,
        'channel_id': str(content.channel_id) if content.channel_id else None,
    }