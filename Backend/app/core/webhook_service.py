"""
Webhook service
Handles webhook event dispatching
"""

import hashlib
import hmac
import json
import logging
from datetime import datetime
from typing import Any, Dict

import httpx
from sqlalchemy.orm import Session

from app.models.webhook import Webhook

logger = logging.getLogger(__name__)


def generate_webhook_signature(payload: str, secret: str) -> str:
    """Generate HMAC-SHA256 signature for webhook payload"""
    return hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()


async def dispatch_webhook(webhook: Webhook, event_data: Dict[str, Any]) -> bool:
    """
    Dispatch a webhook event

    Args:
        webhook: Webhook model instance
        event_data: Event data to send

    Returns:
        True if successful, False otherwise
    """
    payload = json.dumps(event_data)
    signature = generate_webhook_signature(payload, webhook.secret)

    headers = {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Timestamp": datetime.utcnow().isoformat(),
        "X-Webhook-Id": str(webhook.id),
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
                    logger.info(
                        f"Webhook {webhook.id} dispatched successfully. "
                        f"Status: {response.status_code}"
                    )
                    return True

            except httpx.RequestError as e:
                logger.warning(
                    f"Webhook {webhook.id} dispatch failed on attempt {attempt + 1}/{retry_count}: {str(e)}"
                )
                if attempt < retry_count - 1:
                    continue

    logger.error(f"Webhook {webhook.id} dispatch failed after {retry_count} attempts")
    return False


async def trigger_webhooks(
    db: Session, event_type: str, model_id: str, user_id: str, data: Dict[str, Any]
):
    """
    Trigger all relevant webhooks for an event

    Args:
        db: Database session
        event_type: Type of event (prediction, error, model_update)
        model_id: Model UUID
        user_id: User UUID
        data: Event-specific data
    """
    try:
        # Find active webhooks for this user and event type
        webhooks = (
            db.query(Webhook)
            .filter(Webhook.user_id == user_id, Webhook.is_active == True)
            .all()
        )

        # Filter webhooks that listen to this event
        relevant_webhooks = [
            webhook
            for webhook in webhooks
            if event_type in webhook.events
            and (webhook.model_id is None or str(webhook.model_id) == model_id)
        ]

        if not relevant_webhooks:
            return

        # Prepare event payload
        event_payload = {
            "event_type": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "model_id": model_id,
            "data": data,
        }

        # Dispatch webhooks asynchronously
        for webhook in relevant_webhooks:
            try:
                success = await dispatch_webhook(webhook, event_payload)

                # Update last_triggered_at
                if success:
                    webhook.last_triggered_at = datetime.utcnow()
                    db.commit()

            except Exception as e:
                logger.error(f"Failed to dispatch webhook {webhook.id}: {str(e)}")
                continue

    except Exception as e:
        logger.error(f"Failed to trigger webhooks: {str(e)}")
