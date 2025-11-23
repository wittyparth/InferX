"""
Model sharing schemas
"""
from pydantic import BaseModel, Field, HttpUrl, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum


class SharePermission(str, Enum):
    """Permission levels for shared models"""
    VIEW = "view"
    USE = "use"
    EDIT = "edit"


class ModelShareCreate(BaseModel):
    """Create model share request"""
    shared_with_email: str = Field(..., description="Email of user to share with")
    permission: SharePermission = Field(default=SharePermission.VIEW, description="Permission level")


class ModelShareUpdate(BaseModel):
    """Update model share"""
    permission: SharePermission = Field(..., description="New permission level")


class ModelShareResponse(BaseModel):
    """Model share response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str = Field(..., description="Share ID")
    model_id: str = Field(..., description="Model ID")
    permission: SharePermission = Field(..., description="Permission level")
    created_at: datetime = Field(..., description="Creation timestamp")


class ModelShareListResponse(BaseModel):
    """List of model shares"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    model_name: str
    shared_with_email: str
    permission: SharePermission
    created_at: datetime
