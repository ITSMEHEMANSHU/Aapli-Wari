from sqlalchemy.orm import Session
from sqlalchemy import or_
from uuid import UUID, uuid4
from typing import Optional, List
from datetime import datetime
import os

from appwrite.client import Client
from appwrite.services.storage import Storage
from appwrite.input_file import InputFile
from appwrite.exception import AppwriteException

from backend.app.models.content import Content, ContentStatus, ContentType, ContentVersion, ContentReview
from backend.app.models.user import User
from backend.app.models.channel import Channel
from backend.app.schemas.content import ContentCreate, ContentUpdate
from backend.app.core.config import (
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_API_KEY,
    APPWRITE_BUCKET_ID
)


class ContentService:
    @staticmethod
    def get_appwrite_client():
        """Initialize Appwrite client"""
        client = Client()
        client.set_endpoint(APPWRITE_ENDPOINT)
        client.set_project(APPWRITE_PROJECT_ID)
        client.set_key(APPWRITE_API_KEY)
        return client

    @staticmethod
    def create_content(db: Session, content_data: ContentCreate, user_id: UUID, file_url: str = None, file_obj=None) -> Content:
        """Create a new content entry"""
        if content_data.channel_id:
            channel = db.query(Channel).filter(Channel.id == content_data.channel_id).first()
            if not channel:
                raise ValueError("Channel not found")
        
        # Calculate file size
        file_size = None
        if file_obj:
            file_obj.file.seek(0, 2)
            file_size = file_obj.file.tell()
            file_obj.file.seek(0)
        
        # Channel contributors publish directly; public uploads follow review.
        is_public = not bool(content_data.channel_id)
        is_channel_post = bool(content_data.channel_id)
        
        content = Content(
            title=content_data.title,
            description=content_data.description,
            content_type=content_data.content_type,
            language=content_data.language,
            tags=content_data.tags or [],
            file_url=file_url,
            file_size=file_size,
            user_id=user_id,
            channel_id=content_data.channel_id,
            verified=is_public or is_channel_post,
            status=ContentStatus.PUBLISHED if is_public or is_channel_post else ContentStatus.PENDING_REVIEW,
        )
        
        try:
            db.add(content)
            db.commit()
        except Exception:
            db.rollback()
            raise
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
        else:
            query = query.filter(Content.channel_id.is_(None))
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
        
        version_count = db.query(ContentVersion).filter(ContentVersion.content_id == content.id).count()
        version = ContentVersion(
            content_id=content.id,
            version_number=version_count + 1,
            title=content.title,
            description=content.description,
            file_url=content.file_url,
            status=content.status,
            change_note=f"Updated by user {user_id}",
            created_by=user_id
        )
        db.add(version)
        
        for key, value in update_data.model_dump(exclude_unset=True).items():
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
        
        content.status = status
        
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
        
        if content.file_url:
            try:
                ContentService.delete_from_storage(content.file_url)
            except Exception as e:
                print(f"Failed to delete file: {e}")
        
        db.delete(content)
        db.commit()
        return True

    @staticmethod
    def upload_to_storage(file, folder: str = "content") -> str:
        """Upload file to Appwrite Storage"""
        
        client = ContentService.get_appwrite_client()
        storage = Storage(client)
        
        # Generate unique file ID
        file_id = str(uuid4())
        file_ext = file.filename.split('.')[-1] if '.' in file.filename else ''
        file_name = f"{folder}/{file_id}.{file_ext}"
        
        # Reset file pointer and read
        file.file.seek(0)
        file_content = file.file.read()
        
        # Upload to Appwrite
        try:
            result = storage.create_file(
                bucket_id=APPWRITE_BUCKET_ID,
                file_id=file_id,
                file=InputFile.from_bytes(
                    file_content,
                    filename=file_name,
                    mime_type=file.content_type
                )
            )
        except AppwriteException as e:
            raise Exception(f"Appwrite upload failed: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to upload to Appwrite: {str(e)}")
        
        # Public URL format for Appwrite
        public_url = f"{APPWRITE_ENDPOINT}/storage/buckets/{APPWRITE_BUCKET_ID}/files/{file_id}/view?project={APPWRITE_PROJECT_ID}"
        
        # Print for debugging
        print(f"✅ Uploaded file URL: {public_url}")
        
        return public_url

    @staticmethod
    def delete_from_storage(file_url: str) -> bool:
        """Delete file from Appwrite Storage"""
        try:
            # Extract file_id from URL
            # URL format: .../files/{file_id}/view?project=...
            file_id = file_url.split('/files/')[1].split('/view')[0]
            
            client = ContentService.get_appwrite_client()
            storage = Storage(client)
            
            storage.delete_file(
                bucket_id=APPWRITE_BUCKET_ID,
                file_id=file_id
            )
            return True
        except Exception as e:
            print(f"Failed to delete file from Appwrite: {e}")
            return False