import requests
from sqlalchemy.orm import Session
from uuid import UUID
import os
import mimetypes
import time
from urllib.parse import urlparse

from backend.app.core.config import OCR_SPACE_API_KEY
from backend.app.db.database import SessionLocal
from backend.app.models.content import Content
from backend.app.models.content import ContentStatus


def set_processed_status(content: Content) -> None:
    content.status = ContentStatus.PUBLISHED if content.verified else ContentStatus.PROCESSED


def get_file_extension_from_url(url: str) -> str:
    """Extract file extension from URL"""
    parsed = urlparse(url)
    path = parsed.path
    # Get extension from path
    if '.' in path:
        return path.split('.')[-1].lower()
    return None


def get_mime_type(content_type: str, file_ext: str) -> str:
    """Determine mime type from content type or extension"""
    # Map common extensions to mime types
    mime_map = {
        'pdf': 'application/pdf',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'bmp': 'image/bmp',
        'tiff': 'image/tiff',
        'tif': 'image/tiff',
        'webp': 'image/webp'
    }
    
    # First try to use the provided content_type
    if content_type and content_type in mime_map.values():
        return content_type
    
    # Then try from file extension
    if file_ext and file_ext in mime_map:
        return mime_map[file_ext]
    
    # Fallback - try mimetypes library
    if file_ext:
        mime = mimetypes.guess_type(f"file.{file_ext}")[0]
        if mime:
            return mime
    
    # Default fallback
    return 'application/octet-stream'


def get_file_type_from_extension(file_ext: str) -> str:
    """Get OCR.space filetype parameter from extension"""
    if file_ext:
        file_ext_lower = file_ext.lower()
        if file_ext_lower in ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp']:
            return file_ext_lower.upper()
        elif file_ext_lower == 'pdf':
            return 'PDF'
    return None


def get_extension_from_mime_type(mime_type: str, content_type: str) -> str:
    """Return a stable extension when the storage URL has no filename."""
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


def process_ocr(content_id: UUID):
    """
    Process OCR for a content item using OCR.space API
    Auto-detects file type from URL and content
    """
    db: Session = SessionLocal()
    
    try:
        # Get content
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            print(f"Content {content_id} not found")
            return
        
        # Only process images, PDFs, manuscripts
        if content.content_type.value not in ['image', 'pdf', 'manuscript']:
            print(f"Content {content_id} is not an image/PDF/manuscript")
            return
        
        # Check if file_url exists
        if not content.file_url:
            print(f"Content {content_id} has no file_url")
            return
        
        # Update status to processing
        content.status = ContentStatus.PROCESSING
        db.commit()
        
        # Auto-detect file extension from URL
        file_ext = get_file_extension_from_url(content.file_url)
        print(f"📁 Detected file extension: {file_ext}")
        
        # Download file from Appwrite
        try:
            headers = {}
            appwrite_project = os.getenv("APPWRITE_PROJECT_ID", "")
            if appwrite_project:
                headers['X-Appwrite-Project'] = appwrite_project
            
            file_response = requests.get(content.file_url, headers=headers, timeout=30)
            file_response.raise_for_status()
            
            # Get content type from response
            response_content_type = file_response.headers.get('content-type', '')
            print(f"📄 Response content-type: {response_content_type}")
            
        except Exception as e:
            print(f"Failed to download file: {e}")
            set_processed_status(content)
            db.commit()
            return
        
        # Appwrite view URLs do not contain the original filename. Use the
        # response MIME type and stored content type as authoritative sources.
        response_content_type = response_content_type.split(';', 1)[0].lower()
        if not file_ext:
            file_ext = get_extension_from_mime_type(response_content_type, content.content_type.value)
        mime_type = get_mime_type(response_content_type, file_ext)
        print(f"📋 Determined mime type: {mime_type}")
        
        # Determine filetype parameter for OCR.space
        filetype_param = get_file_type_from_extension(file_ext)
        if not filetype_param:
            filetype_param = get_file_type_from_extension(
                get_extension_from_mime_type(mime_type, content.content_type.value)
            )
        print(f"🏷️ OCR.space filetype: {filetype_param}")
        
        # Determine language
        language_map = {
            'mr': 'hin',
            'hi': 'hin',
            'en': 'eng',
            'sa': 'san'
        }
        language = language_map.get(content.language, 'eng')
        
        # Generate filename with proper extension
        filename = f"document.{file_ext if file_ext else 'png'}"
        
        # Build OCR.space request
        data_payload = {
            'language': language,
            'isOverlayRequired': 'false',
            'detectOrientation': 'true',
            'OCREngine': '2',
            'scale': 'true'
        }
        
        # Add filetype if detected (helps OCR.space)
        if filetype_param:
            data_payload['filetype'] = filetype_param
        
        # Retry transient OCR.space failures; uploads remain successful even
        # when the external OCR service is temporarily unavailable.
        result = None
        for attempt in range(3):
            try:
                response = requests.post(
                    'https://api.ocr.space/parse/image',
                    headers={'apikey': OCR_SPACE_API_KEY},
                    data=data_payload,
                    files={'file': (filename, file_response.content, mime_type)},
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
        
        # Extract text from response
        if result.get('OCRExitCode') in [1, 2]:
            parsed_results = result.get('ParsedResults', [])
            all_text = []
            for parsed in parsed_results:
                if parsed.get('ParsedText'):
                    all_text.append(parsed.get('ParsedText'))
            
            if all_text:
                content.extracted_text = '\n\n'.join(all_text)
                set_processed_status(content)
                print(f"✅ OCR complete for content {content_id}")
                print(f"📝 Extracted {len(all_text)} text chunks")
            else:
                print(f"OCR returned empty text for {content_id}")
                set_processed_status(content)
        else:
            error_message = result.get('ErrorMessage') or result.get('ErrorDetails') or 'Unknown error'
            print(
                f"OCR failed for {content_id}: "
                f"HTTP {response.status_code}, "
                f"OCRExitCode={result.get('OCRExitCode')}, "
                f"message={error_message}"
            )
            if result.get('ParsedResults'):
                print(f"OCR parsed results: {result['ParsedResults']}")
            set_processed_status(content)
        
        db.commit()

        if content.extracted_text:
            try:
                from backend.app.ai.translation import translate_content
                import threading
                thread = threading.Thread(target=translate_content, args=(content.id,))
                thread.daemon = True
                thread.start()
                print(f"🔄 Translation triggered for content {content.id}")
            except Exception as e:
                print(f"Failed to trigger translation: {e}")

        # After OCR and translation complete, trigger embeddings
        if content.extracted_text:
            try:
                from backend.app.ai.embeddings import generate_embeddings
                import threading
                thread = threading.Thread(target=generate_embeddings, args=(content.id,))
                thread.daemon = True
                thread.start()
                print(f"🔄 Embeddings triggered for content {content.id}")
            except Exception as e:
                print(f"Failed to trigger embeddings: {e}")
        
    except Exception as e:
        print(f"OCR processing error: {e}")
        try:
            set_processed_status(content)
            db.commit()
        except:
            pass
    finally:
        db.close()


def process_ocr_sync(content_id: UUID):
    """Sync wrapper for calling from API"""
    process_ocr(content_id)