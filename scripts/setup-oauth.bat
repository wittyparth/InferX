@echo off
REM Complete OAuth Setup Script for Windows

echo ====================================
echo OAuth Integration Setup
echo ====================================
echo.

cd "ML-Model-Serving-Platform"

REM Step 1: Build backend with new dependencies
echo Step 1: Building backend with OAuth dependencies...
docker-compose build backend
if errorlevel 1 (
    echo [ERROR] Failed to build backend
    exit /b 1
)
echo [OK] Backend built successfully
echo.

REM Step 2: Start services
echo Step 2: Starting services...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start services
    exit /b 1
)
echo [OK] Services started
echo.

REM Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Step 3: Run database migration
echo Step 3: Running database migration...
docker-compose exec -T backend alembic upgrade head
if errorlevel 1 (
    echo [WARNING] Migration may have already run or database not ready
) else (
    echo [OK] Migration completed
)
echo.

REM Wait for services
echo Waiting for services to stabilize...
timeout /t 5 /nobreak >nul

REM Final summary
echo ====================================
echo OAuth Integration Setup Complete!
echo ====================================
echo.
echo Next Steps:
echo.
echo 1. Configure OAuth Credentials (if not done):
echo    - Google: https://console.cloud.google.com/apis/credentials
echo    - GitHub: https://github.com/settings/developers
echo.
echo 2. Update Environment Variables:
echo    Edit: ML-Model-Serving-Platform\.env
echo    Add your GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, etc.
echo.
echo 3. Restart Services:
echo    docker-compose restart backend
echo.
echo 4. Test OAuth:
echo    Open: http://localhost:3000/login
echo    Click: 'Sign in with Google' or 'Sign in with GitHub'
echo.
echo Documentation:
echo    - Setup Guide: OAUTH_SETUP.md
echo    - Full Guide: OAUTH_INTEGRATION_GUIDE.md
echo    - Summary: OAUTH_IMPLEMENTATION_SUMMARY.md
echo.
echo Services Running:
echo    - Backend: http://localhost:8000
echo    - Frontend: http://localhost:3000
echo    - API Docs: http://localhost:8000/api/v1/docs
echo.

pause
