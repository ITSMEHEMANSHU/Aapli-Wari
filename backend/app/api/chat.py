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

    # ── Check query for toxic / offensive content via Vettly ──
    from backend.app.services.moderation import check_vettly
    vettly_res = check_vettly(request.query, content_type="text")
    if not vettly_res.get("allowed", True):
        return ChatResponse(
            answer="तुमचा प्रश्न सुरक्षा आणि समुदाय मार्गदर्शक तत्त्वांचे उल्लंघन करतो. कृपया आदरपूर्वक आणि वारीशी संबंधित प्रश्न विचारा. / Your question violates safety guidelines. Please ask respectfully and about Pandharpur Wari.",
            sources=[]
        )

    # Convert history to plain dicts for groq_service
    history = (
        [{"role": m.role, "content": m.content} for m in request.history]
        if request.history else None
    )

    result = groq_chat(query=request.query, history=history)
    return ChatResponse(**result)
