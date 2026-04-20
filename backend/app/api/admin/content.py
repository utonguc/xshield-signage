"""
Media content upload & management.
Files stored in /app/uploads/<uuid>_<filename>
"""
import os
import uuid
import shutil
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.admin.deps import get_current_admin
from app.db.session import get_db
from app.db.models import Content

router  = APIRouter(tags=["content"])
UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"}
VIDEO_TYPES = {"video/mp4", "video/webm", "video/ogg"}
HTML_TYPES  = {"text/html"}


def _detect_type(mime: str) -> str:
    if mime in IMAGE_TYPES: return "image"
    if mime in VIDEO_TYPES: return "video"
    if mime in HTML_TYPES:  return "html"
    return "other"


def _content_out(c: Content) -> dict:
    return {
        "id":         str(c.id),
        "name":       c.name,
        "file_path":  c.file_path,
        "file_type":  c.file_type,
        "mime_type":  c.mime_type,
        "file_size":  c.file_size,
        "width":      c.width,
        "height":     c.height,
        "duration":   c.duration,
        "created_at": c.created_at,
    }


@router.get("/content")
def list_content(db: Session = Depends(get_db), _=Depends(get_current_admin)):
    return [_content_out(c) for c in db.query(Content).order_by(Content.created_at.desc()).all()]


@router.post("/content", status_code=201)
async def upload_content(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    content_id = str(uuid.uuid4())
    ext        = os.path.splitext(file.filename or "")[1].lower()
    filename   = f"{content_id}{ext}"
    dest_path  = os.path.join(UPLOAD_DIR, filename)

    with open(dest_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    file_size  = os.path.getsize(dest_path)
    mime       = file.content_type or "application/octet-stream"
    file_type  = _detect_type(mime)

    # Extract image dimensions
    width = height = None
    if file_type == "image":
        try:
            from PIL import Image as PILImage
            with PILImage.open(dest_path) as img:
                width, height = img.size
        except Exception:
            pass

    record = Content(
        id=content_id,
        name=name or file.filename or filename,
        file_path=filename,
        file_type=file_type,
        mime_type=mime,
        file_size=file_size,
        width=width,
        height=height,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _content_out(record)


@router.delete("/content/{content_id}", status_code=204)
def delete_content(content_id: str, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    c = db.query(Content).filter(Content.id == content_id).first()
    if not c:
        raise HTTPException(404, "Content not found")
    # Remove file
    try:
        os.remove(os.path.join(UPLOAD_DIR, c.file_path))
    except FileNotFoundError:
        pass
    db.delete(c)
    db.commit()
