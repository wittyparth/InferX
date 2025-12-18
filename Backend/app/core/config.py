"""
Application Configuration
Loads settings from environment variables
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import Optional
import secrets


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    # Environment
    ENVIRONMENT: str = "development"  # development, staging, production

    # API Settings
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "ML Model Serving Platform"
    VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # OAuth Settings
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: Optional[str] = None

    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None
    GITHUB_REDIRECT_URI: Optional[str] = None

    # Frontend URL for OAuth redirects
    FRONTEND_URL: str = "http://localhost:3000"

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/mlplatform"
    DATABASE_ECHO: bool = False  # Set to True to see SQL queries
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 3600

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    UPSTASH_REDIS_REST_TOKEN: Optional[str] = None  # For Upstash Redis
    CACHE_TTL_SECONDS: int = 3600  # 1 hour

    # CORS
    BACKEND_CORS_ORIGINS: list[str] | str = ["http://localhost:3000", "http://localhost:8000"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from comma-separated string or list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    RATE_LIMIT_PER_HOUR: int = 1000

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = 100
    UPLOAD_DIR: str = "models"
    ALLOWED_MODEL_TYPES: list[str] | str = ["sklearn"]

    @field_validator("ALLOWED_MODEL_TYPES", mode="before")
    @classmethod
    def parse_model_types(cls, v):
        """Parse model types from comma-separated string or list"""
        if isinstance(v, str):
            return [model_type.strip() for model_type in v.split(",") if model_type.strip()]
        return v

    # Model Settings
    MODEL_CACHE_SIZE: int = 5  # Number of models to keep in memory

    # Cloud Storage Settings
    USE_CLOUD_STORAGE: bool = False  # Set to True to use S3/cloud storage
    S3_BUCKET_NAME: Optional[str] = None
    S3_REGION: str = "us-east-1"
    S3_ENDPOINT_URL: Optional[str] = None  # For MinIO or custom S3-compatible services
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None

    # Monitoring
    SENTRY_DSN: Optional[str] = None
    SENTRY_ENVIRONMENT: Optional[str] = None
    SENTRY_TRACES_SAMPLE_RATE: float = 0.1

    # Backup Settings
    BACKUP_ENABLED: bool = True
    BACKUP_SCHEDULE: str = "0 2 * * *"  # Daily at 2 AM (cron format)
    BACKUP_RETENTION_DAYS: int = 7
    BACKUP_S3_BUCKET: Optional[str] = None


# Global settings instance
settings = Settings()
