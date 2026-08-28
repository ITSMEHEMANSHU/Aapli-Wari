import requests
from sqlalchemy.orm import Session
from uuid import UUID

from backend.app.core.config import OPENROUTER_API_KEY
from backend.app.db.database import SessionLocal
from backend.app.models.content import Content


def embed_text(text: str) -> list:
    """Generate embedding for a single text using OpenRouter + BGE-M3"""
    if not text or not text.strip():
        return None
    
    try:
        response = requests.post(
            'https://openrouter.ai/api/v1/embeddings',
            headers={
                'Authorization': f'Bearer {OPENROUTER_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'baai/bge-m3',
                'input': text[:10000]
            },
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        return result.get('data', [{}])[0].get('embedding')
    except Exception as e:
        print(f"Embedding generation failed: {e}")
        return None


def generate_embeddings(content_id: UUID):
    """Generate embeddings for content text"""
    db: Session = SessionLocal()
    
    try:
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            print(f"Content {content_id} not found")
            return
        
        # Collect text to embed
        texts = []
        
        if content.title:
            texts.append(content.title)
        if content.description:
            texts.append(content.description)
        if content.extracted_text:
            texts.append(content.extracted_text[:5000])
        
        if not texts:
            print(f"No text to embed for content {content_id}")
            return
        
        combined_text = ' '.join(texts)
        embedding = embed_text(combined_text)
        
        if embedding:
            # ✅ Proper SQLAlchemy assignment - works with Vector type
            content.embedding = embedding
            db.commit()
            print(f"✅ Embedding generated for content {content_id}")
        else:
            print(f"❌ Failed to generate embedding for content {content_id}")
        
    except Exception as e:
        print(f"Embedding generation error: {e}")
        db.rollback()
    finally:
        db.close()


def generate_embeddings_sync(content_id: UUID):
    """Sync wrapper"""
    generate_embeddings(content_id)