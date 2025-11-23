"""Tests for prediction endpoints"""

import json
from fastapi import status


def test_make_prediction(client, auth_headers, test_model):
    """Test making a prediction with a model"""
    model_id = test_model.id
    
    # Input must have exactly 2 features (matching the model)
    prediction_data = {
        "input": {"feature1": 0.5, "feature2": 1.5}
    }
    
    response = client.post(
        f"/api/v1/predict/{model_id}",
        headers=auth_headers,
        json=prediction_data
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Verify response structure
    assert "success" in data or "prediction" in data


def test_make_prediction_nonexistent_model(client, auth_headers):
    """Test making prediction with nonexistent model returns 404"""
    fake_id = "00000000-0000-0000-0000-000000000000"
    
    prediction_data = {
        "input": {"feature1": 0.5, "feature2": 1.5}
    }
    
    response = client.post(
        f"/api/v1/predict/{fake_id}",
        headers=auth_headers,
        json=prediction_data
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_make_prediction_unauthorized(client, test_model):
    """Test that prediction without auth returns 401"""
    model_id = test_model.id
    
    prediction_data = {
        "input": {"feature1": 0.5, "feature2": 1.5}
    }
    
    response = client.post(
        f"/api/v1/predict/{model_id}",
        json=prediction_data
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED