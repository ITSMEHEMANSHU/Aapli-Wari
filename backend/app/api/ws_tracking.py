"""
WebSocket Live Palkhi Tracking
-------------------------------
Two endpoints:

1. ws://host/ws/track/{channel_id}/send
   - Palkhi Pramukh connects here to SEND location updates.
   - Auth: JWT token passed as ?token=... query param.
   - Sends: { lat, lng } every 60 seconds from the frontend.
   - Server stores in Redis + broadcasts to all subscribers.

2. ws://host/ws/track/{channel_id}/subscribe
   - Channel followers connect here to RECEIVE live location.
   - No auth required (channel is public to followers).
   - Receives: { lat, lng, timestamp, pramukh_name } on every update.
"""

import json
import asyncio
from typing import Dict, Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from backend.app.core.redis_client import store_location, get_location, get_trail, delete_location
from backend.app.core.supabase import supabase

router = APIRouter(tags=["Live Tracking"])

# ── In-memory subscriber registry ─────────────────────────────────────────────
# Maps channel_id → set of active subscriber WebSockets
_subscribers: Dict[str, Set[WebSocket]] = {}


def _add_subscriber(channel_id: str, ws: WebSocket) -> None:
    if channel_id not in _subscribers:
        _subscribers[channel_id] = set()
    _subscribers[channel_id].add(ws)


def _remove_subscriber(channel_id: str, ws: WebSocket) -> None:
    if channel_id in _subscribers:
        _subscribers[channel_id].discard(ws)


async def _broadcast(channel_id: str, payload: dict) -> None:
    """Push a location update to every active subscriber for this channel."""
    dead: Set[WebSocket] = set()
    for ws in list(_subscribers.get(channel_id, [])):
        try:
            await ws.send_text(json.dumps(payload))
        except Exception:
            dead.add(ws)
    for ws in dead:
        _remove_subscriber(channel_id, ws)


# ── Helper: verify JWT token via Supabase ─────────────────────────────────────
def _get_user_from_token(token: str):
    try:
        resp = supabase.auth.get_user(token)
        return resp.user
    except Exception:
        return None


# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINT 1 — Palkhi Pramukh sends location
# ═════════════════════════════════════════════════════════════════════════════
@router.websocket("/ws/track/{channel_id}/send")
async def send_location(
    websocket: WebSocket,
    channel_id: str,
    token: str = Query(..., description="Supabase JWT access token"),
):
    """
    The Palkhi Pramukh connects here and sends:
        { "lat": 17.68, "lng": 75.32 }
    every ~60 seconds from the frontend.
    """
    # Verify token before accepting connection
    user = _get_user_from_token(token)
    if user is None:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    await websocket.accept()
    pramukh_name = user.user_metadata.get("full_name") or user.email or "Palkhi Pramukh"

    try:
        await websocket.send_text(json.dumps({
            "type":    "connected",
            "message": f"Location sharing started for channel {channel_id}",
        }))

        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type":    "error",
                    "message": "Invalid JSON. Send { lat, lng }",
                }))
                continue

            lat = data.get("lat")
            lng = data.get("lng")

            if lat is None or lng is None:
                await websocket.send_text(json.dumps({
                    "type":    "error",
                    "message": "Missing lat or lng",
                }))
                continue

            # Validate coordinates
            if not (-90 <= float(lat) <= 90) or not (-180 <= float(lng) <= 180):
                await websocket.send_text(json.dumps({
                    "type":    "error",
                    "message": "Coordinates out of range",
                }))
                continue

            import datetime
            ts = datetime.datetime.utcnow().isoformat()

            # Store in Upstash Redis (TTL 5 min)
            store_location(
                channel_id=channel_id,
                lat=float(lat),
                lng=float(lng),
                pramukh_name=pramukh_name,
                timestamp=ts,
            )

            # Broadcast to all subscribers of this channel
            broadcast_payload = {
                "type":          "location_update",
                "channel_id":    channel_id,
                "lat":           float(lat),
                "lng":           float(lng),
                "pramukh_name":  pramukh_name,
                "timestamp":     ts,
            }
            await _broadcast(channel_id, broadcast_payload)

            # Acknowledge back to sender
            await websocket.send_text(json.dumps({
                "type":      "ack",
                "lat":       float(lat),
                "lng":       float(lng),
                "timestamp": ts,
            }))

    except WebSocketDisconnect:
        # Pramukh stopped sharing — location will expire via Redis TTL
        pass


# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINT 2 — Channel followers subscribe to live location
# ═════════════════════════════════════════════════════════════════════════════
@router.websocket("/ws/track/{channel_id}/subscribe")
async def subscribe_location(websocket: WebSocket, channel_id: str):
    """
    Channel followers connect here to receive live location pushes.
    On connect, immediately sends the last known location from Redis.
    Then receives pushes every time the Pramukh sends an update.
    """
    await websocket.accept()
    _add_subscriber(channel_id, websocket)

    try:
        # Send last known location immediately so the map shows
        # the marker even before the next 60-second update
        last = get_location(channel_id)
        trail = get_trail(channel_id)

        if last:
            await websocket.send_text(json.dumps({
                "type":  "location_update",
                **last,
                "trail": trail,
            }))
        else:
            await websocket.send_text(json.dumps({
                "type":    "no_location",
                "message": "Palkhi has not started sharing location yet.",
            }))

        # Keep connection alive — wait for client to disconnect
        while True:
            try:
                # Ping every 30s to keep the connection alive
                await asyncio.wait_for(websocket.receive_text(), timeout=30)
            except asyncio.TimeoutError:
                # Send a heartbeat so the client knows we are alive
                await websocket.send_text(json.dumps({"type": "ping"}))

    except WebSocketDisconnect:
        pass
    finally:
        _remove_subscriber(channel_id, websocket)


# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINT 3 — REST fallback: GET current location
# ═════════════════════════════════════════════════════════════════════════════
@router.get("/tracking/{channel_id}/location")
def get_current_location(channel_id: str):
    """
    REST fallback for browsers that cannot use WebSocket.
    Returns the latest location from Redis or null if expired.
    """
    location = get_location(channel_id)
    trail    = get_trail(channel_id)

    if location is None:
        return {"active": False, "location": None, "trail": []}

    return {
        "active":   True,
        "location": location,
        "trail":    trail,
    }


# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINT 4 — Stop sharing (DELETE — Pramukh manually stops)
# ═════════════════════════════════════════════════════════════════════════════
@router.delete("/tracking/{channel_id}/location")
def stop_sharing(
    channel_id: str,
    token: str = Query(...),
):
    user = _get_user_from_token(token)
    if user is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Unauthorized")

    delete_location(channel_id)
    return {"message": "Location sharing stopped."}
