# 🎮 InferX Testing Quest: Production-Ready Edition

**Welcome, Test Warrior!** Your mission: Build a bulletproof test suite for InferX from scratch.

---

## 🎯 How This Quest Works

- **⚔️ Missions**: Each mission is a hands-on coding challenge
- **✅ Checkpoints**: Verify your tests work before moving on
- **🏆 Achievements**: Unlock as you complete sections
- **💎 XP Points**: Track your progress
- **🎁 Rewards**: Dopamine hits when tests pass!

---

## 📊 Your Progress Tracker

```
Level 1: Test Setup Wizard          [ ] 0/100 XP
Level 2: Auth Testing Master        [ ] 0/200 XP
Level 3: Model Testing Champion     [ ] 0/300 XP
Level 4: Prediction Testing Hero    [ ] 0/200 XP
Level 5: Security Testing Guardian  [ ] 0/300 XP
Level 6: Integration Testing Legend [ ] 0/400 XP
                                    ___________
                                    TOTAL: 0/1500 XP
```

---

# 🌟 LEVEL 1: Test Setup Wizard (100 XP)

**Goal**: Set up your testing environment perfectly

---

## Mission 1.1: Verify Test Dependencies (20 XP)

**What you'll learn**: Checking if all testing tools are installed

### 📝 Your Task:

Open a terminal in `Backend/` and run:

```bash
pytest --version
```

**Expected Output**: Should show pytest 7.4.3 or higher

**If it fails:**
```bash
pip install pytest pytest-asyncio pytest-cov
```

### ✅ Checkpoint:
Run `pytest --version` and verify it works.

**Mark complete when**: You see pytest version displayed

---

## Mission 1.2: Understand Your Test Structure (20 XP)

**What you'll learn**: Navigate InferX test files

### 📝 Your Task:

1. Open `Backend/tests/` folder
2. List all test files (you should see):
   - `conftest.py` - Shared fixtures
   - `test_auth.py` - Auth tests (commented out)
   - `test_models.py` - Model tests
   - `test_prediction.py` - Prediction tests

3. **Your first action**: Open `conftest.py` and read lines 1-60

### ✅ Checkpoint:
Answer this: "What does the `client` fixture do?"

<details>
<summary>💡 Hint</summary>
It provides a TestClient that replaces FastAPI's database dependency with the test database.
</details>

**Mark complete when**: You understand what `client`, `db`, and `auth_headers` fixtures do

---

## Mission 1.3: Run Your First Test (60 XP) 🎉

**What you'll learn**: Execute tests and read output

### 📝 Your Task:

**STEP 1**: Uncomment ONE test in `test_auth.py`

Open `Backend/tests/test_auth.py` and find this:

```python
# def test_register_user(client):
#     """Test user registration"""
#     response = client.post(
#         "/api/v1/auth/register",
#         json={
#             "email": "test@example.com",
#             "password": "TestPass123!",
#             "full_name": "Test User",
#         },
#     )
#     assert response.status_code == status.HTTP_201_CREATED
#     data = response.json()
#     assert data["success"] is True
#     assert data["data"]["user"]["email"] == "test@example.com"
```

**Remove the `#` from every line** to uncomment it.

**STEP 2**: Run the test

```bash
cd Backend
pytest tests/test_auth.py::test_register_user -v
```

**STEP 3**: Watch the magic! ✨

### ✅ Checkpoint:

**If it PASSES**: 🎉 Congratulations! You ran your first test!
**If it FAILS**: Read the error message. Common issues:
- Database not running? Start with `docker-compose up -d`
- Import errors? Make sure you're in `Backend/` directory

### 🏆 Achievement Unlocked: "First Test Pass" (+60 XP)

---

# 🌟 LEVEL 2: Auth Testing Master (200 XP)

**Goal**: Write comprehensive authentication tests

---

## Mission 2.1: Test User Registration (Happy Path) (30 XP)

**What you'll learn**: Testing successful user creation

### 📝 Your Task:

