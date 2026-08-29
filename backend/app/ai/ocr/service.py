import requests
from sqlalchemy.orm import Session
from uuid import UUID
import os
import mimetypes
import time
import io
from urllib.parse import urlparse

from backend.app.core.config import OCR_SPACE_API_KEY
from backend.app.db.database import SessionLocal
from backend.app.models.content import Content
from backend.app.models.content import ContentStatus

# OCR.space supported formats
OCR_SUPPORTED = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'pdf'}


def set_processed_status(content: Content) -> None:
    content.status = ContentStatus.PUBLISHED if content.verified else ContentStatus.PROCESSED


def get_file_extension_from_url(url: str) -> str:
    parsed = urlparse(url)
    path = parsed.path
    if '.' in path:
        return path.split('.')[-1].lower()
    return None


def get_extension_from_mime_type(mime_type: str, content_type: str) -> str:
    known_types = {
        'application/pdf': 'pdf',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/bmp': 'bmp',
        'image/tiff': 'tiff',
        'image/webp': 'webp',
    }
    return known_types.get(mime_type) or {
        'pdf': 'pdf',
        'image': 'png',
        'manuscript': 'pdf',
    }.get(content_type, 'png')


def convert_to_png_if_needed(file_bytes: bytes, file_ext: str) -> tuple:
    """
    Convert unsupported formats (webp, bmp, tiff) to PNG.
    Returns (bytes, ext, mime_type).
    """
    if file_ext in OCR_SUPPORTED and file_ext not in {'webp'}:
        mime_map = {
            'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
            'png': 'image/png', 'gif': 'image/gif',
            'bmp': 'image/bmp', 'tiff': 'image/tiff',
            'tif': 'image/tiff', 'pdf': 'application/pdf',
        }
        return file_bytes, file_ext, mime_map.get(file_ext, 'image/png')

    # Convert to PNG using PIL
    try:
        from PIL import Image
        img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        print(f"Converted {file_ext} -> PNG for OCR.space")
        return buf.getvalue(), 'png', 'image/png'
    except Exception as e:
        print(f"Image conversion failed: {e}, sending original")
        return file_bytes, file_ext, 'image/png'


def process_ocr(content_id: UUID):
    db: Session = SessionLocal()

    try:
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            print(f"Content {content_id} not found")
            return

        if content.content_type.value not in ['image', 'pdf', 'manuscript']:
            print(f"Content {content_id} is not an image/PDF/manuscript")
            return

        if not content.file_url:
            print(f"Content {content_id} has no file_url")
            return

        content.status = ContentStatus.PROCESSING
        db.commit()

        # Download file from Appwrite
        try:
            headers = {}
            appwrite_project = os.getenv("APPWRITE_PROJECT_ID", "")
            if appwrite_project:
                headers['X-Appwrite-Project'] = appwrite_project

            file_response = requests.get(content.file_url, headers=headers, timeout=30)
            file_response.raise_for_status()
            response_content_type = file_response.headers.get('content-type', '').split(';')[0].lower()
            print(f"Response content-type: {response_content_type}")
        except Exception as e:
            print(f"Failed to download file: {e}")
            set_processed_status(content)
            db.commit()
            return

        # Determine file extension
        file_ext = get_file_extension_from_url(content.file_url)
        if not file_ext:
            file_ext = get_extension_from_mime_type(response_content_type, content.content_type.value)
        print(f"Detected file extension: {file_ext}")

        # Convert unsupported formats to PNG
        file_bytes, file_ext, mime_type = convert_to_png_if_needed(file_response.content, file_ext)
        print(f"Final format for OCR: {file_ext} ({mime_type})")

        # Free OCR.space API only supports 'eng' language code.
        # Engine 1 with eng can still read Devanagari script.
        language = 'eng'

        filetype_param = file_ext.upper() if file_ext in OCR_SUPPORTED else 'PNG'

        data_payload = {
            'language': language,
            'isOverlayRequired': 'false',
            'detectOrientation': 'true',
            'OCREngine': '3',  # Engine 1 supports hin (Devanagari)
            'scale': 'true',
            'filetype': filetype_param,
        }

        # Send to OCR.space with retry
        result = None
        for attempt in range(3):
            try:
                response = requests.post(
                    'https://api.ocr.space/parse/image',
                    headers={'apikey': OCR_SPACE_API_KEY},
                    data=data_payload,
                    files={'file': (f"document.{file_ext}", file_bytes, mime_type)},
                    timeout=120
                )
                result = response.json()
                error_text = str(result.get('ErrorMessage', ''))
                is_transient = response.status_code >= 500 or 'E502' in error_text
                if not is_transient or attempt == 2:
                    break
                time.sleep(2 ** attempt)
            except (requests.exceptions.RequestException, ValueError) as e:
                if attempt == 2:
                    print(f"OCR.space API call failed: {e}")
                    set_processed_status(content)
                    db.commit()
                    return
                time.sleep(2 ** attempt)

        if result is None:
            set_processed_status(content)
            db.commit()
            return

        if result.get('OCRExitCode') in [1, 2]:
            all_text = [
                p.get('ParsedText', '')
                for p in result.get('ParsedResults', [])
                if p.get('ParsedText')
            ]
            if all_text:
                content.extracted_text = '\n\n'.join(all_text)
                set_processed_status(content)
                print(f"OCR complete for {content_id} — {len(content.extracted_text)} chars extracted")
            else:
                print(f"OCR returned empty text for {content_id}")
                set_processed_status(content)
        else:
            error_message = result.get('ErrorMessage') or result.get('ErrorDetails') or 'Unknown error'
            print(f"OCR failed for {content_id}: OCRExitCode={result.get('OCRExitCode')}, message={error_message}")
            set_processed_status(content)

        db.commit()

        if content.extracted_text:
            try:
                from backend.app.ai.translation import translate_content
                import threading
                threading.Thread(target=translate_content, args=(content.id,), daemon=True).start()
                print(f"Translation triggered for content {content.id}")
            except Exception as e:
                print(f"Failed to trigger translation: {e}")

            try:
                from backend.app.ai.embeddings import generate_embeddings
                import threading
                threading.Thread(target=generate_embeddings, args=(content.id,), daemon=True).start()
                print(f"Embeddings triggered for content {content.id}")
            except Exception as e:
                print(f"Failed to trigger embeddings: {e}")

    except Exception as e:
        print(f"OCR processing error: {e}")
        try:
            set_processed_status(content)
            db.commit()
        except Exception:
            pass
    finally:
        db.close()


def process_ocr_sync(content_id: UUID):
    process_ocr(content_id)
