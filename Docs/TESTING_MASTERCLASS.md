# Testing Masterclass for InferX Backend 🎯

**Time to Complete: 2-3 hours**  
**Approach: 80/20 Rule - Focus on what you'll actually use**

---

## 🎬 Introduction: Why We Test InferX

Imagine you just deployed InferX to production. A user uploads a $10,000 ML model, but your code accidentally deletes it. Or worse - they can access someone else's models! 

**Testing prevents disasters** by catching bugs before users do.

**In InferX, we test:**
- ✅ Authentication (can hackers steal user data?)
- ✅ Model uploads (do files save correctly?)
- ✅ Predictions (does the ML model work?)
- ✅ API keys (can users make API calls?)

---

## 📚 Module 1: The 3 Types of Tests You Actually Need

### **1️⃣ Unit Tests** - Test One Function
**When:** Testing a single function in isolation  
**Time:** Milliseconds (super fast!)

```python
# Example from InferX: Testing password hashing
from app.core.security import get_password_hash, verify_password

def test_password_hashing():
    """Unit test - tests ONLY the hash function"""
    password = "MySecret123!"
    
    # Hash the password
    hashed = get_password_hash(password)
    
    # Verify it works
    assert verify_password(password, hashed) == True
    assert verify_password("WrongPass", hashed) == False
```

**Real Scenario:** You changed the password hashing algorithm. This test ensures old passwords still work.

---

### **2️⃣ Integration Tests** - Test Multiple Parts Together
**When:** Testing how components work together (API + Database)  
**Time:** Seconds (involves DB/network)

```python
# Example from InferX: Testing user registration
def test_register_user(client):
    """Integration test - tests API endpoint + database + validation"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "full_name": "John Doe"
        }
    )
    
    # Check HTTP response
    assert response.status_code == 201
    
    # Check database saved correctly
    data = response.json()
    assert data["data"]["user"]["email"] == "newuser@example.com"
    assert "password" not in data["data"]["user"]  # Never return passwords!
```

**Real Scenario:** You added email validation. This test ensures the API rejects invalid emails AND saves valid ones to the database.

---

### **3️⃣ End-to-End (E2E) Tests** - Test Complete User Workflows
**When:** Testing full user journeys  
**Time:** Seconds to minutes

```python
# Example from InferX: Complete model workflow
def test_complete_model_workflow(client, auth_headers, temp_model_file):
    """E2E test - User uploads model → gets predictions → deletes model"""
    
    # Step 1: Upload a model
    with open(temp_model_file, "rb") as f:
        upload_response = client.post(
            "/api/v1/models/upload",
            headers=auth_headers,
            data={"name": "iris_classifier", "model_type": "sklearn"},
            files={"file": ("model.pkl", f, "application/octet-stream")}
        )
    
    model_id = upload_response.json()["data"]["model"]["id"]
    assert upload_response.status_code == 201
    
    # Step 2: Make a prediction
    prediction_response = client.post(
        f"/api/v1/predict/{model_id}",
        headers=auth_headers,
        json={"input": {"feature1": 5.1, "feature2": 3.5}}
    )
    
    assert prediction_response.status_code == 200
    assert "prediction" in prediction_response.json()
    
    # Step 3: Delete the model
    delete_response = client.delete(
        f"/api/v1/models/{model_id}",
        headers=auth_headers
    )
    
    assert delete_response.status_code == 200
```

**Real Scenario:** This is how real users use InferX. If ANY step breaks, the whole app fails.

---

### ✅ **CHECKPOINT 1: Understanding Test Types**

**Answer these before proceeding:**

1. **Q: You modified the `calculate_storage_size()` function. What type of test do you write?**
   - A) Unit test  
   - B) Integration test  
   - C) E2E test

2. **Q: You need to test if users can register → login → upload a model. What type?**
   - A) Unit test  
   - B) Integration test  
   - C) E2E test

3. **Q: What's the main difference between integration and E2E tests?**

<details>
<summary>✅ Click to see answers</summary>

1. **A) Unit test** - You're testing ONE function in isolation
2. **C) E2E test** - Multiple user actions across different endpoints
3. **Integration tests** test how components work together (e.g., API + DB). **E2E tests** test complete user workflows with multiple steps.

**✋ Only proceed if you got 2/3 correct!**
</details>

---

## 📚 Module 2: Pytest - Your Testing Framework

### **Why Pytest for InferX?**
- Simple syntax (no boilerplate code)
- Automatic test discovery
- Powerful fixtures (reusable test data)
- Used by FastAPI (our framework)

---

### **How to Run Tests**

```bash
# Run ALL tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run one specific test
pytest tests/test_auth.py::test_register_user

# Run with output (see print statements)
pytest -s

# Run with coverage report (how much code is tested)
pytest --cov=app
```

---

### **Test Structure: AAA Pattern**