**Create a NEW test in `test_auth.py`** (don't uncomment - write fresh!)

```python
def test_new_user_registration_success(client):
    """Test: New users can register with valid data"""
    # TODO: Write your test here
    # Hint: POST to /api/v1/auth/register with email, password, full_name
    # Assert: status_code is 201
    # Assert: response has user email
    pass
```

### 🎯 Requirements:
- Use email: `"warrior@inferx.com"`
- Use password: `"SuperSecret123!"`
- Check status code is 201
- Verify response contains the email

### ✅ Checkpoint:

Run: `pytest tests/test_auth.py::test_new_user_registration_success -v`

Should see: `PASSED`

<details>
<summary>🆘 Solution (try first!)</summary>

```python
def test_new_user_registration_success(client):
    """Test: New users can register with valid data"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "warrior@inferx.com",
            "password": "SuperSecret123!",
            "full_name": "Test Warrior"
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["data"]["user"]["email"] == "warrior@inferx.com"
```
</details>

**Mark complete when**: Test passes ✅

---

## Mission 2.2: Test Duplicate Registration (Edge Case) (40 XP)

**What you'll learn**: Testing error conditions

### 📝 Your Task:

Write a test that registers the SAME user TWICE and expects failure.

```python
def test_duplicate_email_registration_fails(client):
    """Test: Registering duplicate email should fail"""
    # TODO: 
    # 1. Register user once
    # 2. Try to register SAME email again
    # 3. Assert second attempt returns 409 (Conflict)
    pass
```

### 🎯 Requirements:
- First registration should succeed (201)
- Second registration with same email should fail (409)

### ✅ Checkpoint:

Run: `pytest tests/test_auth.py::test_duplicate_email_registration_fails -v`

<details>
<summary>🆘 Solution</summary>

```python
def test_duplicate_email_registration_fails(client):
    """Test: Registering duplicate email should fail"""
    email = "duplicate@inferx.com"
    
    # First registration - should work
    client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "Pass123!",
            "full_name": "First User"
        }
    )
    
    # Second registration - should fail
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "DifferentPass123!",
            "full_name": "Second User"
        }
    )
    
    assert response.status_code == 409
```
</details>

**Mark complete when**: Test passes ✅

---

## Mission 2.3: Test Invalid Email Formats (Parametrized!) (50 XP)

**What you'll learn**: Using parametrize to test multiple cases at once

### 📝 Your Task:

Write ONE test that checks multiple invalid emails.

```python
import pytest

@pytest.mark.parametrize("invalid_email", [
    # TODO: Add at least 5 invalid email formats
    # Examples: "notanemail", "@example.com", "missing.com", etc.
])
def test_invalid_email_formats_rejected(client, invalid_email):
    """Test: Invalid email formats should be rejected"""
    # TODO: Try to register with invalid_email
    # Assert: Gets 422 (Validation Error)
    pass
```

### 🎯 Requirements:
- Test at least 5 invalid email formats
- All should return 422 status code
- Use parametrize decorator

### ✅ Checkpoint:

Run: `pytest tests/test_auth.py::test_invalid_email_formats_rejected -v`

You should see MULTIPLE test results (one per email)!

<details>
<summary>🆘 Solution</summary>

```python
@pytest.mark.parametrize("invalid_email", [
    "notanemail",
    "@example.com",
    "missing@",
    "no-domain@",
    "",
    "spaces in@email.com",
])
def test_invalid_email_formats_rejected(client, invalid_email):
    """Test: Invalid email formats should be rejected"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": invalid_email,
            "password": "ValidPass123!",
            "full_name": "Test User"
        }
    )
    
    assert response.status_code == 422
```
</details>

**Mark complete when**: All parametrized tests pass ✅

---

## Mission 2.4: Test Weak Passwords (40 XP)

**What you'll learn**: Security validation testing

### 📝 Your Task:

Write a parametrized test for weak passwords.

```python
@pytest.mark.parametrize("weak_password", [
    # TODO: Add weak passwords
    # Short, no numbers, no special chars, etc.
])
def test_weak_passwords_rejected(client, weak_password):
    """Test: Weak passwords should be rejected"""
    # TODO: Try to register with weak password
    # Assert: Gets 422
    pass
```

### 🎯 Requirements:
- Test at least 4 weak passwords:
  - Too short (< 8 chars)
  - Only letters
  - Only numbers
  - Common password

### ✅ Checkpoint:

Run the test - all cases should fail with 422!

<details>
<summary>🆘 Solution</summary>

```python
@pytest.mark.parametrize("weak_password", [
    "short",           # Too short
    "NoNumbers!",      # No numbers
    "12345678",        # Only numbers
    "password123",     # Common/weak
])
def test_weak_passwords_rejected(client, weak_password):
    """Test: Weak passwords should be rejected"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@inferx.com",
            "password": weak_password,
            "full_name": "Test User"
        }
    )
    
    assert response.status_code == 422
```
</details>

**Mark complete when**: Test passes ✅

---

## Mission 2.5: Test User Login (40 XP)

**What you'll learn**: Testing authentication flow

### 📝 Your Task:

Write a test for user login.

```python
def test_user_login_with_correct_credentials(client):
    """Test: Users can login with correct email/password"""
    # TODO:
    # 1. Register a user first
    # 2. Login with same credentials
    # 3. Assert: Gets 200
    # 4. Assert: Response has "access_token"
    pass
```

### 🎯 Requirements:
- Register a user
- Login with same credentials
- Verify you get an access token back

### ✅ Checkpoint:

<details>
<summary>🆘 Solution</summary>

```python
def test_user_login_with_correct_credentials(client):
    """Test: Users can login with correct email/password"""
    # Register user
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@inferx.com",
            "password": "LoginPass123!",
            "full_name": "Login User"
        }
    )
    
    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "login@inferx.com",
            "password": "LoginPass123!"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
```
</details>

**Mark complete when**: Test passes ✅

### 🏆 Achievement Unlocked: "Auth Testing Master" (+200 XP)

---

# 🌟 LEVEL 3: Model Testing Champion (300 XP)

**Goal**: Test the core model upload/management functionality

---

## Mission 3.1: Test Model Upload (60 XP)

**What you'll learn**: Testing file uploads

### 📝 Your Task:

Open `test_models.py` and write:

```python
def test_upload_model_successfully(client, auth_headers, temp_model_file):
    """Test: Authenticated users can upload ML models"""
    # TODO:
    # 1. Open temp_model_file
    # 2. POST to /api/v1/models/upload with:
    #    - auth_headers
    #    - data: name, description, model_type
    #    - files: the model file
    # 3. Assert: 201 status
    # 4. Assert: Response has model name and version
    pass
```

### 🎯 Requirements:
- Use `auth_headers` fixture for authentication
- Use `temp_model_file` fixture for the file
- Model name: "fraud_detector"
- Model type: "sklearn"
- Verify response has model ID, name, and version

### ✅ Checkpoint:

Run: `pytest tests/test_models.py::test_upload_model_successfully -v`

<details>
<summary>🆘 Solution</summary>

```python
def test_upload_model_successfully(client, auth_headers, temp_model_file):
    """Test: Authenticated users can upload ML models"""
    with open(temp_model_file, "rb") as f:
        response = client.post(
            "/api/v1/models/upload",
            headers=auth_headers,
            data={
                "name": "fraud_detector",
                "description": "Detects fraudulent transactions",
                "model_type": "sklearn"
            },
            files={"file": ("model.pkl", f, "application/octet-stream")}
        )
    
    assert response.status_code == 201
    data = response.json()
    assert data["data"]["model"]["name"] == "fraud_detector"
    assert data["data"]["model"]["version"] == 1
    assert "id" in data["data"]["model"]
```
</details>

**Mark complete when**: Test passes ✅

---

## Mission 3.2: Test Unauthenticated Upload Fails (40 XP)

**What you'll learn**: Security testing - auth required

### 📝 Your Task:

```python
def test_upload_model_without_auth_fails(client, temp_model_file):
    """Test: Unauthenticated users cannot upload models"""
    # TODO:
    # 1. Try to upload WITHOUT auth_headers
    # 2. Assert: Gets 401 (Unauthorized)
    pass
```

### 🎯 Requirements:
- Don't use `auth_headers` fixture
- Should get 401 status code

### ✅ Checkpoint:

<details>
<summary>🆘 Solution</summary>

```python
def test_upload_model_without_auth_fails(client, temp_model_file):
    """Test: Unauthenticated users cannot upload models"""
    with open(temp_model_file, "rb") as f:
        response = client.post(
            "/api/v1/models/upload",
            # No auth_headers!
            data={
                "name": "hacker_model",
                "model_type": "sklearn"
            },
            files={"file": ("model.pkl", f, "application/octet-stream")}
        )
    
    assert response.status_code == 401
```
</details>

**Mark complete when**: Test passes ✅

---

## Mission 3.3: Test Model Versioning (80 XP)

**What you'll learn**: Automatic version incrementation

### 📝 Your Task:

```python
def test_model_auto_versioning(client, auth_headers, temp_model_file):
    """Test: Uploading same model name creates new version"""
    # TODO:
    # 1. Upload a model with name "versioned_model"
    # 2. Assert: version is 1
    # 3. Upload ANOTHER model with SAME name
    # 4. Assert: version is 2
    pass
```

### 🎯 Requirements:
- Upload same model name twice
- First upload: version = 1
- Second upload: version = 2

### ✅ Checkpoint:

<details>
<summary>🆘 Solution</summary>

```python
def test_model_auto_versioning(client, auth_headers, temp_model_file):
    """Test: Uploading same model name creates new version"""
    model_name = "versioned_model"
    
    # Upload version 1
    with open(temp_model_file, "rb") as f:
        response1 = client.post(
            "/api/v1/models/upload",
            headers=auth_headers,
            data={"name": model_name, "model_type": "sklearn"},
            files={"file": ("model.pkl", f, "application/octet-stream")}
        )
    
    assert response1.json()["data"]["model"]["version"] == 1
    
    # Upload version 2 (same name)
    with open(temp_model_file, "rb") as f:
        response2 = client.post(
            "/api/v1/models/upload",
            headers=auth_headers,
            data={"name": model_name, "model_type": "sklearn"},
            files={"file": ("model.pkl", f, "application/octet-stream")}
        )
    
    assert response2.json()["data"]["model"]["version"] == 2
```
</details>

**Mark complete when**: Test passes ✅

---

## Mission 3.4: Test List User Models (60 XP)

**What you'll learn**: Testing GET endpoints

### 📝 Your Task:

```python
def test_list_user_models(client, auth_headers, temp_model_file):
    """Test: Users can list their uploaded models"""
    # TODO:
    # 1. Upload 2 different models
    # 2. GET /api/v1/models with auth_headers
    # 3. Assert: Gets 200
    # 4. Assert: Response has 2 models
    pass
```

### 🎯 Requirements:
- Upload at least 2 models
- List them with GET request
- Verify count is correct

### ✅ Checkpoint:

<details>
<summary>🆘 Solution</summary>

```python
def test_list_user_models(client, auth_headers, temp_model_file):
    """Test: Users can list their uploaded models"""
    # Upload model 1
    with open(temp_model_file, "rb") as f:
        client.post(
            "/api/v1/models/upload",
            headers=auth_headers,
            data={"name": "model_1", "model_type": "sklearn"},
            files={"file": ("model.pkl", f, "application/octet-stream")}
        )
    
    # Upload model 2
    with open(temp_model_file, "rb") as f:
        client.post(
            "/api/v1/models/upload",
            headers=auth_headers,
            data={"name": "model_2", "model_type": "sklearn"},
            files={"file": ("model.pkl", f, "application/octet-stream")}
        )
    
    # List models
    response = client.get("/api/v1/models", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) >= 2
```
</details>

**Mark complete when**: Test passes ✅

---

## Mission 3.5: Test Delete Model (60 XP)

**What you'll learn**: Testing DELETE operations

### 📝 Your Task:

```python
def test_delete_own_model(client, auth_headers, temp_model_file):
    """Test: Users can delete their own models"""
    # TODO:
    # 1. Upload a model
    # 2. Get the model ID from response
    # 3. DELETE /api/v1/models/{model_id}
    # 4. Assert: Gets 200
    # 5. Verify model is deleted (GET returns 404)
    pass
```

### 🎯 Requirements:
- Upload a model
- Delete it
- Verify deletion worked

### ✅ Checkpoint:

<details>
<summary>🆘 Solution</summary>

```python
def test_delete_own_model(client, auth_headers, temp_model_file):
    """Test: Users can delete their own models"""
    # Upload model
    with open(temp_model_file, "rb") as f:
        upload_response = client.post(
            "/api/v1/models/upload",
            headers=auth_headers,
            data={"name": "deletable_model", "model_type": "sklearn"},
            files={"file": ("model.pkl", f, "application/octet-stream")}
        )
    
    model_id = upload_response.json()["data"]["model"]["id"]
    
    # Delete model
    delete_response = client.delete(
        f"/api/v1/models/{model_id}",
        headers=auth_headers
    )
    
    assert delete_response.status_code == 200
    
    # Verify deleted (optional but good practice)
    get_response = client.get(
        f"/api/v1/models/{model_id}",
        headers=auth_headers
    )
    assert get_response.status_code == 404
```
</details>

**Mark complete when**: Test passes ✅

### 🏆 Achievement Unlocked: "Model Testing Champion" (+300 XP)

---

# 🌟 LEVEL 4: Prediction Testing Hero (200 XP)

**Goal**: Test ML prediction functionality

---

## Mission 4.1: Test Make Prediction (80 XP)

**What you'll learn**: Testing ML predictions

### 📝 Your Task:

Open `test_prediction.py` and write:

```python
def test_make_prediction_with_valid_input(client, auth_headers, test_model):
    """Test: Users can make predictions with uploaded models"""
    # TODO:
    # 1. POST to /api/v1/predict/{test_model.id}
    # 2. Send input: {"feature1": 5.1, "feature2": 3.5}
    # 3. Assert: Gets 200
    # 4. Assert: Response has "prediction" key
    pass
```

### 🎯 Requirements:
- Use `test_model` fixture (already uploaded model)
- Send valid input data
- Verify prediction is returned

### ✅ Checkpoint:

<details>
<summary>🆘 Solution</summary>

```python
def test_make_prediction_with_valid_input(client, auth_headers, test_model):
    """Test: Users can make predictions with uploaded models"""
    response = client.post(
        f"/api/v1/predict/{test_model.id}",
        headers=auth_headers,
        json={"input": {"feature1": 5.1, "feature2": 3.5}}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
```
</details>

**Mark complete when**: Test passes ✅

---

## Mission 4.2: Test Invalid Model ID (40 XP)

**What you'll learn**: Testing error cases

### 📝 Your Task:

```python
def test_prediction_with_nonexistent_model(client, auth_headers):
    """Test: Prediction with fake model ID returns 404"""
    # TODO:
    # 1. Use fake UUID: "00000000-0000-0000-0000-000000000000"
    # 2. Try to make prediction
    # 3. Assert: Gets 404
    pass
```

### ✅ Checkpoint:

<details>
<summary>🆘 Solution</summary>

```python
def test_prediction_with_nonexistent_model(client, auth_headers):
    """Test: Prediction with fake model ID returns 404"""
    fake_id = "00000000-0000-0000-0000-000000000000"
    
    response = client.post(
        f"/api/v1/predict/{fake_id}",
        headers=auth_headers,
        json={"input": {"feature1": 5.1, "feature2": 3.5}}
    )
    
    assert response.status_code == 404
```
</details>

**Mark complete when**: Test passes ✅

---

## Mission 4.3: Test Invalid Input Shape (80 XP)

**What you'll learn**: Input validation testing

### 📝 Your Task:

```python
def test_prediction_with_wrong_input_shape(client, auth_headers, test_model):
    """Test: Wrong number of features returns error"""
    # TODO:
    # 1. Send input with only 1 feature (model expects 2)
    # 2. Assert: Gets 400
    pass
```

### ✅ Checkpoint:

<details>
<summary>🆘 Solution</summary>

```python
def test_prediction_with_wrong_input_shape(client, auth_headers, test_model):
    """Test: Wrong number of features returns error"""
    response = client.post(
        f"/api/v1/predict/{test_model.id}",
        headers=auth_headers,
        json={"input": {"feature1": 5.1}}  # Missing feature2!
    )
    
    assert response.status_code == 400
```
</details>

**Mark complete when**: Test passes ✅

### 🏆 Achievement Unlocked: "Prediction Testing Hero" (+200 XP)

---

# 🌟 LEVEL 5: Security Testing Guardian (300 XP)

**Goal**: Ensure users can't access other users' data

---

## Mission 5.1: Test Users Can't Delete Others' Models (100 XP)

**What you'll learn**: Multi-user security testing

### 📝 Your Task:

This is a BOSS FIGHT! 🐉

```python
def test_user_cannot_delete_other_users_model(client, db):
    """Test: Users can only delete their own models"""
    # TODO:
    # 1. Create User1, login, upload model
    # 2. Create User2, login
    # 3. User2 tries to delete User1's model
    # 4. Assert: Gets 403 (Forbidden)
    pass
```

### 🎯 Requirements:
- Create 2 separate users
- User1 uploads a model
- User2 tries to delete it
- Should get 403 error

### ✅ Checkpoint:

<details>
<summary>🆘 Solution</summary>

```python
def test_user_cannot_delete_other_users_model(client, db, temp_model_file):
    """Test: Users can only delete their own models"""
    from app.models.user import User
    from app.core.security import get_password_hash
    
    # Create User1
    user1 = User(
        email="owner@inferx.com",
        hashed_password=get_password_hash("Pass123!"),
        full_name="Model Owner"
    )
    db.add(user1)
    db.commit()
    
    # User1 login
    login1 = client.post(
        "/api/v1/auth/login",
        json={"email": "owner@inferx.com", "password": "Pass123!"}
    )
    user1_token = login1.json()["access_token"]
    user1_headers = {"Authorization": f"Bearer {user1_token}"}
    
    # User1 uploads model
    with open(temp_model_file, "rb") as f:
        upload = client.post(
            "/api/v1/models/upload",
            headers=user1_headers,
            data={"name": "private_model", "model_type": "sklearn"},
            files={"file": ("model.pkl", f, "application/octet-stream")}
        )
    model_id = upload.json()["data"]["model"]["id"]
    
    # Create User2
    user2 = User(
        email="hacker@inferx.com",
        hashed_password=get_password_hash("Pass123!"),
        full_name="Sneaky Hacker"
    )
    db.add(user2)
    db.commit()
    
    # User2 login
    login2 = client.post(
        "/api/v1/auth/login",
        json={"email": "hacker@inferx.com", "password": "Pass123!"}
    )
    user2_token = login2.json()["access_token"]
    user2_headers = {"Authorization": f"Bearer {user2_token}"}
    
    # User2 tries to delete User1's model
    response = client.delete(
        f"/api/v1/models/{model_id}",
        headers=user2_headers
    )
    
    assert response.status_code == 403
```
</details>

**Mark complete when**: Test passes ✅

---

## Mission 5.2: Test Users Can't Access Others' Models (100 XP)

**What you'll learn**: Read access security

### 📝 Your Task:

```python
def test_user_cannot_view_other_users_model(client, db, temp_model_file):
    """Test: Users can only view their own models"""
    # TODO: Similar to 5.1, but test GET instead of DELETE
    pass
```

### ✅ Checkpoint:

<details>
<summary>🆘 Solution</summary>

```python
def test_user_cannot_view_other_users_model(client, db, temp_model_file):
    """Test: Users can only view their own models"""
    from app.models.user import User
    from app.core.security import get_password_hash
    
    # Create and setup User1
    user1 = User(
        email="owner2@inferx.com",
        hashed_password=get_password_hash("Pass123!"),
        full_name="Model Owner 2"
    )
    db.add(user1)
    db.commit()
    
    login1 = client.post(
        "/api/v1/auth/login",
        json={"email": "owner2@inferx.com", "password": "Pass123!"}
    )
    user1_headers = {"Authorization": f"Bearer {login1.json()['access_token']}"}
    
    # User1 uploads model
    with open(temp_model_file, "rb") as f:
        upload = client.post(
            "/api/v1/models/upload",
            headers=user1_headers,
            data={"name": "secret_model", "model_type": "sklearn"},
            files={"file": ("model.pkl", f, "application/octet-stream")}
        )
    model_id = upload.json()["data"]["model"]["id"]
    
    # Create User2
    user2 = User(
        email="spy@inferx.com",
        hashed_password=get_password_hash("Pass123!"),
        full_name="Corporate Spy"
    )
    db.add(user2)
    db.commit()
    
    login2 = client.post(
        "/api/v1/auth/login",
        json={"email": "spy@inferx.com", "password": "Pass123!"}
    )
    user2_headers = {"Authorization": f"Bearer {login2.json()['access_token']}"}
    
    # User2 tries to GET User1's model
    response = client.get(
        f"/api/v1/models/{model_id}",
        headers=user2_headers
    )
    
    assert response.status_code == 403
```
</details>

**Mark complete when**: Test passes ✅

---

## Mission 5.3: Test Password Not Returned in API (100 XP)

**What you'll learn**: Sensitive data protection

### 📝 Your Task:

```python
def test_password_never_returned_in_api(client):
    """Test: API never returns password or hash"""
    # TODO:
    # 1. Register a user
    # 2. Check response doesn't contain "password" or "hashed_password"
    # 3. Login
    # 4. Check response doesn't contain password
    pass
```

### ✅ Checkpoint:

<details>
<summary>🆘 Solution</summary>

```python
def test_password_never_returned_in_api(client):
    """Test: API never returns password or hash"""
    # Register
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "security@inferx.com",
            "password": "SecurePass123!",
            "full_name": "Security Tester"
        }
    )
    
    register_data = str(register_response.json())
    assert "password" not in register_data.lower()
    assert "SecurePass123!" not in register_data
    
    # Login
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "security@inferx.com",
            "password": "SecurePass123!"
        }
    )
    
    login_data = str(login_response.json())
    assert "password" not in login_data.lower()
    assert "SecurePass123!" not in login_data
```
</details>

**Mark complete when**: Test passes ✅

### 🏆 Achievement Unlocked: "Security Testing Guardian" (+300 XP)

---

# 🌟 LEVEL 6: Integration Testing Legend (400 XP)

**Goal**: Test complete user workflows end-to-end

---

## Mission 6.1: Complete Model Lifecycle (200 XP)

**What you'll learn**: End-to-end testing

### 📝 Your Task:

This is the FINAL BOSS! 🎮

```python
def test_complete_model_lifecycle(client, temp_model_file):
    """Test: Full workflow from registration to prediction to deletion"""
    # TODO:
    # 1. Register new user
    # 2. Login
    # 3. Upload a model
    # 4. Make a prediction
    # 5. List models (verify it's there)
    # 6. Delete the model
    # 7. Verify it's gone
    pass
```

### 🎯 Requirements:
- Test the ENTIRE user journey
- All steps must succeed
- Verify each step

### ✅ Checkpoint:

<details>
<summary>🆘 Solution</summary>

```python
def test_complete_model_lifecycle(client, temp_model_file):
    """Test: Full workflow from registration to prediction to deletion"""
    # 1. Register
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "lifecycle@inferx.com",
            "password": "LifeCycle123!",
            "full_name": "Lifecycle User"
        }
    )
    assert register_response.status_code == 201
    
    # 2. Login
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "lifecycle@inferx.com",
            "password": "LifeCycle123!"
        }
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Upload model
    with open(temp_model_file, "rb") as f:
        upload_response = client.post(
            "/api/v1/models/upload",
            headers=headers,
            data={"name": "lifecycle_model", "model_type": "sklearn"},
            files={"file": ("model.pkl", f, "application/octet-stream")}
        )
    assert upload_response.status_code == 201
    model_id = upload_response.json()["data"]["model"]["id"]
    
    # 4. Make prediction
    prediction_response = client.post(
        f"/api/v1/predict/{model_id}",
        headers=headers,
        json={"input": {"feature1": 5.1, "feature2": 3.5}}
    )
    assert prediction_response.status_code == 200
    assert "prediction" in prediction_response.json()
    
    # 5. List models
    list_response = client.get("/api/v1/models", headers=headers)
    assert list_response.status_code == 200
    models = list_response.json()["data"]
    assert any(m["id"] == model_id for m in models)
    
    # 6. Delete model
    delete_response = client.delete(f"/api/v1/models/{model_id}", headers=headers)
    assert delete_response.status_code == 200
    
    # 7. Verify deleted
    get_response = client.get(f"/api/v1/models/{model_id}", headers=headers)
    assert get_response.status_code == 404
```
</details>

**Mark complete when**: Test passes ✅

---

## Mission 6.2: Run Full Test Suite (200 XP)

**What you'll learn**: Running all tests together

### 📝 Your Task:

**STEP 1**: Run ALL your tests:

```bash
cd Backend
pytest tests/ -v
```

**STEP 2**: Check coverage:

```bash
pytest tests/ --cov=app --cov-report=html
```

**STEP 3**: Open `htmlcov/index.html` in your browser to see beautiful coverage report!

### ✅ Checkpoint:

**All tests should PASS!** ✅

### 🏆 Achievement Unlocked: "Integration Testing Legend" (+400 XP)

---

# 🎊 QUEST COMPLETE! 🎊

## Your Final Stats:

```
✅ Level 1: Test Setup Wizard          [✓] 100/100 XP
✅ Level 2: Auth Testing Master        [✓] 200/200 XP
✅ Level 3: Model Testing Champion     [✓] 300/300 XP
✅ Level 4: Prediction Testing Hero    [✓] 200/200 XP
✅ Level 5: Security Testing Guardian  [✓] 300/300 XP
✅ Level 6: Integration Testing Legend [✓] 400/400 XP
                                       _______________
                                       TOTAL: 1500/1500 XP
```

---

## 🏆 Achievements Unlocked:

- ⚡ **First Test Pass** - Ran your first test successfully
- 🔐 **Auth Testing Master** - Mastered authentication testing
- 📦 **Model Testing Champion** - Conquered model upload tests
- 🔮 **Prediction Testing Hero** - Dominated prediction tests
- 🛡️ **Security Testing Guardian** - Protected user data with tests
- 🌟 **Integration Testing Legend** - Completed full E2E tests
- 👑 **TEST WARRIOR SUPREME** - Completed entire quest!

---

## 📊 Your Production-Ready Test Suite:

You now have:

✅ **30+ tests** covering:
- User registration & authentication
- Model uploads & management
- ML predictions
- Security & authorization
- Edge cases & error handling
- End-to-end workflows

✅ **Test types mastered:**
- Unit tests (fast, isolated)
- Integration tests (API + DB)
- E2E tests (full workflows)
- Security tests (multi-user)
- Parametrized tests (multiple cases)

✅ **Best practices applied:**
- AAA pattern (Arrange, Act, Assert)
- Fixtures for reusability
- Independent tests
- Meaningful test names
- Edge case coverage

---

## 🎯 Next Challenges (Optional):

**🔥 BONUS MISSIONS:**

1. **API Key Testing** - Write tests for API key generation & validation
2. **Webhook Testing** - Test webhook creation & triggering
3. **Rate Limiting** - Test rate limit enforcement
4. **Model Sharing** - Test sharing models between users
5. **Batch Predictions** - Test multiple predictions at once

**🚀 ADVANCED CHALLENGES:**

1. Achieve 90%+ code coverage
2. Add performance tests (load testing)
3. Add security tests (SQL injection, XSS)
4. Mock external services (email, S3)
5. Test async endpoints

---

## 📚 What You've Learned:

✅ How to write production-ready tests  
✅ Using pytest fixtures effectively  
✅ Testing authentication & authorization  
✅ File upload testing  
✅ Security testing with multiple users  
✅ End-to-end workflow testing  
✅ Parametrized testing  
✅ Test coverage analysis  

---

## 🎁 Your Reward:

**You now have a bulletproof test suite!** 🛡️

Every time you add new features to InferX:
1. Write tests first (TDD)
2. Run `pytest` to verify
3. Deploy with confidence!

**Remember**: Tests are your safety net. They catch bugs before users do! 🐛→✅

---

## 🎮 Final Score:

```
╔════════════════════════════════╗
║   CONGRATULATIONS!             ║
║                                ║
║   You've completed the         ║
║   InferX Testing Quest!        ║
║                                ║
║   Rank: TEST MASTER 👑         ║
║   XP: 1500/1500                ║
║   Tests Written: 30+           ║
║   Code Coverage: 🔥            ║
║                                ║
║   You are now a certified      ║
║   Testing Warrior! ⚔️          ║
╚════════════════════════════════╝
```

---

**Now go forth and test with confidence!** 🚀

*Remember: A test today keeps the bugs away!* 🐛❌
