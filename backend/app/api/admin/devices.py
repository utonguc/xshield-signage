"""
Device CRUD + live status via WebSocket registry.
"""
import secrets
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.admin.deps import get_current_admin
from app.db.session import get_db
from app.db.models import Device, Playlist
from app.ws.registry import ws_registry

router = APIRouter(tags=["devices"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class DeviceCreate(BaseModel):
    name:        str
    location:    Optional[str] = None
    description: Optional[str] = None
    orientation: str = "landscape"

class DeviceUpdate(BaseModel):
    name:                Optional[str] = None
    location:            Optional[str] = None
    description:         Optional[str] = None
    orientation:         Optional[str] = None
    current_playlist_id: Optional[str] = None

class DeviceOut(BaseModel):
    id:                  str
    name:                str
    location:            Optional[str]
    description:         Optional[str]
    api_key:             str
    status:              str
    last_seen:           Optional[datetime]
    current_playlist_id: Optional[str]
    orientation:         str
    resolution:          Optional[str]
    created_at:          datetime

    model_config = {"from_attributes": True}


def _device_out(d: Device) -> dict:
    return {
        "id":                  str(d.id),
        "name":                d.name,
        "location":            d.location,
        "description":         d.description,
        "api_key":             d.api_key,
        "status":              "online" if str(d.id) in ws_registry else "offline",
        "last_seen":           d.last_seen,
        "current_playlist_id": str(d.current_playlist_id) if d.current_playlist_id else None,
        "orientation":         d.orientation,
        "resolution":          d.resolution,
        "created_at":          d.created_at,
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/devices")
def list_devices(db: Session = Depends(get_db), _=Depends(get_current_admin)):
    return [_device_out(d) for d in db.query(Device).order_by(Device.created_at).all()]


@router.post("/devices", status_code=201)
def create_device(body: DeviceCreate, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    device = Device(
        name=body.name,
        location=body.location,
        description=body.description,
        orientation=body.orientation,
        api_key=secrets.token_urlsafe(32),
    )
    db.add(device)
    db.commit()
    db.refresh(device)
    return _device_out(device)


@router.get("/devices/{device_id}")
def get_device(device_id: str, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    d = db.query(Device).filter(Device.id == device_id).first()
    if not d:
        raise HTTPException(404, "Device not found")
    return _device_out(d)


@router.put("/devices/{device_id}")
def update_device(device_id: str, body: DeviceUpdate,
                  db: Session = Depends(get_db), _=Depends(get_current_admin)):
    d = db.query(Device).filter(Device.id == device_id).first()
    if not d:
        raise HTTPException(404, "Device not found")
    if body.name        is not None: d.name        = body.name
    if body.location    is not None: d.location    = body.location
    if body.description is not None: d.description = body.description
    if body.orientation is not None: d.orientation = body.orientation
    if body.current_playlist_id is not None:
        if body.current_playlist_id == "":
            d.current_playlist_id = None
        else:
            pl = db.query(Playlist).filter(Playlist.id == body.current_playlist_id).first()
            if not pl:
                raise HTTPException(404, "Playlist not found")
            d.current_playlist_id = pl.id
    db.commit()
    db.refresh(d)
    # Push playlist update to connected device immediately
    if str(d.id) in ws_registry and d.current_playlist_id:
        import asyncio
        from app.ws.handler import build_playlist_payload
        payload = build_playlist_payload(db, d)
        asyncio.create_task(ws_registry[str(d.id)].send_json(payload))
    return _device_out(d)


@router.delete("/devices/{device_id}", status_code=204)
def delete_device(device_id: str, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    d = db.query(Device).filter(Device.id == device_id).first()
    if not d:
        raise HTTPException(404, "Device not found")
    db.delete(d)
    db.commit()


@router.post("/devices/{device_id}/push")
async def push_playlist(device_id: str, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    """Force-push current playlist to device via WebSocket."""
    d = db.query(Device).filter(Device.id == device_id).first()
    if not d:
        raise HTTPException(404, "Device not found")
    ws = ws_registry.get(str(d.id))
    if not ws:
        raise HTTPException(400, "Device is offline")
    from app.ws.handler import build_playlist_payload
    await ws.send_json(build_playlist_payload(db, d))
    return {"ok": True}


@router.post("/devices/{device_id}/regenerate-key")
def regenerate_api_key(device_id: str, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    d = db.query(Device).filter(Device.id == device_id).first()
    if not d:
        raise HTTPException(404, "Device not found")
    d.api_key = secrets.token_urlsafe(32)
    db.commit()
    return {"api_key": d.api_key}
