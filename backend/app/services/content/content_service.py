from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from uuid import UUID
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.models.content import Content, ContentStatus, ContentType, ContentVersion, ContentReview
from app.models.user import User
from app.models.channel import Channel
from app.schemas.content import ContentCreate, ContentUpdate, ContentReviewRequest
from app.core.supabase import supabase_client


class ContentService:
    @staticmethod
    def create_content(db: Session, content_data: ContentCreate, user_id: UUID, file_url: str = None) -> Content:
        """Create a new content entry"""
        # Validate channel if provided
        if content_data.channel_id:
            channel = db.query(Channel).filter(Channel.id == content_data.channel_id).first()
            if not channel:
                raise ValueError("Channel not found")
        
        content = Content(
            title=content_data.title,
            description=content_data.description,
            content_type=content_data.content_type,
            language=content_data.language,
            tags=content_data.tags or [],
            file_url=file_url,
            user_id=user_id,
            channel_id=content_data.channel_id,
            status=ContentStatus.UPLOADED,
        )
        db.add(content)
        db.commit()
        db.refresh(content)
        return content

    @staticmethod
    def get_content(db: Session, content_id: UUID) -> Optional[Content]:
        return db.query(Content).filter(Content.id == content_id).first()

    @staticmethod
    def get_content_list(
        db: Session,
        user_id: Optional[UUID] = None,
        channel_id: Optional[UUID] = None,
        content_type: Optional[ContentType] = None,
        status: Optional[ContentStatus] = None,
        verified_only: bool = False,
        search_query: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> List[Content]:
        query = db.query(Content)
        
        if user_id:
            query = query.filter(Content.user_id == user_id)
        if channel_id:
            query = query.filter(Content.channel_id == channel_id)
        if content_type:
            query = query.filter(Content.content_type == content_type)
        if status:
            query = query.filter(Content.status == status)
        if verified_only:
            query = query.filter(Content.verified == True, Content.status == ContentStatus.PUBLISHED)
        if search_query:
            query = query.filter(
                or_(
                    Content.title.ilike(f"%{search_query}%"),
                    Content.description.ilike(f"%{search_query}%"),
                    Content.tags.contains([search_query])
                )
            )
        
        return query.order_by(Content.created_at.desc()).limit(limit).offset(offset).all()

    @staticmethod
    def update_content(db: Session, content_id: UUID, update_data: ContentUpdate, user_id: UUID) -> Optional[Content]:
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            return None
        
        # Create version history before update
        version = ContentVersion(
            content_id=content.id,
            version_number=content.versions.count() + 1 if content.versions else 1,
            title=content.title,
            description=content.description,
            file_url=content.file_url,
            status=content.status,
            change_note=f"Updated by user {user_id}",
            created_by=user_id
        )
        db.add(version)
        
        # Update content
        for key, value in update_data.dict(exclude_unset=True).items():
            setattr(content, key, value)
        
        content.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(content)
        return content

    @staticmethod
    def update_status(db: Session, content_id: UUID, status: ContentStatus, reviewer_id: UUID = None, comments: str = None) -> Optional[Content]:
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            return None
        
        old_status = content.status
        content.status = status
        
        # Create review record if reviewer provided
        if reviewer_id and status in [ContentStatus.APPROVED, ContentStatus.REJECTED, ContentStatus.NEEDS_REVISION]:
            review = ContentReview(
                content_id=content.id,
                reviewer_id=reviewer_id,
                decision=status,
                comments=comments
            )
            db.add(review)
            
            if status == ContentStatus.APPROVED:
                content.verified = True
                content.verified_by = reviewer_id
                content.verified_at = datetime.utcnow()
        
        db.commit()
        db.refresh(content)
        return content

    @staticmethod
    def delete_content(db: Session, content_id: UUID) -> bool:
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            return False
        
        # Delete from storage
        if content.file_url:
            try:
                # Extract path from URL and delete
                pass
            except Exception as e:
                print(f"Failed to delete file: {e}")
        
        db.delete(content)
        db.commit()
        return True

    @staticmethod
    def upload_to_storage(file, folder: str = "content") -> str:
        """Upload file to Supabase Storage"""
        file_path = f"{folder}/{uuid.uuid4()}_{file.filename}"
        supabase_client.storage.from_("content").upload(file_path, file.file)
        public_url = supabase_client.storage.from_("content").get_public_url(file_path)
        return public_url