Every test follows this pattern:

```python
def test_user_can_login(client):
    # ARRANGE - Set up test data
    user_data = {
        "email": "test@example.com",
        "password": "TestPass123!"
    }
    
    # ACT - Perform the action
    response = client.post("/api/v1/auth/login", json=user_data)
    
    # ASSERT - Check the results
    assert response.status_code == 200
    assert "access_token" in response.json()
```

**Real Scenario in InferX:**
- **Arrange:** Create a test user and their credentials
- **Act:** Call the login endpoint
- **Assert:** Verify we got back a JWT token

---

### **Fixtures: Reusable Test Components**

**Problem:** Every test needs a logged-in user. Copy-pasting login code 50 times? 😱

**Solution:** Fixtures!

```python
# In conftest.py (shared fixtures)
@pytest.fixture
def auth_headers(client):
    """Provides authentication headers for tests"""
    # Register a test user
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "testuser@example.com",
            "password": "TestPass123!",
        }
    )
    
    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "testuser@example.com",
            "password": "TestPass123!",
        }
    )
    
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# Now use it in ANY test
def test_upload_model(client, auth_headers, temp_model_file):
    """auth_headers fixture automatically runs before this test"""
    with open(temp_model_file, "rb") as f:
        response = client.post(
            "/api/v1/models/upload",
            headers=auth_headers,  # ← Injected by pytest!
            data={"name": "my_model", "model_type": "sklearn"},
            files={"file": ("model.pkl", f, "application/octet-stream")}
        )
    
    assert response.status_code == 201
```

**Real Scenario:** You wrote 1 fixture for authentication, now 50+ tests use it. Change auth once, all tests update! 🎉

---

### **Common InferX Fixtures**

```python
# fixtures used across InferX tests:

client          # TestClient for making HTTP requests
db              # Database session (auto-cleanup after test)
auth_headers    # Pre-logged-in user headers
test_user       # A user object in the database
test_model      # An uploaded ML model
temp_model_file # A temporary .pkl file for testing uploads
```

---

### ✅ **CHECKPOINT 2: Pytest Basics**

**Answer these:**

1. **Q: What command runs only tests in `test_models.py`?**

2. **Q: Fix this test - what's wrong?**
```python
def test_delete_model(client):
    response = client.delete("/api/v1/models/123")
    assert response.status_code == 200
```

3. **Q: What's the purpose of the `auth_headers` fixture?**

<details>
<summary>✅ Click to see answers</summary>

1. `pytest tests/test_models.py`

2. **Two problems:**
   - Missing authentication headers (will get 401 error)
   - Hardcoded model ID (should use a fixture)
   
   **Fixed:**
   ```python
   def test_delete_model(client, auth_headers, test_model):
       response = client.delete(
           f"/api/v1/models/{test_model.id}",
           headers=auth_headers
       )
       assert response.status_code == 200
   ```

3. Provides authentication headers so tests don't have to register/login manually every time

**✋ Only proceed if you got all 3 correct!**
</details>

---

## 📚 Module 3: Testing InferX Features (Hands-On)

### **Scenario 1: Testing Authentication**

**User Story:** "Users should be able to register and login"

```python
# tests/test_auth.py

def test_register_user(client):
    """Happy path - everything works"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "full_name": "New User"
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["user"]["email"] == "newuser@example.com"
    assert "password" not in str(data)  # Security check!


def test_register_duplicate_email(client):
    """Edge case - duplicate registration"""
    # Register once
    client.post(
        "/api/v1/auth/register",
        json={"email": "same@example.com", "password": "Pass123!"}
    )
    
    # Try again with same email
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "same@example.com", "password": "DifferentPass123!"}
    )
    
    assert response.status_code == 409  # Conflict
    assert "already registered" in response.json()["detail"].lower()


def test_register_weak_password(client):
    """Edge case - weak password"""
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "user@example.com", "password": "123"}  # Too weak
    )
    
    assert response.status_code == 422  # Validation error
```

**What we're testing:**
- ✅ Happy path (normal usage)
- ✅ Edge cases (duplicates, weak passwords)
- ✅ Security (no password leaks)

---

### **Scenario 2: Testing Model Uploads**

**User Story:** "Users should upload ML models and get automatic versioning"

