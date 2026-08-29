from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from backend.app.core.security import authorize_request
from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.schemas.admin import (
    StatsResponse,
    UsersResponse,
    RoleUpdateRequest,
    StatusUpdateRequest,
    ChannelStatusUpdateRequest,
    UserListResponse,
)
from backend.app.services.admin.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["Administration"])


@router.get("/stats", response_model=StatsResponse)
def get_admin_stats(
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    """Get admin dashboard statistics"""
    # Only admin can access
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return AdminService.get_stats(db)


@router.get("/users", response_model=UsersResponse)
def get_users(
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    """Get all users with filters"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return AdminService.get_users(db, search, role, status, limit, offset)


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: UUID,
    data: RoleUpdateRequest,
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    """Update user role"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = AdminService.update_user_role(db, user_id, data.role)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User role updated successfully", "user": user}


@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: UUID,
    data: StatusUpdateRequest,
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    """Activate or suspend user"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = AdminService.update_user_status(db, user_id, data.is_active)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    status_text = "activated" if data.is_active else "suspended"
    return {"message": f"User {status_text} successfully", "user": user}


@router.get("/content")
def get_all_content(
    search: Optional[str] = Query(None),
    content_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    channel_id: Optional[UUID] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    """Get all content with filters (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return AdminService.get_content(db, search, content_type, status, channel_id, limit, offset)


@router.delete("/content/{content_id}")
def delete_content_admin(
    content_id: UUID,
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    """Delete content (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    deleted = AdminService.delete_content(db, content_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Content not found")
    
    return {"message": "Content deleted successfully"}


@router.get("/channels")
def get_all_channels(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    """Get all channels with filters (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return AdminService.get_channels(db, search, status, limit, offset)


@router.patch("/channels/{channel_id}/status")
def update_channel_status(
    channel_id: UUID,
    data: ChannelStatusUpdateRequest,
    current_user: User = Depends(authorize_request),
    db: Session = Depends(get_db),
):
    """Enable or disable channel"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    channel = AdminService.update_channel_status(db, channel_id, data.status)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    return {"message": f"Channel {data.status} successfully", "channel": channel}