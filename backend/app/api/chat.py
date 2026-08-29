from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from backend.app.ai.rag.groq_service import groq_chat

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatMessage(BaseModel):
    role: str      # 'user' or 'assistant'
    content: str


class ChatRequest(BaseModel):
    query: str
    history: Optional[list[ChatMessage]] = None   # conversation history
    channel_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    sources: list


@router.post("", response_model=ChatResponse)
@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest):
    """Aapli Wari AI — answers only Wari/Palkhi related questions."""

    if not request.query or len(request.query.strip()) < 2:
        raise HTTPException(status_code=400, detail="Query too short.")

    # Convert history to plain dicts for groq_service
    history = (
        [{"role": m.role, "content": m.content} for m in request.history]
        if request.history else None
    )

    result = groq_chat(query=request.query, history=history)
    return ChatResponse(**result)
