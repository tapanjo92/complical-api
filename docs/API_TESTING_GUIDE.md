# CompliCal API Testing Guide

This document provides comprehensive examples of all API requests for testing the CompliCal system.

## Table of Contents
1. [Authentication & Setup](#authentication--setup)
2. [Health Check](#health-check)
3. [Simplified Global Endpoint (NEW)](#simplified-global-endpoint-new)
4. [Australian Deadlines](#australian-deadlines)
5. [New Zealand Deadlines](#new-zealand-deadlines)
6. [Billing & Subscription](#billing--subscription)
7. [User Authentication](#user-authentication)
8. [API Key Management](#api-key-management)

## Base Configuration

```bash
# API Base URL
API_BASE_URL="https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev"

# API Key (replace with your actual key)
API_KEY="ipEAfuCnkF9EBP8Ne2Lc2E0WtUPSLVt9tntIbMib"

# Headers
HEADERS="-H 'X-API-Key: ${API_KEY}' -H 'Content-Type: application/json'"
```

## Authentication & Setup

### Get API Key from AWS
```bash
# Get usage plan keys
aws apigateway get-usage-plan-keys --usage-plan-id osdyjp --region ap-south-1

# Get actual API key value
aws apigateway get-api-key --api-key <KEY_ID> --include-value --region ap-south-1 | jq -r '.value'
```

## Health Check

### Basic Health Check
```bash
curl -X GET "${API_BASE_URL}/health"
```

## Simplified Global Endpoint (NEW)

### Overview
The simplified endpoint provides a Calendarific-style API that's easier to use while maintaining all CompliCal features.

### Basic Usage
```bash
# Get all deadlines for a country
curl -X GET "${API_BASE_URL}/v1/deadlines?country=AU" \
  -H "X-API-Key: ${API_KEY}"

# Get deadlines for multiple countries
curl -X GET "${API_BASE_URL}/v1/deadlines?countries=AU,NZ" \
  -H "X-API-Key: ${API_KEY}"
```

### Filtering by Date
```bash
# Filter by year
curl -X GET "${API_BASE_URL}/v1/deadlines?country=AU&year=2025" \
  -H "X-API-Key: ${API_KEY}"

# Filter by year and month
curl -X GET "${API_BASE_URL}/v1/deadlines?country=AU&year=2025&month=3" \
  -H "X-API-Key: ${API_KEY}"

# Custom date range (use traditional endpoints)
# Note: from_date and to_date not supported in simplified endpoint
```

### Filtering by Type
```bash
# Get specific deadline type
curl -X GET "${API_BASE_URL}/v1/deadlines?country=AU&type=BAS_QUARTERLY" \
  -H "X-API-Key: ${API_KEY}"
```

### Pagination
```bash
# Limit results
curl -X GET "${API_BASE_URL}/v1/deadlines?country=AU&limit=10" \
  -H "X-API-Key: ${API_KEY}"

# Pagination with offset
curl -X GET "${API_BASE_URL}/v1/deadlines?country=AU&limit=10&offset=20" \
  -H "X-API-Key: ${API_KEY}"
```

### API Key in URL (Deprecated)
```bash
# Using API key in URL parameter (not recommended)
curl -X GET "${API_BASE_URL}/v1/deadlines?country=AU&api_key=${API_KEY}"

# Note: This will include a deprecation warning in the response
```

### Response Format
```json
{
  "meta": {
    "code": 200,
    "request_id": "abc-123-def",
    "credits_remaining": null,
    "warning": null
  },
  "response": {
    "deadlines": [
      {
        "name": "Q3 2025 BAS Statement",
        "description": "Quarterly Business Activity Statement for April-June 2025",
        "country": "AU",
        "date": {
          "iso": "2025-07-28",
          "datetime": {
            "year": 2025,
            "month": 7,
            "day": 28
          }
        },
        "type": ["BAS_QUARTERLY"],
        "meta": {
          "id": "au-bas-quarterly-2025-07-28-123456",
          "agency": "Australian Taxation Office",
          "period": "2025-Q3",
          "applicableTo": ["Businesses registered for GST"],
          "sourceUrl": "https://www.ato.gov.au/..."
        }
      }
    ],
    "pagination": {
      "total": 110,
      "count": 10,
      "limit": 10,
      "offset": 0,
      "has_more": true
    },
    "filters": {
      "countries": ["AU"],
      "year": "2025",
      "month": null,
      "type": null
    }
  }
}
```

### Country Codes
The endpoint supports various country code formats:
- `AU`, `AUS`, `AUSTRALIA` → Australia
- `NZ`, `NZL`, `NEW ZEALAND`, `NEW_ZEALAND` → New Zealand
- `SG`, `SGP`, `SINGAPORE` → Singapore (coming soon)

### Examples

#### Get Q1 2025 Australian Deadlines
```bash
curl -X GET "${API_BASE_URL}/v1/deadlines?country=AU&year=2025&month=1" \
  -H "X-API-Key: ${API_KEY}" | jq '.response.deadlines[0:3]'
```

#### Get Multiple Countries with Pagination
```bash
curl -X GET "${API_BASE_URL}/v1/deadlines?countries=AU,NZ&limit=20&offset=0" \
  -H "X-API-Key: ${API_KEY}" | jq '{
    countries: .response.filters.countries,
    total: .response.pagination.total,
    returned: .response.pagination.count
  }'
```

#### Filter by Deadline Type
```bash
curl -X GET "${API_BASE_URL}/v1/deadlines?country=AU&type=PAYROLL_TAX_NSW" \
  -H "X-API-Key: ${API_KEY}" | jq '.response.deadlines | length'
```

## Australian Deadlines

### 1. Federal Tax Deadlines

#### Get All ATO Deadlines
```bash
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines" \
  -H "X-API-Key: ${API_KEY}"
```

#### BAS Quarterly Deadlines
```bash
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=BAS_QUARTERLY" \
  -H "X-API-Key: ${API_KEY}"
```

#### BAS Monthly Deadlines
```bash
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=BAS_MONTHLY" \
  -H "X-API-Key: ${API_KEY}"
```

#### PAYG Withholding
```bash
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=PAYG_WITHHOLDING" \
  -H "X-API-Key: ${API_KEY}"
```

#### PAYG Instalments
```bash
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=PAYG_INSTALMENTS" \
  -H "X-API-Key: ${API_KEY}"
```

#### Super Guarantee
```bash
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=SUPER_GUARANTEE" \
  -H "X-API-Key: ${API_KEY}"
```

#### Income Tax
```bash
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=INCOME_TAX" \
  -H "X-API-Key: ${API_KEY}"
```

#### Company Tax
```bash
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=COMPANY_TAX" \
  -H "X-API-Key: ${API_KEY}"
```

#### Fringe Benefits Tax
```bash
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=FBT" \
  -H "X-API-Key: ${API_KEY}"
```

#### GST
```bash
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=GST" \
  -H "X-API-Key: ${API_KEY}"
```

#### STP Finalisation
```bash
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=STP_FINALISATION" \
  -H "X-API-Key: ${API_KEY}"
```

#### TPAR (Taxable Payments Annual Report)
```bash
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=TPAR" \
  -H "X-API-Key: ${API_KEY}"
```

#### ASIC Annual Review
```bash
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=ASIC_ANNUAL_REVIEW" \
  -H "X-API-Key: ${API_KEY}"
```

### 2. State Payroll Tax Deadlines

#### New South Wales
```bash
# Monthly
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=PAYROLL_TAX_NSW" \
  -H "X-API-Key: ${API_KEY}"

# Annual
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=PAYROLL_TAX_NSW_ANNUAL" \
  -H "X-API-Key: ${API_KEY}"
```

#### Victoria
```bash
# Monthly
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=PAYROLL_TAX_VIC" \
  -H "X-API-Key: ${API_KEY}"

# Annual
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=PAYROLL_TAX_VIC_ANNUAL" \
  -H "X-API-Key: ${API_KEY}"
```

#### Queensland
```bash
# Monthly
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=PAYROLL_TAX_QLD" \
  -H "X-API-Key: ${API_KEY}"

# Annual
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=PAYROLL_TAX_QLD_ANNUAL" \
  -H "X-API-Key: ${API_KEY}"
```

#### South Australia
```bash
# Monthly
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=PAYROLL_TAX_SA" \
  -H "X-API-Key: ${API_KEY}"

# Annual
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=PAYROLL_TAX_SA_ANNUAL" \
  -H "X-API-Key: ${API_KEY}"
```

#### Western Australia
```bash
# Monthly
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=PAYROLL_TAX_WA" \
  -H "X-API-Key: ${API_KEY}"

# Annual
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=PAYROLL_TAX_WA_ANNUAL" \
  -H "X-API-Key: ${API_KEY}"
```

#### Tasmania
```bash
# Monthly
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=PAYROLL_TAX_TAS" \
  -H "X-API-Key: ${API_KEY}"

# Annual
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=PAYROLL_TAX_TAS_ANNUAL" \
  -H "X-API-Key: ${API_KEY}"
```

#### Northern Territory
```bash
# Monthly
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=PAYROLL_TAX_NT" \
  -H "X-API-Key: ${API_KEY}"

# Annual
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=PAYROLL_TAX_NT_ANNUAL" \
  -H "X-API-Key: ${API_KEY}"
```

#### Australian Capital Territory
```bash
# Monthly
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=PAYROLL_TAX_ACT" \
  -H "X-API-Key: ${API_KEY}"

# Annual
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=PAYROLL_TAX_ACT_ANNUAL" \
  -H "X-API-Key: ${API_KEY}"
```

### 3. State Land Tax Deadlines

```bash
# New South Wales
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=LAND_TAX_NSW" \
  -H "X-API-Key: ${API_KEY}"

# Victoria
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=LAND_TAX_VIC" \
  -H "X-API-Key: ${API_KEY}"

# Queensland
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=LAND_TAX_QLD" \
  -H "X-API-Key: ${API_KEY}"

# South Australia
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=LAND_TAX_SA" \
  -H "X-API-Key: ${API_KEY}"

# Western Australia
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=LAND_TAX_WA" \
  -H "X-API-Key: ${API_KEY}"

# Tasmania
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=LAND_TAX_TAS" \
  -H "X-API-Key: ${API_KEY}"

# ACT
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=LAND_TAX_ACT" \
  -H "X-API-Key: ${API_KEY}"
```

### 4. Workers Compensation Deadlines

```bash
# New South Wales
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=WORKERS_COMP_NSW" \
  -H "X-API-Key: ${API_KEY}"

# Victoria
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=WORKERS_COMP_VIC" \
  -H "X-API-Key: ${API_KEY}"

# Queensland
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=WORKERS_COMP_QLD" \
  -H "X-API-Key: ${API_KEY}"

# South Australia
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=WORKERS_COMP_SA&from_date=2025-09-01&to_date=2025-09-30" \
  -H "X-API-Key: ${API_KEY}"

# Western Australia
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=WORKERS_COMP_WA&from_date=2025-08-01&to_date=2025-08-31" \
  -H "X-API-Key: ${API_KEY}"

# Tasmania
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=WORKERS_COMP_TAS&from_date=2025-07-01&to_date=2025-07-31" \
  -H "X-API-Key: ${API_KEY}"

# Northern Territory
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=WORKERS_COMP_NT&from_date=2025-08-01&to_date=2025-08-31" \
  -H "X-API-Key: ${API_KEY}"

# ACT
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=WORKERS_COMP_ACT&from_date=2025-07-01&to_date=2025-07-31" \
  -H "X-API-Key: ${API_KEY}"
```

### 5. Date Range Queries

#### Get Deadlines for Q1 2025
```bash
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?from_date=2025-01-01&to_date=2025-03-31" \
  -H "X-API-Key: ${API_KEY}"
```

#### Get Deadlines for Q2 2025
```bash
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?from_date=2025-04-01&to_date=2025-06-30" \
  -H "X-API-Key: ${API_KEY}"
```

#### Get Deadlines for Specific Month
```bash
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?from_date=2025-03-01&to_date=2025-03-31" \
  -H "X-API-Key: ${API_KEY}"
```

### 6. Pagination

#### Get First Page with Limit
```bash
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?limit=10" \
  -H "X-API-Key: ${API_KEY}"
```

#### Get Next Page Using Token
```bash
# Use the nextToken from previous response
curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines?limit=10&nextToken=<TOKEN_FROM_PREVIOUS_RESPONSE>" \
  -H "X-API-Key: ${API_KEY}"
```

## New Zealand Deadlines

### All NZ Deadlines
```bash
curl -X GET "${API_BASE_URL}/v1/nz/ird/deadlines" \
  -H "X-API-Key: ${API_KEY}"
```

### GST Returns
```bash
# Monthly GST
curl -X GET "${API_BASE_URL}/v1/nz/ird/deadlines?type=GST_MONTHLY" \
  -H "X-API-Key: ${API_KEY}"

# 2-Monthly GST
curl -X GET "${API_BASE_URL}/v1/nz/ird/deadlines?type=GST_2MONTHLY" \
  -H "X-API-Key: ${API_KEY}"

# 6-Monthly GST
curl -X GET "${API_BASE_URL}/v1/nz/ird/deadlines?type=GST_6MONTHLY" \
  -H "X-API-Key: ${API_KEY}"
```

### PAYE
```bash
# Regular PAYE
curl -X GET "${API_BASE_URL}/v1/nz/ird/deadlines?type=PAYE" \
  -H "X-API-Key: ${API_KEY}"

# Large Employer PAYE
curl -X GET "${API_BASE_URL}/v1/nz/ird/deadlines?type=PAYE_LARGE" \
  -H "X-API-Key: ${API_KEY}"
```

### Provisional Tax
```bash
# Standard
curl -X GET "${API_BASE_URL}/v1/nz/ird/deadlines?type=PROVISIONAL_TAX" \
  -H "X-API-Key: ${API_KEY}"

# Ratio Method
curl -X GET "${API_BASE_URL}/v1/nz/ird/deadlines?type=PROVISIONAL_TAX_RATIO" \
  -H "X-API-Key: ${API_KEY}"

# AIM Method
curl -X GET "${API_BASE_URL}/v1/nz/ird/deadlines?type=PROVISIONAL_TAX_AIM" \
  -H "X-API-Key: ${API_KEY}"
```

### Other NZ Taxes
```bash
# Individual Tax Return (IR3)
curl -X GET "${API_BASE_URL}/v1/nz/ird/deadlines?type=IR3" \
  -H "X-API-Key: ${API_KEY}"

# FBT Quarterly
curl -X GET "${API_BASE_URL}/v1/nz/ird/deadlines?type=FBT_QUARTERLY" \
  -H "X-API-Key: ${API_KEY}"

# FBT Annual
curl -X GET "${API_BASE_URL}/v1/nz/ird/deadlines?type=FBT_ANNUAL" \
  -H "X-API-Key: ${API_KEY}"

# KiwiSaver
curl -X GET "${API_BASE_URL}/v1/nz/ird/deadlines?type=KIWISAVER" \
  -H "X-API-Key: ${API_KEY}"
```

## Billing & Subscription

### Create Checkout Session
```bash
curl -X POST "${API_BASE_URL}/v1/billing/checkout" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_1234567890",
    "customerId": "cus_1234567890"
  }'
```

### Get Subscription Status
```bash
curl -X GET "${API_BASE_URL}/v1/billing/subscription?customerId=cus_1234567890" \
  -H "X-API-Key: ${API_KEY}"
```

### Handle Stripe Webhook
```bash
curl -X POST "${API_BASE_URL}/v1/billing/webhooks" \
  -H "stripe-signature: t=1234567890,v1=signature_here" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_123"
      }
    }
  }'
```

## User Authentication

### Register New User
```bash
curl -X POST "${API_BASE_URL}/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST "${API_BASE_URL}/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

## API Key Management

### List API Keys
```bash
# Requires authentication token
curl -X GET "${API_BASE_URL}/v1/auth/api-keys" \
  -H "Authorization: Bearer <AUTH_TOKEN>"
```

### Create API Key
```bash
curl -X POST "${API_BASE_URL}/v1/auth/api-keys" \
  -H "Authorization: Bearer <AUTH_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production API Key",
    "permissions": ["read:deadlines", "write:deadlines"]
  }'
```

### Delete API Key
```bash
curl -X DELETE "${API_BASE_URL}/v1/auth/api-keys/{keyId}" \
  -H "Authorization: Bearer <AUTH_TOKEN>"
```

## Testing Scripts

### Batch Test All Australian Deadline Types
```bash
#!/bin/bash
API_BASE_URL="https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev"
API_KEY="ipEAfuCnkF9EBP8Ne2Lc2E0WtUPSLVt9tntIbMib"

# Array of all deadline types
DEADLINE_TYPES=(
  "BAS_QUARTERLY" "BAS_MONTHLY" "PAYG_WITHHOLDING" "PAYG_INSTALMENTS"
  "SUPER_GUARANTEE" "INCOME_TAX" "COMPANY_TAX" "FBT" "GST"
  "STP_FINALISATION" "TPAR" "ASIC_ANNUAL_REVIEW"
  "PAYROLL_TAX_NSW" "PAYROLL_TAX_NSW_ANNUAL"
  "PAYROLL_TAX_VIC" "PAYROLL_TAX_VIC_ANNUAL"
  "PAYROLL_TAX_QLD" "PAYROLL_TAX_QLD_ANNUAL"
  "PAYROLL_TAX_SA" "PAYROLL_TAX_SA_ANNUAL"
  "PAYROLL_TAX_WA" "PAYROLL_TAX_WA_ANNUAL"
  "PAYROLL_TAX_TAS" "PAYROLL_TAX_TAS_ANNUAL"
  "PAYROLL_TAX_NT" "PAYROLL_TAX_NT_ANNUAL"
  "PAYROLL_TAX_ACT" "PAYROLL_TAX_ACT_ANNUAL"
  "LAND_TAX_NSW" "LAND_TAX_VIC" "LAND_TAX_QLD"
  "LAND_TAX_SA" "LAND_TAX_WA" "LAND_TAX_TAS" "LAND_TAX_ACT"
  "WORKERS_COMP_NSW" "WORKERS_COMP_VIC" "WORKERS_COMP_QLD"
  "WORKERS_COMP_SA" "WORKERS_COMP_WA" "WORKERS_COMP_TAS"
  "WORKERS_COMP_NT" "WORKERS_COMP_ACT"
)

# Test each type
for TYPE in "${DEADLINE_TYPES[@]}"; do
  echo "Testing $TYPE..."
  curl -s -X GET "${API_BASE_URL}/v1/au/ato/deadlines?type=${TYPE}" \
    -H "X-API-Key: ${API_KEY}" | jq '.count'
done
```

### Test All NZ Deadline Types
```bash
#!/bin/bash
NZ_TYPES=(
  "GST_MONTHLY" "GST_2MONTHLY" "GST_6MONTHLY"
  "PAYE" "PAYE_LARGE"
  "PROVISIONAL_TAX" "PROVISIONAL_TAX_RATIO" "PROVISIONAL_TAX_AIM"
  "IR3" "FBT_QUARTERLY" "FBT_ANNUAL" "KIWISAVER"
)

for TYPE in "${NZ_TYPES[@]}"; do
  echo "Testing NZ $TYPE..."
  curl -s -X GET "${API_BASE_URL}/v1/nz/ird/deadlines?type=${TYPE}" \
    -H "X-API-Key: ${API_KEY}" | jq '.count'
done
```

## Error Responses

### Missing API Key
```json
{
  "message": "Missing Authentication Token"
}
```

### Invalid API Key
```json
{
  "message": "Forbidden"
}
```

### Invalid Deadline Type
```json
{
  "error": "Invalid deadline type",
  "message": "Invalid type for AU. Valid types are: BAS_QUARTERLY, BAS_MONTHLY, ..."
}
```

### Invalid Date Format
```json
{
  "error": "Invalid request parameters",
  "details": [
    {
      "code": "invalid_string",
      "path": ["from_date"],
      "message": "Invalid"
    }
  ]
}
```

## Performance Testing

### Load Test with Multiple Concurrent Requests
```bash
# Using GNU Parallel
parallel -j 10 "curl -s -X GET '${API_BASE_URL}/v1/au/ato/deadlines?type=BAS_QUARTERLY' \
  -H 'X-API-Key: ${API_KEY}' | jq '.count'" ::: {1..100}
```

### Measure Response Time
```bash
curl -w "\n\nTotal time: %{time_total}s\n" \
  -X GET "${API_BASE_URL}/v1/au/ato/deadlines" \
  -H "X-API-Key: ${API_KEY}"
```

## Monitoring & Debugging

### Check Rate Limiting
```bash
# Make multiple requests quickly to test rate limiting
for i in {1..20}; do
  curl -X GET "${API_BASE_URL}/v1/au/ato/deadlines" \
    -H "X-API-Key: ${API_KEY}" \
    -w "Request $i: HTTP %{http_code}\n" \
    -o /dev/null -s
  sleep 0.1
done
```

### View Response Headers
```bash
curl -i -X GET "${API_BASE_URL}/v1/au/ato/deadlines?limit=5" \
  -H "X-API-Key: ${API_KEY}"
```

## Notes

1. Replace `${API_KEY}` with your actual API key
2. The API uses pagination - default limit is 50 items
3. Date format must be YYYY-MM-DD
4. All responses are in JSON format
5. Rate limiting is set to 10 requests per second for free tier
6. Authentication endpoints require Bearer tokens after login
7. Webhook endpoints require proper signature validation

## Support

For issues or questions:
- Check CloudWatch logs in AWS Console
- Review API Gateway metrics
- Contact support with request ID from response headers