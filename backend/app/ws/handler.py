"""
WebSocket endpoint for device agents.

Connection:  ws://<host>/ws/device/{device_id}?key=<api_key>
Protocol:
  agent → server : {"type": "heartbeat", "resolution": "1920x1080"}
  server → agent : {"type": "playlist", "items": [...], "public_url": "..."}
  server → agent : {"type": "reload"}   # force browser refresh
  server → agent : {"type": "ping"}
"""
import json
import logging
from datetime import datetime

from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.db.models import Device, PlaylistItem
from app.db.session import SessionLocal
from app.ws.registry import ws_registry

log = logging.getLogger(__name__)


def build_playlist_payload(db: Session, device: Device) -> dict:
    if not device.current_playlist_id:
        return {"type": "playlist", "items": []}

    items = (
        db.query(PlaylistItem)
        .filter(PlaylistItem.playlist_id == device.current_playlist_id)
        .order_by(PlaylistItem.order_index)
        .all()
    )
    return {
        "type": "playlist",
        "items": [
            {
                "id":        str(item.content.id),
                "name":      item.content.name,
                "file_type": item.content.file_type,
                "url":       f"/media/{item.content.file_path}",
                "duration":  item.duration,
                "order":     item.order_index,
            }
            for item in items
        ],
    }


async def device_ws_endpoint(websocket: WebSocket, device_id: str):
    db = SessionLocal()
    try:
        device = db.query(Device).filter(Device.id == device_id).first()
        if not device:
            await websocket.close(code=4004)
            return

        # Validate API key from query params
        api_key = websocket.query_params.get("key", "")
        if api_key != device.api_key:
            await websocket.close(code=4001)
            return

        await websocket.accept()
        ws_registry[device_id] = websocket
        device.status    = "online"
        device.last_seen = datetime.utcnow()
        db.commit()
        log.info("Device connected: %s (%s)", device.name, device_id)

        # Send current playlist immediately on connect
        await websocket.send_json(build_playlist_payload(db, device))

        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)

            if msg.get("type") == "heartbeat":
                device.last_seen = datetime.utcnow()
                if msg.get("resolution"):
                    device.resolution = msg["resolution"]
                db.commit()
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        log.info("Device disconnected: %s", device_id)
    finally:
        ws_registry.pop(device_id, None)
        device = db.query(Device).filter(Device.id == device_id).first()
        if device:
            device.status = "offline"
            db.commit()
        db.close()
