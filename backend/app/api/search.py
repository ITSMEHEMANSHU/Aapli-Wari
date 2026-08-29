from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from backend.app.db.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.services.search.search_service import hybrid_search

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/")
def search(
    q: str = Query(..., description="Search query"),
    content_type: Optional[str] = Query(None, description="Filter by content type"),
    language: Optional[str] = Query(None, description="Filter by language"),
    channel_id: Optional[UUID] = Query(None, description="Filter by channel"),
    verified_only: bool = Query(True, description="Show only verified content"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """
    Hybrid search across all content
    - Keyword search (PostgreSQL full-text)
    - Semantic search (pgvector)
    - Combined with ranking
    """
    
    if not q or len(q.strip()) < 2:
        raise HTTPException(status_code=400, detail="Search query must be at least 2 characters")
    
    # If user is not authenticated, only show public content
    if not current_user:
        verified_only = True
    
    results = hybrid_search(
        db=db,
        query=q,
        content_type=content_type,
        language=language,
        channel_id=channel_id,
        verified_only=verified_only,
        limit=limit,
        offset=offset
    )
    
    return {
        "query": q,
        "count": len(results),
        "results": results
    }