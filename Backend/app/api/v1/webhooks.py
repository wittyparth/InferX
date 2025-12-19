"""
Webhook endpoints
Handles webhook management and event dispatching
"""

import hashlib
import hmac
from datetime import datetime

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Security, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.model import Model
from app.models.user import User
from app.models.webhook import Webhook
from app.schemas.webhook import (WebhookCreate, WebhookEvent, WebhookResponse,
                                 WebhookTestRequest, WebhookUpdate)

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


def generate_webhook_signature(payload: str, secret: str) -> str:
    """Generate HMAC signature for webhook payload"""
    return hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()


async def dispatch_webhook(webhook: Webhook, event: WebhookEvent):
    """Dispatch webhook event with retries"""
    payload = event.model_dump_json()
    signature = generate_webhook_signature(payload, webhook.secret)

    headers = {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Timestamp": datetime.utcnow().isoformat(),
    }

    retry_count = int(webhook.retry_count)
    timeout = int(webhook.timeout_seconds)

    async with httpx.AsyncClient(timeout=timeout) as client:
        for attempt in range(retry_count):
            try:
                response = await client.post(
                    str(webhook.url), content=payload, headers=headers
                )
                if response.status_code < 500:  # Success or client error
                    return True
            except httpx.RequestError:
                if attempt < retry_count - 1:
                    continue
                return False

    return False


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_webhook(
    webhook_create: WebhookCreate,
    current_user: User = Security(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new webhook

    - **url**: Webhook URL to POST to
    - **events**: List of events to listen for
    - **model_id**: Optional - specific model ID (NULL = all models)
    - **description**: Optional webhook description

    Requires authentication
    """
    # Validate model_id if provided
    if webhook_create.model_id:
        model = db.query(Model).filter(Model.id == webhook_create.model_id).first()
        if not model or model.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found or access denied",
            )

    # Validate events
    valid_events = ["prediction", "error", "model_update"]
    for event in webhook_create.events:
        if event not in valid_events:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid event: {event}. Valid events: {', '.join(valid_events)}",
            )

    # Generate secret for HMAC signature
    import secrets

    secret = secrets.token_urlsafe(32)

    # Create webhook
    new_webhook = Webhook(
        user_id=current_user.id,
        model_id=webhook_create.model_id,
        url=str(webhook_create.url),
        description=webhook_create.description,
        events=webhook_create.events,
        secret=secret,
        retry_count=str(webhook_create.retry_count or 3),
        timeout_seconds=str(webhook_create.timeout_seconds or 30),
    )

    db.add(new_webhook)
    db.commit()
    db.refresh(new_webhook)

    webhook_data = {
        "id": str(new_webhook.id),
        "url": new_webhook.url,
        "description": new_webhook.description,
        "model_id": str(new_webhook.model_id) if new_webhook.model_id else None,
        "events": new_webhook.events,
        "is_active": new_webhook.is_active,
        "retry_count": new_webhook.retry_count,
        "timeout_seconds": new_webhook.timeout_seconds,
        "created_at": new_webhook.created_at,
        "last_triggered_at": new_webhook.last_triggered_at,
        "secret": secret,  # Only show secret once
    }

    return {
        "success": True,
        "data": webhook_data,
        "message": "Webhook created successfully. Store the secret for signature verification!",
    }


@router.get("", response_model=dict)
async def list_webhooks(
    page: int = 1,
    per_page: int = 20,
    current_user: User = Security(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List user's webhooks

    - **page**: Page number (default: 1)
    - **per_page**: Items per page (default: 20, max: 100)

    Requires authentication
    """
    query = db.query(Webhook).filter(Webhook.user_id == current_user.id)
    total = query.count()
    skip = (page - 1) * per_page
    webhooks = (
        query.order_by(desc(Webhook.created_at)).offset(skip).limit(per_page).all()
    )

    webhook_list = [
        WebhookResponse.model_validate(webhook).model_dump() for webhook in webhooks
    ]

    return {
        "success": True,
        "data": webhook_list,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page,
            "total_items": total,
        },
    }


@router.get("/{webhook_id}", response_model=dict)
async def get_webhook(
    webhook_id: str,
    current_user: User = Security(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get webhook details

    - **webhook_id**: Webhook UUID

    Requires authentication and ownership
    """
    webhook = (
        db.query(Webhook)
        .filter(Webhook.id == webhook_id, Webhook.user_id == current_user.id)
        .first()
    )

    if not webhook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Webhook not found"
        )

    return {"success": True, "data": WebhookResponse.model_validate(webhook)}


@router.patch("/{webhook_id}", response_model=dict)
async def update_webhook(
    webhook_id: str,
    update_request: WebhookUpdate,
    current_user: User = Security(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update webhook configuration

    - **webhook_id**: Webhook UUID

    Requires authentication and ownership
    """
    webhook = (
        db.query(Webhook)
        .filter(Webhook.id == webhook_id, Webhook.user_id == current_user.id)
        .first()
    )

    if not webhook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Webhook not found"
        )

    # Update fields if provided
    if update_request.url:
        webhook.url = str(update_request.url)
    if update_request.description is not None:
        webhook.description = update_request.description
    if update_request.events:
        webhook.events = update_request.events
    if update_request.is_active is not None:
        webhook.is_active = update_request.is_active
    if update_request.retry_count is not None:
        webhook.retry_count = str(update_request.retry_count)
    if update_request.timeout_seconds is not None:
        webhook.timeout_seconds = str(update_request.timeout_seconds)

    db.commit()
    db.refresh(webhook)

    return {
        "success": True,
        "data": WebhookResponse.model_validate(webhook),
        "message": "Webhook updated successfully",
    }


@router.delete("/{webhook_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_webhook(
    webhook_id: str,
    current_user: User = Security(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete webhook

    - **webhook_id**: Webhook UUID

    Requires authentication and ownership
    """
    webhook = (
        db.query(Webhook)
        .filter(Webhook.id == webhook_id, Webhook.user_id == current_user.id)
        .first()
    )

    if not webhook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Webhook not found"
        )

    db.delete(webhook)
    db.commit()

    return None


@router.post("/{webhook_id}/test", response_model=dict)
async def test_webhook(
    webhook_id: str,
    test_request: WebhookTestRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Security(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Test webhook with sample event

    - **webhook_id**: Webhook UUID
    - **test_event**: Event type to test (default: prediction)

    Requires authentication and ownership
    """
    webhook = (
        db.query(Webhook)
        .filter(Webhook.id == webhook_id, Webhook.user_id == current_user.id)
        .first()
    )

    if not webhook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Webhook not found"
        )

    # Create test event
    test_event = WebhookEvent(
        event_type=test_request.test_event,
        timestamp=datetime.utcnow(),
        model_id="test-model-id",
        data={"test": True, "message": "This is a test webhook"},
    )

    # Dispatch in background
    background_tasks.add_task(dispatch_webhook, webhook, test_event)

    return {
        "success": True,
        "message": "Test event sent. Check your webhook URL logs.",
        "event": test_event.model_dump(mode="json"),
    }
