from sqlalchemy import Column, String, Integer, DateTime, Boolean, Index, Text, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime
from sqlalchemy.dialects.postgresql import ARRAY as PG_ARRAY

Base = declarative_base()

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    name = Column(String, nullable=False)  # User-provided name
    description = Column(Text, default="")  # User-provided description
    tags = Column(PG_ARRAY(String), default=list)  # User-provided tags
    file_hash = Column(String, unique=True, index=True, nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String, nullable=False)
    ip_address = Column(String, index=True, nullable=False)
    device_fingerprint = Column(String, index=True, nullable=True)  # Device fingerprint
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    processed = Column(Boolean, default=False)

    # Add composite indexes for queries
    __table_args__ = (
        Index('idx_ip_uploaded', 'ip_address', 'uploaded_at'),
        Index('idx_device_uploaded', 'device_fingerprint', 'uploaded_at'),
    )

class UploadLimit(Base):
    __tablename__ = "upload_limits"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True, index=True, nullable=False)  # Composite: IP + device fingerprint
    ip_address = Column(String, index=True, nullable=False)
    device_fingerprint = Column(String, index=True, nullable=True)
    upload_count = Column(Integer, default=0)
    last_reset = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
