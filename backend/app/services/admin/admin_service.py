from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from uuid import UUID
from typing import Optional, List, Dict, Any

from backend.app.models.user import User
from backend.app.models.rbac import Role, Permission, RolePermission
from backend.app.models.content import Content, ContentStatus
from backend.app.models.channel import Channel
from backend.app.models.engagement import Like, Comment, Share, Download


class AdminService:
    
    @staticmethod
    def get_stats(db: Session) -> Dict[str, Any]:
        """Get dashboard statistics"""
        total_users = db.query(func.count(User.id)).scalar()
        active_users = db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar()
        total_channels = db.query(func.count(Channel.id)).scalar()
        active_channels = db.query(func.count(Channel.id)).filter(Channel.status == "active").scalar()
        total_content = db.query(func.count(Content.id)).scalar()
        published_content = db.query(func.count(Content.id)).filter(Content.status == ContentStatus.PUBLISHED).scalar()
        pending_review = db.query(func.count(Content.id)).filter(Content.status == ContentStatus.PENDING_REVIEW).scalar()

        return {
            "total_users": total_users,
            "active_users": active_users,
            "total_channels": total_channels,
            "active_channels": active_channels,
            "total_content": total_content,
            "published_content": published_content,
            "pending_review": pending_review,
        }
    
    @staticmethod
    def get_users(
        db: Session,
        search: Optional[str] = None,
        role: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Get all users with filters"""
        query = db.query(User)
        
        if search:
            query = query.filter(
                (User.full_name.ilike(f"%{search}%")) |
                (User.email.ilike(f"%{search}%")) |
                (User.username.ilike(f"%{search}%"))
            )
        if role:
            normalized_role = role.strip().lower().replace(" ", "_")
            query = query.filter(User.role == normalized_role)
        if status:
            is_active = status.lower() == "active"
            query = query.filter(User.is_active == is_active)
        
        total = query.count()
        users = query.order_by(User.created_at.desc()).limit(limit).offset(offset).all()
        
        return {
            "total": total,
            "users": users
        }
    
    @staticmethod
    def update_user_role(db: Session, user_id: UUID, role_name: str) -> Optional[User]:
        """Update user role"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        role = db.query(Role).filter(Role.name == role_name).first()
        if not role:
            return None
        
        user.role = role_name
        user.role_id = role.id
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def update_user_status(db: Session, user_id: UUID, is_active: bool) -> Optional[User]:
        """Activate/suspend user"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        user.is_active = is_active
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def get_content(
        db: Session,
        search: Optional[str] = None,
        content_type: Optional[str] = None,
        status: Optional[str] = None,
        channel_id: Optional[UUID] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Get all content with filters"""
        from backend.app.models.content import ContentType
        
        query = db.query(Content)
        
        if search:
            query = query.filter(
                (Content.title.ilike(f"%{search}%")) |
                (Content.description.ilike(f"%{search}%"))
            )
        if content_type:
            try:
                content_type_enum = ContentType(content_type.lower())
                query = query.filter(Content.content_type == content_type_enum)
            except ValueError:
                pass
        if status:
            try:
                status_enum = ContentStatus(status.lower())
                query = query.filter(Content.status == status_enum)
            except ValueError:
                pass
        if channel_id:
            query = query.filter(Content.channel_id == channel_id)
        
        total = query.count()
        items = query.order_by(Content.created_at.desc()).limit(limit).offset(offset).all()
        
        return {
            "total": total,
            "items": items
        }
    
    @staticmethod
    def delete_content(db: Session, content_id: UUID) -> bool:
        """Delete content (soft delete)"""
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            return False
        
        # Instead of hard delete, mark as archived/delete flag
        # Or use a status like 'deleted' if you have it
        db.delete(content)
        db.commit()
        return True
    
    @staticmethod
    def get_channels(
        db: Session,
        search: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Get all channels with filters"""
        query = db.query(Channel)
        
        if search:
            query = query.filter(
                (Channel.name.ilike(f"%{search}%")) |
                (Channel.description.ilike(f"%{search}%"))
            )
        if status:
            query = query.filter(Channel.status == status)
        
        total = query.count()
        channels = query.order_by(Channel.created_at.desc()).limit(limit).offset(offset).all()
        
        return {
            "total": total,
            "channels": channels
        }
    
    @staticmethod
    def update_channel_status(db: Session, channel_id: UUID, status: str) -> Optional[Channel]:
        """Enable/disable channel"""
        channel = db.query(Channel).filter(Channel.id == channel_id).first()
        if not channel:
            return None
        
        if status not in ["active", "inactive"]:
            return None
        
        channel.status = status
        db.commit()
        db.refresh(channel)
        return channel