```python
# tests/test_models.py

def test_upload_model_success(client, auth_headers, temp_model_file):
    """Upload a model file"""
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
    assert data["data"]["model"]["version"] == 1  # First upload
    assert data["data"]["model"]["file_path"] is not None


def test_model_versioning(client, auth_headers, temp_model_file):
    """Uploading same model name creates new version"""
    # Upload v1
    with open(temp_model_file, "rb") as f:
        response1 = client.post(
            "/api/v1/models/upload",
            headers=auth_headers,
            data={"name": "my_model", "model_type": "sklearn"},
            files={"file": ("model.pkl", f, "application/octet-stream")}
        )
    
    # Upload v2 (same name)
    with open(temp_model_file, "rb") as f:
        response2 = client.post(
            "/api/v1/models/upload",
            headers=auth_headers,
            data={"name": "my_model", "model_type": "sklearn"},
            files={"file": ("model.pkl", f, "application/octet-stream")}
        )
    
    assert response1.json()["data"]["model"]["version"] == 1
    assert response2.json()["data"]["model"]["version"] == 2


def test_upload_without_auth(client, temp_model_file):
    """Unauthorized users can't upload models"""
    with open(temp_model_file, "rb") as f:
        response = client.post(
            "/api/v1/models/upload",
            data={"name": "hack_model", "model_type": "sklearn"},
            files={"file": ("model.pkl", f, "application/octet-stream")}
        )
    
    assert response.status_code == 401  # Unauthorized
```

**What we're testing:**
- ✅ File uploads work
- ✅ Versioning increments correctly
- ✅ Security (auth required)

---

### **Scenario 3: Testing Predictions**

**User Story:** "Users can make predictions with their uploaded models"

```python
# tests/test_prediction.py

def test_make_prediction(client, auth_headers, test_model):
    """Make a prediction with an uploaded model"""
    response = client.post(
        f"/api/v1/predict/{test_model.id}",
        headers=auth_headers,
        json={"input": {"feature1": 5.1, "feature2": 3.5}}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert isinstance(data["prediction"], (int, float, list))


def test_prediction_wrong_input_shape(client, auth_headers, test_model):
    """Model expects 2 features, we send 1"""
    response = client.post(
        f"/api/v1/predict/{test_model.id}",
        headers=auth_headers,
        json={"input": {"feature1": 5.1}}  # Missing feature2!
    )
    
    assert response.status_code == 400  # Bad request
    assert "features" in response.json()["detail"].lower()


def test_prediction_nonexistent_model(client, auth_headers):
    """Try to use a model that doesn't exist"""
    fake_id = "00000000-0000-0000-0000-000000000000"
    
    response = client.post(
        f"/api/v1/predict/{fake_id}",
        headers=auth_headers,
        json={"input": {"feature1": 5.1, "feature2": 3.5}}
    )
    
    assert response.status_code == 404  # Not found
```

**What we're testing:**
- ✅ Predictions work
- ✅ Input validation
- ✅ Error handling

---

### ✅ **CHECKPOINT 3: Writing Real Tests**

**Your Task:** Write a test for this requirement:

**"Users should NOT be able to delete models they don't own"**

```python
def test_cannot_delete_other_users_model(client, db):
    # TODO: Write this test
    # Hints:
    # 1. Create two users (use fixtures or create manually)
    # 2. User1 uploads a model
    # 3. User2 tries to delete User1's model
    # 4. Assert it returns 403 Forbidden
    
    pass
```

<details>
<summary>✅ Click to see solution</summary>

```python
def test_cannot_delete_other_users_model(client, db):
    """Users can only delete their own models"""
    from app.models.user import User
    from app.core.security import get_password_hash
    
    # ARRANGE: Create two users
    user1 = User(
        email="owner@example.com",
        hashed_password=get_password_hash("Pass123!"),
        full_name="Model Owner"
    )
    user2 = User(
        email="hacker@example.com",
        hashed_password=get_password_hash("Pass123!"),
        full_name="Sneaky Hacker"
    )
    db.add_all([user1, user2])
    db.commit()
    
    # User1 logs in and uploads model
    login1 = client.post(
        "/api/v1/auth/login",
        json={"email": "owner@example.com", "password": "Pass123!"}
    )
    user1_headers = {"Authorization": f"Bearer {login1.json()['access_token']}"}
    
    # Upload model as User1
    with open("temp_model.pkl", "rb") as f:
        upload = client.post(
            "/api/v1/models/upload",
            headers=user1_headers,
            data={"name": "secret_model", "model_type": "sklearn"},
            files={"file": f}
        )
    model_id = upload.json()["data"]["model"]["id"]
    
    # User2 logs in
    login2 = client.post(
        "/api/v1/auth/login",
        json={"email": "hacker@example.com", "password": "Pass123!"}
    )
    user2_headers = {"Authorization": f"Bearer {login2.json()['access_token']}"}
    
    # ACT: User2 tries to delete User1's model
    response = client.delete(
        f"/api/v1/models/{model_id}",
        headers=user2_headers
    )
    
    # ASSERT: Should be forbidden
    assert response.status_code == 403
    assert "permission" in response.json()["detail"].lower()
```

**Key learning:** Testing security requires creating multiple users and trying unauthorized actions!

**✋ Only proceed after attempting this yourself!**
</details>

---

## 📚 Module 4: Test Configuration & Setup

### **Understanding `conftest.py`**

This file contains shared fixtures for all tests:

