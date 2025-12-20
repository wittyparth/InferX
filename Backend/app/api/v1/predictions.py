""" 
Prediction endpoints
Handles real-time and batch predictions with Redis caching
"""

import io
import joblib
import logging
import time
from datetime import datetime
from typing import Any, Dict
from uuid import UUID

import numpy as np
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Security, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.caching import PredictionCache, get_cache
from app.core.model_loader import ModelLoader, get_model_loader
from app.core.rate_limiter import rate_limit
from app.core.rate_limit_config import PREDICT, PREDICT_HISTORY
from app.core.webhook_service import trigger_webhooks
from app.db.session import get_db
from app.models.model import Model
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.prediction import PredictionInput
from app.core.storage import StorageService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/predict", tags=["Predictions"])


# Background task to log predictions
def log_prediction_to_db(
    db: Session,
    user_id: UUID,
    model_id: UUID,
    input_data: Dict[str, Any],
    output_data: Dict[str, Any],
    inference_time_ms: int,
    status: str = "success",
    error_message: str = None,
):
    """Background task to log prediction to database"""
    try:
        prediction_log = Prediction(
            user_id=user_id,
            model_id=model_id,
            input_data=input_data,
            output_data=output_data,
            inference_time_ms=inference_time_ms,
            status=status,
            error_message=error_message,
        )
        db.add(prediction_log)
        db.commit()
        logger.info(f"Logged prediction for model {model_id}, status: {status}")
    except Exception as e:
        logger.error(f"Failed to log prediction: {str(e)}")
        db.rollback()


@router.post("/{model_id}", response_model=dict)
async def predict(
    model_id: str,
    prediction_input: PredictionInput,
    background_tasks: BackgroundTasks,
    current_user: User = Security(get_current_user),
    db: Session = Depends(get_db),
    loader: ModelLoader = Depends(get_model_loader),
    cache: PredictionCache = Depends(get_cache),
    _rate_limit: None = Depends(rate_limit(PREDICT)),
):
    """
    Make a real-time prediction

    - **model_id**: Model UUID
    - **input**: Input data as JSON object
    - **version**: Optional model version (defaults to latest)

    Requires authentication

    Returns prediction result with metadata
    
    **Performance:** Results are cached in Redis. Identical inputs return cached results instantly.
    """
    start_time = time.time()
    cache_hit = False

    # Get model
    query = db.query(Model).filter(Model.id == model_id)

    # Filter by version if specified
    if prediction_input.version:
        query = query.filter(Model.version == prediction_input.version)

    model_record = query.first()

    if not model_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found or version not available",
        )

    if model_record.status not in ["active", "deprecated"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Model is not available for predictions",
        )

    try:
        # ==================== CHECK CACHE FIRST ====================
        cached_result = await cache.get_prediction(
            model_id=str(model_record.id),
            input_data=prediction_input.input,
            version=model_record.version,
        )
        
        if cached_result:
            cache_hit = True
            inference_time_ms = int((time.time() - start_time) * 1000)
            
            logger.info(f"Cache HIT for model {model_id} - returning cached prediction")
            
            return {
                "success": True,
                "data": {
                    "prediction": cached_result,
                    "metadata": {
                        "model_id": str(model_record.id),
                        "model_version": model_record.version,
                        "inference_time_ms": inference_time_ms,
                        "model_cached": loader.is_model_cached(str(model_record.id)),
                        "prediction_cached": True,
                    },
                    "timestamp": datetime.utcnow().isoformat(),
                },
            }
        
        # ==================== CACHE MISS - RUN INFERENCE ====================
        logger.info(f"Cache MISS for model {model_id} - running inference")
        
        # Load model using ModelLoader (handles model caching + S3/local storage)
        model = await loader.load_model(
            file_path=model_record.file_path,
            model_id=str(model_record.id)
        )

        # Prepare input data
        input_data = prediction_input.input

        # Convert input to numpy array for sklearn models
        if model_record.model_type == "sklearn":
            # Accept dict → single sample, list → single or batch
            if isinstance(input_data, dict):
                vals = list(input_data.values())
                if len(vals) == 1 and isinstance(vals[0], (list, tuple, np.ndarray)):
                    # Unwrap common payloads like {"features": [...]}
                    inner = vals[0]
                    if inner and all(isinstance(row, (list, tuple, np.ndarray)) for row in inner):
                        # Batch inside the single key
                        X = np.array(inner)
                    else:
                        X = np.array([list(inner)])
                else:
                    feature_values = vals
                    X = np.array([feature_values])
            elif isinstance(input_data, list):
                # If already batch (list of lists/tuples), keep as-is; else wrap as single sample
                if input_data and all(isinstance(row, (list, tuple)) for row in input_data):
                    X = np.array(input_data)
                else:
                    X = np.array([input_data])
            else:
                raise ValueError("Input must be a dict or list")

            if X.ndim > 2:
                raise ValueError("Input must be 1D feature list or 2D batch of samples")

            # Make prediction
            prediction = model.predict(X)

            # Get probabilities if available
            probabilities = None
            confidence = None
            if hasattr(model, "predict_proba"):
                proba = model.predict_proba(X)
                probabilities = proba[0].tolist()
                confidence = float(max(probabilities))

            # Format result
            prediction_result = {
                "prediction": (
                    int(prediction[0])
                    if hasattr(prediction[0], "item")
                    else prediction[0]
                ),
                "confidence": confidence,
                "probabilities": probabilities,
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail=f"Predictions for {model_record.model_type} models not yet implemented",
            )

        # Calculate inference time
        inference_time_ms = int((time.time() - start_time) * 1000)

        # ==================== CACHE THE RESULT ====================
        # Cache in background to not slow down response
        background_tasks.add_task(
            cache.set_prediction,
            model_id=str(model_record.id),
            input_data=prediction_input.input,
            output_data=prediction_result,
            version=model_record.version,
            ttl=3600,  # 1 hour cache TTL
        )

        # Log prediction to database asynchronously (non-blocking)
        background_tasks.add_task(
            log_prediction_to_db,
            db=db,
            user_id=current_user.id,
            model_id=model_record.id,
            input_data=prediction_input.input,
            output_data=prediction_result,
            inference_time_ms=inference_time_ms,
            status="success",
        )

        # Trigger webhooks for prediction event
        background_tasks.add_task(
            trigger_webhooks,
            db=db,
            event_type="prediction",
            model_id=str(model_record.id),
            user_id=str(current_user.id),
            data={
                "input": prediction_input.input,
                "output": prediction_result,
                "inference_time_ms": inference_time_ms,
            },
        )

        return {
            "success": True,
            "data": {
                "prediction": prediction_result,
                "metadata": {
                    "model_id": str(model_record.id),
                    "model_version": model_record.version,
                    "inference_time_ms": inference_time_ms,
                    "model_cached": loader.is_model_cached(str(model_record.id)),
                    "prediction_cached": False,
                },
                "timestamp": datetime.utcnow().isoformat(),
            },
        }

    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Model file not found on disk"
        )
    except Exception as e:
        # Log failed prediction asynchronously
        background_tasks.add_task(
            log_prediction_to_db,
            db=db,
            user_id=current_user.id,
            model_id=model_record.id,
            input_data=prediction_input.input,
            output_data=None,
            inference_time_ms=int((time.time() - start_time) * 1000),
            status="failed",
            error_message=str(e),
        )

        # Trigger webhooks for error event
        background_tasks.add_task(
            trigger_webhooks,
            db=db,
            event_type="error",
            model_id=str(model_record.id),
            user_id=str(current_user.id),
            data={"error": str(e), "input": prediction_input.input},
        )

        logger.error(f"Prediction failed for model {model_id}: {str(e)}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}",
        )


