"""
OpenAPI Specification for ML Model Serving Platform
This file generates and customizes the OpenAPI schema for the API documentation
"""

from fastapi.openapi.utils import get_openapi


def get_openapi_schema(app):
    """
    Generate OpenAPI schema with custom documentation
    """
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="ML Model Serving Platform",
        version="1.0.0",
        description="""
# ML Model Serving Platform API

A production-ready platform for deploying, managing, and serving machine learning models via REST API.

## Key Features

- **Model Management**: Upload, version, and manage ML models
- **Authentication**: JWT + API Key authentication with refresh tokens
- **Predictions**: Real-time predictions with caching and performance tracking
- **Sharing**: Share models with other users with granular permissions
- **Analytics**: Track model performance and usage metrics
- **Webhooks**: Event-driven architecture with webhook support
- **Rate Limiting**: Per-user rate limiting with Redis backend
- **Health Checks**: Kubernetes-ready health check endpoints

## Authentication

The API supports two authentication methods:

### JWT (Bearer Token)
1. Register or login to get access and refresh tokens
2. Include the access token in the `Authorization: Bearer <token>` header
3. Tokens expire after 30 minutes; use refresh endpoint to get new ones

### API Key
1. Create an API key from the API Keys endpoint
2. Include the key in the `X-API-Key` header

## Getting Started

### 1. Create an Account
```bash
POST /api/v1/auth/register
{
    "email": "user@example.com",
    "password": "secure_password"
}
```

### 2. Login
```bash
POST /api/v1/auth/login
{
    "email": "user@example.com",
    "password": "secure_password"
}
```

### 3. Upload a Model
```bash
POST /api/v1/models/upload
# Include the model file and metadata
```

### 4. Make Predictions
```bash
POST /api/v1/predictions/predict
{
    "model_id": "model_123",
    "features": [1.0, 2.0, 3.0]
}
```

## Response Format

All responses follow this format:

**Success (2xx):**
```json
{
    "data": {},
    "message": "Operation successful",
    "status": "success"
}
```

**Error (4xx, 5xx):**
```json
{
    "detail": "Error message",
    "error_code": "ERROR_CODE",
    "status_code": 400
}
```

## Rate Limiting

- Default: 100 requests per minute per user
- Configurable via environment variables
- Rate limit info included in response headers:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time (Unix timestamp)

## Performance

- First prediction with model loading: ~636ms
- Cached prediction from memory: ~2ms
- Model caching: LRU cache for 5-50 models
- Supports async operations for long-running tasks

## Support & Documentation

- **Swagger UI**: `/api/v1/docs`
- **ReDoc**: `/api/v1/redoc`
- **OpenAPI JSON**: `/api/v1/openapi.json`
        """,
        routes=app.routes,
        tags=[
            {
                "name": "Authentication",
                "description": "User registration, login, and token management",
            },
            {
                "name": "Models",
                "description": "ML model upload, versioning, and management",
            },
            {
                "name": "Predictions",
                "description": "Real-time model predictions with caching",
            },
            {
                "name": "Model Sharing",
                "description": "Share models with other users and manage permissions",
            },
            {
                "name": "API Keys",
                "description": "Create and manage API keys for authentication",
            },
            {
                "name": "Analytics",
                "description": "Track model performance and usage metrics",
            },
            {
                "name": "Webhooks",
                "description": "Configure webhooks for event notifications",
            },
            {"name": "Health", "description": "System health and readiness checks"},
            {"name": "Users", "description": "User profile and account management"},
        ],
    )

    # Add server information
    openapi_schema["servers"] = [
        {"url": "http://localhost:8000", "description": "Local development server"},
    ]

    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "BearerToken": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your JWT access token from /api/v1/auth/login (just the token, without 'Bearer')",
        },
        "ApiKey": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key",
            "description": "Enter your API key from /api/v1/api-keys endpoint",
        },
    }

    # Define public endpoints that DON'T require authentication
    public_endpoints = {
        "/api/v1/auth/register",
        "/api/v1/auth/login",
        "/api/v1/health",
        "/api/v1/health/ready",
        "/api/v1/health/live",
    }
    
    # OAuth endpoints (also public)
    oauth_patterns = ["/api/v1/auth/oauth"]
    
    # Add security requirements to ALL endpoints except public ones
    # This ensures Swagger shows the lock icon and includes auth headers
    for path, path_item in openapi_schema.get("paths", {}).items():
        for method, operation in path_item.items():
            if method in ["get", "post", "put", "patch", "delete", "options"]:
                # Check if this is a public endpoint
                is_public = path in public_endpoints or any(path.startswith(pattern) for pattern in oauth_patterns)
                
                if not is_public:
                    # Add security requirement - user can authenticate with EITHER Bearer token OR API key
                    operation["security"] = [
                        {"BearerToken": []},  # Option 1: Bearer token
                        {"ApiKey": []}        # Option 2: API key
                    ]
                    
                    # Add security description to the endpoint documentation
                    if "description" in operation:
                        if "🔒 **Authentication Required**" not in operation["description"]:
                            operation["description"] = (
                                f"🔒 **Authentication Required**: Use Bearer token OR X-API-Key header\n\n"
                                f"{operation['description']}"
                            )
                    else:
                        operation["description"] = "🔒 **Authentication Required**: Use Bearer token OR X-API-Key header"

    # Add common responses
    openapi_schema["components"]["responses"] = {
        "UnauthorizedError": {
            "description": "Authentication required",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "detail": {"type": "string", "example": "Not authenticated"}
                        },
                    }
                }
            },
        },
        "ForbiddenError": {
            "description": "Insufficient permissions",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "detail": {
                                "type": "string",
                                "example": "Insufficient permissions",
                            }
                        },
                    }
                }
            },
        },
        "NotFoundError": {
            "description": "Resource not found",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "detail": {"type": "string", "example": "Model not found"}
                        },
                    }
                }
            },
        },
        "RateLimitError": {
            "description": "Too many requests",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "detail": {
                                "type": "string",
                                "example": "Rate limit exceeded",
                            }
                        },
                    }
                }
            },
        },
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema
