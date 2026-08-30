import json
import hashlib
from typing import Any, Optional

import redis

from backend.app.core.config import REDIS_URL

_cache_store = {}


def build_cache_key(prefix: str, **parts: Any) -> str:
    payload = json.dumps(parts, sort_keys=True, default=str)
    digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]
    return f"{prefix}:{digest}"


def _get_redis_client():
    if not REDIS_URL:
        return None
    try:
        client = redis.from_url(REDIS_URL, decode_responses=True)
        client.ping()
        return client
    except Exception:
        return None


def cache_get(key: str) -> Optional[Any]:
    client = _get_redis_client()
    if client is not None:
        try:
            value = client.get(key)
            if value is None:
                return None
            return json.loads(value)
        except Exception:
            pass

    if key in _cache_store:
        return _cache_store[key]
    return None


def cache_set(key: str, value: Any, ttl: int = 300) -> None:
    client = _get_redis_client()
    if client is not None:
        try:
            client.setex(key, ttl, json.dumps(value, default=str))
            return
        except Exception:
            pass

    _cache_store[key] = value
