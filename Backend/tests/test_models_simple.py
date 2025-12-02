"""Tests for model listing and retrieval endpoints"""

import json
from fastapi import status


def test_list_models(client, auth_headers):
    """Test listing all models for authenticated user"""
    response = client.get(
        "/api/v1/models",
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Verify response structure
    assert "success" in data
    assert "data" in data
    assert isinstance(data["data"], list)


def test_list_models_unauthorized(client):
    """Test that listing models without auth returns 401"""
    response = client.get("/api/v1/models")
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_model_by_id(client, auth_headers, test_model, db):
    """Test getting a specific model by ID"""
    model_id = test_model.id
    
    response = client.get(
        f"/api/v1/models/{model_id}",
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["data"]["id"] == str(model_id)
    assert data["data"]["name"] == test_model.name


def test_get_nonexistent_model(client, auth_headers):
    """Test getting a model that doesn't exist returns 404"""
    fake_id = "00000000-0000-0000-0000-000000000000"
    
    response = client.get(
        f"/api/v1/models/{fake_id}",
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND