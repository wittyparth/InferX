# 🚀 InferX Cloud Deployment Guide

**Project**: ML Model Serving Platform  
**Target**: Individual cloud services (NeonDB + Render/Railway + Vercel + AWS S3)  
**Goal**: Production deployment for portfolio showcase  
**Status**: In Progress  
**Last Updated**: December 18, 2025

---

## 📊 Deployment Progress Tracker

### Phase 1: Infrastructure Setup ⏳
- [ ] **1.1** Setup NeonDB PostgreSQL (Serverless)
- [ ] **1.2** Setup Redis Cloud/Upstash (Free Tier)
- [ ] **1.3** Create AWS S3 Bucket for Model Storage
- [ ] **1.4** Get AWS IAM Credentials (Access Key + Secret)
- [ ] **1.5** Register Domain (Optional) or Note Service URLs

### Phase 2: Backend Preparation 🔧
- [ ] **2.1** Create `.env.production` file in Backend folder
- [ ] **2.2** Update `models.py` to use S3 StorageService
- [ ] **2.3** Update `predictions.py` to load models from S3
- [ ] **2.4** Fix CORS configuration for production URLs
- [ ] **2.5** Run database migrations to NeonDB
- [ ] **2.6** Test backend locally with cloud services

### Phase 3: Frontend Preparation 🎨
- [ ] **3.1** Create `.env.production` in Frontend folder
- [ ] **3.2** Create `.env.local` in Frontend folder
- [ ] **3.3** Fix TypeScript build errors
- [ ] **3.4** Update API URL configuration
- [ ] **3.5** Test frontend build locally

### Phase 4: OAuth Configuration 🔐
- [ ] **4.1** Update Google OAuth redirect URIs
- [ ] **4.2** Update GitHub OAuth redirect URIs
- [ ] **4.3** Add production credentials to backend env
- [ ] **4.4** Test OAuth flow

### Phase 5: Deployment 🌐
- [ ] **5.1** Deploy Backend to Render/Railway
- [ ] **5.2** Deploy Frontend to Vercel
- [ ] **5.3** Configure environment variables on platforms
- [ ] **5.4** Verify health endpoints work
- [ ] **5.5** Test complete user flow end-to-end

### Phase 6: Optimization & Security 🔒
- [ ] **6.1** Enable production mode (DEBUG=False)
- [ ] **6.2** Configure proper CORS origins
- [ ] **6.3** Setup Sentry error tracking
- [ ] **6.4** Add rate limiting configuration
- [ ] **6.5** Security headers and HTTPS

### Phase 7: Documentation & Demo 📹
- [ ] **7.1** Update README.md with live demo links
- [ ] **7.2** Add screenshots to README
- [ ] **7.3** Create demo video (3-5 minutes)
- [ ] **7.4** Upload video to YouTube
- [ ] **7.5** Prepare API documentation

### Phase 8: Social Media Launch 📱
- [ ] **8.1** Write LinkedIn post with demo
- [ ] **8.2** Create Twitter/X thread
- [ ] **8.3** Prepare visuals and screenshots
- [ ] **8.4** Post and share project links

---

## 🛠️ Detailed Step-by-Step Instructions

### Phase 1: Infrastructure Setup