```python
# tests/conftest.py

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.base import Base

# Test database (isolated from production)
SQLALCHEMY_DATABASE_URL = "postgresql://mluser:mlpassword@postgres:5432/ml_platform"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Runs once before ALL tests - creates tables"""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)  # Cleanup after all tests


@pytest.fixture(scope="function")
def db():
    """Runs before EACH test - provides fresh database session"""
    session = TestingSessionLocal()
    try:
        yield session
        session.commit()
    finally:
        session.rollback()  # Undo changes after test
        session.close()


@pytest.fixture
def client(db):
    """Provides TestClient for making HTTP requests"""
    from app.db.session import get_db
    
    # Override database dependency
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
```

**Key Concepts:**

- **`scope="session"`** - Runs once for all tests
- **`scope="function"`** - Runs once per test (default)
- **`autouse=True`** - Runs automatically without being requested
- **`yield`** - Returns control to test, then cleanup happens after

---

### **Understanding `pytest.ini`**

Configuration file for pytest:

```ini
[pytest]
# Where to find tests
testpaths = tests

# Test file naming patterns
python_files = test_*.py
python_functions = test_*

# Additional options
addopts = 
    -ra                    # Show summary of all test results
    --strict-markers       # Error if unknown marker used
    --tb=short            # Shorter error tracebacks

# Test markers (categories)
markers =
    unit: Unit tests (fast, isolated)
    integration: Integration tests (use real DB)
    e2e: End-to-end tests (complete workflows)
    slow: Slow running tests
```

**Use markers to run specific test types:**

```bash
# Run only unit tests
pytest -m unit

# Run only integration tests
pytest -m integration

# Skip slow tests
pytest -m "not slow"
```

---

### ✅ **CHECKPOINT 4: Configuration**

**Answer these:**

1. **Q: What's the difference between `scope="session"` and `scope="function"`?**

2. **Q: Why do we use a separate test database?**

3. **Q: What command runs only tests marked as "unit"?**

<details>
<summary>✅ Click to see answers</summary>

1. 
   - **`scope="session"`**: Runs ONCE before all tests (e.g., creating database tables)
   - **`scope="function"`**: Runs BEFORE EACH test (e.g., fresh database session)

2. To prevent tests from corrupting production data! Tests create/delete data constantly.

3. `pytest -m unit`

**✋ Only proceed if you got all 3 correct!**
</details>

---

## 📚 Module 5: Advanced Testing Patterns

### **Pattern 1: Parametrized Tests**

**Problem:** Testing multiple inputs without copy-pasting

```python
# BAD - Repetitive
def test_invalid_email_1(client):
    response = client.post("/api/v1/auth/register", json={"email": "notanemail"})
    assert response.status_code == 422

def test_invalid_email_2(client):
    response = client.post("/api/v1/auth/register", json={"email": "@example.com"})
    assert response.status_code == 422

# GOOD - Parametrized
@pytest.mark.parametrize("invalid_email", [
    "notanemail",
    "@example.com",
    "missing@domain",
    "spaces in@email.com",
    "",
])
def test_invalid_emails(client, invalid_email):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": invalid_email, "password": "Pass123!"}
    )
    assert response.status_code == 422
```

**Real InferX Use Case:**

```python
@pytest.mark.parametrize("model_type,file_ext", [
    ("sklearn", ".pkl"),
    ("tensorflow", ".h5"),
    ("pytorch", ".pth"),
])
def test_upload_different_model_types(client, auth_headers, model_type, file_ext):
    """Test uploading various ML model formats"""
    # Test implementation...
```

---

### **Pattern 2: Testing Exceptions**

```python
def test_prediction_with_missing_model_file(client, auth_headers, db):
    """What if model file is deleted from disk but DB record exists?"""
    from app.models.model import Model
    import os
    
    # Create model record without actual file
    model = Model(
        name="broken_model",
        file_path="/nonexistent/path/model.pkl",
        model_type="sklearn",
        user_id=1
    )
    db.add(model)
    db.commit()
    
    # Try to make prediction
    response = client.post(
        f"/api/v1/predict/{model.id}",
        headers=auth_headers,
        json={"input": {"feature1": 1.0}}
    )
    
    # Should handle gracefully, not crash
    assert response.status_code == 500
    assert "model file not found" in response.json()["detail"].lower()
```

---

### **Pattern 3: Testing Async Code**

```python
# If InferX has async endpoints
@pytest.mark.asyncio
async def test_async_prediction(async_client, auth_headers):
    """Test asynchronous prediction endpoint"""
    response = await async_client.post(
        "/api/v1/predict/async/123",
        headers=auth_headers,
        json={"input": {"feature1": 1.0}}
    )
    
    assert response.status_code == 200
```

---

### **Pattern 4: Mocking External Services**

**Scenario:** InferX sends emails on registration, but we don't want to send real emails in tests!

