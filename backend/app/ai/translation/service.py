from uuid import UUID
from sqlalchemy.orm import Session

from backend.app.db.database import SessionLocal
from backend.app.models.content import Content
from backend.app.ai.translation.nllb import translate_with_cache


def translate_content(content_id: UUID):
    db: Session = SessionLocal()
    try:
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            print(f"Content {content_id} not found")
            return

        src_lang = content.language or "mr"
        translations = {"description": {}}

        if content.extracted_text:
            translations["en"] = translate_with_cache(content.extracted_text, src_lang, "en")
            translations["hi"] = translate_with_cache(content.extracted_text, src_lang, "hi")

        if content.description:
            translations["description"]["en"] = translate_with_cache(content.description, src_lang, "en")
            translations["description"]["hi"] = translate_with_cache(content.description, src_lang, "hi")

        content.translations = translations
        db.commit()
        print(f"Translation complete for content {content_id}")

    except Exception as e:
        db.rollback()
        print(f"Translation error for {content_id}: {e}")
        raise
    finally:
        db.close()


def translate_content_sync(content_id: UUID):
    translate_content(content_id)
