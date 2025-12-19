"""
Model sharing endpoints
Handles sharing models between users
"""


from fastapi import APIRouter, Depends, HTTPException, Security, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.model import Model
from app.models.model_share import ModelShare
from app.models.user import User
from app.schemas.model_share import (ModelShareCreate, ModelShareResponse,
                                     ModelShareUpdate)

router = APIRouter(prefix="/models", tags=["Model Sharing"])


@router.post(
    "/{model_id}/share", response_model=dict, status_code=status.HTTP_201_CREATED
)
async def share_model(
    model_id: str,
    share_request: ModelShareCreate,
    current_user: User = Security(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Share a model with another user

    - **model_id**: Model UUID
    - **shared_with_email**: Email of user to share with
    - **permission**: Permission level (view, use, edit)

    Requires authentication and model ownership
    """
    # Validate model exists and user owns it
    model = db.query(Model).filter(Model.id == model_id).first()

    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Model not found"
        )

    if model.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only share your own models",
        )

    # Find target user
    target_user = (
        db.query(User).filter(User.email == share_request.shared_with_email).first()
    )

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email {share_request.shared_with_email} not found",
        )

    if target_user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot share model with yourself",
        )

    # Check if already shared
    existing_share = (
        db.query(ModelShare)
        .filter(
            ModelShare.model_id == model_id,
            ModelShare.shared_with_user_id == target_user.id,
        )
        .first()
    )

    if existing_share:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Model already shared with this user",
        )

    # Create share
    new_share = ModelShare(
        model_id=model_id,
        owner_id=current_user.id,
        shared_with_user_id=target_user.id,
        permission=share_request.permission,
    )

    db.add(new_share)
    db.commit()
    db.refresh(new_share)

    return {
        "success": True,
        "data": ModelShareResponse.model_validate(new_share),
        "message": f"Model shared with {share_request.shared_with_email}",
    }


@router.get("/{model_id}/shares", response_model=dict)
async def list_model_shares(
    model_id: str,
    current_user: User = Security(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List users this model is shared with

    - **model_id**: Model UUID

    Requires authentication and model ownership
    """
    # Validate model exists and user owns it
    model = db.query(Model).filter(Model.id == model_id).first()

    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Model not found"
        )

    if model.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view shares for your own models",
        )

    # Get shares
    shares = (
        db.query(ModelShare)
        .filter(ModelShare.model_id == model_id)
        .order_by(desc(ModelShare.created_at))
        .all()
    )

    share_list = [
        {
            "id": str(share.id),
            "shared_with_email": share.shared_with_user.email,
            "shared_with_name": share.shared_with_user.full_name,
            "permission": share.permission.value,
            "created_at": share.created_at.isoformat(),
        }
        for share in shares
    ]

    return {"success": True, "data": share_list, "total": len(share_list)}


@router.patch("/{model_id}/shares/{share_id}", response_model=dict)
async def update_model_share(
    model_id: str,
    share_id: str,
    update_request: ModelShareUpdate,
    current_user: User = Security(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update share permissions

    - **model_id**: Model UUID
    - **share_id**: Share UUID
    - **permission**: New permission level

    Requires authentication and model ownership
    """
    # Validate model exists and user owns it
    model = db.query(Model).filter(Model.id == model_id).first()

    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Model not found"
        )

    if model.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only modify shares for your own models",
        )

    # Get share
    share = (
        db.query(ModelShare)
        .filter(ModelShare.id == share_id, ModelShare.model_id == model_id)
        .first()
    )

    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Share not found"
        )

    # Update permission
    share.permission = update_request.permission
    db.commit()
    db.refresh(share)

    return {
        "success": True,
        "data": ModelShareResponse.model_validate(share),
        "message": "Share permission updated",
    }


@router.delete("/{model_id}/shares/{share_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_model_share(
    model_id: str,
    share_id: str,
    current_user: User = Security(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Revoke model share

    - **model_id**: Model UUID
    - **share_id**: Share UUID

    Requires authentication and model ownership
    """
    # Validate model exists and user owns it
    model = db.query(Model).filter(Model.id == model_id).first()

    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Model not found"
        )

    if model.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only revoke shares for your own models",
        )

    # Get and delete share
    share = (
        db.query(ModelShare)
        .filter(ModelShare.id == share_id, ModelShare.model_id == model_id)
        .first()
    )

    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Share not found"
        )

    db.delete(share)
    db.commit()

    return None


@router.get("/shared-with-me", response_model=dict)
async def list_shared_models(
    page: int = 1,
    per_page: int = 20,
    current_user: User = Security(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List models shared with the current user

    - **page**: Page number (default: 1)
    - **per_page**: Items per page (default: 20, max: 100)

    Requires authentication
    """
    # Query shares
    query = db.query(ModelShare).filter(
        ModelShare.shared_with_user_id == current_user.id
    )

    total = query.count()
    skip = (page - 1) * per_page
    shares = (
        query.order_by(desc(ModelShare.created_at)).offset(skip).limit(per_page).all()
    )

    shared_models = [
        {
            "model_id": str(share.model.id),
            "model_name": share.model.name,
            "model_version": share.model.version,
            "owner_email": share.owner.email,
            "owner_name": share.owner.full_name,
            "permission": share.permission.value,
            "shared_at": share.created_at.isoformat(),
        }
        for share in shares
    ]

    return {
        "success": True,
        "data": shared_models,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page,
            "total_items": total,
        },
    }
