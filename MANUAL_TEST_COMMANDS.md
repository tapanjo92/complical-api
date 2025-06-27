# CompliCal API Manual Test Commands

## API Configuration
```bash
API_URL="https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev"
```

## 1. User Registration & Authentication

### Register a New User
```bash
curl -X POST "$API_URL/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "companyName": "Test Company"
  }'
```

### Login
```bash
curl -X POST "$API_URL/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'
```
Save the `idToken` from the response for authenticated requests.

## 2. API Key Management

### Create API Key (Requires Authentication)
```bash
ID_TOKEN="<your-id-token-from-login>"

curl -X POST "$API_URL/v1/auth/api-keys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -d '{
    "name": "Production API Key",
    "description": "Main API key for production app",
    "expiresIn": 90
  }'
```
Save the `apiKey` from the response - you won't see it again!

### List Your API Keys
```bash
curl -X GET "$API_URL/v1/auth/api-keys" \
  -H "Authorization: Bearer $ID_TOKEN"
```

### Delete an API Key
```bash
API_KEY_ID="<key-id-from-list>"

curl -X DELETE "$API_URL/v1/auth/api-keys/$API_KEY_ID" \
  -H "Authorization: Bearer $ID_TOKEN"
```

## 3. Public Endpoints (No Auth Required)

### Health Check
```bash
curl -X GET "$API_URL/health"
```

## 4. API Endpoints (Requires API Key)

### Set Your API Key
```bash
API_KEY="<your-api-key-from-create>"
```

### Ultra-Simple Endpoints (NEW! Recommended)

#### Get Monthly Deadlines
```bash
# January 2025 - All deadlines
curl -X GET "$API_URL/v1/deadlines/AU/2025/1" \
  -H "x-api-key: $API_KEY"

# February 2025 - All deadlines  
curl -X GET "$API_URL/v1/deadlines/AU/2025/2" \
  -H "x-api-key: $API_KEY"

# March 2025 for New Zealand
curl -X GET "$API_URL/v1/deadlines/NZ/2025/3" \
  -H "x-api-key: $API_KEY"
```

#### Server-Side Filtering (NEW!)
```bash
# Only tax-related deadlines
curl -X GET "$API_URL/v1/deadlines/AU/2025/2?category=tax" \
  -H "x-api-key: $API_KEY"

# Only payroll deadlines (81% less data!)
curl -X GET "$API_URL/v1/deadlines/AU/2025/2?category=payroll" \
  -H "x-api-key: $API_KEY"

# Only compliance deadlines
curl -X GET "$API_URL/v1/deadlines/AU/2025/2?category=compliance" \
  -H "x-api-key: $API_KEY"

# Only super/retirement deadlines
curl -X GET "$API_URL/v1/deadlines/AU/2025/2?category=super" \
  -H "x-api-key: $API_KEY"

# Specific type only
curl -X GET "$API_URL/v1/deadlines/AU/2025/2?type=BAS_QUARTERLY" \
  -H "x-api-key: $API_KEY"
```

### Australian Deadlines - Traditional Endpoints

#### Get All Australian Deadlines
```bash
curl -X GET "$API_URL/v1/au/ato/deadlines" \
  -H "x-api-key: $API_KEY"
```

#### Filter by Type
```bash
# BAS Quarterly
curl -X GET "$API_URL/v1/au/ato/deadlines?type=BAS_QUARTERLY" \
  -H "x-api-key: $API_KEY"

# Payroll Tax (NSW)
curl -X GET "$API_URL/v1/au/ato/deadlines?type=PAYROLL_TAX_NSW" \
  -H "x-api-key: $API_KEY"

# Super Guarantee
curl -X GET "$API_URL/v1/au/ato/deadlines?type=SUPER_GUARANTEE" \
  -H "x-api-key: $API_KEY"
```

#### Filter by Date Range
```bash
# January 2025 deadlines
curl -X GET "$API_URL/v1/au/ato/deadlines?from_date=2025-01-01&to_date=2025-01-31" \
  -H "x-api-key: $API_KEY"

# Next 30 days
curl -X GET "$API_URL/v1/au/ato/deadlines?from_date=$(date +%Y-%m-%d)&to_date=$(date -d '+30 days' +%Y-%m-%d)" \
  -H "x-api-key: $API_KEY"
```

