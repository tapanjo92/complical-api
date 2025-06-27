# CompliCal API Quick Reference

## Setup
```bash
export API_URL="https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev"
export API_KEY="YOUR_API_KEY_HERE"

# For authenticated endpoints
export TEST_EMAIL="test@example.com"
export TEST_PASSWORD="SecurePassword123!"
```

## Most Common API Tests

### 1. Health Check
```bash
curl -X GET "${API_URL}/health"
```

### 2. NEW: Simplified Global Endpoint (Calendarific-style)
```bash
# Single country
curl -X GET "${API_URL}/v1/deadlines?country=AU" -H "X-API-Key: ${API_KEY}"

# Multiple countries
curl -X GET "${API_URL}/v1/deadlines?countries=AU,NZ" -H "X-API-Key: ${API_KEY}"

# With year filter
curl -X GET "${API_URL}/v1/deadlines?country=AU&year=2025" -H "X-API-Key: ${API_KEY}"

# With year and month
curl -X GET "${API_URL}/v1/deadlines?country=AU&year=2025&month=3" -H "X-API-Key: ${API_KEY}"

# With pagination
curl -X GET "${API_URL}/v1/deadlines?country=AU&limit=10&offset=20" -H "X-API-Key: ${API_KEY}"
```

### 3. Get All Australian Deadlines (Traditional)
```bash
curl -X GET "${API_URL}/v1/au/ato/deadlines" -H "X-API-Key: ${API_KEY}"
```

### 4. Get Specific Deadline Types

#### Federal Taxes
```bash
# BAS Quarterly
curl -X GET "${API_URL}/v1/au/ato/deadlines?type=BAS_QUARTERLY" -H "X-API-Key: ${API_KEY}"

# Super Guarantee
curl -X GET "${API_URL}/v1/au/ato/deadlines?type=SUPER_GUARANTEE" -H "X-API-Key: ${API_KEY}"

# Company Tax
curl -X GET "${API_URL}/v1/au/ato/deadlines?type=COMPANY_TAX" -H "X-API-Key: ${API_KEY}"
```

#### State Payroll Tax (Monthly)
```bash
# NSW
curl -X GET "${API_URL}/v1/au/ato/deadlines?type=PAYROLL_TAX_NSW" -H "X-API-Key: ${API_KEY}"

# VIC
curl -X GET "${API_URL}/v1/au/ato/deadlines?type=PAYROLL_TAX_VIC" -H "X-API-Key: ${API_KEY}"

# QLD
curl -X GET "${API_URL}/v1/au/ato/deadlines?type=PAYROLL_TAX_QLD" -H "X-API-Key: ${API_KEY}"
```

#### Land Tax
```bash
# South Australia
curl -X GET "${API_URL}/v1/au/ato/deadlines?type=LAND_TAX_SA" -H "X-API-Key: ${API_KEY}"

# Western Australia
curl -X GET "${API_URL}/v1/au/ato/deadlines?type=LAND_TAX_WA" -H "X-API-Key: ${API_KEY}"

# ACT (Quarterly)
curl -X GET "${API_URL}/v1/au/ato/deadlines?type=LAND_TAX_ACT" -H "X-API-Key: ${API_KEY}"
```

#### Workers Compensation
```bash
# SA (Sep deadlines)
curl -X GET "${API_URL}/v1/au/ato/deadlines?type=WORKERS_COMP_SA&from_date=2025-09-01&to_date=2025-09-30" -H "X-API-Key: ${API_KEY}"

# WA (Aug deadline)
curl -X GET "${API_URL}/v1/au/ato/deadlines?type=WORKERS_COMP_WA&from_date=2025-08-01&to_date=2025-08-31" -H "X-API-Key: ${API_KEY}"
```

### 4. Date Range Queries

#### Next 30 Days
```bash
curl -X GET "${API_URL}/v1/au/ato/deadlines?from_date=$(date +%Y-%m-%d)&to_date=$(date -d '+30 days' +%Y-%m-%d)" -H "X-API-Key: ${API_KEY}"
```

