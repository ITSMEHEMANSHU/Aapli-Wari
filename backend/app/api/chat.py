from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.app.ai.rag.groq_service import groq_chat
from backend.app.core.security import get_current_user_optional
from backend.app.core.supabase import supabase
from backend.app.models.user import User

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: Optional[str] = None
    created_at: Optional[str] = None


class ChatRequest(BaseModel):
    query: str
    history: Optional[List[ChatMessage]] = None  # conversation history
    channel_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    sources: list
    user_message: Optional[dict] = None
    assistant_message: Optional[dict] = None


@router.get("/history")
def get_history(current_user: Optional[User] = Depends(get_current_user_optional)):
    """Fetch stored AI chat history for the current user from Supabase."""
    if not current_user:
        return {"history": []}

    try:
        res = (
            supabase.table("chat_history")
            .select("*")
            .eq("user_id", str(current_user.id))
            .order("created_at", desc=False)
            .execute()
        )
        messages = res.data or []
        formatted = []
        for m in messages:
            created_dt = m.get("created_at")
            ts = ""
            if created_dt:
                try:
                    dt = datetime.fromisoformat(created_dt.replace("Z", "+00:00"))
                    ts = dt.strftime("%I:%M %p")
                except Exception:
                    ts = ""
            formatted.append(
                {
                    "id": m.get("id"),
                    "role": m.get("role"),
                    "content": m.get("content"),
                    "created_at": created_dt,
                    "timestamp": ts,
                }
            )
        return {"history": formatted}
    except Exception as e:
        print(f"[Chat History] Fetch error: {e}")
        return {"history": []}


@router.delete("/history")
def clear_history(current_user: Optional[User] = Depends(get_current_user_optional)):
    """Delete all AI chat history for the current user in Supabase."""
    if not current_user:
        return {"message": "No user session"}

    try:
        supabase.table("chat_history").delete().eq("user_id", str(current_user.id)).execute()
        return {"message": "Chat history cleared"}
    except Exception as e:
        print(f"[Chat History] Clear error: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear chat history")


@router.post("", response_model=ChatResponse)
@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest, current_user: Optional[User] = Depends(get_current_user_optional)):
    """Aapli Wari AI — answers Wari/Palkhi questions and persists history to Supabase."""

    if not request.query or len(request.query.strip()) < 2:
        raise HTTPException(status_code=400, detail="Query too short.")

    # Check query for toxic / offensive content via Vettly
    from backend.app.services.moderation import check_vettly

    vettly_res = check_vettly(request.query, content_type="text")
    if not vettly_res.get("allowed", True):
        return ChatResponse(
            answer="तुमचा प्रश्न सुरक्षा आणि समुदाय मार्गदर्शक तत्त्वांचे उल्लंघन करतो. कृपया आदरपूर्वक आणि वारीशी संबंधित प्रश्न विचारा. / Your question violates safety guidelines. Please ask respectfully and about Pandharpur Wari.",
            sources=[],
        )

    # Convert history to plain dicts for groq_service
    history = (
        [{"role": m.role, "content": m.content} for m in request.history]
        if request.history
        else None
    )

    result = groq_chat(query=request.query, history=history)
    answer_text = result.get("answer", "")

    # Save to Supabase chat_history if user is logged in
    user_msg_data = None
    assistant_msg_data = None

    if current_user:
        try:
            records = [
                {
                    "user_id": str(current_user.id),
                    "role": "user",
                    "content": request.query.strip(),
                },
                {
                    "user_id": str(current_user.id),
                    "role": "assistant",
                    "content": answer_text,
                },
            ]
            inserted = supabase.table("chat_history").insert(records).execute()
            if inserted.data and len(inserted.data) >= 2:
                user_msg_data = inserted.data[0]
                assistant_msg_data = inserted.data[1]
        except Exception as save_err:
            print(f"[Chat History] Failed to store messages: {save_err}")

    return ChatResponse(
        answer=answer_text,
        sources=result.get("sources", []),
        user_message=user_msg_data,
        assistant_message=assistant_msg_data,
    )
