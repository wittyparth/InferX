"""
Main FastAPI application
Entry point for the ML Model Serving Platform
"""
from contextlib import asynccontextmanager
from datetime import datetime

import sentry_sdk
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from starlette.middleware.sessions import SessionMiddleware

from app.api.v1 import (api_keys, auth, health, model_shares, models,
                        predictions, users, webhooks)
from app.core.config import settings
from app.core.logging import get_logger, setup_logging
from app.core.middleware import (ErrorTrackingMiddleware,
                                 PerformanceMonitoringMiddleware,
                                 RateLimitHeaderMiddleware,
                                 RequestLoggingMiddleware)
from app.db.base import Base
from app.db.session import engine
from openapi_spec import get_openapi_schema

# Setup logging
setup_logging()
logger = get_logger(__name__)

# Initialize Sentry (if configured)
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.SENTRY_ENVIRONMENT or settings.ENVIRONMENT,
        traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
        integrations=[
            FastApiIntegration(transaction_style="endpoint"),
            SqlalchemyIntegration(),
        ],
        # Performance monitoring
        enable_tracing=True,
        # Release tracking (optional)
        release=f"{settings.PROJECT_NAME}@{settings.VERSION}",
        # Additional options
        attach_stacktrace=True,
        send_default_pii=False,  # Don't send personally identifiable information
    )
    logger.info(f"Sentry initialized for {settings.ENVIRONMENT} environment")
else:
    logger.info("Sentry not configured (SENTRY_DSN not set)")

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="A production-ready platform for deploying and serving ML models via REST API",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json"
    # lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session middleware (required for OAuth)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    session_cookie="oauth_session",
    max_age=3600,  # 1 hour
    same_site="lax",
    https_only=False  # Set to True in production with HTTPS
)

# Add custom middleware (order matters!)
app.add_middleware(ErrorTrackingMiddleware)
app.add_middleware(PerformanceMonitoringMiddleware, slow_threshold_ms=1000)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RateLimitHeaderMiddleware)


# Configure OpenAPI schema
app.openapi = lambda: get_openapi_schema(app)


# Include routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(models.router, prefix=settings.API_V1_PREFIX)
app.include_router(predictions.router, prefix=settings.API_V1_PREFIX)
app.include_router(users.router, prefix=settings.API_V1_PREFIX)
app.include_router(health.router, prefix=settings.API_V1_PREFIX)
app.include_router(api_keys.router, prefix=settings.API_V1_PREFIX)
app.include_router(model_shares.router, prefix=settings.API_V1_PREFIX)
app.include_router(webhooks.router, prefix=settings.API_V1_PREFIX)


# Root endpoint
@app.get("/", tags=["System"])
async def root():
    """Root endpoint with API information"""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_PREFIX}/docs",
        "health": f"{settings.API_V1_PREFIX}/health"
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred",
                "details": str(exc) if settings.DEBUG else None
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    )


# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown events"""
    # Startup event
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"API documentation available at {settings.API_V1_PREFIX}/docs")

    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")

    yield  # Application runs here

    # Shutdown event
    logger.info(f"Shutting down {settings.PROJECT_NAME}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
