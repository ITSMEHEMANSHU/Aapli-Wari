import requests
from sqlalchemy.orm import Session
from uuid import UUID
import time

from backend.app.core.config import LIBRETRANSLATE_URL
from backend.app.db.database import SessionLocal
from backend.app.models.content import Content


def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """Translate text using LibreTranslate"""
    if not text or not text.strip():
        return ""
    
    # Map language codes
    lang_map = {
        'mr': 'mr',   # Marathi
        'hi': 'hi',   # Hindi
        'en': 'en',   # English
        'sa': 'sa'    # Sanskrit
    }
    
    source = lang_map.get(source_lang, 'en')
    target = lang_map.get(target_lang, 'en')
    
    if source == target:
        return text
    
    try:
        response = requests.post(
            LIBRETRANSLATE_URL,
            json={
                'q': text,
                'source': source,
                'target': target,
                'format': 'text'
            },
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        return result.get('translatedText', text)
    except Exception as e:
        print(f"Translation failed: {e}")
        return text


def translate_content(content_id: UUID):
    """Translate content text into multiple languages"""
    db: Session = SessionLocal()
    
    try:
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            print(f"Content {content_id} not found")
            return
        
        # Get source language
        source_lang = content.language or 'mr'
        
        # Target languages
        targets = ['en', 'hi']  # English, Hindi
        
        translations = {}
        
        # Translate extracted_text (OCR output)
        if content.extracted_text:
            for target in targets:
                if target != source_lang:
                    translated = translate_text(content.extracted_text, source_lang, target)
                    if translated:
                        translations[target] = translated
                        time.sleep(0.5)  # Rate limit
        
        # Translate description
        if content.description:
            desc_translations = {}
            for target in targets:
                if target != source_lang:
                    translated = translate_text(content.description, source_lang, target)
                    if translated:
                        desc_translations[target] = translated
                        time.sleep(0.5)
            if desc_translations:
                translations['description'] = desc_translations
        
        # Save translations
        if translations:
            if not content.translations:
                content.translations = {}
            content.translations.update(translations)
            db.commit()
            print(f"✅ Translation complete for content {content_id}")
        
    except Exception as e:
        print(f"Translation error: {e}")
    finally:
        db.close()


def translate_content_sync(content_id: UUID):
    """Sync wrapper"""
    translate_content(content_id)