@router.get("/history", response_model=dict)
async def get_prediction_history(
    model_id: str = None,
    page: int = 1,
    per_page: int = 20,
    current_user: User = Security(get_current_user),
    db: Session = Depends(get_db),
    _rate_limit: None = Depends(rate_limit(PREDICT_HISTORY)),
):
    """
    Get prediction history

    - **model_id**: Optional model UUID to filter by
    - **page**: Page number
    - **per_page**: Items per page

    Requires authentication

    Returns paginated prediction history
    """
    try:
        # Build query
        query = db.query(Prediction).filter(Prediction.user_id == current_user.id)

        # Filter by model if specified
        if model_id:
            try:
                model_uuid = UUID(model_id)
                query = query.filter(Prediction.model_id == model_uuid)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid model_id format",
                )

        # Get total count for pagination
        total_items = query.count()
        total_pages = (total_items + per_page - 1) // per_page

        # Apply pagination and ordering
        predictions = (
            query.order_by(Prediction.created_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )

        # Format response with model names
        data = []
        for pred in predictions:
            model = db.query(Model).filter(Model.id == pred.model_id).first()
            data.append(
                {
                    "id": str(pred.id),
                    "model_id": str(pred.model_id),
                    "model_name": model.name if model else None,
                    "user_id": str(pred.user_id),
                    "input_data": pred.input_data,
                    "output_data": pred.output_data,
                    "inference_time_ms": pred.inference_time_ms,
                    "status": pred.status,
                    "error_message": pred.error_message,
                    "created_at": pred.created_at.isoformat(),
                }
            )

        return {
            "success": True,
            "data": data,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total_pages": total_pages,
                "total_items": total_items,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching prediction history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch prediction history: {str(e)}",
        )


@router.get("/cache/stats", response_model=dict)
async def get_cache_stats(
    current_user: User = Security(get_current_user),
    cache: PredictionCache = Depends(get_cache),
):
    """
    Get prediction cache statistics.
    
    Shows hit rate, memory usage, and cache health.
    
    Requires authentication.
    """
    stats = await cache.get_cache_stats()
    memory = await cache.get_memory_usage()
    
    return {
        "success": True,
        "data": {
            "cache_stats": stats,
            "memory_usage": memory,
            "limits": {
                "max_item_size_kb": 1024,  # 1MB per item
                "recommended_total_mb": 200,  # Stay under 250MB
            },
        },
    }


@router.delete("/cache/{model_id}", response_model=dict)
async def invalidate_model_cache(
    model_id: str,
    current_user: User = Security(get_current_user),
    db: Session = Depends(get_db),
    cache: PredictionCache = Depends(get_cache),
):
    """
    Invalidate all cached predictions for a specific model.
    
    Use this when a model is updated or retrained.
    
    - **model_id**: Model UUID
    
    Requires authentication and model ownership.
    """
    # Verify model ownership
    model = db.query(Model).filter(Model.id == model_id).first()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found",
        )
    
    if model.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to manage this model's cache",
        )
    
    deleted_count = await cache.invalidate_model_cache(model_id)
    
    return {
        "success": True,
        "data": {
            "model_id": model_id,
            "deleted_cache_entries": deleted_count,
        },
        "message": f"Invalidated {deleted_count} cached predictions for model {model_id}",
    }