```python
from unittest.mock import patch

def test_registration_sends_welcome_email(client):
    """Test that registration triggers email (without actually sending)"""
    
    with patch("app.services.email.send_email") as mock_send:
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "Pass123!"
            }
        )
        
        assert response.status_code == 201
        
        # Verify email function was called
        mock_send.assert_called_once()
        call_args = mock_send.call_args[0]
        assert call_args[0] == "newuser@example.com"  # recipient
        assert "welcome" in call_args[1].lower()  # subject
```

---

### ✅ **CHECKPOINT 5: Advanced Patterns**

**Your Task:** Write a parametrized test for this:

**"Model names cannot be empty, contain special characters, or exceed 100 characters"**

```python
@pytest.mark.parametrize("invalid_name,reason", [
    # Add test cases here
    # Format: (invalid_name, "why it's invalid")
])
def test_invalid_model_names(client, auth_headers, temp_model_file, invalid_name, reason):
    # TODO: Implement test
    pass
```

<details>
<summary>✅ Click to see solution</summary>

```python
@pytest.mark.parametrize("invalid_name,reason", [
    ("", "empty name"),
    ("a" * 101, "exceeds 100 chars"),
    ("model!@#$", "special characters"),
    ("   ", "only whitespace"),
    ("model\nname", "contains newline"),
])
def test_invalid_model_names(client, auth_headers, temp_model_file, invalid_name, reason):
    """Model names must be valid strings"""
    with open(temp_model_file, "rb") as f:
        response = client.post(
            "/api/v1/models/upload",
            headers=auth_headers,
            data={"name": invalid_name, "model_type": "sklearn"},
            files={"file": ("model.pkl", f, "application/octet-stream")}
        )
    
    assert response.status_code == 422, f"Failed for: {reason}"
    assert "name" in response.json()["detail"][0]["loc"]
```

**✋ Attempt this yourself before viewing!**
</details>

---

## 📚 Module 6: Test Coverage & Best Practices

### **What is Code Coverage?**

**Coverage** = % of your code that runs during tests

```bash
# Run tests with coverage report
pytest --cov=app --cov-report=html

# Opens a beautiful HTML report showing:
# - Which lines are tested (green)
# - Which lines are NOT tested (red)
```

**InferX Coverage Goals:**
- ✅ **Critical paths (auth, payments):** 95%+ coverage
- ✅ **Business logic (models, predictions):** 80%+ coverage
- ⚠️ **Utility functions:** 60%+ coverage

**Don't chase 100% coverage** - some code isn't worth testing (getters/setters, simple config).

---

### **Best Practices for InferX Tests**

#### **1. Test Naming Convention**

```python
# GOOD - Descriptive names
def test_user_cannot_delete_other_users_models():
    pass

def test_model_upload_fails_with_invalid_pickle_file():
    pass

# BAD - Vague names
def test_delete():
    pass

def test_upload_2():
    pass
```

#### **2. One Assert Per Concept**

```python
# GOOD - Each test checks one thing
def test_registration_returns_user_data(client):
    response = client.post("/api/v1/auth/register", json={...})
    assert response.status_code == 201

def test_registration_excludes_password(client):
    response = client.post("/api/v1/auth/register", json={...})
    assert "password" not in response.json()

# ACCEPTABLE - Related assertions
def test_registration_creates_user(client):
    response = client.post("/api/v1/auth/register", json={...})
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"
```

#### **3. Test Independence**

```python
# BAD - Tests depend on each other
def test_create_model(client):
    global model_id
    response = client.post("/api/v1/models/upload", ...)
    model_id = response.json()["id"]

def test_delete_model(client):
    response = client.delete(f"/api/v1/models/{model_id}")  # Fails if test_create_model didn't run!

# GOOD - Each test is independent
def test_create_model(client, auth_headers, temp_model_file):
    response = client.post("/api/v1/models/upload", ...)
    assert response.status_code == 201

def test_delete_model(client, auth_headers, test_model):  # Uses fixture
    response = client.delete(f"/api/v1/models/{test_model.id}")
    assert response.status_code == 200
```

#### **4. Use Fixtures for Common Setup**

```python
# GOOD - Reusable fixture
@pytest.fixture
def uploaded_model(client, auth_headers, temp_model_file):
    with open(temp_model_file, "rb") as f:
        response = client.post(
            "/api/v1/models/upload",
            headers=auth_headers,
            data={"name": "test_model", "model_type": "sklearn"},
            files={"file": f}
        )
    return response.json()["data"]["model"]

# Now 10 tests can use it easily
def test_get_model(client, auth_headers, uploaded_model):
    response = client.get(f"/api/v1/models/{uploaded_model['id']}", headers=auth_headers)
    assert response.status_code == 200
```

#### **5. Test Edge Cases**

