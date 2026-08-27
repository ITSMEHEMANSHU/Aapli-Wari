from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List
import os

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.content import ContentStatus, ContentType
from app.schemas.content import ContentCreate, ContentUpdate, ContentResponse, ContentUploadResponse, ContentReviewRequest, ContentSearchParams
from app.services.content.content_service import ContentService
from app.models.rbac import RoutePermission, Permission

router = APIRouter(prefix="/content", tags=["content"])


@router.post("/upload", response_model=ContentUploadResponse)
async def upload_content(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    content_type: ContentType = Form(...),
    language: str = Form("mr"),
    tags: str = Form(""),
    channel_id: Optional[UUID] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a new content file"""
    
    # Validate file type
    allowed_types = {
        "video": ["video/mp4", "video/mpeg", "video/quicktime"],
        "image": ["image/jpeg", "image/png", "image/gif", "image/webp"],
        "audio": ["audio/mpeg", "audio/wav", "audio/ogg"],
        "pdf": ["application/pdf"],
        "manuscript": ["application/pdf", "image/jpeg", "image/png"],
        "story": []  # No file for stories
    }
    
    if content_type != "story" and file.content_type not in allowed_types.get(content_type.value, []):
        raise HTTPException(status_code=400, detail=f"Invalid file type for {content_type.value}")
    
    # Validate file size (max 500MB)
    max_size = 500 * 1024 * 1024  # 500MB
    if file.size > max_size:
        raise HTTPException(status_code=400, detail="File too large. Max 500MB")
    
    # Upload to Supabase Storage
    try:
        file_url = ContentService.upload_to_storage(file, folder=f"content/{content_type.value}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")
    
    # Create content record
    content_data = ContentCreate(
        title=title,
        description=description,
        content_type=content_type,
        language=language,
        tags=tags.split(",") if tags else [],
        channel_id=channel_id
    )
    
    content = ContentService.create_content(db, content_data, current_user.id, file_url)
    
    # Queue for AI processing (async via Celery)
    # process_content_async.delay(content.id)
    
    return ContentUploadResponse(
        id=content.id,
        message="Content uploaded successfully. Processing has been queued.",
        status=content.status
    )


@router.get("/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    content = ContentService.get_content(db, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Check if content is published or user has access
    if content.status != ContentStatus.PUBLISHED and content.status != ContentStatus.APPROVED:
        if not current_user or (current_user.id != content.user_id and not current_user.is_admin):
            raise HTTPException(status_code=403, detail="Content not available")
    
    return content


@router.get("/", response_model=List[ContentResponse])
async def list_content(
    content_type: Optional[ContentType] = Query(None),
    language: Optional[str] = Query(None),
    channel_id: Optional[UUID] = Query(None),
    verified_only: bool = Query(False),
    search: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    # Public users can only see published content
    if not current_user:
        return ContentService.get_content_list(
            db,
            verified_only=True,
            status=ContentStatus.PUBLISHED,
            search_query=search,
            content_type=content_type,
            channel_id=channel_id,
            limit=limit,
            offset=offset
        )
    
    return ContentService.get_content_list(
        db,
        content_type=content_type,
        channel_id=channel_id,
        verified_only=verified_only,
        search_query=search,
        limit=limit,
        offset=offset
    )


@router.put("/{content_id}", response_model=ContentResponse)
async def update_content(
    content_id: UUID,
    update_data: ContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = ContentService.get_content(db, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    if content.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to update this content")
    
    updated = ContentService.update_content(db, content_id, update_data, current_user.id)
    return updated


@router.delete("/{content_id}")
async def delete_content(
    content_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = ContentService.get_content(db, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    if content.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this content")
    
    deleted = ContentService.delete_content(db, content_id)
    if not deleted:
        raise HTTPException(status_code=500, detail="Failed to delete content")
    
    return {"message": "Content deleted successfully"}


@router.post("/{content_id}/review")
async def review_content(
    content_id: UUID,
    review: ContentReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Review content (Admin or Channel Owner only)"""
    content = ContentService.get_content(db, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Check if user is admin or channel owner
    is_admin = current_user.role.name == "admin"
    is_channel_owner = content.channel_id and db.query(Channel).filter(
        Channel.id == content.channel_id,
        Channel.created_by_user_id == current_user.id
    ).first()
    
    if not is_admin and not is_channel_owner:
        raise HTTPException(status_code=403, detail="Not authorized to review this content")
    
    updated = ContentService.update_status(
        db, content_id, review.decision, current_user.id, review.comments
    )
    
    return {"message": f"Content {review.decision.value}", "status": updated.status}


@router.post("/{content_id}/like")
async def like_content(
    content_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Implement likes table
    pass


@router.post("/{content_id}/save")
async def save_content(
    content_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Implement saves table
    pass


@router.post("/{content_id}/comments")
async def add_comment(
    content_id: UUID,
    comment: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Implement comments table
    pass