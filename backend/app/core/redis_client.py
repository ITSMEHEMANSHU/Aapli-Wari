"""
Upstash Redis Client
--------------------
Uses the upstash-redis HTTP REST client — works perfectly with Upstash's
serverless Redis without needing a persistent TCP socket connection.

Install: pip install upstash-redis
"""

import os
from upstash_redis import Redis

_redis: Redis | None = None


def get_redis() -> Redis:
    global _redis
    if _redis is None:
        url   = os.getenv("UPSTASH_REDIS_REST_URL")
        token = os.getenv("UPSTASH_REDIS_REST_TOKEN")

        if not url or not token:
            raise RuntimeError(
                "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN "
                "must be set in your .env file."
            )
        _redis = Redis(url=url, token=token)
    return _redis


# ── Key helpers ───────────────────────────────────────────────────────────────

def palkhi_location_key(channel_id: str) -> str:
    """Current live location of a palkhi — expires after 5 minutes."""
    return f"palkhi:location:{channel_id}"


def palkhi_trail_key(channel_id: str) -> str:
    """Last 10 GPS points — used to draw a route trail on the map."""
    return f"palkhi:trail:{channel_id}"


# TTL in seconds
LOCATION_TTL = 300   # 5 minutes — if no update, marker disappears
TRAIL_MAX    = 10    # keep only the last 10 points in the trail


def store_location(channel_id: str, lat: float, lng: float,
                   pramukh_name: str = "", timestamp: str = "") -> None:
    """
    Write the latest GPS point to Redis.
    - Overwrites the current location key (TTL reset to 5 min).
    - Prepends to the trail list and trims to the last 10 points.
    """
    r   = get_redis()
    key = palkhi_location_key(channel_id)

    import json, datetime
    payload = {
        "lat":          lat,
        "lng":          lng,
        "pramukh_name": pramukh_name,
        "timestamp":    timestamp or datetime.datetime.utcnow().isoformat(),
        "channel_id":   channel_id,
    }

    # Store current location with TTL
    r.set(key, json.dumps(payload), ex=LOCATION_TTL)

    # Append to trail list
    trail_key = palkhi_trail_key(channel_id)
    r.lpush(trail_key, json.dumps({"lat": lat, "lng": lng, "ts": payload["timestamp"]}))
    r.ltrim(trail_key, 0, TRAIL_MAX - 1)
    r.expire(trail_key, LOCATION_TTL)


def get_location(channel_id: str) -> dict | None:
    """Return the latest location dict or None if expired / not started."""
    import json
    r   = get_redis()
    raw = r.get(palkhi_location_key(channel_id))
    if raw is None:
        return None
    return json.loads(raw) if isinstance(raw, str) else raw


def get_trail(channel_id: str) -> list[dict]:
    """Return the last N location points as a list (newest first)."""
    import json
    r    = get_redis()
    raw  = r.lrange(palkhi_trail_key(channel_id), 0, TRAIL_MAX - 1)
    if not raw:
        return []
    result = []
    for item in raw:
        try:
            result.append(json.loads(item) if isinstance(item, str) else item)
        except Exception:
            pass
    return result


def delete_location(channel_id: str) -> None:
    """Manually stop sharing — remove both keys immediately."""
    r = get_redis()
    r.delete(palkhi_location_key(channel_id))
    r.delete(palkhi_trail_key(channel_id))