```python
# Don't just test happy paths!

def test_pagination_first_page(client, auth_headers):
    """Test page 1 of results"""
    response = client.get("/api/v1/models?page=1&per_page=10", headers=auth_headers)
    assert response.status_code == 200

def test_pagination_empty_page(client, auth_headers):
    """Test requesting page beyond available data"""
    response = client.get("/api/v1/models?page=999", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()["data"]) == 0

def test_pagination_invalid_parameters(client, auth_headers):
    """Test negative page numbers"""
    response = client.get("/api/v1/models?page=-1", headers=auth_headers)
    assert response.status_code == 422
```

---

### ✅ **CHECKPOINT 6: Best Practices**

**Identify what's wrong with these tests:**

```python
# Test 1
def test_stuff(client):
    r = client.post("/api/v1/auth/register", json={"email": "a@b.com", "password": "x"})
    assert r.status_code == 201
    r2 = client.post("/api/v1/auth/login", json={"email": "a@b.com", "password": "x"})
    assert r2.status_code == 200
    r3 = client.get("/api/v1/models", headers={"Authorization": f"Bearer {r2.json()['access_token']}"})
    assert len(r3.json()) > 0
```

```python
# Test 2
model_id = None

def test_create_model(client, auth_headers):
    global model_id
    response = client.post("/api/v1/models/upload", ...)
    model_id = response.json()["id"]

def test_update_model(client, auth_headers):
    response = client.put(f"/api/v1/models/{model_id}", ...)
```

<details>
<summary>✅ Click to see answers</summary>

**Test 1 Problems:**
1. ❌ Vague name (`test_stuff`)
2. ❌ Testing too many things (registration + login + listing models)
3. ❌ Poor variable names (`r`, `r2`, `r3`)
4. ❌ No clear AAA pattern
5. ❌ Should be split into 3 separate tests

**Test 2 Problems:**
1. ❌ Tests are NOT independent (sharing global `model_id`)
2. ❌ `test_update_model` will fail if `test_create_model` doesn't run first
3. ❌ Should use fixtures instead of global variables

**Fixed:**
```python
def test_register_user_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "newuser@example.com", "password": "SecurePass123!"}
    )
    assert response.status_code == 201

@pytest.fixture
def uploaded_model(client, auth_headers):
    response = client.post("/api/v1/models/upload", ...)
    return response.json()["id"]

def test_update_model(client, auth_headers, uploaded_model):
    response = client.put(
        f"/api/v1/models/{uploaded_model}",
        headers=auth_headers,
        json={"name": "updated_name"}
    )
    assert response.status_code == 200
```

**✋ Only proceed if you identified at least 3 problems!**
</details>

---

## 📚 Module 7: Debugging Failed Tests

### **Reading Pytest Output**

When a test fails:

```bash
$ pytest tests/test_auth.py::test_login

================================ FAILURES =================================
______________________ test_login _______________________

client = <fastapi.testclient.TestClient object at 0x...>

    def test_login(client):
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "user@example.com", "password": "wrong"}
        )
>       assert response.status_code == 200
E       AssertionError: assert 401 == 200
E        +  where 401 = <Response [401]>.status_code

tests/test_auth.py:15: AssertionError
```

**How to debug:**

1. **Check the assertion** - Expected 200, got 401 (unauthorized)
2. **Print response body** - Add `print(response.json())` before assert
3. **Check test data** - Is the user registered? Is password correct?

---

### **Common Debugging Techniques**

```python
def test_model_upload(client, auth_headers, temp_model_file):
    # Print to see what's happening
    print(f"Auth headers: {auth_headers}")
    print(f"Model file path: {temp_model_file}")
    
    with open(temp_model_file, "rb") as f:
        response = client.post("/api/v1/models/upload", ...)
    
    # Print response for debugging
    print(f"Status: {response.status_code}")
    print(f"Body: {response.json()}")
    
    assert response.status_code == 201

# Run with: pytest -s tests/test_models.py
# -s flag shows print statements
```

---

### **Using pytest's Built-in Debugging**

```bash
# Drop into debugger on failure
pytest --pdb

# Drop into debugger at start of test
pytest --trace
```

---

## 🎯 Final Assessment

### **Part 1: Multiple Choice (15 questions)**

1. What type of test is this?
   ```python
   def test_hash_password():
       hashed = get_password_hash("secret")
       assert verify_password("secret", hashed)
   ```
   - A) Unit test
   - B) Integration test
   - C) E2E test

2. What does this fixture do?
   ```python
   @pytest.fixture(scope="session")
   def setup_db():
       create_tables()
       yield
       drop_tables()
   ```
   - A) Runs before each test
   - B) Runs once before all tests
   - C) Runs after each test fails

3. How do you run only tests in `test_auth.py`?
   - A) `pytest test_auth.py`
   - B) `pytest tests/test_auth.py`
   - C) `pytest -f test_auth`