#### Pagination
```bash
# First page (5 items)
curl -X GET "$API_URL/v1/au/ato/deadlines?limit=5" \
  -H "x-api-key: $API_KEY"

# Next page (use nextToken from previous response)
curl -X GET "$API_URL/v1/au/ato/deadlines?limit=5&nextToken=<token-from-previous-response>" \
  -H "x-api-key: $API_KEY"
```

### New Zealand Deadlines - Traditional Endpoints

#### Get All NZ Deadlines
```bash
curl -X GET "$API_URL/v1/nz/ird/deadlines" \
  -H "x-api-key: $API_KEY"
```

#### Filter by Type
```bash
# GST Monthly
curl -X GET "$API_URL/v1/nz/ird/deadlines?type=GST_MONTHLY" \
  -H "x-api-key: $API_KEY"

# PAYE
curl -X GET "$API_URL/v1/nz/ird/deadlines?type=PAYE" \
  -H "x-api-key: $API_KEY"
```

### Simplified Global Endpoint (Calendarific-style)

#### Get Deadlines by Country
```bash
# Australia
curl -X GET "$API_URL/v1/deadlines?country=AU" \
  -H "x-api-key: $API_KEY"

# New Zealand
curl -X GET "$API_URL/v1/deadlines?country=NZ" \
  -H "x-api-key: $API_KEY"

# Multiple countries
curl -X GET "$API_URL/v1/deadlines?countries=AU,NZ" \
  -H "x-api-key: $API_KEY"
```

#### Filter by Year and Month
```bash
# January 2025
curl -X GET "$API_URL/v1/deadlines?country=AU&year=2025&month=1" \
  -H "x-api-key: $API_KEY"

# Current month
curl -X GET "$API_URL/v1/deadlines?country=AU&year=$(date +%Y)&month=$(date +%-m)" \
  -H "x-api-key: $API_KEY"
```

#### Filter by Type
```bash
# BAS deadlines only
curl -X GET "$API_URL/v1/deadlines?country=AU&type=BAS_QUARTERLY" \
  -H "x-api-key: $API_KEY"
```

#### Pagination
```bash
# Limit results
curl -X GET "$API_URL/v1/deadlines?country=AU&limit=10&offset=0" \
  -H "x-api-key: $API_KEY"

# Next page
curl -X GET "$API_URL/v1/deadlines?country=AU&limit=10&offset=10" \
  -H "x-api-key: $API_KEY"
```

## 5. Testing with jq for Pretty Output

### Get deadline names only
```bash
curl -s -X GET "$API_URL/v1/au/ato/deadlines?limit=5" \
  -H "x-api-key: $API_KEY" | jq '.deadlines[].name'
```

### Get deadlines with specific fields
```bash
curl -s -X GET "$API_URL/v1/au/ato/deadlines?limit=3" \
  -H "x-api-key: $API_KEY" | jq '.deadlines[] | {name, dueDate, type}'
```

### Get count of deadlines by type
```bash
curl -s -X GET "$API_URL/v1/au/ato/deadlines" \
  -H "x-api-key: $API_KEY" | jq '.deadlines | group_by(.type) | map({type: .[0].type, count: length})'
```

## 6. Error Testing

### Test without API key (should return 403)
```bash
curl -X GET "$API_URL/v1/au/ato/deadlines"
```

### Test with invalid API key (should return 403)
```bash
curl -X GET "$API_URL/v1/au/ato/deadlines" \
  -H "x-api-key: invalid-key-12345"
```

### Test with invalid date format (should return 400)
```bash
curl -X GET "$API_URL/v1/au/ato/deadlines?from_date=invalid-date" \
  -H "x-api-key: $API_KEY"
```

### Test with invalid deadline type (should return 400)
```bash
curl -X GET "$API_URL/v1/au/ato/deadlines?type=INVALID_TYPE" \
  -H "x-api-key: $API_KEY"
```

## 7. Check API Key Usage

### Via DynamoDB (requires AWS CLI)
```bash
# Replace with your API key ID
API_KEY_ID="<your-api-key-id>"

aws dynamodb get-item \
  --table-name complical-api-keys-dev \
  --key "{\"id\":{\"S\":\"$API_KEY_ID\"}}" \
  --region ap-south-1 | jq '.Item | {id: .id.S, usageCount: .usageCount.N, lastUsed: .lastUsed.S}'
```

## 8. Complete Test Script