#### 1.1 Setup NeonDB PostgreSQL
**Service**: [https://neon.tech](https://neon.tech)  
**Cost**: Free tier (0.5GB storage)

**Steps**:
1. Sign up at neon.tech
2. Create new project: `inferx-production`
3. Create database: `ml_platform`
4. Copy connection string (looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/ml_platform?sslmode=require
   ```
5. Save this for `.env.production` as `DATABASE_URL`

---

#### 1.2 Setup Redis Cloud/Upstash
**Service**: [https://upstash.com](https://upstash.com) (Recommended)  
**Cost**: Free tier (10K requests/day)

**Steps**:
1. Sign up at upstash.com
2. Create Redis database: `inferx-cache`
3. Select region closest to your backend deployment
4. Copy connection string (looks like):
   ```
   redis://default:password@region.upstash.io:6379
   ```
5. Save this for `.env.production` as `REDIS_URL`

---

#### 1.3 Create AWS S3 Bucket
**Service**: AWS S3  
**Cost**: ~$1-2/month for small model files

**Steps**:
1. Login to AWS Console → S3
2. Click "Create bucket"
3. Bucket name: `inferx-models-production` (must be globally unique)
4. Region: `us-east-1` (or your preferred region)
5. **Uncheck** "Block all public access" (we'll use IAM for security)
6. Create bucket
7. Note bucket name and region for `.env.production`

---

#### 1.4 Get AWS IAM Credentials
**Steps**:
1. AWS Console → IAM → Users
2. Create user: `inferx-s3-service`
3. Attach policy: `AmazonS3FullAccess` (or create custom policy for just your bucket)
4. Security credentials → Create access key
5. Use case: "Application running outside AWS"
6. Copy:
   - Access Key ID
   - Secret Access Key
7. Save these for `.env.production`

**Custom Policy (Recommended - More Secure)**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::inferx-models-production/*",
        "arn:aws:s3:::inferx-models-production"
      ]
    }
  ]
}
```

---

### Phase 2: Backend Preparation

#### 2.1 Create `.env.production` File

**Location**: `Backend/.env.production`

**Template**:
```env
# Application Settings
ENVIRONMENT=production
DEBUG=False
PROJECT_NAME=InferX - ML Model Serving Platform
VERSION=1.0.0

# API Settings
API_V1_PREFIX=/api/v1

# Security (GENERATE NEW SECRET KEY!)
SECRET_KEY=<GENERATE_WITH_PYTHON_SECRETS>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database (NeonDB)
DATABASE_URL=postgresql://user:pass@host.neon.tech/ml_platform?sslmode=require
DATABASE_ECHO=False
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=2

# Redis (Upstash)
REDIS_URL=redis://default:password@region.upstash.io:6379
CACHE_TTL_SECONDS=3600

# CORS Origins (UPDATE WITH YOUR VERCEL URL)
BACKEND_CORS_ORIGINS=https://your-app.vercel.app,https://inferx.yourdomain.com

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=1000

# File Upload
MAX_UPLOAD_SIZE_MB=100
UPLOAD_DIR=models
ALLOWED_MODEL_TYPES=sklearn

# Model Settings
MODEL_CACHE_SIZE=3

# Cloud Storage (AWS S3) - IMPORTANT!
USE_CLOUD_STORAGE=True
S3_BUCKET_NAME=inferx-models-production
S3_REGION=us-east-1
S3_ENDPOINT_URL=
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# Monitoring (Optional - setup Sentry account)
SENTRY_DSN=
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1

# OAuth Settings - Google
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/api/auth/oauth/google/callback

# OAuth Settings - GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret
GITHUB_REDIRECT_URI=https://your-app.vercel.app/api/auth/oauth/github/callback

# Frontend URL
FRONTEND_URL=https://your-app.vercel.app
```

**Generate SECRET_KEY**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

#### 2.2 Update `models.py` to Use S3 Storage

**File**: `Backend/app/api/v1/models.py`

**What to change**:

**OLD CODE** (Lines ~77-90):
```python
# Create file path
model_id = str(uuid_lib.uuid4())
file_dir = os.path.join(
    settings.UPLOAD_DIR, str(current_user.id), name, f"v{version}"
)
os.makedirs(file_dir, exist_ok=True)

file_path = os.path.join(file_dir, file.filename or "model.pkl")

# Save file
with open(file_path, "wb") as f:
    f.write(content)
```

**NEW CODE** (What you need to write):
```python
from app.core.storage import StorageService

# Initialize storage service (at top of function or module level)
storage = StorageService()

# Create S3 key (instead of file path)
model_id = str(uuid_lib.uuid4())
s3_key = f"{current_user.id}/{name}/v{version}/{file.filename or 'model.pkl'}"

# Save file to S3
file_path = await storage.save_file(s3_key, content)
```

**Why**: This changes from local filesystem to cloud storage (S3), making your deployment stateless.

---

#### 2.3 Update `predictions.py` to Load Models from S3

**File**: `Backend/app/api/v1/predictions.py`

**What to find and change**:
Look for where models are loaded with `joblib.load()`. You'll need to:

1. Import storage service
2. Load model bytes from S3
3. Use joblib to deserialize from bytes

**Pattern**:
```python
from app.core.storage import StorageService
import joblib
import io

storage = StorageService()

# Instead of: model = joblib.load(file_path)
# Use:
model_bytes = await storage.load_file(model.file_path)
model = joblib.load(io.BytesIO(model_bytes))
```

---

#### 2.4 Fix CORS Configuration

**File**: `Backend/app/main.py`

**What to change**:
After deployment, update line ~66-71 to include your Vercel URL:

```python
# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,  # This reads from .env
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

And update line ~79 for production:
```python
# Session middleware
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    session_cookie="oauth_session",
    max_age=3600,
    same_site="lax",
    https_only=True  # CHANGE TO True in production!
)
```

---

#### 2.5 Run Database Migrations

**Steps**:
1. Set DATABASE_URL environment variable to your NeonDB connection string:
   ```bash
   export DATABASE_URL="postgresql://user:pass@host.neon.tech/ml_platform?sslmode=require"
   ```

2. Run migrations:
   ```bash
   cd Backend
   alembic upgrade head
   ```

3. Verify tables created:
   ```bash
   # Connect to NeonDB and check
   psql $DATABASE_URL -c "\dt"
   ```

**Expected tables**: users, models, predictions, api_keys, webhooks, model_shares

---

### Phase 3: Frontend Preparation

#### 3.1 Create `.env.production` in Frontend

**Location**: `Frontend/.env.production`

```env
# Backend API URL (UPDATE with your deployed backend URL)
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

---

#### 3.2 Create `.env.local` in Frontend

**Location**: `Frontend/.env.local`

```env
# Local development
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

#### 3.3 Fix TypeScript Build Errors

**File**: `Frontend/next.config.mjs`

**Current** (Line 3):
```javascript
typescript: {
  ignoreBuildErrors: true,  // BAD - hiding errors!
},
```

**Change to**:
```javascript
typescript: {
  ignoreBuildErrors: false,  // Fix the actual errors
},
```

Then run:
```bash
cd Frontend
npm run build
```

Fix any TypeScript errors that appear. Common issues:
- Missing type annotations
- Incorrect prop types
- Unused variables

---

### Phase 4: OAuth Configuration

#### 4.1 Google OAuth Setup

**URL**: [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

**Steps**:
1. Select your project (or create new)
2. Credentials → OAuth 2.0 Client IDs
3. Edit your OAuth client
4. Add to "Authorized redirect URIs":
   ```
   https://your-app.vercel.app/api/auth/oauth/google/callback
   ```
5. Save
6. Copy Client ID and Client Secret to `.env.production`

---

#### 4.2 GitHub OAuth Setup

**URL**: [https://github.com/settings/developers](https://github.com/settings/developers)

**Steps**:
1. OAuth Apps → Your app (or create new)
2. Update settings:
   - Homepage URL: `https://your-app.vercel.app`
   - Authorization callback URL: `https://your-app.vercel.app/api/auth/oauth/github/callback`
3. Generate new client secret if needed
4. Copy Client ID and Client Secret to `.env.production`

---

### Phase 5: Deployment

#### 5.1 Deploy Backend to Render

**URL**: [https://render.com](https://render.com)

**Steps**:
1. Sign up / Login
2. New → Web Service
3. Connect your GitHub repo: `InferX`
4. Configure:
   - **Name**: `inferx-backend`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `Backend`
   - **Runtime**: `Python 3.11`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Advanced → Add Environment Variables:
   - Copy ALL variables from `.env.production`
   - Click "Add" for each one
6. Create Web Service
7. Wait for deployment (~5-10 minutes)
8. Copy your backend URL: `https://inferx-backend.onrender.com`

**Free Tier Note**: Service will sleep after 15 minutes of inactivity. First request after sleep takes ~30 seconds.

---

#### 5.2 Deploy Frontend to Vercel

**URL**: [https://vercel.com](https://vercel.com)

**Steps**:
1. Sign up / Login with GitHub
2. Import Project → Select `InferX` repo
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `Frontend`
4. Environment Variables:
   - Add `NEXT_PUBLIC_API_URL` = `https://inferx-backend.onrender.com`
5. Deploy
6. Wait for build (~2-3 minutes)
7. Copy your frontend URL: `https://inferx-xyz.vercel.app`

---

#### 5.3 Update CORS and OAuth

**After deployment**:
1. Update `Backend/.env.production` on Render:
   - `BACKEND_CORS_ORIGINS` = your Vercel URL
   - `FRONTEND_URL` = your Vercel URL
   - Update OAuth redirect URIs

2. Update OAuth providers with new callback URLs

3. Redeploy backend on Render

---

### Phase 6: Testing Checklist

#### End-to-End Testing
- [ ] Visit frontend URL - loads without errors
- [ ] Register new user account
- [ ] Login with email/password
- [ ] Login with Google OAuth
- [ ] Login with GitHub OAuth
- [ ] Upload a test ML model (.pkl file)
- [ ] Make prediction using uploaded model
- [ ] View predictions in dashboard
- [ ] Generate API key
- [ ] Test API key with cURL/Postman
- [ ] Check health endpoint: `/api/v1/health`
- [ ] Verify models stored in S3 bucket
- [ ] Check database records in NeonDB
- [ ] Test logout functionality

---

## 🚨 Common Issues & Solutions

### Issue: CORS Error
**Error**: "Access to fetch blocked by CORS policy"  
**Solution**: 
1. Check `BACKEND_CORS_ORIGINS` includes your frontend URL
2. Ensure no trailing slashes
3. Redeploy backend after changes

### Issue: Database Connection Failed
**Error**: "Could not connect to database"  
**Solution**:
1. Verify DATABASE_URL format includes `?sslmode=require`
2. Check NeonDB is active (not suspended)
3. Test connection locally first

### Issue: S3 Upload Failed
**Error**: "Access Denied" or "Bucket not found"  
**Solution**:
1. Verify AWS credentials are correct
2. Check bucket name matches exactly
3. Ensure IAM user has S3 permissions
4. Verify bucket region matches `S3_REGION`

### Issue: OAuth Redirect Error
**Error**: "redirect_uri_mismatch"  
**Solution**:
1. Exact match required (including https://)
2. No trailing slashes
3. Wait 5 minutes after updating in console

### Issue: Backend Sleep on Render
**Note**: Free tier sleeps after 15min inactivity  
**Solution**: 
- First request takes 30-60 seconds
- Consider upgrading to paid ($7/month) for 24/7 uptime
- Or use Railway ($5/month)

---

## 📝 Environment Variables Reference

### Backend Required Variables
```
DATABASE_URL          - NeonDB connection string
REDIS_URL            - Upstash Redis URL
SECRET_KEY           - Generated token
AWS_ACCESS_KEY_ID    - AWS IAM key
AWS_SECRET_ACCESS_KEY - AWS IAM secret
S3_BUCKET_NAME       - Your S3 bucket name
S3_REGION           - AWS region (e.g., us-east-1)
USE_CLOUD_STORAGE    - Set to True
BACKEND_CORS_ORIGINS - Frontend URL
FRONTEND_URL         - Frontend URL
```

### Frontend Required Variables
```
NEXT_PUBLIC_API_URL  - Backend URL
```

---

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ Frontend loads without errors
- ✅ Users can register and login
- ✅ OAuth login works (Google & GitHub)
- ✅ Models can be uploaded and stored in S3
- ✅ Predictions work correctly
- ✅ Dashboard shows real data
- ✅ API keys can be generated and used
- ✅ Health check returns 200 OK
- ✅ No console errors in browser
- ✅ Mobile responsive design works

---

## 📊 Cost Breakdown

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| NeonDB | Free | $0 |
| Upstash Redis | Free | $0 |
| AWS S3 | Pay-as-go | $1-2 |
| Render Backend | Free | $0 (with sleep) |
| Vercel Frontend | Free | $0 |
| Domain (optional) | - | $1/month |
| **Total** | | **~$2-3/month** |

---

## 🎬 Next Steps After Deployment

1. **Create Demo Video** (Use OBS Studio or Loom)
2. **Update README** with live demo link
3. **Add Screenshots** to GitHub repo
4. **Post on LinkedIn** with demo and tech breakdown
5. **Tweet Thread** on X/Twitter
6. **Monitor Sentry** for errors
7. **Get Feedback** from users
8. **Add to Resume** with live demo link

---

## 📚 Resources

- **NeonDB Docs**: https://neon.tech/docs
- **Upstash Docs**: https://docs.upstash.com
- **AWS S3 Guide**: https://docs.aws.amazon.com/s3/
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/

---

## ✅ Quick Command Reference

```bash
# Generate SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Test Backend Locally with Cloud Services
cd Backend
export DATABASE_URL="postgresql://..."
export REDIS_URL="redis://..."
uvicorn app.main:app --reload

# Run Database Migrations
cd Backend
alembic upgrade head

# Build Frontend Locally
cd Frontend
npm run build
npm start

# Test Backend Health
curl https://your-backend.onrender.com/api/v1/health

# Test API Endpoint
curl -X POST https://your-backend.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","username":"testuser"}'
```

---

**Remember**: I'm here to guide you through each step. Check off items as you complete them, and let me know if you need help with any specific step! 🚀
