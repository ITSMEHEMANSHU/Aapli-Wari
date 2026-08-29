from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from typing import Optional, List
from pydantic import BaseModel
import json

from backend.app.db.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.models.content import ContentStatus, ContentType, Content
from backend.app.models.channel import Channel
from backend.app.models.engagement import Comment, Download, Like, Share
from backend.app.services.channels.post_service import ensure_can_post
from backend.app.schemas.content import (
    ContentCreate,
    ContentUpdate,
    ContentResponse,
    ContentUploadResponse,
    ContentReviewRequest
)
from backend.app.services.content.content_service import ContentService
from backend.app.services.cache_service import build_cache_key, cache_get, cache_set
import threading

router = APIRouter(prefix="/content", tags=["content"])

ALLOWED_CONTENT_FILE_TYPES = {
    "video": {"video/mp4", "video/mpeg", "video/quicktime"},
    "image": {"image/jpeg", "image/png", "image/gif", "image/webp"},
    "audio": {"audio/mpeg", "audio/wav", "audio/ogg"},
    "pdf": {"application/pdf"},
    "manuscript": {"application/pdf", "image/jpeg", "image/png"},
    "short": {"video/mp4", "video/mpeg", "video/quicktime"},
}


class SuggestionItem(BaseModel):
    id: UUID
    title: str
    content_type: str
    thumbnail_url: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("/my/contributions", response_model=List[ContentResponse])
