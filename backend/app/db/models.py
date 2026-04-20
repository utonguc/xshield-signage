import uuid
from datetime import datetime
from sqlalchemy import Column, Text, Boolean, Integer, DateTime, ForeignKey, String, JSON, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class AdminUser(Base):
    __tablename__ = "admin_users"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email         = Column(Text, unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role          = Column(String(20), nullable=False, default="super_admin")
    created_at    = Column(DateTime, default=datetime.utcnow)


class Device(Base):
    __tablename__ = "devices"

    id                  = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name                = Column(Text, nullable=False)
    location            = Column(Text)
    description         = Column(Text)
    api_key             = Column(Text, unique=True, nullable=False)
    status              = Column(String(20), default="offline")   # online | offline
    last_seen           = Column(DateTime)
    current_playlist_id = Column(UUID(as_uuid=True), ForeignKey("playlists.id", ondelete="SET NULL"), nullable=True)
    orientation         = Column(String(10), default="landscape")  # landscape | portrait
    resolution          = Column(String(20))                        # e.g. 1920x1080
    created_at          = Column(DateTime, default=datetime.utcnow)

    current_playlist = relationship("Playlist", foreign_keys=[current_playlist_id])
    schedules        = relationship("Schedule", back_populates="device", cascade="all, delete-orphan")


class Content(Base):
    __tablename__ = "content"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name       = Column(Text, nullable=False)
    file_path  = Column(Text, nullable=False)          # relative: uploads/<filename>
    file_type  = Column(String(20), nullable=False)    # image | video | html
    mime_type  = Column(Text)
    file_size  = Column(BigInteger, default=0)
    width      = Column(Integer)
    height     = Column(Integer)
    duration   = Column(Integer)                       # seconds (for video); None = image
    thumbnail  = Column(Text)                          # relative path
    created_at = Column(DateTime, default=datetime.utcnow)

    playlist_items = relationship("PlaylistItem", back_populates="content")


class Playlist(Base):
    __tablename__ = "playlists"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name       = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    items     = relationship("PlaylistItem", back_populates="playlist",
                             order_by="PlaylistItem.order_index", cascade="all, delete-orphan")
    schedules = relationship("Schedule", back_populates="playlist")


class PlaylistItem(Base):
    __tablename__ = "playlist_items"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    playlist_id  = Column(UUID(as_uuid=True), ForeignKey("playlists.id", ondelete="CASCADE"), nullable=False)
    content_id   = Column(UUID(as_uuid=True), ForeignKey("content.id",   ondelete="CASCADE"), nullable=False)
    order_index  = Column(Integer, nullable=False, default=0)
    duration     = Column(Integer, nullable=False, default=10)  # seconds to display

    playlist = relationship("Playlist",     back_populates="items")
    content  = relationship("Content",      back_populates="playlist_items")


class Schedule(Base):
    __tablename__ = "schedules"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    device_id   = Column(UUID(as_uuid=True), ForeignKey("devices.id",   ondelete="CASCADE"), nullable=False)
    playlist_id = Column(UUID(as_uuid=True), ForeignKey("playlists.id", ondelete="CASCADE"), nullable=False)
    start_time  = Column(String(5))    # HH:MM  e.g. "08:00"
    end_time    = Column(String(5))    # HH:MM  e.g. "22:00"
    days        = Column(JSON, default=list)  # [0,1,2,3,4,5,6] (Mon=0)
    enabled     = Column(Boolean, default=True)
    priority    = Column(Integer, default=0)
    created_at  = Column(DateTime, default=datetime.utcnow)

    device   = relationship("Device",   back_populates="schedules")
    playlist = relationship("Playlist", back_populates="schedules")
