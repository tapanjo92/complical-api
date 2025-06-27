#!/bin/bash

API_URL="https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev"
API_KEY="6mIXIP3kmG35IdqE3tXXM8XyrGDEtTHWaz3ZtjC8"

echo "================================================"
echo "Testing All CompliCal API Endpoints"
echo "================================================"

# 1. Health Check (no auth required)
echo -e "\n1. Health Check"
echo "---------------"
curl -s -X GET "$API_URL/health" | jq '.'

# 2. Ultra-Simple Endpoint (NEW!)
echo -e "\n2. Ultra-Simple Endpoint (NEW!)"
echo "--------------------------------"
echo "All January deadlines:"
curl -s -X GET "$API_URL/v1/deadlines/AU/2025/1" \
  -H "x-api-key: $API_KEY" | jq '{count, first: .deadlines[0].name}'

echo -e "\nFebruary - Tax only (81% less data):"
curl -s -X GET "$API_URL/v1/deadlines/AU/2025/2?category=tax" \
  -H "x-api-key: $API_KEY" | jq '{count, filters, deadlines: [.deadlines[].name]}'

echo -e "\nFebruary - Payroll only:"
curl -s -X GET "$API_URL/v1/deadlines/AU/2025/2?category=payroll" \
  -H "x-api-key: $API_KEY" | jq '{count, filters}'

# 3. Simplified Global Endpoint (Calendarific-style)
echo -e "\n3. Simplified Global Endpoint (Calendarific-style)"
echo "-------------------------------------------------"
echo "Query: Australia"
curl -s -X GET "$API_URL/v1/deadlines?country=AU&limit=2" \
  -H "x-api-key: $API_KEY" | jq '.response | {total: .pagination.total, deadlines: .deadlines[].name}'

echo -e "\nQuery: New Zealand"
curl -s -X GET "$API_URL/v1/deadlines?country=NZ&limit=2" \
  -H "x-api-key: $API_KEY" | jq '.response | {total: .pagination.total, deadlines: .deadlines[].name}'

echo -e "\nQuery: Multiple countries"
curl -s -X GET "$API_URL/v1/deadlines?countries=AU,NZ&limit=3" \
  -H "x-api-key: $API_KEY" | jq '.response | {countries: .filters.countries, count: .pagination.count}'

# 4. Australian Traditional Endpoints
echo -e "\n4. Australian Traditional Endpoints"
echo "-----------------------------------"
echo "All AU deadlines (count):"
curl -s -X GET "$API_URL/v1/au/ato/deadlines" \
  -H "x-api-key: $API_KEY" | jq '.count'

echo -e "\nBAS Quarterly:"
curl -s -X GET "$API_URL/v1/au/ato/deadlines?type=BAS_QUARTERLY&limit=2" \
  -H "x-api-key: $API_KEY" | jq '.deadlines[] | {type, name, dueDate}'

echo -e "\nDate range (Jan 2025):"
curl -s -X GET "$API_URL/v1/au/ato/deadlines?from_date=2025-01-01&to_date=2025-01-31" \
  -H "x-api-key: $API_KEY" | jq '{count, firstDeadline: .deadlines[0].name}'

# 5. New Zealand Traditional Endpoints
echo -e "\n5. New Zealand Traditional Endpoints"
echo "------------------------------------"
echo "All NZ deadlines (count):"
curl -s -X GET "$API_URL/v1/nz/ird/deadlines" \
  -H "x-api-key: $API_KEY" | jq '.count'

echo -e "\nGST Monthly:"
curl -s -X GET "$API_URL/v1/nz/ird/deadlines?type=GST_MONTHLY&limit=2" \
  -H "x-api-key: $API_KEY" | jq '.deadlines[] | {type, name, dueDate}'

# 6. Pagination Test
echo -e "\n6. Pagination Test"
echo "------------------"
FIRST_PAGE=$(curl -s -X GET "$API_URL/v1/au/ato/deadlines?limit=5" \
  -H "x-api-key: $API_KEY")
echo "First page count: $(echo $FIRST_PAGE | jq '.count')"
NEXT_TOKEN=$(echo $FIRST_PAGE | jq -r '.nextToken // empty')

if [ ! -z "$NEXT_TOKEN" ]; then
  echo "Has next page: true"
  echo "Next token: ${NEXT_TOKEN:0:20}..."
fi

# 7. Error Handling Test
echo -e "\n7. Error Handling Tests"
echo "----------------------"
echo "Invalid type:"
curl -s -X GET "$API_URL/v1/au/ato/deadlines?type=INVALID_TYPE" \
  -H "x-api-key: $API_KEY" | jq '.error'

echo -e "\nInvalid date:"
curl -s -X GET "$API_URL/v1/au/ato/deadlines?from_date=invalid-date" \
  -H "x-api-key: $API_KEY" | jq '.error'

# 8. API Key Usage Check
echo -e "\n8. API Key Usage Check"
echo "---------------------"
echo "Checking usage stats..."
aws dynamodb get-item \
  --table-name complical-api-keys-dev \
  --key '{"id":{"S":"sxebu0xt5h"}}' \
  --region ap-south-1 | jq '.Item | {usageCount: .usageCount.N, lastUsed: .lastUsed.S}'

echo -e "\n================================================"
echo "All tests completed!"
echo "API Key: $API_KEY"
echo "================================================"