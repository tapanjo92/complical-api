#!/bin/bash

echo "=== CompliCal API Test Script ==="
echo

# Get stack outputs
API_URL=$(aws cloudformation describe-stacks --stack-name CompliCal-Api-dev --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text)
USER_POOL_ID=$(aws cloudformation describe-stacks --stack-name CompliCal-Auth-dev --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' --output text)
CLIENT_ID=$(aws cloudformation describe-stacks --stack-name CompliCal-Auth-dev --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' --output text)

echo "API URL: $API_URL"
echo "User Pool ID: $USER_POOL_ID"
echo "Client ID: $CLIENT_ID"
echo

# Test 1: Health check (no auth required)
echo "1. Testing health endpoint (no auth):"
curl -s "${API_URL}health" | python3 -m json.tool
echo

# Test 2: Try deadlines endpoint without auth (should fail)
echo "2. Testing deadlines endpoint without auth (should fail):"
curl -s -w "\nHTTP Status: %{http_code}\n" "${API_URL}v1/au/ato/deadlines"
echo

# Test 3: Create a test user and get token
echo "3. Creating test API client..."
echo "Note: In production, you would:"
echo "- Use AWS Console to create an API client user"
echo "- Get client credentials securely"
echo "- Use OAuth2 client credentials flow to get token"
echo

# For now, let's test with a direct call
echo "Example authenticated call would be:"
echo "curl -H \"Authorization: Bearer <token>\" ${API_URL}v1/au/ato/deadlines"
echo

# Test 4: Query parameters
echo "4. Example queries:"
echo "- Filter by type: ${API_URL}v1/au/ato/deadlines?type=BAS_QUARTERLY"
echo "- Date range: ${API_URL}v1/au/ato/deadlines?from_date=2024-01-01&to_date=2024-12-31"
echo "- Limit results: ${API_URL}v1/au/ato/deadlines?limit=10"