"""
User schemas for request and response validation
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

import re
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

# Request Schemas


class UserCreate(BaseModel):
    """Schema for user registration"""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(
        ..., min_length=8, max_length=72, description="Password (8-72 characters)"
    )
    full_name: Optional[str] = Field(
        None, max_length=255, description="User's full name"
    )
    @field_validator("password")
    def password_strength(cls, value):
        pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$'
        if re.fullmatch(pattern, value.strip()) is None:
            raise ValueError("Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.")
        return value


class UserLogin(BaseModel):
    """Schema for user login"""

    email: EmailStr
    password: str
    

class UserUpdate(BaseModel):
    """Schema for updating user profile"""

    full_name: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None


# Response Schemas


class UserResponse(BaseModel):
    """Schema for user response (excludes password)"""

    id: UUID
    email: str
    full_name: Optional[str]
    oauth_provider: Optional[str] = None
    oauth_id: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    is_admin: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Schema for authentication token response"""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 1800  # 30 minutes in seconds
    user: UserResponse
