import pytest

def test_new_user_registration(client):
    response = client.post("/api/v1/auth/register",
                           json={
                               "email": "test@example.com",
                               "password" : "Parthu12345@",
                               "full_name" : "Partha Saradhi"
                           })
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["user"]["email"] == "test@example.com"


def test_existing_user_registration(client, test_user):
    user = {
        "email" : "test@example2.com",
        "password" : "AnotherPass123@",
        "full_name" : "Another User"
    }
    response1 = client.post("/api/v1/auth/register",json=user)
    data1 = response1.json()
    assert response1.status_code == 201
    assert data1["success"] is True
    response2 = client.post("/api/v1/auth/register",json=user)
    data2 = response2.json()
    assert response2.status_code == 409
    # assert data2["success"] is False
@pytest.mark.parametrize("user", [{"email":"", "password":"ValidPass123@", "full_name":"No Email"},
                                  {"email":"invalidemail", "password":"ValidPass123@", "full_name":"Invalid Email"},
                                  {"email":"invalidemail2", "password":"ValidPass123@", "full_name":"Invalid Email 2"}])
def test_invalid_email(client, user):
    response = client.post("/api/v1/auth/register",json=user)
    assert response.status_code == 422  # Unprocessable Entity for invalid email format

@pytest.mark.parametrize("user", [{"email":"partha@email.com","password":"123","full_name":"Weak Pass"},{"email":"parthu@gmail.com","password":"abcdefg@","full_name":"Short Pass"},{"email":"paasgk@gmail.com","password":"nopunctuation1","full_name":"No Special Char"}])
def test_weak_password(client, user):
    response = client.post("/api/v1/auth/register",json=user)
    assert response.status_code == 422  # Unprocessable Entity for weak password
    

def test_user_login_with_correct_credentials(client):
    """Test: Users can login with correct email/password"""
    # TODO:
    # 1. Register a user first
    # 2. Login with same credentials
    # 3. Assert: Gets 200
    # 4. Assert: Response has "access_token"
    user = {
        "email": "parthasaradhimunakala@gmail.com",
        "password": "Parthu12345@",
        "full_name": "Partha Saradhi Munakala"
    }
    register_response = client.post("/api/v1/auth/register",json=user)
    assert register_response.status_code == 201
    login_response = client.post("/api/v1/auth/login",json={"email":user["email"],"password":user["password"]})
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert login_data["success"] is True
    assert login_data["data"]["access_token"] is not None