4. What's wrong with this test?
   ```python
   def test_model_workflow(client):
       # Register user
       # Login
       # Upload model
       # Make prediction
       # Delete model
   ```
   - A) Missing assertions
   - B) Testing too many things
   - C) Missing fixtures

5. What does `assert response.status_code == 201` check?
   - A) Resource was created successfully
   - B) Request was OK
   - C) Unauthorized access

6. When should you use parametrized tests?
   - A) Testing one specific case
   - B) Testing multiple similar inputs
   - C) Testing async functions

7. What's the purpose of `conftest.py`?
   - A) Configure pytest settings
   - B) Share fixtures across test files
   - C) Store test data

8. What does 80% code coverage mean?
   - A) 80% of tests pass
   - B) 80% of code runs during tests
   - C) 80% of features are tested

9. How do you skip slow tests?
   - A) `pytest --skip-slow`
   - B) `pytest -m "not slow"`
   - C) `pytest --fast`

10. What's the AAA pattern?
    - A) Arrange, Act, Assert
    - B) Add, Analyze, Approve
    - C) Authenticate, Authorize, Access

11. What command shows test coverage?
    - A) `pytest --coverage`
    - B) `pytest --cov=app`
    - C) `pytest -c`

12. What does `@pytest.fixture` do?
    - A) Marks a test as broken
    - B) Creates reusable test data
    - C) Runs before all tests

13. What status code means "Forbidden"?
    - A) 401
    - B) 403
    - C) 404

14. Why use a separate test database?
    - A) Faster tests
    - B) Don't corrupt production data
    - C) Required by pytest

15. What does `client.post()` do in tests?
    - A) Sends an HTTP POST request
    - B) Creates a new database record
    - C) Uploads a file

<details>
<summary>✅ Click for answers</summary>

1. A (tests single function)
2. B (scope="session" = once)
3. B
4. B (should split into multiple tests)
5. A (201 = Created)
6. B
7. B
8. B
9. B
10. A
11. B
12. B
13. B (403 = Forbidden, 401 = Unauthorized)
14. B
15. A

**Score:**
- 13-15: Excellent! Move to Part 2
- 10-12: Good! Review weak areas
- <10: Re-read relevant modules

</details>

---

### **Part 2: Practical Coding (3 exercises)**

#### **Exercise 1: Write a Registration Test**

**Requirement:** "Users with passwords under 8 characters should get a validation error"

```python
def test_registration_weak_password(client):
    # TODO: Write this test
    pass
```

<details>
<summary>✅ Solution</summary>

```python
def test_registration_weak_password(client):
    """Passwords under 8 characters should fail"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "user@example.com",
            "password": "short",  # Only 5 chars
            "full_name": "Test User"
        }
    )
    
    assert response.status_code == 422  # Validation error
    error_detail = response.json()["detail"]
    assert any("password" in str(err).lower() for err in error_detail)
```
</details>

---

#### **Exercise 2: Write a Parametrized Test**

**Requirement:** "Model types can only be: sklearn, tensorflow, pytorch"

```python
@pytest.mark.parametrize("model_type,should_pass", [
    # TODO: Add test cases
])
def test_model_type_validation(client, auth_headers, temp_model_file, model_type, should_pass):
    # TODO: Write this test
    pass
```

<details>
<summary>✅ Solution</summary>

```python
@pytest.mark.parametrize("model_type,should_pass", [
    ("sklearn", True),
    ("tensorflow", True),
    ("pytorch", True),
    ("invalid_type", False),
    ("", False),
    ("SKLEARN", False),  # Case sensitive
])
def test_model_type_validation(client, auth_headers, temp_model_file, model_type, should_pass):
    """Only specific model types are allowed"""
    with open(temp_model_file, "rb") as f:
        response = client.post(
            "/api/v1/models/upload",
            headers=auth_headers,
            data={"name": "test_model", "model_type": model_type},
            files={"file": ("model.pkl", f, "application/octet-stream")}
        )
    
    if should_pass:
        assert response.status_code == 201
    else:
        assert response.status_code == 422
```
</details>

---

#### **Exercise 3: Write a Security Test**

**Requirement:** "Users should NOT be able to access other users' models via GET /api/v1/models/{id}"

```python
def test_cannot_access_other_users_model(client, db):
    # TODO: Write this test
    # Hint: Create 2 users, user1 uploads model, user2 tries to GET it
    pass
```

<details>
<summary>✅ Solution</summary>

