<div align="center">

# 🚀 InferX

### **The Modern MLOps Platform for Production-Ready ML Inference**

*Deploy, Monitor, and Scale your Machine Learning models with zero DevOps knowledge*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Now-blue?style=for-the-badge)](https://inferx.vercel.app)
[![API Docs](https://img.shields.io/badge/📚_API_Docs-FastAPI-009688?style=for-the-badge)](https://api.inferx.dev/docs)

<br/>

https://github.com/user-attachments/assets/YOUR_DEMO_VIDEO_ID

<br/>

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?style=flat-square&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-24.0-2496ED?style=flat-square&logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-77%25_Coverage-brightgreen?style=flat-square)

<br/>

[**📖 Documentation**](#-documentation) •
[**✨ Features**](#-features) •
[**🏗️ Architecture**](#️-architecture) •
[**🚀 Getting Started**](#-getting-started) •
[**📊 Demo**](#-demo)

</div>

---

## 💡 The Problem & Solution

<table>
<tr>
<td width="50%">

### ❌ Traditional ML Deployment

- Writing custom Flask/FastAPI endpoints for each model
- Managing model versioning manually
- No standardized way to monitor model performance
- Complex DevOps setup for every deployment
- Hours spent on infrastructure instead of ML

</td>
<td width="50%">

### ✅ With InferX

- **Upload once**, get REST API instantly
- Automatic versioning with rollback support
- Real-time analytics dashboard
- Docker-ready, cloud-native architecture
- Deploy in minutes, not days

</td>
</tr>
</table>

> **Think of InferX as "Vercel for ML Models"** — Upload your trained model, and we handle the rest.

---

## ✨ Features

<table>
<tr>
<td align="center" width="25%">
<img src="https://img.icons8.com/fluency/96/artificial-intelligence.png" width="60"/>
<br/><b>🧠 Smart Model Management</b>
<br/><sub>Upload, version, and organize your ML models with automatic versioning and hot-reload capabilities</sub>
</td>
<td align="center" width="25%">
<img src="https://img.icons8.com/fluency/96/lightning-bolt.png" width="60"/>
<br/><b>⚡ Lightning Fast Inference</b>
<br/><sub>2ms cached predictions with Redis LRU caching and async processing</sub>
</td>
<td align="center" width="25%">
<img src="https://img.icons8.com/fluency/96/dashboard-layout.png" width="60"/>
<br/><b>📊 Real-time Analytics</b>
<br/><sub>Monitor latency, success rates, usage trends, and model health in real-time</sub>
</td>
<td align="center" width="25%">
<img src="https://img.icons8.com/fluency/96/lock-2.png" width="60"/>
<br/><b>🔐 Enterprise Security</b>
<br/><sub>JWT + API Keys, OAuth (Google/GitHub), rate limiting, RBAC permissions</sub>
</td>
</tr>
</table>

### Feature Highlights

| Category | Features |
|----------|----------|
| **🔐 Authentication** | JWT with refresh tokens • OAuth (Google, GitHub) • API Key management • Argon2 password hashing |
| **📦 Model Management** | Upload (.pkl, .joblib) • Auto versioning • Status management (active/deprecated/archived) • Model sharing with permissions |
| **🚀 Predictions** | Sub-2ms cached inference • Async processing • Batch predictions • Confidence scores |
| **📊 Analytics** | Real-time dashboards • Usage trends • Error tracking • Inference time monitoring |
| **🪝 Webhooks** | Custom event notifications • HMAC signatures • Retry logic • Model-specific triggers |
| **⚡ Performance** | Redis LRU caching • Token bucket rate limiting • Connection pooling • Background jobs |
| **🛡️ Security** | CORS configuration • Input validation (Pydantic) • SQL injection prevention • HTTPS ready |
| **🐳 DevOps** | Docker Compose • Multi-stage builds • Health checks • CI/CD ready |

---

## 🏗️ Architecture

InferX follows a **modern microservices-friendly monolith** architecture, designed for scalability and maintainability.

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[🌐 Web Browser<br/>Next.js Frontend]
        MOBILE[📱 Mobile Apps]
        API_CLIENT[🔧 API Clients<br/>Python/cURL]
    end

    subgraph "Load Balancer / Reverse Proxy"
        NGINX[⚡ Nginx<br/>Port 80/443]
    end

    subgraph "Application Layer"
        FRONTEND[⚛️ Next.js 16<br/>React 19, TypeScript]
        BACKEND[🐍 FastAPI<br/>Python 3.11+]
    end

    subgraph "Caching Layer"
        REDIS[(🔴 Redis 7.0<br/>In-Memory Cache)]
    end

    subgraph "Database Layer"
        POSTGRES[(🐘 PostgreSQL 15<br/>Primary Database)]
    end

    subgraph "Storage Layer"
        LOCAL_STORAGE[💾 Local File System<br/>Model Storage]
        S3[☁️ AWS S3<br/>Cloud Storage]
    end

    subgraph "External Services"
        OAUTH[🔐 OAuth Providers]
        WEBHOOKS[🪝 Webhooks]
        MONITORING[📊 Sentry/DataDog]
    end

    WEB --> NGINX
    MOBILE --> NGINX
    API_CLIENT --> NGINX
    
    NGINX --> FRONTEND
    NGINX --> BACKEND
    
    FRONTEND --> BACKEND
    
    BACKEND --> REDIS
    BACKEND --> POSTGRES
    BACKEND --> LOCAL_STORAGE
    BACKEND -.-> S3
    BACKEND --> OAUTH
    BACKEND --> WEBHOOKS
    BACKEND --> MONITORING

    style FRONTEND fill:#61dafb,stroke:#333,stroke-width:2px,color:#000
    style BACKEND fill:#009688,stroke:#333,stroke-width:2px,color:#fff
    style POSTGRES fill:#336791,stroke:#333,stroke-width:2px,color:#fff
    style REDIS fill:#dc382d,stroke:#333,stroke-width:2px,color:#fff
    style NGINX fill:#009639,stroke:#333,stroke-width:2px,color:#fff
```

### 📊 Database Schema

```mermaid
erDiagram
    USERS ||--o{ MODELS : owns
    USERS ||--o{ PREDICTIONS : makes
    USERS ||--o{ API_KEYS : has
    USERS ||--o{ WEBHOOKS : configures
    MODELS ||--o{ PREDICTIONS : generates
    MODELS ||--o{ MODEL_SHARES : "shared via"
    
    USERS {
        uuid id PK
        string email UK
        string hashed_password
        string full_name
        string oauth_provider
        boolean is_active
        timestamp created_at
    }

    MODELS {
        uuid id PK
        uuid user_id FK
        string name
        string model_type
        integer version
        string status
        jsonb model_metadata
        timestamp created_at
    }

    PREDICTIONS {
        uuid id PK
        uuid model_id FK
        uuid user_id FK
        jsonb input_data
        jsonb output_data
        integer inference_time_ms
        string status
    }
```

### 🔄 Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant Frontend as Next.js
    participant Backend as FastAPI
    participant Redis
    participant DB as PostgreSQL

    Client->>Frontend: Make Prediction Request
    Frontend->>Backend: POST /api/v1/predict/{model_id}
    Backend->>Backend: Validate JWT/API Key
    Backend->>Redis: Check Rate Limit
    Redis-->>Backend: ✅ Allowed
    Backend->>Redis: Check Model Cache
    
    alt Cache Hit (2ms)
        Redis-->>Backend: 🎯 Cached Model
    else Cache Miss (50-200ms)
        Backend->>Backend: Load from Disk
        Backend->>Redis: Cache Model (TTL: 10min)
    end
    
    Backend->>Backend: Run Inference
    Backend->>DB: Log Prediction (async)
    Backend-->>Frontend: Prediction Result
    Frontend-->>Client: Display Result
```

---

## 🛠️ Tech Stack

<table>
<tr>
<td>

### Backend
| Technology | Purpose |
|------------|---------|
| ![FastAPI](https://img.shields.io/badge/-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) | High-performance async API |
| ![Python](https://img.shields.io/badge/-Python_3.11-3776AB?style=flat-square&logo=python&logoColor=white) | Core language |
| ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL_15-336791?style=flat-square&logo=postgresql&logoColor=white) | Primary database |
| ![Redis](https://img.shields.io/badge/-Redis_7-DC382D?style=flat-square&logo=redis&logoColor=white) | Caching & rate limiting |
| ![SQLAlchemy](https://img.shields.io/badge/-SQLAlchemy_2.0-D71F00?style=flat-square) | Async ORM |
| ![Pydantic](https://img.shields.io/badge/-Pydantic_2.5-E92063?style=flat-square) | Data validation |

</td>
<td>

### Frontend
| Technology | Purpose |
|------------|---------|
| ![Next.js](https://img.shields.io/badge/-Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white) | React framework |
| ![React](https://img.shields.io/badge/-React_19-61DAFB?style=flat-square&logo=react&logoColor=black) | UI library |
| ![TypeScript](https://img.shields.io/badge/-TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white) | Type safety |
| ![Tailwind](https://img.shields.io/badge/-Tailwind_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | Styling |
| ![Radix](https://img.shields.io/badge/-Radix_UI-161618?style=flat-square) | UI primitives |
| ![Framer](https://img.shields.io/badge/-Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white) | Animations |

</td>
</tr>
</table>

### ML & DevOps

| Category | Stack |
|----------|-------|
| **ML Framework** | Scikit-learn 1.3, NumPy, Joblib (TensorFlow/PyTorch planned) |
| **Containerization** | Docker, Docker Compose, Multi-stage builds |
| **Testing** | Pytest (77% coverage), pytest-cov, pytest-asyncio |
| **CI/CD** | GitHub Actions, automated testing on push |
| **Monitoring** | Sentry, structured JSON logging |

---

## 🚀 Getting Started

### Prerequisites

- **Docker & Docker Compose** (recommended)
- Or: Python 3.11+, Node.js 22+, PostgreSQL 15+, Redis 7+

### 🐳 Quick Start with Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/wittyparth/InferX.git
cd InferX

# 2. Set up environment variables
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Run database migrations
docker-compose exec backend alembic upgrade head
```

**Access the apps:**
| Service | URL |
|---------|-----|
| 🌐 **Frontend Dashboard** | http://localhost:3000 |
| 📚 **API Documentation** | http://localhost:8000/docs |
| 🔍 **ReDoc API Docs** | http://localhost:8000/redoc |

### 💻 Local Development Setup

<details>
<summary><b>Backend Setup</b></summary>

```bash
cd Backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env.development

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```
</details>

<details>
<summary><b>Frontend Setup</b></summary>

```bash
cd Frontend

# Install dependencies
npm install  # or pnpm install

# Set up environment
cp .env.example .env

# Start development server
npm run dev
```
</details>

---

## 📖 API Reference

### Quick Examples

<details>
<summary><b>🔐 Authentication</b></summary>

**Register a new user:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecureP@ss123",
    "full_name": "John Doe"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecureP@ss123"
  }'
```
</details>

<details>
<summary><b>📦 Model Upload</b></summary>

```bash
curl -X POST http://localhost:8000/api/v1/models/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@iris_classifier.pkl" \
  -F "name=iris_classifier" \
  -F "model_type=sklearn" \
  -F "description=Iris flower classification model"
```
</details>

<details>
<summary><b>🔮 Make Predictions</b></summary>

```bash
curl -X POST http://localhost:8000/api/v1/predict/{model_id} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "sepal_length": 5.1,
      "sepal_width": 3.5,
      "petal_length": 1.4,
      "petal_width": 0.2
    }
  }'
```

**Response:**
```json
{
  "prediction": [0],
  "probabilities": [[0.97, 0.02, 0.01]],
  "confidence": 0.97,
  "inference_time_ms": 2,
  "cache_hit": true
}
```
</details>

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| 🚀 **Cached Prediction Latency** | ~2ms |
| 📦 **Cold Model Load** | ~50-200ms |
| 🔄 **Cache Hit Rate** | >70% |
| 📈 **Concurrent Users Tested** | 100+ |
| ✅ **Test Coverage** | 77% |
| 🔧 **API Endpoints** | 30+ |

---

## 📂 Project Structure

```
InferX/
├── 🐍 Backend/                      # FastAPI Application
│   ├── app/
│   │   ├── api/                     # API Routes (auth, models, predictions)
│   │   ├── core/                    # Config, Security, Dependencies
│   │   ├── models/                  # SQLAlchemy Database Models
│   │   ├── schemas/                 # Pydantic Schemas
│   │   ├── services/                # Business Logic Layer
│   │   └── main.py                  # Application Entry Point
│   ├── alembic/                     # Database Migrations
│   ├── tests/                       # Pytest Test Suites
│   └── requirements.txt
│
├── ⚛️ Frontend/                     # Next.js 16 Application
│   ├── app/
│   │   ├── (auth)/                  # Authentication Pages
│   │   ├── (dashboard)/             # Protected Dashboard Routes
│   │   └── (landing)/               # Public Landing Pages
│   ├── components/                  # Reusable UI Components
│   ├── contexts/                    # React Context Providers
│   ├── hooks/                       # Custom React Hooks
│   └── lib/                         # Utilities & API Clients
│
├── 🐳 docker-compose.yml            # Development Environment
├── 🐳 docker-compose.prod.yml       # Production Environment
├── 📚 Docs/                         # Learning Guides & Documentation
└── 📊 mermaid/                      # Architecture Diagrams
```

---

## 🧪 Testing

```bash
# Run all tests
cd Backend && pytest

# Run with coverage report
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py -v

# Run integration tests only
pytest tests/integration/ -v
```

**Current Test Coverage:** 77% (39 passing tests)

---

## 🗺️ Roadmap

- [x] **Core MVP** — Authentication, Model Upload, Predictions
- [x] **Analytics Dashboard** — Real-time monitoring
- [x] **API Keys** — Programmatic access
- [x] **Model Sharing** — Granular permissions
- [x] **Webhooks** — Event notifications
- [x] **Rate Limiting** — Token bucket algorithm
- [ ] **TensorFlow/PyTorch Support** — Coming soon
- [ ] **Model A/B Testing** — Planned
- [ ] **Data Drift Detection** — Planned
- [ ] **Python SDK** — In development

---

## 🎓 What I Learned

This project demonstrates proficiency in:

| Area | Skills |
|------|--------|
| **Backend Development** | FastAPI, REST APIs, async Python, dependency injection |
| **Frontend Development** | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS |
| **Database Design** | PostgreSQL, SQLAlchemy 2.0, Alembic migrations, indexing strategies |
| **Caching Strategies** | Redis, cache-aside pattern, LRU caching, TTL management |
| **Authentication** | JWT, OAuth 2.0, password hashing (Argon2), API key management |
| **System Design** | Microservices patterns, rate limiting, webhooks, background jobs |
| **DevOps** | Docker, Docker Compose, multi-stage builds, CI/CD |
| **Testing** | Unit tests, integration tests, pytest fixtures, 77% coverage |

---

## 👨‍💻 Author

<div align="center">

**Partha Saradhi Munakala**

IIT (ISM) Dhanbad — Electrical Engineering

[![GitHub](https://img.shields.io/badge/GitHub-wittyparth-181717?style=for-the-badge&logo=github)](https://github.com/wittyparth)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/wittyparth)
[![LeetCode](https://img.shields.io/badge/LeetCode-Knight_1887-FFA116?style=for-the-badge&logo=leetcode&logoColor=white)](https://leetcode.com/wittyparth)

</div>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### ⭐ Star this repo if you found it helpful!

**Built with ❤️ to master full-stack development and MLOps**

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>

</div>
