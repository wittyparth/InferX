#!/bin/bash
# Complete API Testing Script
# Tests all endpoints including new Phase 6 features

echo "=========================================="
echo "ML Model Serving Platform - API Test"
echo "=========================================="
echo ""

API_URL="http://localhost:8000/api/v1"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counter
TESTS_RUN=0
TESTS_PASSED=0

test_endpoint() {
    TESTS_RUN=$((TESTS_RUN + 1))
    echo -n "Testing: $1... "
    response=$(eval "$2")
    if echo "$response" | grep -q "$3"; then
        echo -e "${GREEN}✓ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "Response: $response"
        return 1
    fi
}

echo "1. Health Checks"
echo "----------------"
test_endpoint "Root health" "curl -s $API_URL/../" "\"status\".*\"healthy\""
test_endpoint "Detailed health" "curl -s $API_URL/health" "\"database\".*\"healthy\""
test_endpoint "Readiness probe" "curl -s $API_URL/health/ready" "\"status\".*200"
test_endpoint "Liveness probe" "curl -s $API_URL/health/live" "\"status\".*200"
echo ""

echo "2. Authentication"
echo "----------------"
# Register user 1
RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"Pass123!","full_name":"User One"}')
test_endpoint "Register user 1" "echo '$RESPONSE'" "\"success\".*true"

# Login user 1
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"Pass123!"}')
TOKEN1=$(echo $LOGIN_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['access_token'])" 2>/dev/null || echo "")

if [ -z "$TOKEN1" ]; then
    echo -e "${RED}✗ Failed to get access token${NC}"
    exit 1
fi

test_endpoint "Login user 1" "echo '$LOGIN_RESPONSE'" "\"access_token\""
test_endpoint "Get current user" "curl -s $API_URL/auth/me -H 'Authorization: Bearer $TOKEN1'" "\"email\".*\"user1@test.com\""

# Register user 2 for sharing tests
curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@test.com","password":"Pass123!","full_name":"User Two"}' > /dev/null

LOGIN2=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@test.com","password":"Pass123!"}')
TOKEN2=$(echo $LOGIN2 | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['access_token'])" 2>/dev/null || echo "")

echo ""

echo "3. API Keys"
echo "----------"
# Create API key
APIKEY_RESPONSE=$(curl -s -X POST $API_URL/api-keys \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Key","expires_in_days":30}')
test_endpoint "Create API key" "echo '$APIKEY_RESPONSE'" "\"api_key\""

API_KEY=$(echo $APIKEY_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['api_key'])" 2>/dev/null || echo "")

test_endpoint "List API keys" "curl -s $API_URL/api-keys -H 'Authorization: Bearer $TOKEN1'" "\"name\".*\"Test Key\""
test_endpoint "Auth with API key" "curl -s $API_URL/auth/me -H 'X-API-Key: $API_KEY'" "\"email\".*\"user1@test.com\""
echo ""

echo "4. Model Management"
echo "------------------"
# Create a dummy model file
echo "import pickle; pickle.dump({'model': 'dummy'}, open('/tmp/test_model.pkl', 'wb'))" | python3

# Upload model
MODEL_RESPONSE=$(curl -s -X POST $API_URL/models/upload \
  -H "Authorization: Bearer $TOKEN1" \
  -F "file=@/tmp/test_model.pkl" \
  -F "name=test_model" \
  -F "description=Test model" \
  -F "model_type=sklearn")
test_endpoint "Upload model" "echo '$MODEL_RESPONSE'" "\"success\".*true"

MODEL_ID=$(echo $MODEL_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['model']['id'])" 2>/dev/null || echo "")

test_endpoint "List models" "curl -s $API_URL/models -H 'Authorization: Bearer $TOKEN1'" "\"test_model\""
test_endpoint "Get model details" "curl -s $API_URL/models/$MODEL_ID -H 'Authorization: Bearer $TOKEN1'" "\"test_model\""
test_endpoint "Update model" "curl -s -X PATCH $API_URL/models/$MODEL_ID -H 'Authorization: Bearer $TOKEN1' -H 'Content-Type: application/json' -d '{\"description\":\"Updated\"}'" "\"Updated\""
echo ""

echo "5. Model Sharing (NEW!)"
echo "----------------------"
# Share model with user 2
SHARE_RESPONSE=$(curl -s -X POST $API_URL/models/$MODEL_ID/share \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"shared_with_email":"user2@test.com","permission":"use"}')
test_endpoint "Share model" "echo '$SHARE_RESPONSE'" "\"success\".*true"

SHARE_ID=$(echo $SHARE_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || echo "")

test_endpoint "List shares" "curl -s $API_URL/models/$MODEL_ID/shares -H 'Authorization: Bearer $TOKEN1'" "\"user2@test.com\""
test_endpoint "List shared with me" "curl -s $API_URL/models/shared-with-me -H 'Authorization: Bearer $TOKEN2'" "\"test_model\""
test_endpoint "Update share permission" "curl -s -X PATCH $API_URL/models/$MODEL_ID/shares/$SHARE_ID -H 'Authorization: Bearer $TOKEN1' -H 'Content-Type: application/json' -d '{\"permission\":\"view\"}'" "\"view\""
echo ""

echo "6. Webhooks (NEW!)"
echo "-----------------"
# Create webhook
WEBHOOK_RESPONSE=$(curl -s -X POST $API_URL/webhooks \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://webhook.site/unique-id","description":"Test webhook","events":["prediction","error"],"model_id":"'$MODEL_ID'"}')
test_endpoint "Create webhook" "echo '$WEBHOOK_RESPONSE'" "\"secret\""

WEBHOOK_ID=$(echo $WEBHOOK_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || echo "")

test_endpoint "List webhooks" "curl -s $API_URL/webhooks -H 'Authorization: Bearer $TOKEN1'" "\"Test webhook\""
test_endpoint "Get webhook" "curl -s $API_URL/webhooks/$WEBHOOK_ID -H 'Authorization: Bearer $TOKEN1'" "\"webhook.site\""
test_endpoint "Update webhook" "curl -s -X PATCH $API_URL/webhooks/$WEBHOOK_ID -H 'Authorization: Bearer $TOKEN1' -H 'Content-Type: application/json' -d '{\"description\":\"Updated webhook\"}'" "\"Updated webhook\""
test_endpoint "Test webhook" "curl -s -X POST $API_URL/webhooks/$WEBHOOK_ID/test -H 'Authorization: Bearer $TOKEN1' -H 'Content-Type: application/json' -d '{\"test_event\":\"prediction\"}'" "\"Test event sent\""
echo ""

echo "7. Analytics"
echo "-----------"
test_endpoint "Model analytics" "curl -s $API_URL/models/$MODEL_ID/analytics -H 'Authorization: Bearer $TOKEN1'" "\"statistics\""
echo ""

echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "Tests Run: $TESTS_RUN"
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $((TESTS_RUN - TESTS_PASSED))"

if [ $TESTS_PASSED -eq $TESTS_RUN ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}Some tests failed${NC}"
    exit 1
fi
