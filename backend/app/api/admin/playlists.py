from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.admin.deps import get_current_admin
from app.db.session import get_db
from app.db.models import Playlist, PlaylistItem, Content

router = APIRouter(tags=["playlists"])


class PlaylistCreate(BaseModel):
    name: str

class ItemAdd(BaseModel):
    content_id:  str
    duration:    int = 10       # seconds
    order_index: Optional[int] = None

class ItemUpdate(BaseModel):
    duration:    Optional[int] = None
    order_index: Optional[int] = None


def _playlist_out(p: Playlist) -> dict:
    return {
        "id":         str(p.id),
        "name":       p.name,
        "created_at": p.created_at,
        "items": [
            {
                "id":          str(i.id),
                "order_index": i.order_index,
                "duration":    i.duration,
                "content": {
                    "id":        str(i.content.id),
                    "name":      i.content.name,
                    "file_type": i.content.file_type,
                    "file_path": i.content.file_path,
                    "width":     i.content.width,
                    "height":    i.content.height,
                },
            }
            for i in p.items
        ],
    }


@router.get("/playlists")
def list_playlists(db: Session = Depends(get_db), _=Depends(get_current_admin)):
    return [_playlist_out(p) for p in db.query(Playlist).order_by(Playlist.created_at.desc()).all()]


@router.post("/playlists", status_code=201)
def create_playlist(body: PlaylistCreate, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    p = Playlist(name=body.name)
    db.add(p)
    db.commit()
    db.refresh(p)
    return _playlist_out(p)


@router.get("/playlists/{playlist_id}")
def get_playlist(playlist_id: str, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    p = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not p:
        raise HTTPException(404, "Playlist not found")
    return _playlist_out(p)


@router.put("/playlists/{playlist_id}")
def rename_playlist(playlist_id: str, body: PlaylistCreate,
                    db: Session = Depends(get_db), _=Depends(get_current_admin)):
    p = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not p:
        raise HTTPException(404, "Playlist not found")
    p.name = body.name
    db.commit()
    return _playlist_out(p)


@router.delete("/playlists/{playlist_id}", status_code=204)
def delete_playlist(playlist_id: str, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    p = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not p:
        raise HTTPException(404, "Playlist not found")
    db.delete(p)
    db.commit()


# ── Items ─────────────────────────────────────────────────────────────────────

@router.post("/playlists/{playlist_id}/items", status_code=201)
def add_item(playlist_id: str, body: ItemAdd,
             db: Session = Depends(get_db), _=Depends(get_current_admin)):
    p = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not p:
        raise HTTPException(404, "Playlist not found")
    c = db.query(Content).filter(Content.id == body.content_id).first()
    if not c:
        raise HTTPException(404, "Content not found")

    max_order = max((i.order_index for i in p.items), default=-1)
    item = PlaylistItem(
        playlist_id=playlist_id,
        content_id=body.content_id,
        duration=body.duration,
        order_index=body.order_index if body.order_index is not None else max_order + 1,
    )
    db.add(item)
    db.commit()
    db.refresh(p)
    return _playlist_out(p)


@router.put("/playlists/{playlist_id}/items/{item_id}")
def update_item(playlist_id: str, item_id: str, body: ItemUpdate,
                db: Session = Depends(get_db), _=Depends(get_current_admin)):
    item = db.query(PlaylistItem).filter(
        PlaylistItem.id == item_id,
        PlaylistItem.playlist_id == playlist_id,
    ).first()
    if not item:
        raise HTTPException(404, "Item not found")
    if body.duration    is not None: item.duration    = body.duration
    if body.order_index is not None: item.order_index = body.order_index
    db.commit()
    p = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    return _playlist_out(p)


@router.delete("/playlists/{playlist_id}/items/{item_id}", status_code=204)
def remove_item(playlist_id: str, item_id: str,
                db: Session = Depends(get_db), _=Depends(get_current_admin)):
    item = db.query(PlaylistItem).filter(
        PlaylistItem.id == item_id,
        PlaylistItem.playlist_id == playlist_id,
    ).first()
    if not item:
        raise HTTPException(404, "Item not found")
    db.delete(item)
    db.commit()


@router.put("/playlists/{playlist_id}/reorder")
def reorder_items(playlist_id: str, order: list[str],
                  db: Session = Depends(get_db), _=Depends(get_current_admin)):
    """Pass list of item IDs in desired order."""
    p = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not p:
        raise HTTPException(404, "Playlist not found")
    id_to_item = {str(i.id): i for i in p.items}
    for idx, item_id in enumerate(order):
        if item_id in id_to_item:
            id_to_item[item_id].order_index = idx
    db.commit()
    db.refresh(p)
    return _playlist_out(p)
