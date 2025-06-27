#!/bin/bash

# CompliCal Complete API Test Script
# This script demonstrates the full flow from user registration to API usage

API_URL="https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev"

# Generate unique test user
TIMESTAMP=$(date +%s)
TEST_EMAIL="test-user-${TIMESTAMP}@example.com"
TEST_PASSWORD="SecurePassword123!"
TEST_COMPANY="Test Company ${TIMESTAMP}"

echo "================================================"
echo "CompliCal API Complete Test Flow"
echo "================================================"
echo "Test Email: ${TEST_EMAIL}"
echo "Test Password: ${TEST_PASSWORD}"
echo "================================================"

# Step 1: Register a new user
echo -e "\n1. REGISTERING NEW USER"
echo "------------------------"
REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"${TEST_EMAIL}"'",
    "password": "'"${TEST_PASSWORD}"'",
    "companyName": "'"${TEST_COMPANY}"'"
  }' \
  -w "\nHTTP_STATUS:%{http_code}")

REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | sed -n '1,/^HTTP_STATUS:/p' | sed '$d')
REGISTER_STATUS=$(echo "$REGISTER_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)

echo "Response Status: $REGISTER_STATUS"
echo "Response Body:"
echo "$REGISTER_BODY" | jq '.' 2>/dev/null || echo "$REGISTER_BODY"

if [ "$REGISTER_STATUS" != "200" ]; then
  echo "❌ Registration failed! Status: $REGISTER_STATUS"
  exit 1
fi
echo "✅ User registered successfully!"

# Step 2: Login with the new user
echo -e "\n2. LOGGING IN"
echo "-------------"
sleep 2  # Give the system a moment to process registration

LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"${TEST_EMAIL}"'",
    "password": "'"${TEST_PASSWORD}"'"
  }' \
  -w "\nHTTP_STATUS:%{http_code}")

LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed -n '1,/^HTTP_STATUS:/p' | sed '$d')
LOGIN_STATUS=$(echo "$LOGIN_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)

echo "Response Status: $LOGIN_STATUS"
echo "Response Body:"
echo "$LOGIN_BODY" | jq '.' 2>/dev/null || echo "$LOGIN_BODY"

if [ "$LOGIN_STATUS" != "200" ]; then
  echo "❌ Login failed! Status: $LOGIN_STATUS"
  exit 1
fi

# Extract tokens from response
ID_TOKEN=$(echo "$LOGIN_BODY" | jq -r '.idToken // empty')
CSRF_TOKEN=$(echo "$LOGIN_BODY" | jq -r '.csrfToken // empty')

if [ -z "$ID_TOKEN" ]; then
  echo "❌ No idToken found in login response!"
  echo "Checking if it's returning 'token' instead..."
  ID_TOKEN=$(echo "$LOGIN_BODY" | jq -r '.token // empty')
  if [ -z "$ID_TOKEN" ]; then
    echo "❌ No token found at all in login response!"
    exit 1
  fi
fi

echo "✅ Login successful!"
echo "ID Token: ${ID_TOKEN:0:50}..."
echo "CSRF Token: ${CSRF_TOKEN:0:20}..."

# Step 3: Create an API key
echo -e "\n3. CREATING API KEY"
echo "-------------------"
API_KEY_RESPONSE=$(curl -s -X POST "${API_URL}/v1/auth/api-keys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ID_TOKEN}" \
  -d '{
    "name": "Test API Key",
    "description": "Created by test script",
    "expiresIn": 90
  }' \
  -w "\nHTTP_STATUS:%{http_code}")

API_KEY_BODY=$(echo "$API_KEY_RESPONSE" | sed -n '1,/^HTTP_STATUS:/p' | sed '$d')
API_KEY_STATUS=$(echo "$API_KEY_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)

echo "Response Status: $API_KEY_STATUS"
echo "Response Body:"
echo "$API_KEY_BODY" | jq '.' 2>/dev/null || echo "$API_KEY_BODY"

if [ "$API_KEY_STATUS" != "201" ] && [ "$API_KEY_STATUS" != "200" ]; then
  echo "❌ API key creation failed! Status: $API_KEY_STATUS"
  exit 1
fi

# Extract API key
API_KEY=$(echo "$API_KEY_BODY" | jq -r '.apiKey // empty')
API_KEY_ID=$(echo "$API_KEY_BODY" | jq -r '.id // empty')

if [ -z "$API_KEY" ]; then
  echo "❌ No API key found in response!"
  exit 1
fi

echo "✅ API key created successfully!"
echo "API Key: ${API_KEY}"
echo "Key ID: ${API_KEY_ID}"

# Step 4: Test the API key
echo -e "\n4. TESTING API KEY"
echo "------------------"
echo "Testing Australian deadlines endpoint..."

TEST_RESPONSE=$(curl -s -X GET "${API_URL}/v1/au/ato/deadlines?limit=2" \
  -H "x-api-key: ${API_KEY}" \
  -w "\nHTTP_STATUS:%{http_code}")

TEST_BODY=$(echo "$TEST_RESPONSE" | sed -n '1,/^HTTP_STATUS:/p' | sed '$d')
TEST_STATUS=$(echo "$TEST_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)

echo "Response Status: $TEST_STATUS"

if [ "$TEST_STATUS" == "200" ]; then
  echo "✅ API key is working!"
  echo "Sample deadlines:"
  echo "$TEST_BODY" | jq '.deadlines[] | {type, name, dueDate}' 2>/dev/null || echo "$TEST_BODY"
else
  echo "❌ API key test failed! Status: $TEST_STATUS"
  echo "Response:"
  echo "$TEST_BODY" | jq '.' 2>/dev/null || echo "$TEST_BODY"
fi

# Step 5: Test simplified endpoint
echo -e "\n5. TESTING SIMPLIFIED ENDPOINT"
echo "------------------------------"
SIMPLE_RESPONSE=$(curl -s -X GET "${API_URL}/v1/deadlines?country=AU&limit=2" \
  -H "x-api-key: ${API_KEY}" \
  -w "\nHTTP_STATUS:%{http_code}")

SIMPLE_BODY=$(echo "$SIMPLE_RESPONSE" | sed -n '1,/^HTTP_STATUS:/p' | sed '$d')
SIMPLE_STATUS=$(echo "$SIMPLE_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)

echo "Response Status: $SIMPLE_STATUS"

if [ "$SIMPLE_STATUS" == "200" ]; then
  echo "✅ Simplified endpoint is working!"
  echo "Sample response:"
  echo "$SIMPLE_BODY" | jq '.response.deadlines[0] | {name, country, date}' 2>/dev/null || echo "See full response above"
else
  echo "❌ Simplified endpoint test failed! Status: $SIMPLE_STATUS"
fi

# Step 6: List API keys
echo -e "\n6. LISTING API KEYS"
echo "-------------------"
LIST_RESPONSE=$(curl -s -X GET "${API_URL}/v1/auth/api-keys" \
  -H "Authorization: Bearer ${ID_TOKEN}" \
  -w "\nHTTP_STATUS:%{http_code}")

LIST_BODY=$(echo "$LIST_RESPONSE" | sed -n '1,/^HTTP_STATUS:/p' | sed '$d')
LIST_STATUS=$(echo "$LIST_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)

echo "Response Status: $LIST_STATUS"

if [ "$LIST_STATUS" == "200" ]; then
  echo "✅ API keys listed successfully!"
  echo "$LIST_BODY" | jq '.apiKeys[] | {id, name, keyPrefix, status, usageCount}' 2>/dev/null || echo "$LIST_BODY"
else
  echo "❌ List API keys failed! Status: $LIST_STATUS"
fi

# Summary
echo -e "\n================================================"
echo "TEST SUMMARY"
echo "================================================"
echo "✅ Test User: ${TEST_EMAIL}"
echo "✅ Password: ${TEST_PASSWORD}"
echo "✅ API Key: ${API_KEY}"
echo ""
echo "You can now use this API key to test the API:"
echo ""
echo "curl -X GET \"${API_URL}/v1/au/ato/deadlines\" \\"
echo "  -H \"x-api-key: ${API_KEY}\" | jq '.'"
echo ""
echo "Or test the simplified endpoint:"
echo ""
echo "curl -X GET \"${API_URL}/v1/deadlines?country=AU\" \\"
echo "  -H \"x-api-key: ${API_KEY}\" | jq '.'"
echo "================================================"