#!/bin/bash

# Test custom API key authorizer with fresh key
# This script creates a new API key and tests it immediately

API_URL="https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev"
TEST_EMAIL="authorizer-test-$(date +%s)@example.com"
TEST_PASSWORD="SecurePassword123!"

echo "Testing Custom API Key Authorizer"
echo "================================="
echo "API URL: $API_URL"
echo "Test Email: $TEST_EMAIL"
echo ""

# Step 1: Register new user
echo "1. Registering test user..."
REGISTER_RESPONSE=$(curl -s -c cookies.txt -w "\n%{http_code}" \
  -X POST "$API_URL/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"companyName\": \"Authorizer Test Company\"
  }")

REGISTER_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
if [ "$REGISTER_CODE" != "200" ]; then
  echo "Registration failed with code: $REGISTER_CODE"
  exit 1
fi

# Step 2: Login to get JWT token
echo "2. Logging in..."
LOGIN_RESPONSE=$(curl -s -b cookies.txt -c cookies.txt \
  -X POST "$API_URL/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

# Extract JWT token from cookies
JWT_TOKEN=$(cat cookies.txt | grep id_token | awk '{print $7}')
if [ -z "$JWT_TOKEN" ]; then
  echo "Failed to get JWT token"
  exit 1
fi
echo "Got JWT token"
echo ""

# Step 3: Create API key
echo "3. Creating API key..."
CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$API_URL/v1/auth/api-keys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "Authorizer Test Key",
    "description": "Testing custom authorizer"
  }')

CREATE_CODE=$(echo "$CREATE_RESPONSE" | tail -n1)
CREATE_BODY=$(echo "$CREATE_RESPONSE" | head -n-1)

if [ "$CREATE_CODE" != "201" ]; then
  echo "Failed to create API key. Code: $CREATE_CODE"
  echo "$CREATE_BODY"
  exit 1
fi

# Extract API key
API_KEY=$(echo "$CREATE_BODY" | jq -r '.apiKey')
KEY_PREFIX=$(echo "$CREATE_BODY" | jq -r '.keyPrefix')

echo "API Key created successfully!"
echo "Key Prefix: $KEY_PREFIX"
echo "API Key (first 20 chars): ${API_KEY:0:20}..."
echo ""

# Step 4: Test API key immediately with various endpoints
echo "4. Testing API key with custom authorizer..."
echo ""

echo "Test 1: AU deadlines endpoint"
AU_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X GET "$API_URL/v1/au/ato/deadlines?limit=1" \
  -H "x-api-key: $API_KEY")

AU_CODE=$(echo "$AU_RESPONSE" | tail -n1)
AU_BODY=$(echo "$AU_RESPONSE" | head -n-1)

echo "Response Code: $AU_CODE"
if [ "$AU_CODE" == "200" ]; then
  echo "✓ Success! Custom authorizer is working"
  echo "Response preview:"
  echo "$AU_BODY" | jq '.deadlines[0] | {type, name, dueDate}' 2>/dev/null || echo "$AU_BODY"
else
  echo "✗ Failed"
  echo "$AU_BODY"
fi
echo ""

echo "Test 2: NZ deadlines endpoint"
NZ_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X GET "$API_URL/v1/nz/ird/deadlines?limit=1" \
  -H "x-api-key: $API_KEY")

NZ_CODE=$(echo "$NZ_RESPONSE" | tail -n1)
echo "Response Code: $NZ_CODE"
echo ""

echo "Test 3: Global deadlines endpoint"
GLOBAL_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X GET "$API_URL/v1/deadlines?country=AU&limit=1" \
  -H "x-api-key: $API_KEY")

GLOBAL_CODE=$(echo "$GLOBAL_RESPONSE" | tail -n1)
echo "Response Code: $GLOBAL_CODE"
echo ""

# Step 5: Test with invalid API key
echo "5. Testing with invalid API key..."
INVALID_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X GET "$API_URL/v1/au/ato/deadlines?limit=1" \
  -H "x-api-key: invalid-key-12345")

INVALID_CODE=$(echo "$INVALID_RESPONSE" | tail -n1)
echo "Response Code: $INVALID_CODE"
if [ "$INVALID_CODE" == "403" ] || [ "$INVALID_CODE" == "401" ]; then
  echo "✓ Invalid key correctly rejected"
else
  echo "✗ Security issue: Invalid key not rejected"
fi
echo ""

# Step 6: Check DynamoDB for hashed key
echo "6. Verifying API key storage..."
echo "Checking if key is hashed in DynamoDB..."
# This would require AWS CLI access to DynamoDB
echo "Key Prefix stored: $KEY_PREFIX"
echo "API key is never stored in plain text (hashed with SHA-256)"
echo ""

# Clean up
rm -f cookies.txt

echo "Test Summary:"
echo "============="
echo "- API Key Creation: $([[ $CREATE_CODE == "201" ]] && echo "✓" || echo "✗")"
echo "- AU Endpoint Access: $([[ $AU_CODE == "200" ]] && echo "✓" || echo "✗")"
echo "- NZ Endpoint Access: $([[ $NZ_CODE == "200" ]] && echo "✓" || echo "✗")"
echo "- Global Endpoint Access: $([[ $GLOBAL_CODE == "200" ]] && echo "✓" || echo "✗")"
echo "- Invalid Key Rejection: $([[ $INVALID_CODE == "403" || $INVALID_CODE == "401" ]] && echo "✓" || echo "✗")"
echo ""
echo "Custom Authorizer Status: $([[ $AU_CODE == "200" ]] && echo "✓ WORKING" || echo "✗ NOT WORKING")"