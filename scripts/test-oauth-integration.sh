#!/bin/bash
# OAuth Integration Test Script

echo "🔍 OAuth Integration Test"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Helper function for tests
test_check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $1"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $1"
        ((FAILED++))
    fi
}

echo "1. Checking Backend Files..."
echo "----------------------------"

# Check backend files
if [ -f "ML-Model-Serving-Platform/app/services/oauth.py" ]; then
    test_check "OAuth service exists"
else
    test_check "OAuth service exists"
fi

if grep -q "oauth_provider" "ML-Model-Serving-Platform/app/models/user.py"; then
    test_check "User model has OAuth fields"
else
    test_check "User model has OAuth fields"
fi

if grep -q "GOOGLE_CLIENT_ID" "ML-Model-Serving-Platform/app/core/config.py"; then
    test_check "Config has Google OAuth settings"
else
    test_check "Config has Google OAuth settings"
fi

if grep -q "GITHUB_CLIENT_ID" "ML-Model-Serving-Platform/app/core/config.py"; then
    test_check "Config has GitHub OAuth settings"
else
    test_check "Config has GitHub OAuth settings"
fi

if grep -q "authlib" "ML-Model-Serving-Platform/requirements.txt"; then
    test_check "authlib dependency added"
else
    test_check "authlib dependency added"
fi

echo ""
echo "2. Checking Frontend Files..."
echo "-----------------------------"

# Check frontend files
if [ -f "Frontend/app/auth/callback/page.tsx" ]; then
    test_check "OAuth callback page exists"
else
    test_check "OAuth callback page exists"
fi

if [ -f "Frontend/app/api/auth/oauth/[provider]/route.ts" ]; then
    test_check "OAuth provider route exists"
else
    test_check "OAuth provider route exists"
fi

if [ -f "Frontend/app/api/auth/oauth/[provider]/callback/route.ts" ]; then
    test_check "OAuth callback route exists"
else
    test_check "OAuth callback route exists"
fi

if grep -q "/auth/callback" "Frontend/middleware.ts"; then
    test_check "Middleware allows callback route"
else
    test_check "Middleware allows callback route"
fi

if grep -q "oauth/google" "Frontend/app/(auth)/login/page.tsx"; then
    test_check "Login page has OAuth buttons"
else
    test_check "Login page has OAuth buttons"
fi

echo ""
echo "3. Checking Database Migration..."
echo "--------------------------------"

if [ -f "ML-Model-Serving-Platform/alembic/versions/f4a8b9c1d2e3_add_oauth_fields_to_user.py" ]; then
    test_check "OAuth migration file exists"
else
    test_check "OAuth migration file exists"
fi

echo ""
echo "4. Checking Environment Files..."
echo "--------------------------------"

if grep -q "GOOGLE_CLIENT_ID" "ML-Model-Serving-Platform/.env.example"; then
    test_check "Backend .env.example has OAuth vars"
else
    test_check "Backend .env.example has OAuth vars"
fi

if grep -q "FRONTEND_URL" "Frontend/.env.example"; then
    test_check "Frontend .env.example has required vars"
else
    test_check "Frontend .env.example has required vars"
fi

echo ""
echo "5. Checking Documentation..."
echo "----------------------------"

if [ -f "OAUTH_INTEGRATION_GUIDE.md" ]; then
    test_check "OAuth integration guide exists"
else
    test_check "OAuth integration guide exists"
fi

if [ -f "OAUTH_SETUP.md" ]; then
    test_check "OAuth setup guide exists"
else
    test_check "OAuth setup guide exists"
fi

echo ""
echo "=========================="
echo "Test Results Summary"
echo "=========================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Set up OAuth credentials (see OAUTH_SETUP.md)"
    echo "2. Update .env files with credentials"
    echo "3. Run database migration: docker-compose exec backend alembic upgrade head"
    echo "4. Restart services: docker-compose restart"
    echo "5. Test OAuth at: http://localhost:3000/login"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please check the errors above.${NC}"
    exit 1
fi
