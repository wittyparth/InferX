"""
Model Sharing model
Handles sharing models between users
"""

import enum
import uuid

from sqlalchemy import Column, DateTime, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class SharePermission(str, enum.Enum):
    """Permission levels for shared models"""

    VIEW = "view"
    USE = "use"  # Can make predictions
    EDIT = "edit"  # Can update model metadata


class ModelShare(Base):
    """Model sharing permissions"""

    __tablename__ = "model_shares"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign keys
    model_id = Column(
        UUID(as_uuid=True),
        ForeignKey("models.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    owner_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    shared_with_user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Permission level
    permission = Column(
        Enum(SharePermission), default=SharePermission.VIEW, nullable=False
    )

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    model = relationship("Model", foreign_keys=[model_id])
    owner = relationship("User", foreign_keys=[owner_id])
    shared_with_user = relationship("User", foreign_keys=[shared_with_user_id])

    # Constraints
    __table_args__ = (
        UniqueConstraint("model_id", "shared_with_user_id", name="unique_model_share"),
    )

    def __repr__(self) -> str:
        return f"<ModelShare(model_id={self.model_id}, shared_with={self.shared_with_user_id}, permission={self.permission})>"
