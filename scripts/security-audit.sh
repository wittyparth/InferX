#!/bin/bash
# Security Audit Script
# Checks for common security issues in the ML Model Serving Platform

echo "=========================================="
echo "Security Audit for ML Model Serving Platform"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ISSUES=0

# 1. Check if .env file is excluded from git
echo "1. Checking if .env is in .gitignore..."
if grep -q "^\.env$" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✓${NC} .env is properly gitignored"
else
    echo -e "${RED}✗${NC} .env is NOT in .gitignore - CRITICAL SECURITY ISSUE!"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# 2. Check for hardcoded secrets in code
echo "2. Checking for hardcoded secrets..."
SECRET_PATTERNS=("password" "secret" "api_key" "token" "private_key")
for pattern in "${SECRET_PATTERNS[@]}"; do
    matches=$(grep -r -i "$pattern.*=.*['\"]" app/ --include="*.py" | grep -v "^#" | grep -v "settings\." | wc -l)
    if [ "$matches" -gt 0 ]; then
        echo -e "${YELLOW}⚠${NC} Found $matches potential hardcoded $pattern references"
        ISSUES=$((ISSUES + 1))
    fi
done
echo -e "${GREEN}✓${NC} Hardcoded secrets check complete"
echo ""

# 3. Check if SECRET_KEY is strong
echo "3. Checking SECRET_KEY strength..."
if [ -f ".env" ]; then
    SECRET_KEY=$(grep "^SECRET_KEY=" .env | cut -d'=' -f2)
    if [ ${#SECRET_KEY} -lt 32 ]; then
        echo -e "${RED}✗${NC} SECRET_KEY is too short (less than 32 characters)"
        ISSUES=$((ISSUES + 1))
    elif [ "$SECRET_KEY" = "your-secret-key-here" ] || [ "$SECRET_KEY" = "dev-secret-key" ]; then
        echo -e "${RED}✗${NC} SECRET_KEY is using default/weak value"
        ISSUES=$((ISSUES + 1))
    else
        echo -e "${GREEN}✓${NC} SECRET_KEY appears strong"
    fi
else
    echo -e "${YELLOW}⚠${NC} .env file not found"
fi
echo ""

# 4. Check for SQL injection protection
echo "4. Checking for raw SQL queries (potential SQL injection)..."
raw_sql=$(grep -r "execute.*\"\|execute.*'" app/ --include="*.py" | grep -v "^#" | wc -l)
if [ "$raw_sql" -gt 0 ]; then
    echo -e "${YELLOW}⚠${NC} Found $raw_sql raw SQL queries - verify they use parameterized queries"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓${NC} No raw SQL queries found (using ORM)"
fi
echo ""

# 5. Check for HTTPS in production
echo "5. Checking CORS and HTTPS configuration..."
if [ -f ".env.production" ]; then
    CORS_ORIGINS=$(grep "^BACKEND_CORS_ORIGINS=" .env.production | cut -d'=' -f2)
    if [[ "$CORS_ORIGINS" == *"http://"* ]] && [[ "$CORS_ORIGINS" != *"localhost"* ]]; then
        echo -e "${RED}✗${NC} Production CORS allows HTTP (non-HTTPS) origins"
        ISSUES=$((ISSUES + 1))
    else
        echo -e "${GREEN}✓${NC} CORS configuration looks good"
    fi
else
    echo -e "${YELLOW}⚠${NC} .env.production not found"
fi
echo ""

# 6. Check for exposed debug mode
echo "6. Checking DEBUG mode..."
if [ -f ".env.production" ]; then
    DEBUG=$(grep "^DEBUG=" .env.production | cut -d'=' -f2)
    if [ "$DEBUG" = "true" ] || [ "$DEBUG" = "True" ]; then
        echo -e "${RED}✗${NC} DEBUG is enabled in production - SECURITY RISK!"
        ISSUES=$((ISSUES + 1))
    else
        echo -e "${GREEN}✓${NC} DEBUG is disabled in production"
    fi
fi
echo ""

# 7. Check for dependency vulnerabilities
echo "7. Checking for known dependency vulnerabilities..."
if command -v safety &> /dev/null; then
    safety check --json > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} No known vulnerabilities in dependencies"
    else
        echo -e "${YELLOW}⚠${NC} Vulnerabilities found in dependencies - run 'safety check' for details"
        ISSUES=$((ISSUES + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC} 'safety' not installed - install with 'pip install safety'"
fi
echo ""

# 8. Check for proper authentication
echo "8. Checking authentication implementation..."
if grep -q "get_current_user" app/api/dependencies.py 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Authentication dependency implemented"
else
    echo -e "${RED}✗${NC} Authentication dependency not found"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# 9. Check for rate limiting
echo "9. Checking rate limiting..."
if grep -q -i "rate.*limit" app/ -r --include="*.py"; then
    echo -e "${GREEN}✓${NC} Rate limiting appears to be implemented"
else
    echo -e "${YELLOW}⚠${NC} No rate limiting found - consider implementing"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# 10. Check for input validation
echo "10. Checking input validation (Pydantic models)..."
pydantic_models=$(find app/schemas -name "*.py" | wc -l)
if [ "$pydantic_models" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Found $pydantic_models Pydantic schema files"
else
    echo -e "${RED}✗${NC} No Pydantic schemas found - input validation missing"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# Summary
echo "=========================================="
echo "Security Audit Summary"
echo "=========================================="
if [ "$ISSUES" -eq 0 ]; then
    echo -e "${GREEN}✓ All security checks passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠ Found $ISSUES security issues that need attention${NC}"
    echo ""
    echo "Recommendations:"
    echo "  1. Review and fix all flagged issues"
    echo "  2. Use strong, randomly generated secrets"
    echo "  3. Enable HTTPS in production"
    echo "  4. Keep dependencies updated"
    echo "  5. Implement rate limiting and input validation"
    echo "  6. Regularly run security audits"
    exit 1
fi
