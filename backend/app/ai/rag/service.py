import requests
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Dict, Any

from backend.app.core.config import OPENROUTER_API_KEY
from backend.app.db.database import SessionLocal
from backend.app.models.content import Content
from backend.app.services.search.search_service import hybrid_search
from backend.app.ai.rag.prompt import build_chat_prompt


def ask_question(
    query: str,
    channel_id: str = None,
    content_id: str = None,
    user_id: str = None,
    limit: int = 5
) -> Dict[str, Any]:
    """
    RAG pipeline: Search → Context → LLM → Answer
    """
    db: Session = SessionLocal()
    
    try:
        # Step 1: Search for relevant content
        search_results = hybrid_search(
            db=db,
            query=query,
            channel_id=channel_id,
            verified_only=True,
            limit=limit
        )
        
        if not search_results:
            return {
                "answer": "I couldn't find any relevant information about this in our knowledge base.",
                "sources": []
            }
        
        # Step 2: Build context from search results
        context_parts = []
        sources = []
        
        for idx, result in enumerate(search_results, 1):
            # Get full content
            content = db.query(Content).filter(Content.id == UUID(result['id'])).first()
            if not content:
                continue
            
            # Build context chunk
            text = ""
            if content.extracted_text:
                text += content.extracted_text[:1500]
            elif content.description:
                text += content.description
            elif content.title:
                text += content.title
            
            if text:
                context_parts.append(f"[Source {idx}] {content.title}\n{text}")
                sources.append({
                    "id": str(content.id),
                    "title": content.title,
                    "url": f"/content/{content.id}"
                })
        
        if not context_parts:
            return {"answer": "No text content found in search results.", "sources": []}
        
        context = "\n\n---\n\n".join(context_parts)
        
        # Step 3: Generate answer using LLM
        prompt = build_chat_prompt(query, context)
        
        response = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENROUTER_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'qwen/qwen-2.5-coder-32b-instruct',
                'messages': [
                    {'role': 'system', 'content': 'You are an AI assistant for Wari heritage.'},
                    {'role': 'user', 'content': prompt}
                ],
                'temperature': 0.7,
                'max_tokens': 500
            },
            timeout=60
        )
        response.raise_for_status()
        result = response.json()
        answer = result['choices'][0]['message']['content'].strip()
        
        return {
            "answer": answer,
            "sources": sources
        }
        
    except Exception as e:
        print(f"RAG error: {e}")
        return {
            "answer": "Sorry, I encountered an error. Please try again.",
            "sources": []
        }
    finally:
        db.close()


def ask_channel_question(query: str, channel_id: str) -> Dict[str, Any]:
    """Ask question limited to a specific channel"""
    return ask_question(query, channel_id=channel_id)


def ask_content_question(query: str, content_id: str) -> Dict[str, Any]:
    """Ask question about specific content"""
    db: Session = SessionLocal()
    try:
        content = db.query(Content).filter(Content.id == UUID(content_id)).first()
        if not content:
            return {"answer": "Content not found", "sources": []}
        
        # Get related content from same channel
        channel_id = str(content.channel_id) if content.channel_id else None
        
        return ask_question(query, channel_id=channel_id, content_id=content_id, limit=5)
    finally:
        db.close()