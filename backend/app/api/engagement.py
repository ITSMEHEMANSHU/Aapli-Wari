from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from backend.app.core.security import bearer_scheme, get_current_user
from backend.app.db.database import get_db
from backend.app.models.content import Content
from backend.app.models.engagement import Comment, Download, Like, Share
from backend.app.models.user import User
from backend.app.schemas.engagement import CommentCreate, CommentResponse, LikeResponse, ShareRequest

router = APIRouter(prefix="/engagement", tags=["engagement"])


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if credentials is None:
        return None
    return get_current_user(credentials=credentials, db=db)


def _content_or_404(db: Session, content_id: UUID) -> Content:
    content = db.get(Content, content_id)
    if content is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    return content


@router.post("/content/{content_id}/like", response_model=LikeResponse)
def toggle_like(content_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _content_or_404(db, content_id)
    existing_like = db.get(Like, (current_user.id, content_id))
    if existing_like:
        db.delete(existing_like)
        is_liked = False
    else:
        db.add(Like(user_id=current_user.id, content_id=content_id))
        is_liked = True
    db.commit()
    likes_count = db.query(func.count()).select_from(Like).filter(Like.content_id == content_id).scalar()
    return LikeResponse(is_liked=is_liked, likes_count=likes_count)


@router.get("/content/{content_id}/comments", response_model=list[CommentResponse])
def get_comments(content_id: UUID, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    _content_or_404(db, content_id)
    if skip < 0 or not 1 <= limit <= 100:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid pagination values")
    return (db.query(Comment).options(joinedload(Comment.user))
        .filter(Comment.content_id == content_id, Comment.parent_id.is_(None))
        .order_by(Comment.created_at.asc()).offset(skip).limit(limit).all())


@router.post("/content/{content_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(content_id: UUID, comment_data: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _content_or_404(db, content_id)
    text = comment_data.text.strip()
    if not text:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Comment text cannot be blank")
    if comment_data.parent_id:
        parent = db.get(Comment, comment_data.parent_id)
        if parent is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent comment not found")
        if parent.content_id != content_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Parent comment belongs to different content")
    comment = Comment(user_id=current_user.id, content_id=content_id, text=text, parent_id=comment_data.parent_id)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.delete("/comment/{comment_id}")
def delete_comment(comment_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    comment = db.get(Comment, comment_id)
    if comment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this comment")
    db.delete(comment)
    db.commit()
    return {"success": True, "message": "Comment deleted"}


@router.post("/content/{content_id}/share")
def track_share(content_id: UUID, share_data: Optional[ShareRequest] = None, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    _content_or_404(db, content_id)
    db.add(Share(user_id=current_user.id if current_user else None, content_id=content_id, platform=share_data.platform if share_data else None))
    db.commit()
    shares_count = db.query(func.count()).select_from(Share).filter(Share.content_id == content_id).scalar()
    return {"success": True, "shares_count": shares_count}


@router.get("/content/{content_id}/download")
def track_download(content_id: UUID, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    content = _content_or_404(db, content_id)
    if not content.file_url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not available")
    db.add(Download(user_id=current_user.id if current_user else None, content_id=content_id))
    db.commit()
    downloads_count = db.query(func.count()).select_from(Download).filter(Download.content_id == content_id).scalar()
    return {"success": True, "file_url": content.file_url, "downloads_count": downloads_count}
