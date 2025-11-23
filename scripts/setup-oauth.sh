#!/bin/bash
# Complete OAuth Setup Script

echo "🚀 OAuth Integration Setup"
echo "==========================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Build backend with new dependencies
echo -e "${BLUE}Step 1: Building backend with OAuth dependencies...${NC}"
cd "ML-Model-Serving-Platform"
docker-compose build backend
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend built successfully${NC}"
else
    echo -e "${RED}✗ Failed to build backend${NC}"
    exit 1
fi
echo ""

# Step 2: Start services
echo -e "${BLUE}Step 2: Starting services...${NC}"
docker-compose up -d
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Services started${NC}"
else
    echo -e "${RED}✗ Failed to start services${NC}"
    exit 1
fi
echo ""

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Step 3: Run database migration
echo -e "${BLUE}Step 3: Running database migration...${NC}"
docker-compose exec -T backend alembic upgrade head
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migration completed${NC}"
else
    echo -e "${YELLOW}⚠ Migration may have already run or database not ready${NC}"
fi
echo ""

# Step 4: Check if environment variables are set
echo -e "${BLUE}Step 4: Checking environment configuration...${NC}"
if docker-compose exec -T backend env | grep -q "GOOGLE_CLIENT_ID"; then
    echo -e "${GREEN}✓ Google OAuth configured${NC}"
else
    echo -e "${YELLOW}⚠ Google OAuth not configured (optional)${NC}"
fi

if docker-compose exec -T backend env | grep -q "GITHUB_CLIENT_ID"; then
    echo -e "${GREEN}✓ GitHub OAuth configured${NC}"
else
    echo -e "${YELLOW}⚠ GitHub OAuth not configured (optional)${NC}"
fi
echo ""

# Step 5: Test services
echo -e "${BLUE}Step 5: Testing services...${NC}"
sleep 5

# Test backend health
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/health)
if [ "$BACKEND_HEALTH" = "200" ]; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${YELLOW}⚠ Backend health check returned: $BACKEND_HEALTH${NC}"
fi

# Test frontend
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND_HEALTH" = "200" ]; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${YELLOW}⚠ Frontend returned: $FRONTEND_HEALTH${NC}"
fi
echo ""

# Final summary
echo "==========================="
echo -e "${GREEN}✓ OAuth Integration Setup Complete!${NC}"
echo "==========================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Configure OAuth Credentials (if not done):"
echo "   - Google: https://console.cloud.google.com/apis/credentials"
echo "   - GitHub: https://github.com/settings/developers"
echo ""
echo "2. Update Environment Variables:"
echo "   Edit: ML-Model-Serving-Platform/.env"
echo "   Add your GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, etc."
echo ""
echo "3. Restart Services:"
echo "   docker-compose restart backend"
echo ""
echo "4. Test OAuth:"
echo "   Open: http://localhost:3000/login"
echo "   Click: 'Sign in with Google' or 'Sign in with GitHub'"
echo ""
echo "📚 Documentation:"
echo "   - Setup Guide: OAUTH_SETUP.md"
echo "   - Full Guide: OAUTH_INTEGRATION_GUIDE.md"
echo "   - Summary: OAUTH_IMPLEMENTATION_SUMMARY.md"
echo ""
echo "✅ Services Running:"
echo "   - Backend: http://localhost:8000"
echo "   - Frontend: http://localhost:3000"
echo "   - API Docs: http://localhost:8000/api/v1/docs"
echo ""
