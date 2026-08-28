from sqlalchemy.orm import Session
from sqlalchemy import text, or_
from uuid import UUID
from typing import Optional, List, Dict, Any
import requests

from backend.app.core.config import OPENROUTER_API_KEY
from backend.app.models.content import Content, ContentStatus, ContentType


def embed_text(text: str) -> list:
    """Generate embedding using OpenRouter + BGE-M3"""
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


def hybrid_search(
    db: Session,
    query: str,
    content_type: Optional[str] = None,
    language: Optional[str] = None,
    channel_id: Optional[UUID] = None,
    verified_only: bool = True,
    limit: int = 20,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """
    Hybrid search combining:
    1. Keyword search (PostgreSQL full-text)
    2. Semantic search (pgvector similarity)
    """
    
    # Generate query embedding
    query_embedding = embed_text(query)
    
    # Build base filters
    filters = []
    
    # Only show published/verified content for public
    if verified_only:
        filters.append("verified = true")
        filters.append("status IN ('published', 'processed')")
    
    if content_type:
        filters.append(f"content_type = '{content_type}'")
    
    if language:
        filters.append(f"language = '{language}'")
    
    if channel_id:
        filters.append(f"channel_id = '{channel_id}'")
    elif verified_only:
        filters.append("channel_id IS NULL")
    
    filter_clause = " AND ".join(filters) if filters else "1=1"
    
    results = []
    
    # =========================================================
    # 1. KEYWORD SEARCH (PostgreSQL Full-Text)
    # =========================================================
    
    keyword_query = text(f"""
        SELECT 
            id,
            title,
            description,
            extracted_text,
            content_type,
            file_url,
            language,
            verified,
            status,
            user_id,
            channel_id,
            created_at,
            ts_rank(
                setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
                setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
                setweight(to_tsvector('english', coalesce(extracted_text, '')), 'C'),
                plainto_tsquery('english', :query)
            ) AS keyword_score
        FROM contents
        WHERE {filter_clause}
        AND (
            to_tsvector('english', coalesce(title, '')) @@ plainto_tsquery('english', :query)
            OR to_tsvector('english', coalesce(description, '')) @@ plainto_tsquery('english', :query)
            OR to_tsvector('english', coalesce(extracted_text, '')) @@ plainto_tsquery('english', :query)
            OR title ILIKE :like_query
            OR description ILIKE :like_query
            OR extracted_text ILIKE :like_query
        )
        ORDER BY keyword_score DESC
        LIMIT :limit
        OFFSET :offset
    """)
    
    keyword_results = db.execute(
        keyword_query,
        {
            'query': query,
            'like_query': f'%{query}%',
            'limit': limit,
            'offset': offset,
        }
    ).fetchall()
    
    keyword_ids = [str(r.id) for r in keyword_results]
    keyword_scores = {str(r.id): float(r.keyword_score) for r in keyword_results}
    
    # =========================================================
    # 2. SEMANTIC SEARCH (pgvector)
    # =========================================================
    
    semantic_results = []
    
    if query_embedding:
        # Format embedding for PostgreSQL
        embedding_str = '[' + ','.join(str(x) for x in query_embedding) + ']'
        
        semantic_query = text(f"""
            SELECT 
                id,
                title,
                description,
                extracted_text,
                content_type,
                file_url,
                language,
                verified,
                status,
                user_id,
                channel_id,
                created_at,
                1 - (embedding <=> CAST(:embedding AS vector)) AS semantic_score
            FROM contents
            WHERE {filter_clause}
            AND embedding IS NOT NULL
            ORDER BY embedding <=> CAST(:embedding AS vector)
            LIMIT :limit
            OFFSET :offset
        """)
        
        semantic_results = db.execute(
            semantic_query,
            {'embedding': embedding_str, 'limit': limit, 'offset': offset}
        ).fetchall()
        
        semantic_ids = [str(r.id) for r in semantic_results]
        semantic_scores = {str(r.id): float(r.semantic_score) for r in semantic_results}
    else:
        semantic_ids = []
        semantic_scores = {}
    
    # =========================================================
    # 3. COMBINE RESULTS (Hybrid)
    # =========================================================
    
    # Combine scores: 50% keyword, 50% semantic
    combined = {}
    
    # Add keyword results
    for id_val in keyword_ids:
        combined[id_val] = {
            'score': keyword_scores.get(id_val, 0) * 0.5,
            'has_keyword': True,
            'has_semantic': False
        }
    
    # Add semantic results
    for id_val in semantic_ids:
        if id_val in combined:
            combined[id_val]['score'] += semantic_scores.get(id_val, 0) * 0.5
            combined[id_val]['has_semantic'] = True
        else:
            combined[id_val] = {
                'score': semantic_scores.get(id_val, 0) * 0.5,
                'has_keyword': False,
                'has_semantic': True
            }
    
    # Sort by combined score
    sorted_ids = sorted(combined.keys(), key=lambda x: combined[x]['score'], reverse=True)
    
    # Get full content objects
    final_results = []
    for id_val in sorted_ids[:limit]:
        content = db.query(Content).filter(Content.id == UUID(id_val)).first()
        if content:
            result = {
                'id': str(content.id),
                'title': content.title,
                'description': content.description,
                'extracted_text': content.extracted_text[:500] if content.extracted_text else None,
                'content_type': content.content_type.value,
                'file_url': content.file_url,
                'language': content.language,
                'verified': content.verified,
                'status': content.status.value if content.status else None,
                'user_id': str(content.user_id) if content.user_id else None,
                'channel_id': str(content.channel_id) if content.channel_id else None,
                'created_at': content.created_at.isoformat() if content.created_at else None,
                'score': combined[id_val]['score'],
                'match_type': 'hybrid'
            }
            
            # Add match details
            if combined[id_val]['has_keyword'] and combined[id_val]['has_semantic']:
                result['match_type'] = 'both'
            elif combined[id_val]['has_keyword']:
                result['match_type'] = 'keyword'
            elif combined[id_val]['has_semantic']:
                result['match_type'] = 'semantic'
            
            final_results.append(result)
    
    return final_results