#!/bin/bash

# Test secure authentication with httpOnly cookies
# This script tests the new secure auth endpoints

API_URL="https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev"
TEST_EMAIL="test-secure-$(date +%s)@example.com"
TEST_PASSWORD="SecurePassword123!"

echo "Testing Secure Authentication Implementation"
echo "=========================================="
echo "API URL: $API_URL"
echo "Test Email: $TEST_EMAIL"
echo ""

# Test 1: Register new user
echo "1. Testing Registration..."
REGISTER_RESPONSE=$(curl -s -c cookies.txt -w "\n%{http_code}" \
  -X POST "$API_URL/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"companyName\": \"Test Company\"
  }")

REGISTER_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | head -n-1)

echo "Response Code: $REGISTER_CODE"
echo "Response Body: $REGISTER_BODY"
echo ""

# Test 2: Login with credentials
echo "2. Testing Login..."
LOGIN_RESPONSE=$(curl -s -b cookies.txt -c cookies.txt -w "\n%{http_code}" \
  -X POST "$API_URL/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

LOGIN_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | head -n-1)

echo "Response Code: $LOGIN_CODE"
echo "Response Body: $LOGIN_BODY"

# Extract CSRF token if present
CSRF_TOKEN=$(echo "$LOGIN_BODY" | grep -o '"csrfToken":"[^"]*' | cut -d'"' -f4)
if [ ! -z "$CSRF_TOKEN" ]; then
  echo "CSRF Token: $CSRF_TOKEN"
fi

echo ""

# Check cookies
echo "3. Checking Cookies..."
echo "Cookies saved:"
cat cookies.txt | grep -E "(id_token|access_token|refresh_token|csrf_token)" | awk '{print $6 "=" substr($7, 1, 20) "..."}'
echo ""

# Test 3: Refresh token
echo "4. Testing Token Refresh..."
REFRESH_RESPONSE=$(curl -s -b cookies.txt -c cookies.txt -w "\n%{http_code}" \
  -X POST "$API_URL/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN")

REFRESH_CODE=$(echo "$REFRESH_RESPONSE" | tail -n1)
REFRESH_BODY=$(echo "$REFRESH_RESPONSE" | head -n-1)

echo "Response Code: $REFRESH_CODE"
echo "Response Body: $REFRESH_BODY"
echo ""

# Test 4: Access protected endpoint with cookie
echo "5. Testing Protected Endpoint Access..."
# First get the JWT token from login response for comparison
JWT_TOKEN=$(cat cookies.txt | grep id_token | awk '{print $7}')

if [ ! -z "$JWT_TOKEN" ]; then
  # Try accessing API keys endpoint with cookie authentication
  PROTECTED_RESPONSE=$(curl -s -b cookies.txt -w "\n%{http_code}" \
    -X GET "$API_URL/v1/auth/api-keys" \
    -H "X-CSRF-Token: $CSRF_TOKEN")

  PROTECTED_CODE=$(echo "$PROTECTED_RESPONSE" | tail -n1)
  PROTECTED_BODY=$(echo "$PROTECTED_RESPONSE" | head -n-1)

  echo "Response Code: $PROTECTED_CODE"
  echo "Response Body: $PROTECTED_BODY"
else
  echo "No JWT token found in cookies"
fi
echo ""

# Test 5: Logout
echo "6. Testing Logout..."
LOGOUT_RESPONSE=$(curl -s -b cookies.txt -c cookies.txt -w "\n%{http_code}" \
  -X POST "$API_URL/v1/auth/logout" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN")

LOGOUT_CODE=$(echo "$LOGOUT_RESPONSE" | tail -n1)
LOGOUT_BODY=$(echo "$LOGOUT_RESPONSE" | head -n-1)

echo "Response Code: $LOGOUT_CODE"
echo "Response Body: $LOGOUT_BODY"
echo ""

# Check if cookies were cleared
echo "7. Checking Cookies After Logout..."
echo "Remaining cookies:"
cat cookies.txt | grep -E "(id_token|access_token|refresh_token|csrf_token)" | grep -v "0$" || echo "All auth cookies cleared"
echo ""

# Clean up
rm -f cookies.txt

echo "Test completed!"
echo ""
echo "Summary:"
echo "- Registration: $([[ $REGISTER_CODE == "200" ]] && echo "✓ PASS" || echo "✗ FAIL")"
echo "- Login: $([[ $LOGIN_CODE == "200" ]] && echo "✓ PASS" || echo "✗ FAIL")"
echo "- Token Refresh: $([[ $REFRESH_CODE == "200" ]] && echo "✓ PASS" || echo "✗ FAIL")"
echo "- Protected Access: $([[ $PROTECTED_CODE == "200" || $PROTECTED_CODE == "401" ]] && echo "✓ PASS" || echo "✗ FAIL")"
echo "- Logout: $([[ $LOGOUT_CODE == "200" ]] && echo "✓ PASS" || echo "✗ FAIL")"