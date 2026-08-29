import requests
from sqlalchemy.orm import Session
from uuid import UUID
import os
import time
from urllib.parse import urlparse

from backend.app.core.config import DEEPGRAM_API_KEY
from backend.app.db.database import SessionLocal
from backend.app.models.content import Content, ContentStatus


def set_processed_status(content: Content) -> None:
    """Match the public visibility logic used by OCR and other content pipelines."""
    content.status = ContentStatus.PUBLISHED if content.verified else ContentStatus.PROCESSED


def build_groq_audio_payload(file_url: str, file_content: bytes):
    """Build a valid audio payload for Groq Whisper. Appwrite URLs often end in view/download tokens instead of a real extension."""
    parsed = urlparse(file_url)
    path = parsed.path.lower()
    raw_ext = os.path.splitext(path)[1].lstrip('.')

    ext_map = {
        'mp3': ('audio.mp3', 'audio/mpeg'),
        'wav': ('audio.wav', 'audio/wav'),
        'm4a': ('audio.m4a', 'audio/mp4'),
        'aac': ('audio.aac', 'audio/aac'),
        'ogg': ('audio.ogg', 'audio/ogg'),
        'webm': ('audio.webm', 'audio/webm'),
        'flac': ('audio.flac', 'audio/flac'),
    }

    default_name = 'audio.mp3'
    default_mime = 'audio/mpeg'

    if raw_ext in ext_map:
        filename, mime_type = ext_map[raw_ext]
        return (filename, file_content, mime_type)

    # Fallback: prefer a valid MIME type when the URL is a storage view token.
    if file_content[:2] == b'RI':
        return ('audio.wav', file_content, 'audio/wav')
    if file_content[:4] == b'ID3' or file_content[:2] == b'\xff\xfb':
        return ('audio.mp3', file_content, 'audio/mpeg')
    if file_content[:4] == b'OggS':
        return ('audio.ogg', file_content, 'audio/ogg')

    return (default_name, file_content, default_mime)


def download_file(url: str) -> bytes:
    """Download file from Appwrite URL"""
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.content
    except Exception as e:
        raise Exception(f"Failed to download file: {e}")


def process_stt(content_id: UUID):
    """Process Speech-to-Text using Deepgram Nova."""
    db: Session = SessionLocal()

    try:
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            print(f"Content {content_id} not found")
            return

        if content.content_type.value not in ['audio', 'video']:
            print(f"Content {content_id} is not audio/video (type: {content.content_type.value})")
            return

        if not content.file_url:
            print(f"Content {content_id} has no file_url")
            return

        print(f"🎤 Starting STT for content {content_id}")
        content.status = ContentStatus.PROCESSING
        db.commit()

        file_content = download_file(content.file_url)

        lang_map = {
            'mr': 'mr',
            'mr-in': 'mr',
            'hi': 'hi',
            'en': 'en',
            'sa': 'hi',
        }
        language = lang_map.get(content.language, 'en')

        filename, payload_bytes, mime_type = build_groq_audio_payload(content.file_url, file_content)

        if not DEEPGRAM_API_KEY:
            raise ValueError("DEEPGRAM_API_KEY is not configured")

        headers = {
            'Authorization': f'Token {DEEPGRAM_API_KEY}',
            'Content-Type': mime_type,
        }
        params = {
            'model': 'nova-3',
            'language': language,
            'smart_format': 'true',
            'diarize': 'true',
        }

        print("📤 Sending to Deepgram...")
        response = requests.post(
            'https://api.deepgram.com/v1/listen',
            headers=headers,
            params=params,
            data=payload_bytes,
            timeout=120,
        )

        if response.status_code == 429:
            print("Rate limit exceeded. Waiting 30 seconds...")
            time.sleep(30)
            response = requests.post(
                'https://api.deepgram.com/v1/listen',
                headers=headers,
                params=params,
                data=payload_bytes,
                timeout=120,
            )

        response.raise_for_status()
        result = response.json()

        transcript = ''
        try:
            transcript = result['results']['channels'][0]['alternatives'][0]['transcript']
        except (KeyError, IndexError, TypeError):
            transcript = ''

        if transcript:
            content.transcription = transcript
            print(f"✅ STT complete for content {content_id}")
            print(f"📝 Transcription length: {len(transcript)} chars")
        else:
            print(f"⚠️ Empty transcription for content {content_id}")

        set_processed_status(content)
        db.commit()

    except requests.exceptions.RequestException as e:
        print(f"❌ Deepgram API error: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"Response: {e.response.text}")
        set_processed_status(content)
        db.commit()
    except Exception as e:
        print(f"❌ STT processing error: {e}")
        set_processed_status(content)
        db.commit()
    finally:
        db.close()


def process_stt_sync(content_id: UUID):
    """Sync wrapper for calling from API"""
    process_stt(content_id)