"""
OAuth Service
Handles OAuth authentication with Google and GitHub
"""

from typing import Any, Dict

import httpx
from authlib.integrations.starlette_client import OAuth
from fastapi import HTTPException, status
from starlette.config import Config

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Initialize OAuth with settings
config_data = {
    "GOOGLE_CLIENT_ID": settings.GOOGLE_CLIENT_ID or "",
    "GOOGLE_CLIENT_SECRET": settings.GOOGLE_CLIENT_SECRET or "",
    "GITHUB_CLIENT_ID": settings.GITHUB_CLIENT_ID or "",
    "GITHUB_CLIENT_SECRET": settings.GITHUB_CLIENT_SECRET or "",
}

config = Config(environ=config_data)
oauth = OAuth(config)


class OAuthService:
    """OAuth service for handling social authentication"""

    def __init__(self):
        """Initialize OAuth providers"""
        self._setup_google()
        self._setup_github()

    def _setup_google(self):
        """Setup Google OAuth"""
        if settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET:
            oauth.register(
                name="google",
                client_id=settings.GOOGLE_CLIENT_ID,
                client_secret=settings.GOOGLE_CLIENT_SECRET,
                server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
                client_kwargs={
                    "scope": "openid email profile",
                    "prompt": "select_account",  # Force account selection
                },
            )
            logger.info("Google OAuth configured")
        else:
            logger.warning("Google OAuth not configured - missing credentials")

    def _setup_github(self):
        """Setup GitHub OAuth"""
        if settings.GITHUB_CLIENT_ID and settings.GITHUB_CLIENT_SECRET:
            oauth.register(
                name="github",
                client_id=settings.GITHUB_CLIENT_ID,
                client_secret=settings.GITHUB_CLIENT_SECRET,
                access_token_url="https://github.com/login/oauth/access_token",
                access_token_params=None,
                authorize_url="https://github.com/login/oauth/authorize",
                authorize_params=None,
                api_base_url="https://api.github.com/",
                client_kwargs={"scope": "user:email"},
            )
            logger.info("GitHub OAuth configured")
        else:
            logger.warning("GitHub OAuth not configured - missing credentials")

    def get_provider(self, provider_name: str):
        """Get OAuth provider by name"""
        if provider_name == "google":
            if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
                raise HTTPException(
                    status_code=status.HTTP_501_NOT_IMPLEMENTED,
                    detail="Google OAuth is not configured",
                )
            return oauth.google
        elif provider_name == "github":
            if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
                raise HTTPException(
                    status_code=status.HTTP_501_NOT_IMPLEMENTED,
                    detail="GitHub OAuth is not configured",
                )
            return oauth.github
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported OAuth provider: {provider_name}",
            )

    async def get_user_info_google(self, token: Dict[str, Any]) -> Dict[str, Any]:
        """Get user info from Google"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={"Authorization": f'Bearer {token["access_token"]}'},
                )
                response.raise_for_status()
                user_info = response.json()

                return {
                    "oauth_id": user_info["id"],
                    "email": user_info["email"],
                    "full_name": user_info.get("name"),
                    "avatar_url": user_info.get("picture"),
                    "email_verified": user_info.get("verified_email", False),
                }
        except Exception as e:
            logger.error(f"Error getting Google user info: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve user information from Google",
            )

    async def get_user_info_github(self, token: Dict[str, Any]) -> Dict[str, Any]:
        """Get user info from GitHub"""
        try:
            async with httpx.AsyncClient() as client:
                # Get user profile
                response = await client.get(
                    "https://api.github.com/user",
                    headers={
                        "Authorization": f'Bearer {token["access_token"]}',
                        "Accept": "application/vnd.github.v3+json",
                    },
                )
                response.raise_for_status()
                user_info = response.json()

                # Get primary email
                email_response = await client.get(
                    "https://api.github.com/user/emails",
                    headers={
                        "Authorization": f'Bearer {token["access_token"]}',
                        "Accept": "application/vnd.github.v3+json",
                    },
                )
                email_response.raise_for_status()
                emails = email_response.json()

                # Find primary verified email
                primary_email = None
                for email in emails:
                    if email.get("primary") and email.get("verified"):
                        primary_email = email["email"]
                        break

                if not primary_email:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="No verified email found in GitHub account",
                    )

                return {
                    "oauth_id": str(user_info["id"]),
                    "email": primary_email,
                    "full_name": user_info.get("name") or user_info.get("login"),
                    "avatar_url": user_info.get("avatar_url"),
                    "email_verified": True,
                }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting GitHub user info: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve user information from GitHub",
            )

    async def get_user_info(
        self, provider: str, token: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Get user info from OAuth provider"""
        if provider == "google":
            return await self.get_user_info_google(token)
        elif provider == "github":
            return await self.get_user_info_github(token)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported OAuth provider: {provider}",
            )


# Global OAuth service instance
oauth_service = OAuthService()
