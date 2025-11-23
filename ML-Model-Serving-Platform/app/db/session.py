"""
Database session management
Creates and manages database connections
"""

from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

# Create database engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using
    pool_size=settings.DB_POOL_SIZE,  # Max connections in pool
    max_overflow=settings.DB_MAX_OVERFLOW,  # Allow overflow connections
    pool_recycle=settings.DB_POOL_RECYCLE,  # Recycle connections after timeout
    pool_timeout=settings.DB_POOL_TIMEOUT,  # Connection timeout
    echo=settings.DATABASE_ECHO,  # Log SQL queries if enabled
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function that yields database sessions

    Yields:
        Database session

    Usage:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
