from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List
import uuid as uuid_lib

from backend.app.db.database import get_db
from backend.app.core.security import authorize_request
from backend.app.models.user import User
from backend.app.models.content import ContentStatus, ContentType, Content
from backend.app.models.channel import Channel
from backend.app.services.channels.post_service import ensure_can_post
from backend.app.schemas.content import (
    ContentCreate, 
    ContentUpdate, 
    ContentResponse, 
    ContentUploadResponse, 
    ContentReviewRequest
)
from backend.app.services.content.content_service import ContentService
from backend.app.ai.ocr import process_ocr
import threading

router = APIRouter(prefix="/content", tags=["content"])


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
    """Upload a new content file"""
    
    # Convert to lowercase
    content_type_value = content_type.lower()
    
    # Validate content type
    valid_types = ['video', 'image', 'audio', 'pdf', 'manuscript', 'story']
    if content_type_value not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid content type: {content_type}")
    
    # Validate file type
    allowed_types = {
        "video": ["video/mp4", "video/mpeg", "video/quicktime"],
        "image": ["image/jpeg", "image/png", "image/gif", "image/webp"],
        "audio": ["audio/mpeg", "audio/wav", "audio/ogg"],
        "pdf": ["application/pdf"],
        "manuscript": ["application/pdf", "image/jpeg", "image/png"],
        "story": [],
    }
    
    if content_type_value != "story" and file.content_type not in allowed_types.get(content_type_value, []):
        raise HTTPException(status_code=400, detail=f"Invalid file type for {content_type_value}")
    
    # Validate file size (max 500MB)
    max_size = 500 * 1024 * 1024
    if file.size > max_size:
        raise HTTPException(status_code=400, detail="File too large. Max 500MB")

    if channel_id:
        channel = db.get(Channel, channel_id)
        if channel is None:
            raise HTTPException(status_code=404, detail="Channel not found")
        ensure_can_post(channel, current_user)
    
    # Upload to Appwrite
    try:
        file_url = ContentService.upload_to_storage(file, folder=f"content/{content_type_value}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")
    
    # Create content record
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
            file_obj=file  # ✅ Pass file object for size calculation
        )
        
    except Exception as e:
        # Try to delete uploaded file if content creation fails
        try:
            ContentService.delete_from_storage(file_url)
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Failed to create content record: {str(e)}")

     # In upload_content function, after content is created:

# ✅ Trigger OCR + Translation for image/pdf/manuscript
    if content_type_value in ['image', 'pdf', 'manuscript']:
        try:
            from backend.app.ai.ocr import process_ocr
            import threading
            thread = threading.Thread(target=process_ocr, args=(content.id,))
            thread.daemon = True
            thread.start()
            print(f"🔄 OCR triggered for content {content.id}")
        except Exception as e:
            print(f"Failed to trigger OCR: {e}")
    
    return ContentUploadResponse(
        id=content.id,
        message="Content uploaded successfully.",
        status=content.status
    )


# Keep all other endpoints (GET, PUT, DELETE, REVIEW) exactly as they are


@router.get("/{content_id}", response_model=ContentResponse)
def get_content(
    content_id: UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(authorize_request),
):
    content = ContentService.get_content(db, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Check if content is published or user has access
    if content.status not in [ContentStatus.PUBLISHED, ContentStatus.APPROVED, ContentStatus.PROCESSED] or not content.verified:
        if not current_user or (current_user.id != content.user_id and current_user.role != "admin"):
            raise HTTPException(status_code=403, detail="Content not available")
    
    return content


@router.get("/", response_model=List[ContentResponse])
def list_content(
    content_type: Optional[str] = Query(None),  # ✅ Changed from ContentType to str
    language: Optional[str] = Query(None),
    channel_id: Optional[UUID] = Query(None),
    verified_only: bool = Query(False),
    search: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(authorize_request),
):
    # ✅ Convert content_type to enum if provided
    content_type_enum = None
    if content_type:
        content_type_lower = content_type.lower()
        try:
            content_type_enum = ContentType(content_type_lower)
        except ValueError:
            pass  # Ignore invalid content type
    
    # Public users can only see published content
    if not current_user:
        return ContentService.get_content_list(
            db,
            verified_only=True,
            search_query=search,
            content_type=content_type_enum,
            channel_id=channel_id,
            limit=limit,
            offset=offset
        )
    
    return ContentService.get_content_list(
        db,
        content_type=content_type_enum,
        channel_id=channel_id,
        verified_only=verified_only,
        search_query=search,
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
    
    updated = ContentService.update_content(db, content_id, update_data, current_user.id)
    return updated


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
    
    deleted = ContentService.delete_content(db, content_id)
    if not deleted:
        raise HTTPException(status_code=500, detail="Failed to delete content")
    
    return {"message": "Content deleted successfully"}


@router.post("/{content_id}/review")
def review_content(
    content_id: UUID,
    review: ContentReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(authorize_request),
):
    """Review content (Admin or Channel Owner only)"""
    content = ContentService.get_content(db, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Check if user is admin or channel owner
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