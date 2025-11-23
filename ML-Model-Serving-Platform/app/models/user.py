"""
User database model
Represents users in the system
"""

import uuid

from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class User(Base):
    """User account model"""

    __tablename__ = "users"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # User information
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=True)  # Nullable for OAuth users
    full_name = Column(String(255), nullable=True)

    # OAuth fields
    oauth_provider = Column(
        String(50), nullable=True, index=True
    )  # 'google', 'github', etc.
    oauth_id = Column(String(255), nullable=True, index=True)  # Provider's user ID
    avatar_url = Column(String(512), nullable=True)  # Profile picture URL

    # Status flags
    is_active = Column(Boolean, default=True, index=True)
    is_admin = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    models = relationship("Model", back_populates="user", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="user")
    api_keys = relationship(
        "APIKey", back_populates="user", cascade="all, delete-orphan"
    )
    webhooks = relationship(
        "Webhook", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email})>"