### Run all tests at once
```bash
bash /home/ubuntu/CompliCal/complete-api-test.sh
```

### Test all endpoints with existing API key
```bash
bash /home/ubuntu/CompliCal/test-all-endpoints.sh
```

## 9. Common Test Scenarios

### Get upcoming deadlines for next 7 days
```bash
curl -s -X GET "$API_URL/v1/au/ato/deadlines?from_date=$(date +%Y-%m-%d)&to_date=$(date -d '+7 days' +%Y-%m-%d)" \
  -H "x-api-key: $API_KEY" | jq '.deadlines[] | {name, dueDate}'
```

### Get all payroll tax deadlines across states
```bash
curl -s -X GET "$API_URL/v1/au/ato/deadlines" \
  -H "x-api-key: $API_KEY" | jq '.deadlines[] | select(.type | startswith("PAYROLL_TAX")) | {state: .type, name, dueDate}'
```

### Get quarterly deadlines
```bash
curl -s -X GET "$API_URL/v1/au/ato/deadlines" \
  -H "x-api-key: $API_KEY" | jq '.deadlines[] | select(.name | contains("Quarterly") or contains("quarterly")) | {name, dueDate, type}'
```

## Ultra-Simple Endpoint Reference (NEW!)

### Endpoint Format
```
GET /v1/deadlines/{country}/{year}/{month}
GET /v1/deadlines/{country}/{year}/{month}?type={TYPE}
GET /v1/deadlines/{country}/{year}/{month}?category={CATEGORY}
```

### Available Categories
- **tax**: BAS, GST, Income Tax, FBT, PAYG Instalments, TPAR
- **payroll**: PAYG Withholding, Payroll Tax (all states), STP, PAYE
- **compliance**: Annual Company Reviews, Workers Compensation
- **super**: Super Guarantee, KiwiSaver
- **other**: Land Tax, Provisional Tax, RWT

### Response Format
```json
{
  "country": "AU",
  "year": 2025,
  "month": 2,
  "deadlines": [
    {
      "id": "au-bas-quarterly-2025-02-28",
      "name": "Q2 2024-25 BAS Statement",
      "date": "2025-02-28",
      "type": "BAS_QUARTERLY",
      "agency": "Australian Taxation Office"
    }
  ],
  "count": 1,
  "filters": {
    "type": "BAS_QUARTERLY"  // Shows applied filter
  }
}
```

### Performance Benefits
| Filter | Data Reduction | Use Case |
|--------|---------------|----------|
| No filter | Baseline | Get everything for planning |
| category=tax | ~81% less | Tax professionals |
| category=payroll | ~35% less | Payroll departments |
| type=BAS_QUARTERLY | ~89% less | Specific compliance |

## Available Deadline Types

### Australian Types (38 total)
- BAS_QUARTERLY, BAS_MONTHLY
- PAYG_WITHHOLDING_MONTHLY, PAYG_WITHHOLDING_QUARTERLY
- PAYG_INSTALMENTS_QUARTERLY, PAYG_INSTALMENTS_MONTHLY
- SUPER_GUARANTEE
- INCOME_TAX_INDIVIDUAL, INCOME_TAX_COMPANY
- FBT (Fringe Benefits Tax)
- GST_ANNUAL
- STP_FINALISATION
- TPAR (Taxable Payments Annual Report)
- ANNUAL_COMPANY_REVIEW
- PAYROLL_TAX_NSW, PAYROLL_TAX_VIC, PAYROLL_TAX_QLD, etc. (all states)
- LAND_TAX_NSW, LAND_TAX_VIC, etc.
- WORKERS_COMP_NSW, WORKERS_COMP_VIC, etc.

### New Zealand Types (12 total)
- GST_MONTHLY, GST_TWO_MONTHLY, GST_SIX_MONTHLY
- PAYE
- PROVISIONAL_TAX
- INCOME_TAX_RETURN (IR3)
- COMPANY_TAX_RETURN (IR4)
- FBT_QUARTERLY, FBT_ANNUAL
- KIWISAVER
- EMPLOYER_DEDUCTIONS
- RWT (Resident Withholding Tax)

## Notes
- All dates should be in ISO format: YYYY-MM-DD
- API keys are case-sensitive
- Rate limits: 10 requests/second, 20 burst
- Monthly quota: 10,000 requests (free tier)
- API keys expire after the specified period (default 90 days)