#### Specific Quarter
```bash
# Q1 2025
curl -X GET "${API_URL}/v1/au/ato/deadlines?from_date=2025-01-01&to_date=2025-03-31" -H "X-API-Key: ${API_KEY}"

# Q2 2025
curl -X GET "${API_URL}/v1/au/ato/deadlines?from_date=2025-04-01&to_date=2025-06-30" -H "X-API-Key: ${API_KEY}"
```

### 5. New Zealand Deadlines
```bash
# All NZ deadlines
curl -X GET "${API_URL}/v1/nz/ird/deadlines" -H "X-API-Key: ${API_KEY}"

# GST Monthly
curl -X GET "${API_URL}/v1/nz/ird/deadlines?type=GST_MONTHLY" -H "X-API-Key: ${API_KEY}"

# PAYE
curl -X GET "${API_URL}/v1/nz/ird/deadlines?type=PAYE" -H "X-API-Key: ${API_KEY}"
```

### 6. Pagination
```bash
# First page (10 items)
curl -X GET "${API_URL}/v1/au/ato/deadlines?limit=10" -H "X-API-Key: ${API_KEY}"

# With pagination token
curl -X GET "${API_URL}/v1/au/ato/deadlines?limit=10&nextToken=<TOKEN>" -H "X-API-Key: ${API_KEY}"
```

## Quick Test All Major Categories

```bash
#!/bin/bash
# Save as test-all.sh and run with: bash test-all.sh

TYPES=(
  "BAS_QUARTERLY"
  "SUPER_GUARANTEE"
  "PAYROLL_TAX_NSW"
  "LAND_TAX_SA"
  "WORKERS_COMP_SA"
)

echo "Testing CompliCal API..."
echo "========================"

for TYPE in "${TYPES[@]}"; do
  COUNT=$(curl -s -X GET "${API_URL}/v1/au/ato/deadlines?type=${TYPE}" \
    -H "X-API-Key: ${API_KEY}" | jq -r '.count // 0')
  echo "$TYPE: $COUNT deadlines"
done

# Total count
TOTAL=$(curl -s -X GET "${API_URL}/v1/au/ato/deadlines" \
  -H "X-API-Key: ${API_KEY}" | jq -r '.count // 0')
echo "========================"
echo "TOTAL AU: $TOTAL deadlines"

# NZ count
NZ_TOTAL=$(curl -s -X GET "${API_URL}/v1/nz/ird/deadlines" \
  -H "X-API-Key: ${API_KEY}" | jq -r '.count // 0')
echo "TOTAL NZ: $NZ_TOTAL deadlines"
```

## Response Format

### Success Response
```json
{
  "deadlines": [
    {
      "id": "au-land-tax-sa-2025-03-15-1750998468859",
      "type": "LAND_TAX_SA",
      "name": "SA Land Tax Q3 2025 Assessment",
      "description": "Land tax assessment for properties owned as at 30 June 2024",
      "jurisdiction": "AU",
      "agency": "REVENUE_SA",
      "dueDate": "2025-03-15",
      "period": "2024-25",
      "applicableTo": ["Property owners with taxable land value over $723,000"],
      "sourceUrl": "https://www.revenuesa.sa.gov.au/landtax"
    }
  ],
  "count": 1,
  "filters": {
    "jurisdiction": "AU",
    "type": "LAND_TAX_SA",
    "dateRange": {}
  },
  "nextToken": "eyJHU0kxUEs..."
}
```

### Error Response
```json
{
  "error": "Invalid deadline type",
  "message": "Invalid type for AU. Valid types are: BAS_QUARTERLY, BAS_MONTHLY, ..."
}
```

## Troubleshooting

1. **Missing Authentication Token**: Add `/v1/au/ato/deadlines` path
2. **Invalid Type**: Check exact spelling and underscore placement
3. **No Results**: Add date range for future-dated deadlines
4. **Rate Limiting**: Max 10 requests per second

## All Available Deadline Types