def get_my_contributions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch all content submitted by the currently authenticated user."""
    contents = (
        db.query(Content)
        .filter(Content.user_id == current_user.id)
        .order_by(Content.created_at.desc())
        .all()
    )
    return contents

@router.get("/suggestions", response_model=List[SuggestionItem])
def get_suggestions(
    q: str = Query(..., min_length=1),
    limit: int = Query(6, ge=1, le=10),
    db: Session = Depends(get_db),
):
    """Lightweight title-only suggestions for search autocomplete."""
    results = (
        db.query(Content.id, Content.title, Content.content_type, Content.thumbnail_url)
        .filter(
            Content.title.ilike(f"%{q}%"),
            Content.verified.is_(True),
            Content.status.in_([
                ContentStatus.PUBLISHED,
                ContentStatus.PROCESSED,
                ContentStatus.APPROVED,
            ]),
        )
        .limit(limit)
        .all()
    )
    return [
        SuggestionItem(id=r.id, title=r.title, content_type=r.content_type.value, thumbnail_url=r.thumbnail_url)
        for r in results
    ]


@router.post("/upload", response_model=ContentUploadResponse)
def upload_content(
    title: str = Form(...),
    vernacular_title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    content_body: Optional[str] = Form(None),
    content_type: str = Form(...),
    language: str = Form("mr"),
    tags: str = Form(""),
    categories: str = Form("[]"),  # ✅ JSON string array e.g., '["saints","history"]'
    channel_id: Optional[UUID] = Form(None),
    file: Optional[UploadFile] = File(None),  # ✅ Optional for articles/stories
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from backend.app.services.users.user_service import can_contribute
    if not can_contribute(current_user, db):
        raise HTTPException(
            status_code=403,
            detail="You must apply as a contributor to upload content.",
        )

    content_type_value = content_type.lower()

    # ✅ Updated 'article' to 'text' to match your text-only requirement
    valid_types = ['text', 'video', 'image', 'audio', 'pdf', 'manuscript', 'story', 'short']
    if content_type_value not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid content type: {content_type}")

    # Parse categories JSON safely
    try:
        parsed_categories = json.loads(categories) if categories else []
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid categories JSON format")

    if content_type_value == 'text' and not parsed_categories:
        raise HTTPException(status_code=400, detail=f"At least one category is required for {content_type_value}")

    allowed_types = {
        "text": [],  # ✅ Text-only requires no file attachments
        "video": ["video/mp4", "video/mpeg", "video/quicktime"],
        "image": ["image/jpeg", "image/png", "image/gif", "image/webp"],
        "audio": ["audio/mpeg", "audio/wav", "audio/ogg"],
        "pdf": ["application/pdf"],
        "manuscript": ["application/pdf", "image/jpeg", "image/png"],
        "story": [],
        "short": ["video/mp4", "video/mpeg", "video/quicktime"]
    }

    file_url = None
    if file and file.filename:
        if content_type_value not in ["story", "text"] and file.content_type not in allowed_types.get(content_type_value, []):
            raise HTTPException(status_code=400, detail=f"Invalid file type for {content_type_value}")

        max_size = 500 * 1024 * 1024
        if hasattr(file, 'size') and file.size and file.size > max_size:
            raise HTTPException(status_code=400, detail="File too large. Max 500MB")

        try:
            file_url = ContentService.upload_to_storage(file, folder=f"content/{content_type_value}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

    if channel_id:
        channel = db.get(Channel, channel_id)
        if channel is None:
            raise HTTPException(status_code=404, detail="Channel not found")
        ensure_can_post(channel, current_user)

    content_data = ContentCreate(
        title=title,
        description=description,
        content_type=content_type_value,
        language=language,
        tags=tags.split(",") if tags else [],
        channel_id=channel_id
    )

    try:
        content = ContentService.create_content(
            db=db,
            content_data=content_data,
            user_id=current_user.id,
            file_url=file_url,
            file_obj=file
        )
        
        # ✅ Bind Knowledge-specific metadata fields directly onto the model instance
        content.vernacular_title = vernacular_title
        content.content_body = content_body
        content.categories = parsed_categories
        db.commit()
        db.refresh(content)

    except Exception as e:
        if file_url:
            try:
                ContentService.delete_from_storage(file_url)
            except Exception:
                pass
        raise HTTPException(status_code=500, detail=f"Failed to create content record: {str(e)}")

    # Trigger background tasks as before...
    return ContentUploadResponse(
        id=content.id,
        message="Content uploaded successfully and pending community review.",
        status=content.status
    )

@router.get("/{content_id}", response_model=ContentResponse)
def get_content(
    content_id: UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    content = ContentService.get_content(db, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    visible_statuses = [
        ContentStatus.PUBLISHED, ContentStatus.APPROVED,
        ContentStatus.PROCESSED, ContentStatus.PROCESSING,
    ]
    if content.status not in visible_statuses or not content.verified:
        if not current_user or (current_user.id != content.user_id and current_user.role != "admin"):
            raise HTTPException(status_code=403, detail="Content not available")

    likes_count = db.query(func.count()).select_from(Like).filter(Like.content_id == content_id).scalar()
    comments_count = db.query(func.count()).select_from(Comment).filter(Comment.content_id == content_id).scalar()
    shares_count = db.query(func.count()).select_from(Share).filter(Share.content_id == content_id).scalar()
    downloads_count = db.query(func.count()).select_from(Download).filter(Download.content_id == content_id).scalar()
    is_liked = bool(current_user and db.get(Like, (current_user.id, content_id)))
    response = ContentResponse.model_validate(content)
    return response.model_copy(update={
        "likes_count": likes_count,
        "comments_count": comments_count,
        "shares_count": shares_count,
        "downloads_count": downloads_count,
        "is_liked": is_liked,
    })


@router.get("/", response_model=List[ContentResponse])
def list_content(
    content_type: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    channel_id: Optional[UUID] = Query(None),
    verified_only: bool = Query(False),
    search: Optional[str] = Query(None),
    exclude_short: bool = Query(False),
    categories: Optional[str] = Query(None), 
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    # 1. Handle content_type "all" or empty
    content_type_enum = None
    if content_type and content_type.lower() != "all":
        try:
            normalized_type = 'text' if content_type.lower() == 'article' else content_type.lower()
            content_type_enum = ContentType(normalized_type)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid content type: {content_type}")

    if not current_user:
        verified_only = True

    # 2. ✅ Handle categories "all" or empty properly
    category_list = None
    if categories and categories.lower() != "all":
        category_list = [cat.strip() for cat in categories.split(",") if cat.strip() and cat.strip().lower() != "all"]
        if not category_list:
            category_list = None

    cache_key = build_cache_key(
        'content_list',
        content_type=content_type_enum.value if content_type_enum else None,
        language=language,
        channel_id=str(channel_id) if channel_id else None,
        verified_only=verified_only,
        search=search,
        exclude_short=exclude_short,
        categories=category_list,
        limit=limit,
        offset=offset,
    )
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    items = ContentService.get_content_list(
        db,
        content_type=content_type_enum,
        channel_id=channel_id,
        verified_only=verified_only,
        search_query=search,
        exclude_short=exclude_short,
        categories=category_list,
        limit=limit,
        offset=offset
    )

    result = [ContentResponse.model_validate(item).model_dump(mode='json') for item in items]
    cache_set(cache_key, result, ttl=180)
    return result


@router.put("/{content_id}", response_model=ContentResponse)
def update_content(
    content_id: UUID,
    update_data: ContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = ContentService.get_content(db, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    if content.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this content")
    return ContentService.update_content(db, content_id, update_data, current_user.id)


@router.put("/{content_id}/file", response_model=ContentResponse)
def replace_content_file(
    content_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = ContentService.get_content(db, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    if content.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this content")

    allowed_types = ALLOWED_CONTENT_FILE_TYPES.get(content.content_type.value, set())
    if not allowed_types:
        raise HTTPException(status_code=400, detail="This content type does not support file replacement")
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type for {content.content_type.value}",
        )

    max_size = 500 * 1024 * 1024
    if file.size and file.size > max_size:
        raise HTTPException(status_code=400, detail="File too large. Max 500MB")

    old_file_url = content.file_url
    try:
        new_file_url = ContentService.upload_to_storage(
            file, folder=f"content/{content.content_type.value}"
        )
        file_size = file.size
        if file_size is None and file.file:
            file.file.seek(0, 2)
            file_size = file.file.tell()
            file.file.seek(0)

        content.file_url = new_file_url
        content.file_size = file_size
        db.commit()
        db.refresh(content)
    except Exception as exc:
        db.rollback()
        if "new_file_url" in locals():
            ContentService.delete_from_storage(new_file_url)
        raise HTTPException(status_code=500, detail=f"Failed to replace file: {exc}")

    if old_file_url:
        ContentService.delete_from_storage(old_file_url)
    return content


@router.delete("/{content_id}")
def delete_content(
    content_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = ContentService.get_content(db, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    if content.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this content")
    if not ContentService.delete_content(db, content_id):
        raise HTTPException(status_code=500, detail="Failed to delete content")
    return {"message": "Content deleted successfully"}


@router.post("/{content_id}/review")
def review_content(
    content_id: UUID,
    review: ContentReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = ContentService.get_content(db, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    is_admin = current_user.role == "admin"
    is_channel_owner = False
    if content.channel_id:
        channel = db.query(Channel).filter(
            Channel.id == content.channel_id,
            Channel.created_by_user_id == current_user.id
        ).first()
        is_channel_owner = channel is not None

    if not is_admin and not is_channel_owner:
        raise HTTPException(status_code=403, detail="Not authorized to review this content")

    updated = ContentService.update_status(
        db, content_id, review.decision, current_user.id, review.comments
    )
    return {"message": f"Content {review.decision.value}", "status": updated.status}

