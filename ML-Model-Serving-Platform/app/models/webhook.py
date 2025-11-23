"""
Webhook model
Stores webhook configurations for event notifications
"""

import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Webhook(Base):
    """Webhook configuration for event notifications"""

    __tablename__ = "webhooks"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign key
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    model_id = Column(
        UUID(as_uuid=True),
        ForeignKey("models.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )  # NULL = listen to all models

    # Webhook configuration
    url = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)

    # Events to listen for
    events = Column(
        JSONB, default=[], nullable=False
    )  # ['prediction', 'error', 'model_update']

    # Webhook status
    is_active = Column(Boolean, default=True, index=True)

    # Security
    secret = Column(String(255), nullable=False)  # Used for HMAC signature verification

    # Retry configuration
    retry_count = Column(
        String(10), default="3", nullable=False
    )  # How many times to retry on failure
    timeout_seconds = Column(String(10), default="30", nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_triggered_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="webhooks")
    model = relationship("Model")

    def __repr__(self) -> str:
        return f"<Webhook(id={self.id}, url={self.url}, events={self.events})>"
