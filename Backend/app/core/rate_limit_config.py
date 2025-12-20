"""
Rate Limit Configuration
Centralized configuration for all API route rate limits

Each endpoint has carefully considered limits based on:
- Resource intensity (CPU, memory, I/O)
- Abuse potential (brute force, spam)
- Expected usage patterns
- Cost (storage, compute)

Format: {requests_per_window, window_in_seconds}
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class RateLimitConfig:
    """Rate limit configuration for a single endpoint"""
    max_requests: int
    window_seconds: int
    description: str = ""
    
    def __repr__(self):
        return f"RateLimitConfig({self.max_requests} req/{self.window_seconds}s)"


# =============================================================================
# AUTHENTICATION ENDPOINTS
# Security-critical: Low limits to prevent brute force attacks
# =============================================================================

AUTH_REGISTER = RateLimitConfig(
    max_requests=5,
    window_seconds=60,
    description="Prevent spam account creation"
)

AUTH_LOGIN = RateLimitConfig(
    max_requests=10,
    window_seconds=60,
    description="Prevent brute force password attacks"
)

AUTH_REFRESH = RateLimitConfig(
    max_requests=30,
    window_seconds=60,
    description="Allow token refresh but prevent abuse"
)

AUTH_ME = RateLimitConfig(
    max_requests=60,
    window_seconds=60,
    description="User info is cached, higher limit ok"
)

AUTH_OAUTH = RateLimitConfig(
    max_requests=10,
    window_seconds=60,
    description="OAuth flow initiation limit"
)


# =============================================================================
# MODEL MANAGEMENT ENDPOINTS
# Resource-intensive: Moderate limits for safety
# =============================================================================

MODELS_UPLOAD = RateLimitConfig(
    max_requests=10,
    window_seconds=60,
    description="File upload is expensive (storage, validation)"
)

MODELS_LIST = RateLimitConfig(
    max_requests=60,
    window_seconds=60,
    description="List operations are lightweight"
)

MODELS_GET = RateLimitConfig(
    max_requests=120,
    window_seconds=60,
    description="Get single model is very fast"
)

MODELS_UPDATE = RateLimitConfig(
    max_requests=30,
    window_seconds=60,
    description="Update operations are moderate"
)

MODELS_DELETE = RateLimitConfig(
    max_requests=20,
    window_seconds=60,
    description="Delete operations should be deliberate"
)

MODELS_ANALYTICS = RateLimitConfig(
    max_requests=30,
    window_seconds=60,
    description="Analytics queries can be expensive"
)


# =============================================================================
# PREDICTION ENDPOINTS
# Core functionality: Higher limits for production use
# =============================================================================

PREDICT = RateLimitConfig(
    max_requests=100,
    window_seconds=60,
    description="Main use case - balance between usage and protection"
)

PREDICT_HISTORY = RateLimitConfig(
    max_requests=60,
    window_seconds=60,
    description="History queries are moderately expensive"
)


# =============================================================================
# API KEY ENDPOINTS
# Sensitive operations: Lower limits for security
# =============================================================================

API_KEYS_CREATE = RateLimitConfig(
    max_requests=10,
    window_seconds=60,
    description="Creating keys should be infrequent"
)

API_KEYS_LIST = RateLimitConfig(
    max_requests=60,
    window_seconds=60,
    description="List operations are lightweight"
)

API_KEYS_GET = RateLimitConfig(
    max_requests=60,
    window_seconds=60,
    description="Get operations are lightweight"
)

API_KEYS_UPDATE = RateLimitConfig(
    max_requests=30,
    window_seconds=60,
    description="Update operations are moderate"
)

API_KEYS_REVOKE = RateLimitConfig(
    max_requests=20,
    window_seconds=60,
    description="Revocation should be deliberate"
)


# =============================================================================
# MODEL SHARING ENDPOINTS
# Collaborative features: Moderate limits
# =============================================================================

SHARING_CREATE = RateLimitConfig(
    max_requests=30,
    window_seconds=60,
    description="Sharing is a deliberate action"
)

SHARING_LIST = RateLimitConfig(
    max_requests=60,
    window_seconds=60,
    description="List operations are lightweight"
)

SHARING_UPDATE = RateLimitConfig(
    max_requests=30,
    window_seconds=60,
    description="Permission updates are moderate"
)

SHARING_DELETE = RateLimitConfig(
    max_requests=30,
    window_seconds=60,
    description="Revoke sharing permission"
)

SHARED_WITH_ME = RateLimitConfig(
    max_requests=60,
    window_seconds=60,
    description="List shared models"
)


# =============================================================================
# WEBHOOK ENDPOINTS
# Integration features: Moderate limits
# =============================================================================

WEBHOOKS_CREATE = RateLimitConfig(
    max_requests=20,
    window_seconds=60,
    description="Webhook creation is infrequent"
)

WEBHOOKS_LIST = RateLimitConfig(
    max_requests=60,
    window_seconds=60,
    description="List operations are lightweight"
)

WEBHOOKS_GET = RateLimitConfig(
    max_requests=60,
    window_seconds=60,
    description="Get operations are lightweight"
)

WEBHOOKS_UPDATE = RateLimitConfig(
    max_requests=30,
    window_seconds=60,
    description="Update operations are moderate"
)

WEBHOOKS_DELETE = RateLimitConfig(
    max_requests=20,
    window_seconds=60,
    description="Delete operations should be deliberate"
)

WEBHOOKS_TEST = RateLimitConfig(
    max_requests=10,
    window_seconds=60,
    description="Testing makes external requests - limit strictly"
)


# =============================================================================
# USER ENDPOINTS
# Profile operations: Moderate limits
# =============================================================================

USERS_GET_ME = RateLimitConfig(
    max_requests=60,
    window_seconds=60,
    description="Profile fetch is lightweight"
)

USERS_UPDATE_ME = RateLimitConfig(
    max_requests=20,
    window_seconds=60,
    description="Profile updates should be infrequent"
)


# =============================================================================
# HEALTH ENDPOINTS
# Monitoring: No rate limits (used by orchestrators like k8s)
# =============================================================================

HEALTH_CHECK = RateLimitConfig(
    max_requests=300,
    window_seconds=60,
    description="Health checks should always work (monitoring tools)"
)


# =============================================================================
# GLOBAL DEFAULT
# Fallback for any unlisted endpoints
# =============================================================================

DEFAULT = RateLimitConfig(
    max_requests=60,
    window_seconds=60,
    description="Default rate limit for unlisted endpoints"
)


# =============================================================================
# SUMMARY TABLE (for documentation)
# =============================================================================

ALL_LIMITS = {
    # Auth
    "auth.register": AUTH_REGISTER,
    "auth.login": AUTH_LOGIN,
    "auth.refresh": AUTH_REFRESH,
    "auth.me": AUTH_ME,
    "auth.oauth": AUTH_OAUTH,
    
    # Models
    "models.upload": MODELS_UPLOAD,
    "models.list": MODELS_LIST,
    "models.get": MODELS_GET,
    "models.update": MODELS_UPDATE,
    "models.delete": MODELS_DELETE,
    "models.analytics": MODELS_ANALYTICS,
    
    # Predictions
    "predict": PREDICT,
    "predict.history": PREDICT_HISTORY,
    
    # API Keys
    "api_keys.create": API_KEYS_CREATE,
    "api_keys.list": API_KEYS_LIST,
    "api_keys.get": API_KEYS_GET,
    "api_keys.update": API_KEYS_UPDATE,
    "api_keys.revoke": API_KEYS_REVOKE,
    
    # Sharing
    "sharing.create": SHARING_CREATE,
    "sharing.list": SHARING_LIST,
    "sharing.update": SHARING_UPDATE,
    "sharing.delete": SHARING_DELETE,
    "shared_with_me": SHARED_WITH_ME,
    
    # Webhooks
    "webhooks.create": WEBHOOKS_CREATE,
    "webhooks.list": WEBHOOKS_LIST,
    "webhooks.get": WEBHOOKS_GET,
    "webhooks.update": WEBHOOKS_UPDATE,
    "webhooks.delete": WEBHOOKS_DELETE,
    "webhooks.test": WEBHOOKS_TEST,
    
    # Users
    "users.get_me": USERS_GET_ME,
    "users.update_me": USERS_UPDATE_ME,
    
    # Health
    "health": HEALTH_CHECK,
    
    # Default
    "default": DEFAULT,
}


def get_limit_summary() -> str:
    """Generate a markdown summary of all rate limits"""
    summary = "## Rate Limit Configuration Summary\n\n"
    summary += "| Endpoint | Limit | Window | Description |\n"
    summary += "|----------|-------|--------|-------------|\n"
    
    for name, config in ALL_LIMITS.items():
        summary += f"| `{name}` | {config.max_requests} | {config.window_seconds}s | {config.description} |\n"
    
    return summary


if __name__ == "__main__":
    # Print summary when run directly
    print(get_limit_summary())
