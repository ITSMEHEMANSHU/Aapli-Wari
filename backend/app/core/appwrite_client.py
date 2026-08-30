import uuid
import requests
from backend.app.core.config import (
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_API_KEY,
)


def upload_file_to_appwrite(bucket_id: str, file_bytes: bytes, filename: str, content_type: str) -> str:
    """Upload a file to Appwrite storage and return the fileId.

    Returns fileId string on success, raises Exception on failure.
    """
    if not APPWRITE_ENDPOINT or not APPWRITE_PROJECT_ID or not APPWRITE_API_KEY:
        raise Exception("Appwrite not configured")

    url = f"{APPWRITE_ENDPOINT.rstrip('/')}/storage/buckets/{bucket_id}/files"
    headers = {
        "X-Appwrite-Project": APPWRITE_PROJECT_ID,
        "X-Appwrite-Key": APPWRITE_API_KEY,
    }
    file_id = str(uuid.uuid4())
    data = {
        "fileId": file_id,
    }
    files = {
        'file': (filename, file_bytes, content_type),
    }
    resp = requests.post(url, headers=headers, data=data, files=files)
    if resp.status_code not in (200, 201):
        raise Exception(f"Appwrite upload failed: {resp.status_code} {resp.text}")
    resp_data = resp.json()
    return resp_data.get('$id') or resp_data.get('id') or file_id