```python
def test_cannot_access_other_users_model(client, db):
    """Users can only view their own models"""
    from app.models.user import User
    from app.core.security import get_password_hash
    
    # Create two users
    user1 = User(email="owner@example.com", hashed_password=get_password_hash("Pass123!"))
    user2 = User(email="hacker@example.com", hashed_password=get_password_hash("Pass123!"))
    db.add_all([user1, user2])
    db.commit()
    
    # User1 uploads model
    login1 = client.post("/api/v1/auth/login", json={"email": "owner@example.com", "password": "Pass123!"})
    user1_token = login1.json()["access_token"]
    
    with open("temp_model.pkl", "rb") as f:
        upload = client.post(
            "/api/v1/models/upload",
            headers={"Authorization": f"Bearer {user1_token}"},
            data={"name": "private_model", "model_type": "sklearn"},
            files={"file": f}
        )
    model_id = upload.json()["data"]["model"]["id"]
    
    # User2 tries to access it
    login2 = client.post("/api/v1/auth/login", json={"email": "hacker@example.com", "password": "Pass123!"})
    user2_token = login2.json()["access_token"]
    
    response = client.get(
        f"/api/v1/models/{model_id}",
        headers={"Authorization": f"Bearer {user2_token}"}
    )
    
    assert response.status_code == 403  # Forbidden
```
</details>

---

### **Part 3: Debugging Challenge**

This test is failing. Fix it!

```python
def test_model_prediction(client, auth_headers):
    # Upload model
    response = client.post(
        "/api/v1/models/upload",
        headers=auth_headers,
        data={"name": "predictor", "model_type": "sklearn"},
        files={"file": open("model.pkl", "rb")}
    )
    
    model_id = response.json()["id"]
    
    # Make prediction
    pred_response = client.post(
        f"/api/v1/predict/{model_id}",
        headers=auth_headers,
        json={"input": [1.0, 2.0, 3.0]}
    )
    
    assert pred_response.status_code == 200
```

**Error:**
```
KeyError: 'id'
```

<details>
<summary>✅ Solution & Explanation</summary>

**Problems:**
1. Response structure is `{"data": {"model": {"id": ...}}}`, not just `{"id": ...}`
2. File handle isn't closed (should use `with` statement)
3. File path might not exist (should use fixture)

**Fixed:**
```python
def test_model_prediction(client, auth_headers, temp_model_file):
    # Upload model (with proper file handling)
    with open(temp_model_file, "rb") as f:
        response = client.post(
            "/api/v1/models/upload",
            headers=auth_headers,
            data={"name": "predictor", "model_type": "sklearn"},
            files={"file": ("model.pkl", f, "application/octet-stream")}
        )
    
    # Fix: Access nested data structure
    model_id = response.json()["data"]["model"]["id"]
    
    # Make prediction
    pred_response = client.post(
        f"/api/v1/predict/{model_id}",
        headers=auth_headers,
        json={"input": {"feature1": 1.0, "feature2": 2.0}}  # Fix: Use dict, not list
    )
    
    assert pred_response.status_code == 200
```
</details>

---

## 🎓 Graduation Requirements

**To complete this masterclass, you must:**

1. ✅ Score 13+ on Part 1 (Multiple Choice)
2. ✅ Complete 2/3 exercises in Part 2 (Practical Coding)
3. ✅ Fix the debugging challenge in Part 3

**Bonus Challenge:** Write a complete E2E test for this workflow:
1. User registers
2. User logs in
3. User uploads a model
4. User makes a prediction
5. User deletes the model
6. Verify model is gone

---

## 📖 Quick Reference Cheat Sheet

```python
# Running Tests
pytest                           # Run all tests
pytest tests/test_auth.py        # Run specific file
pytest -k "login"                # Run tests matching "login"
pytest -m unit                   # Run only unit tests
pytest -s                        # Show print statements
pytest --cov=app                 # Show coverage
pytest --pdb                     # Debug on failure

# Common Assertions
assert response.status_code == 200
assert "email" in response.json()
assert len(data) > 0
assert data["id"] is not None

# HTTP Status Codes
200 - OK
201 - Created
400 - Bad Request
401 - Unauthorized
403 - Forbidden
404 - Not Found
422 - Validation Error
500 - Server Error

# Fixture Scopes
scope="function"  # Default - runs per test
scope="class"     # Runs per test class
scope="module"    # Runs per file
scope="session"   # Runs once for all tests

# Parametrize
@pytest.mark.parametrize("input,expected", [
    (1, 2),
    (2, 4),
])
def test_double(input, expected):
    assert double(input) == expected
```

---

## 🎯 Next Steps

After completing this masterclass:

1. **Write tests for a new feature** - Pick any InferX feature and write 5 tests
2. **Improve coverage** - Run `pytest --cov=app` and add tests for uncovered code
3. **Explore advanced topics**:
   - Performance testing (load testing endpoints)
   - Security testing (penetration testing)
   - Snapshot testing (comparing outputs)

---

## 📚 Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing Guide](https://fastapi.tiangolo.com/tutorial/testing/)
- [Real Python: Testing Guide](https://realpython.com/pytest-python-testing/)

---

**Good luck! Remember: Tests are your safety net. Write them before bugs bite! 🐛→🛡️**
