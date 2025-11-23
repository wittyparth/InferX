"""
Webhook schemas
"""
from pydantic import BaseModel, Field, HttpUrl, ConfigDict
from typing import Optional, List
from datetime import datetime


class WebhookCreate(BaseModel):
    """Create webhook request"""
    url: HttpUrl = Field(..., description="Webhook URL to POST to")
    description: Optional[str] = Field(None, description="Webhook description")
    model_id: Optional[str] = Field(None, description="Model ID (None = all models)")
    events: List[str] = Field(
        default=["prediction"],
        description="Events to listen for: prediction, error, model_update"
    )
    retry_count: Optional[int] = Field(default=3, description="Number of retries")
    timeout_seconds: Optional[int] = Field(default=30, description="Request timeout")


class WebhookUpdate(BaseModel):
    """Update webhook"""
    url: Optional[HttpUrl] = Field(None, description="New webhook URL")
    description: Optional[str] = Field(None, description="New description")
    events: Optional[List[str]] = Field(None, description="Updated events list")
    is_active: Optional[bool] = Field(None, description="Enable/disable webhook")
    retry_count: Optional[int] = Field(None, description="Number of retries")
    timeout_seconds: Optional[int] = Field(None, description="Request timeout")


class WebhookResponse(BaseModel):
    """Webhook response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str = Field(..., description="Webhook ID")
    url: str = Field(..., description="Webhook URL")
    description: Optional[str] = Field(None, description="Description")
    model_id: Optional[str] = Field(None, description="Model ID")
    events: List[str] = Field(..., description="Events list")
    is_active: bool = Field(..., description="Active status")
    retry_count: str = Field(..., description="Retry count")
    timeout_seconds: str = Field(..., description="Timeout in seconds")
    created_at: datetime = Field(..., description="Created at")
    last_triggered_at: Optional[datetime] = Field(None, description="Last triggered time")


class WebhookTestRequest(BaseModel):
    """Test webhook request"""
    test_event: str = Field(default="prediction", description="Event type to test")


class WebhookEvent(BaseModel):
    """Webhook event payload"""
    event_type: str = Field(..., description="Type of event: prediction, error, model_update")
    timestamp: datetime = Field(..., description="Event timestamp")
    model_id: str = Field(..., description="Model ID")
    data: dict = Field(..., description="Event-specific data")