### Australian (38 types)
```
BAS_QUARTERLY, BAS_MONTHLY, PAYG_WITHHOLDING, PAYG_INSTALMENTS,
SUPER_GUARANTEE, INCOME_TAX, COMPANY_TAX, FBT, GST,
STP_FINALISATION, TPAR, ASIC_ANNUAL_REVIEW,
PAYROLL_TAX_NSW, PAYROLL_TAX_NSW_ANNUAL,
PAYROLL_TAX_VIC, PAYROLL_TAX_VIC_ANNUAL,
PAYROLL_TAX_QLD, PAYROLL_TAX_QLD_ANNUAL,
PAYROLL_TAX_SA, PAYROLL_TAX_SA_ANNUAL,
PAYROLL_TAX_WA, PAYROLL_TAX_WA_ANNUAL,
PAYROLL_TAX_TAS, PAYROLL_TAX_TAS_ANNUAL,
PAYROLL_TAX_NT, PAYROLL_TAX_NT_ANNUAL,
PAYROLL_TAX_ACT, PAYROLL_TAX_ACT_ANNUAL,
LAND_TAX_NSW, LAND_TAX_VIC, LAND_TAX_QLD,
LAND_TAX_SA, LAND_TAX_WA, LAND_TAX_TAS, LAND_TAX_ACT,
WORKERS_COMP_NSW, WORKERS_COMP_VIC, WORKERS_COMP_QLD,
WORKERS_COMP_SA, WORKERS_COMP_WA, WORKERS_COMP_TAS,
WORKERS_COMP_NT, WORKERS_COMP_ACT
```

### New Zealand (12 types)
```
GST_MONTHLY, GST_2MONTHLY, GST_6MONTHLY,
PAYE, PAYE_LARGE,
PROVISIONAL_TAX, PROVISIONAL_TAX_RATIO, PROVISIONAL_TAX_AIM,
IR3, FBT_QUARTERLY, FBT_ANNUAL, KIWISAVER
```

## Secure Authentication (httpOnly Cookies)

### Quick Auth Flow
```bash
# 1. Register
curl -c cookies.txt -X POST "${API_URL}/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"'${TEST_EMAIL}'","password":"'${TEST_PASSWORD}'","companyName":"Test Co"}'

# 2. Login and get CSRF token
CSRF_TOKEN=$(curl -b cookies.txt -c cookies.txt -X POST "${API_URL}/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"'${TEST_EMAIL}'","password":"'${TEST_PASSWORD}'"}' | jq -r '.csrfToken')

# 3. Get JWT from cookies
JWT_TOKEN=$(cat cookies.txt | grep id_token | awk '{print $7}')

# 4. Create API key
API_KEY=$(curl -X POST "${API_URL}/v1/auth/api-keys" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"My API Key","expiresIn":90}' | jq -r '.apiKey')

echo "Your API Key: $API_KEY"

# 5. Logout
curl -b cookies.txt -c cookies.txt -X POST "${API_URL}/v1/auth/logout" \
  -H "X-CSRF-Token: $CSRF_TOKEN"

# Clean up
rm -f cookies.txt
```

### API Key Management
```bash
# List your API keys
curl -X GET "${API_URL}/v1/auth/api-keys" \
  -H "Authorization: Bearer ${JWT_TOKEN}" | jq '.apiKeys[] | {id, name, keyPrefix, usageCount, lastUsed}'

# Delete API key
curl -X DELETE "${API_URL}/v1/auth/api-keys/KEY_ID_HERE" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

## Native Solution Monitoring

### Check API Key Usage
```bash
# Get API key usage stats
aws dynamodb get-item \
  --table-name complical-api-keys-dev \
  --key '{"id":{"S":"YOUR_KEY_ID"}}' \
  --region ap-south-1 | jq '.Item | {usageCount: .usageCount.N, lastUsed: .lastUsed.S}'

# Check hourly aggregates
aws dynamodb query \
  --table-name complical-api-usage-dev \
  --key-condition-expression "PK = :pk AND begins_with(SK, :sk)" \
  --expression-attribute-values '{":pk":{"S":"USER#'${TEST_EMAIL}'"},":sk":{"S":"AGGREGATE#"}}' \
  --region ap-south-1 | jq '.Items[] | {hour: .SK.S, requests: .requests.N}'
```

### View Access Logs
```bash
# Recent API access logs
aws logs tail /aws/apigateway/complical-dev --since 5m --region ap-south-1

# Usage processor logs
aws logs tail /aws/lambda/complical-usage-processor-dev --since 5m --region ap-south-1
```