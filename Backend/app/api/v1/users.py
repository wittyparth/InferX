"""
User management endpoints
Handles user profile operations
"""

from fastapi import APIRouter, Depends, HTTPException, Security, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.rate_limiter import rate_limit
from app.core.rate_limit_config import USERS_GET_ME, USERS_UPDATE_ME
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=dict)
async def get_current_user_profile(
    current_user: User = Security(get_current_user),
    _rate_limit: None = Depends(rate_limit(USERS_GET_ME)),
):
    """
    Get current user profile

    Requires authentication

    Returns user profile information
    """
    return {"success": True, "data": UserResponse.model_validate(current_user)}


@router.patch("/me", response_model=dict)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Security(get_current_user),
    db: Session = Depends(get_db),
    _rate_limit: None = Depends(rate_limit(USERS_UPDATE_ME)),
):
    """
    Update current user profile

    - **full_name**: New full name (optional)
    - **email**: New email (optional)

    Requires authentication
    """
    # Update fields
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name

    if user_update.email is not None:
        # Check if email is already taken
        existing_user = (
            db.query(User)
            .filter(User.email == user_update.email, User.id != current_user.id)
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Email already in use"
            )

        current_user.email = user_update.email

    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "data": UserResponse.model_validate(current_user),
        "message": "Profile updated successfully",
    }
