def test_upload_model(client,auth_headers,temp_model_file):
    data={
        "name":"Test Model",
        "description":"A model for testing",    
        "version":"1.0.0"
    }
    response = client.post("/api/v1/models/upload",headers=auth_headers,files=temp_model_file,data=data)
    assert response.status_code == 201
    resp_data = response.json()
    assert resp_data["success"] is True
    assert "model_id" in resp_data["data"]
