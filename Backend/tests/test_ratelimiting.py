def test_me_ratelimit(client,auth_headers):
    for i in range(10):
        response = client.get("/api/v1/auth/me",headers=auth_headers)
        assert response.status_code in [200,429]
    response = client.get("/api/v1/auth/me",headers=auth_headers)
    assert response.status_code == 429