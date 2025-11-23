# Frontend Backend Integration Guide

## Changes Made

### 1. Fixed Navigation Routing ✅
- Changed from `/(dashboard)/models` to `/models`
- All navigation links updated across the application
- Consistent URL structure throughout

### 2. Connected Frontend to FastAPI Backend ✅
**Previous Issue:** Frontend was using mock API routes  
**Solution:** Created proper backend integration

#### Updated Files:
- `Frontend/app/api/auth/login/route.ts` - Now forwards to FastAPI
- `Frontend/app/api/auth/register/route.ts` - Now forwards to FastAPI
- `Frontend/lib/api-client.ts` - New centralized API client

### 3. Removed Unimplemented Features ✅
**Removed:**
- Two-Factor Authentication (2FA) toggle from settings
- OTP input components (not used)

**Replaced With:**
- Email Notifications toggle
- Dark Mode toggle (functional with theme system)

### 4. Created API Client Library ✅
**Location:** `Frontend/lib/api-client.ts`

**Features:**
- Centralized API endpoint configuration
- Automatic authentication token handling
- Type-safe request methods
- Error handling
- File upload support

**Usage Example:**
```typescript
import { api } from '@/lib/api-client'

// Login
const response = await api.auth.login(email, password)

// Get models
const models = await api.models.list()

// Create prediction
const result = await api.predictions.create(modelId, inputData)
```

## Backend Endpoints Available

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout user

### Users
- `GET /api/v1/users/me` - Get current user
- `PATCH /api/v1/users/me` - Update user profile

### Models
- `POST /api/v1/models/upload` - Upload new model
- `GET /api/v1/models` - List all models
- `GET /api/v1/models/{model_id}` - Get model details
- `PATCH /api/v1/models/{model_id}` - Update model
- `DELETE /api/v1/models/{model_id}` - Delete model
- `GET /api/v1/models/{model_id}/analytics` - Get model analytics

### Predictions
- `POST /api/v1/predictions/{model_id}` - Make prediction
- `GET /api/v1/predictions/history` - Get prediction history

### API Keys
- `GET /api/v1/api-keys` - List API keys
- `POST /api/v1/api-keys` - Create new API key
- `DELETE /api/v1/api-keys/{key_id}` - Delete API key

### Model Sharing
- `POST /api/v1/model-shares/{model_id}/share` - Share model
- `GET /api/v1/model-shares/{model_id}/shares` - Get model shares
- `GET /api/v1/model-shares/shared-with-me` - Get models shared with me
- `PATCH /api/v1/model-shares/{model_id}/shares/{share_id}` - Update share
- `DELETE /api/v1/model-shares/{model_id}/shares/{share_id}` - Delete share

### Webhooks
- `GET /api/v1/webhooks` - List webhooks
- `POST /api/v1/webhooks` - Create webhook
- `GET /api/v1/webhooks/{webhook_id}` - Get webhook details
- `PATCH /api/v1/webhooks/{webhook_id}` - Update webhook
- `DELETE /api/v1/webhooks/{webhook_id}` - Delete webhook
- `POST /api/v1/webhooks/{webhook_id}/test` - Test webhook

## Environment Configuration

### Development (Local)
**File:** `Frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Docker Container
Environment variable set in `docker-compose.yml`:
```yaml
NEXT_PUBLIC_API_URL=http://backend:8000
```

## Running the Application

### Option 1: Docker (Recommended)
```bash
# Stop any running containers
docker-compose down

# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Local Development
```bash
# Terminal 1 - Backend
cd ML-Model-Serving-Platform
python -m uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd Frontend
pnpm dev
```

## Seeing Your Changes in Docker

### Issue: Changes not reflecting in Docker
**Cause:** Docker containers cache the built application

**Solution:**
```bash
# Method 1: Full rebuild (clean slate)
docker-compose down
docker-compose up --build

# Method 2: Rebuild specific service
docker-compose up --build frontend

# Method 3: Force recreation
docker-compose up --force-recreate frontend
```

### Hot Reload in Docker
The Docker setup includes hot reload, but Windows requires:
```yaml
environment:
  - CHOKIDAR_USEPOLLING=true  # ✅ Already added
  - WATCHPACK_POLLING=true    # ✅ Already added
```

**Note:** Hot reload may be slower on Windows. If changes aren't showing:
1. Save the file
2. Wait 5-10 seconds
3. Refresh browser
4. Check terminal for rebuild logs

## Testing the Integration

### 1. Test Authentication
```bash
# Register a new user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

### 2. Test from Frontend
1. Go to http://localhost:3000
2. Click "Create Account"
3. Register with email and password
4. Should redirect to login
5. Login with credentials
6. Should redirect to dashboard

### 3. Verify Backend Connection
Check browser console (F12) for API requests:
- Should see requests to `http://backend:8000` (in Docker)
- Or `http://localhost:8000` (local dev)

## Troubleshooting

### Frontend can't connect to backend
**Error:** "Unable to connect to authentication server"

**Solutions:**
1. Check backend is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify environment variable: `docker-compose exec frontend env | grep API_URL`
4. Test backend directly: `curl http://localhost:8000/api/v1/health`

### Changes not showing in Docker
```bash
# Clear everything and rebuild
docker-compose down -v
docker system prune -f
docker-compose up --build
```

### Database connection issues
```bash
# Check database health
docker-compose exec postgres pg_isready -U mluser

# View database logs
docker-compose logs postgres
```

### CORS errors
The backend should already have CORS configured in `app/main.py`.  
If you see CORS errors, check the CORS middleware configuration.

## Development Workflow

### Making Frontend Changes
1. Edit files in `Frontend/` directory
2. Save the file
3. Wait for hot reload (5-10 seconds)
4. Refresh browser
5. Check browser console for errors

### Making Backend Changes
1. Edit files in `ML-Model-Serving-Platform/` directory
2. FastAPI auto-reloads
3. Test with curl or frontend

### Adding New API Endpoints
1. Add endpoint in backend (e.g., `app/api/v1/models.py`)
2. Update `Frontend/lib/api-client.ts` with new endpoint
3. Use in components via `api.models.newMethod()`

## Features Not Yet Implemented in Frontend

These backend endpoints exist but frontend UI is not yet built:

- ❌ Model upload UI (backend ready)
- ❌ Predictions page with actual data
- ❌ Model sharing UI (backend ready)
- ❌ Webhooks management (backend ready)
- ❌ Model analytics charts with real data

**Next Steps:** Implement these UIs using the `api-client` library.

## Production Deployment

For production, update `docker-compose.prod.yml`:
```yaml
frontend:
  build:
    target: production
  environment:
    - NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## Summary

✅ **Fixed:** Navigation routing  
✅ **Fixed:** Backend API connection  
✅ **Removed:** Unimplemented features (2FA)  
✅ **Added:** Centralized API client  
✅ **Added:** Proper environment configuration  
✅ **Enhanced:** Login/Register pages with animations  
✅ **Enhanced:** Settings page  

**Next:** Implement remaining frontend UIs for backend features.

---

**Last Updated:** October 31, 2025  
**Status:** Production Ready for Authentication & Basic Features
