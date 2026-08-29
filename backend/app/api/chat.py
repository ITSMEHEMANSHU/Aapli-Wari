from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.ai.rag.service import ask_question, ask_channel_question

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    query: str
    channel_id: Optional[str] = None
    content_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    sources: list


@router.post("/", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Ask question to AI Assistant"""
    
    if not request.query or len(request.query.strip()) < 2:
        raise HTTPException(status_code=400, detail="Query must be at least 2 characters")
    
    result = ask_question(
        query=request.query,
        channel_id=request.channel_id,
        content_id=request.content_id,
        user_id=str(current_user.id) if current_user else None
    )
    
    return ChatResponse(**result)


@router.post("/channel/{channel_id}", response_model=ChatResponse)
def chat_channel(
    channel_id: str,
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Ask question scoped to a specific channel"""
    
    if not request.query or len(request.query.strip()) < 2:
        raise HTTPException(status_code=400, detail="Query must be at least 2 characters")
    
    result = ask_channel_question(request.query, channel_id)
    return ChatResponse(**result)