"""
Authentication endpoints
Handles user registration, login, token refresh, and OAuth
"""

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Security, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette.requests import Request as StarletteRequest

from app.api.dependencies import get_current_user
from app.core.config import settings
from app.core.logging import get_logger
from app.core.security import (create_access_token, create_refresh_token,
                               get_password_hash, verify_password,
                               verify_token)
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services.oauth import oauth_service

logger = get_logger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user

    - **email**: Valid email address (must be unique)
    - **password**: Password (min 8 characters)
    - **full_name**: Optional full name

    Returns created user information (excludes password)
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
        )

    # Create new user
    new_user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "success": True,
        "data": {"user": UserResponse.model_validate(new_user)},
        "message": "User registered successfully",
    }


@router.post("/login", response_model=dict)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password

    - **email**: User email
    - **password**: User password

    Returns access token, refresh token, and user information
    """
    # Find user
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive"
        )

    # Create tokens
    access_token = create_access_token(
        data={"user_id": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_token = create_refresh_token(data={"user_id": str(user.id)})

    return {
        "success": True,
        "data": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": UserResponse.model_validate(user),
        },
        "message": "Login successful",
    }


class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/refresh", response_model=dict)
async def refresh_access_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Refresh access token using refresh token

    - **refresh_token**: Valid refresh token

    Returns new access token
    """
    # Verify refresh token
    payload = verify_token(request.refresh_token, token_type="refresh")
    user_id = payload.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )

    # Create new access token
    access_token = create_access_token(
        data={"user_id": user_id},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    # Also create a new refresh token (rotate tokens for security)
    new_refresh_token = create_refresh_token(data={"user_id": user_id})

    return {
        "success": True,
        "data": {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        },
    }


@router.get("/me", response_model=dict)
async def get_current_user_info(current_user: User = Security(get_current_user)):
    """
    Get current user information

    Requires authentication (Bearer token)

    Returns user profile information
    """
    logger.info(f"User {current_user.email} accessed /me endpoint")
    return {"success": True, "data": UserResponse.model_validate(current_user)}


# ==================== OAuth Endpoints ====================


@router.get("/oauth/{provider}", response_model=None)
async def oauth_login(provider: str, request: Request, db: Session = Depends(get_db)):
    """
    Initiate OAuth login flow

    - **provider**: OAuth provider (google or github)

    Redirects to provider's authorization page
    """
    try:
        # Get OAuth client for provider
        oauth_client = oauth_service.get_provider(provider)

        # Generate redirect URI for callback - must point to backend
        redirect_uri = f"{settings.BACKEND_URL}{settings.API_V1_PREFIX}/auth/oauth/{provider}/callback"

        logger.info(f"Starting OAuth flow for {provider}, redirect_uri: {redirect_uri}")

        # Use Starlette request for authlib compatibility
        starlette_request = StarletteRequest(request.scope, request.receive)

        # Redirect to provider's authorization page
        return await oauth_client.authorize_redirect(starlette_request, redirect_uri)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OAuth initiation error for {provider}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate OAuth with {provider}",
        )


@router.get("/oauth/{provider}/callback", response_model=None)
async def oauth_callback(
    provider: str, request: Request, db: Session = Depends(get_db)
):
    """
    OAuth callback endpoint

    - **provider**: OAuth provider (google or github)

    Handles OAuth callback and creates/logs in user
    """
    try:
        # Get OAuth client for provider
        oauth_client = oauth_service.get_provider(provider)

        # Use Starlette request for authlib compatibility
        starlette_request = StarletteRequest(request.scope, request.receive)

        # Exchange authorization code for access token
        token = await oauth_client.authorize_access_token(starlette_request)

        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to obtain access token from provider",
            )

        # Get user info from provider
        user_info = await oauth_service.get_user_info(provider, token)

        logger.info(
            f"OAuth user info received from {provider}: {user_info.get('email')}"
        )

        # Check if user exists by OAuth ID
        user = (
            db.query(User)
            .filter(
                User.oauth_provider == provider, User.oauth_id == user_info["oauth_id"]
            )
            .first()
        )

        if not user:
            # Check if user exists by email
            user = db.query(User).filter(User.email == user_info["email"]).first()

            if user:
                # Link existing account with OAuth
                user.oauth_provider = provider
                user.oauth_id = user_info["oauth_id"]
                user.avatar_url = user_info.get("avatar_url")
                if user_info.get("full_name") and not user.full_name:
                    user.full_name = user_info["full_name"]
                db.commit()
                logger.info(f"Linked existing user {user.email} with {provider}")
            else:
                # Create new user
                user = User(
                    email=user_info["email"],
                    full_name=user_info.get("full_name"),
                    oauth_provider=provider,
                    oauth_id=user_info["oauth_id"],
                    avatar_url=user_info.get("avatar_url"),
                    is_active=True,
                    hashed_password=None,  # No password for OAuth users
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                logger.info(f"Created new user via {provider}: {user.email}")

        # Create access tokens
        access_token = create_access_token(
            data={"user_id": str(user.id)},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        refresh_token = create_refresh_token(data={"user_id": str(user.id)})

        # Redirect to frontend with tokens
        frontend_redirect = f"{settings.FRONTEND_URL}/auth/callback?access_token={access_token}&refresh_token={refresh_token}"

        return RedirectResponse(url=frontend_redirect)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OAuth callback error for {provider}: {e}", exc_info=True)
        # Redirect to frontend with error
        error_redirect = (
            f"{settings.FRONTEND_URL}/login?error=oauth_failed&provider={provider}"
        )
        return RedirectResponse(url=error_redirect)
