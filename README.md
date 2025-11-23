# 🚀 ML Model Serving Platform

> **A production-ready MLOps platform for deploying, monitoring, and managing Scikit-learn models with a Next.js dashboard and FastAPI backend.**

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 💡 What is this?

This platform bridges the gap between data science and production. It allows data scientists to upload trained models (Scikit-learn) and instantly expose them via high-performance REST APIs, while providing a modern dashboard to monitor inference performance and manage model versions.

**Why use this?**
*   **Zero-Downtime Deployment:** Deploy new model versions without restarting the server.
*   **Real-time Monitoring:** Track latency, error rates, and drift detection.
*   **Secure:** Built-in JWT authentication and API key management.

---

## 🏗️ Architecture

# System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser<br/>Next.js Frontend]
        MOBILE[Mobile Apps]
        API_CLIENT[API Clients<br/>Python/cURL]
    end

    subgraph "Load Balancer / Reverse Proxy"
        NGINX[Nginx<br/>Port 80/443]
    end

    subgraph "Application Layer"
        FRONTEND[Next.js Application<br/>Port 3000<br/>React 19, TypeScript]
        BACKEND[FastAPI Backend<br/>Port 8000<br/>Python 3.11+]
    end

    subgraph "Caching Layer"
        REDIS[(Redis 7.0<br/>Port 6379<br/>In-Memory Cache)]
    end

    subgraph "Database Layer"
        POSTGRES[(PostgreSQL 15<br/>Port 5432<br/>Primary Database)]
    end

    subgraph "Storage Layer"
        LOCAL_STORAGE[Local File System<br/>Model Storage]
        S3[AWS S3<br/>Cloud Storage<br/>Future]
    end

    subgraph "External Services"
        OAUTH_GOOGLE[Google OAuth]
        OAUTH_GITHUB[GitHub OAuth]
        WEBHOOKS[External Webhooks]
        MONITORING[Sentry/DataDog<br/>Monitoring]
    end

    WEB -->|HTTPS| NGINX
    MOBILE -->|HTTPS| NGINX
    API_CLIENT -->|HTTPS/REST| NGINX
    
    NGINX -->|Proxy| FRONTEND
    NGINX -->|Proxy| BACKEND
    
    FRONTEND -->|API Calls| BACKEND
    
    BACKEND -->|Cache Read/Write| REDIS
    BACKEND -->|SQL Queries| POSTGRES
    BACKEND -->|Store/Load Models| LOCAL_STORAGE
    BACKEND -.->|Future| S3
    BACKEND -->|OAuth Flow| OAUTH_GOOGLE
    BACKEND -->|OAuth Flow| OAUTH_GITHUB
    BACKEND -->|Event Notifications| WEBHOOKS
    BACKEND -->|Error Tracking| MONITORING
    
    REDIS -->|Cache Miss| POSTGRES
    
    style FRONTEND fill:#61dafb,stroke:#333,stroke-width:2px,color:#000
    style BACKEND fill:#009688,stroke:#333,stroke-width:2px,color:#fff
    style POSTGRES fill:#336791,stroke:#333,stroke-width:2px,color:#fff
    style REDIS fill:#dc382d,stroke:#333,stroke-width:2px,color:#fff
    style NGINX fill:#009639,stroke:#333,stroke-width:2px,color:#fff
```

---

## ✨ Key Features

### 🧠 Model Management
*   **Version Control:** Keep track of multiple versions of your models.
*   **Hot Reloading:** Update models in memory without downtime.
*   **Framework Agnostic:** Currently optimized for Scikit-learn, but extensible to PyTorch/TensorFlow.

### ⚡ High-Performance API
*   **FastAPI:** Built on Starlette and Pydantic for speed.
*   **Async Inference:** Non-blocking prediction endpoints.
*   **Redis Caching:** Caches frequent predictions to reduce latency.

### 📊 Interactive Dashboard
*   **Next.js 16:** Built with the latest App Router and React Server Components.
*   **Visualizations:** Real-time charts using Recharts.
*   **Modern UI:** Styled with Tailwind CSS 4 and Radix UI.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Python 3.10+, FastAPI | High-performance API framework |
| **Frontend** | Next.js 16, React 19 | Server-side rendered dashboard |
| **Database** | PostgreSQL 15 | Relational data storage |
| **ORM** | SQLAlchemy 2.0 | Async database interaction |
| **Caching** | Redis 7 | In-memory data structure store |
| **Container** | Docker & Compose | Orchestration and deployment |
| **Monitoring** | Sentry | Error tracking and performance monitoring |

---

## 🚀 Quick Start

### Prerequisites
*   Docker & Docker Compose installed.

### Option A: Run with Docker (Recommended)
The easiest way to spin up the entire stack (Frontend, Backend, DB, Redis).

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/ml-model-serving.git
cd ml-model-serving

# 2. Set up environment variables
cp .env.example .env

# 3. Start the services
docker-compose up --build
```

Access the apps:
*   **Frontend Dashboard:** `http://localhost:3000`
*   **API Documentation:** `http://localhost:8000/docs`

### Option B: Local Development

<details>
<summary><strong>Click to expand instructions</strong></summary>

#### Backend
```bash
cd ML-Model-Serving-Platform
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd Frontend
npm install
npm run dev
```
</details>

---

## 📂 Project Structure

```bash
├── Frontend/                 # Next.js Web Application
│   ├── app/                  # App Router pages ((dashboard), (auth))
│   ├── components/           # Reusable UI components
│   └── lib/                  # Utilities and API clients
│
├── ML-Model-Serving-Platform/ # FastAPI Backend
│   ├── app/
│   │   ├── api/              # API Routes (auth, models, predictions)
│   │   ├── core/             # Config & Security
│   │   ├── models/           # Database Models
│   │   └── services/         # Business Logic
│   ├── alembic/              # Database Migrations
│   └── tests/                # Pytest suites
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
