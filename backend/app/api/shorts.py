from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List

from backend.app.db.database import get_db
from backend.app.core.security import get_current_user_optional
from backend.app.models.user import User
from backend.app.services.shorts.shorts_service import get_shorts, get_short_details

router = APIRouter(prefix="/shorts", tags=["Shorts"])


@router.get("/")
def list_shorts(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    content_type: Optional[str] = Query(None, description="Filter by content type"),
    db: Session = Depends(get_db),
    _: Optional[User] = Depends(get_current_user_optional),
):
    """Get list of short-form content for Aapla Theva"""
    results = get_shorts(db, limit=limit, offset=offset, content_type=content_type)
    return {
        "count": len(results),
        "results": results
    }


@router.get("/{short_id}")
def get_short(
    short_id: UUID,
    db: Session = Depends(get_db),
    _: Optional[User] = Depends(get_current_user_optional),
):
    """Get single short content details"""
    result = get_short_details(db, short_id)
    if not result:
        raise HTTPException(status_code=404, detail="Short not found")
    return result       