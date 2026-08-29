from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from typing import Optional, List
from pydantic import BaseModel

from backend.app.db.database import get_db
from backend.app.core.security import authorize_request
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
import threading

router = APIRouter(prefix="/content", tags=["content"])


class SuggestionItem(BaseModel):
    id: UUID
    title: str
    content_type: str
    thumbnail_url: Optional[str] = None

    class Config:
        from_attributes = True


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
    description: Optional[str] = Form(None),
    content_type: str = Form(...),
    language: str = Form("mr"),
    tags: str = Form(""),
    channel_id: Optional[UUID] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(authorize_request),
):
    from backend.app.services.users.user_service import can_contribute
    if not can_contribute(current_user, db):
        raise HTTPException(
            status_code=403,
            detail="You must apply as a contributor to upload content.",
        )

    content_type_value = content_type.lower()

    valid_types = ['video', 'image', 'audio', 'pdf', 'manuscript', 'story', 'short']
    if content_type_value not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid content type: {content_type}")

    allowed_types = {
        "video": ["video/mp4", "video/mpeg", "video/quicktime"],
        "image": ["image/jpeg", "image/png", "image/gif", "image/webp"],
        "audio": ["audio/mpeg", "audio/wav", "audio/ogg"],
        "pdf": ["application/pdf"],
        "manuscript": ["application/pdf", "image/jpeg", "image/png"],
        "story": [],
        "short": ["video/mp4", "video/mpeg", "video/quicktime"]
    }

    if content_type_value != "story" and file.content_type not in allowed_types.get(content_type_value, []):
        raise HTTPException(status_code=400, detail=f"Invalid file type for {content_type_value}")

    max_size = 500 * 1024 * 1024
    if file.size > max_size:
        raise HTTPException(status_code=400, detail="File too large. Max 500MB")

    if channel_id:
        channel = db.get(Channel, channel_id)
        if channel is None:
            raise HTTPException(status_code=404, detail="Channel not found")
        ensure_can_post(channel, current_user)

    try:
        file_url = ContentService.upload_to_storage(file, folder=f"content/{content_type_value}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

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
    except Exception as e:
        try:
            ContentService.delete_from_storage(file_url)
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Failed to create content record: {str(e)}")

    # ✅ Trigger OCR for images, PDFs, manuscripts
    if content_type_value in ['image', 'pdf', 'manuscript']:
        try:
            from backend.app.ai.ocr import process_ocr
            thread = threading.Thread(target=process_ocr, args=(content.id,))
            thread.daemon = True
            thread.start()
            print(f"🔍 OCR triggered for content {content.id}")
        except Exception as e:
            print(f"Failed to trigger OCR: {e}")

    # ✅ Trigger STT for audio, video
    if content_type_value in ['audio', 'video']:
        try:
            from backend.app.ai.stt import process_stt
            thread = threading.Thread(target=process_stt, args=(content.id,))
            thread.daemon = True
            thread.start()
            print(f"🎤 STT triggered for content {content.id}")
        except Exception as e:
            print(f"Failed to trigger STT: {e}")

    return ContentUploadResponse(
        id=content.id,
        message="Content uploaded successfully.",
        status=content.status
    )


@router.get("/{content_id}", response_model=ContentResponse)
def get_content(
    content_id: UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(authorize_request),
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
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(authorize_request),
):
    content_type_enum = None
    if content_type:
        try:
            content_type_enum = ContentType(content_type.lower())
        except ValueError:
            pass

    if not current_user:
        verified_only = True

    return ContentService.get_content_list(
        db,
        content_type=content_type_enum,
        channel_id=channel_id,
        verified_only=verified_only,
        search_query=search,
        exclude_short=exclude_short,
        limit=limit,
        offset=offset
    )


@router.put("/{content_id}", response_model=ContentResponse)
def update_content(
    content_id: UUID,
    update_data: ContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(authorize_request),
):
    content = ContentService.get_content(db, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    if content.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this content")
    return ContentService.update_content(db, content_id, update_data, current_user.id)


@router.delete("/{content_id}")
def delete_content(
    content_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(authorize_request),
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
    current_user: User = Depends(authorize_request),
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