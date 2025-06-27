# CompliCal API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Endpoints Overview](#endpoints-overview)
3. [Ultra-Simple Endpoints](#ultra-simple-endpoints-new)
4. [Traditional Endpoints](#traditional-endpoints)
5. [Simplified Global Endpoint](#simplified-global-endpoint)
6. [Response Formats](#response-formats)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [Best Practices](#best-practices)

## Authentication

CompliCal uses API key authentication for all data endpoints.

### Getting an API Key

1. **Register an account**
```bash
POST /v1/auth/register
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "companyName": "Your Company"
}
```

2. **Login to get JWT token**
```bash
POST /v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
# Returns: { "idToken": "...", "email": "...", "companyName": "..." }
```

3. **Create API key**
```bash
POST /v1/auth/api-keys
Authorization: Bearer {idToken}
{
  "name": "Production API Key",
  "description": "Main app key",
  "expiresIn": 90  # days
}
# Returns: { "apiKey": "...", "id": "...", "keyPrefix": "..." }
```

### Using API Keys

Include the API key in the `x-api-key` header:
```bash
GET /v1/deadlines/AU/2025/1
x-api-key: YOUR_API_KEY
```

## Endpoints Overview

### Endpoint Comparison

| Endpoint Type | Format | Best For | Data Efficiency |
|--------------|--------|----------|-----------------|
| Ultra-Simple | `/v1/deadlines/{country}/{year}/{month}` | Most use cases | ⭐⭐⭐⭐⭐ |
| Traditional | `/v1/au/ato/deadlines` | Legacy support | ⭐⭐⭐ |
| Simplified | `/v1/deadlines?country=AU` | Calendarific users | ⭐⭐⭐⭐ |

## Ultra-Simple Endpoints (NEW!)

### Base Format
```
GET /v1/deadlines/{country}/{year}/{month}
```

### Parameters
- **country** (required): `AU` or `NZ`
- **year** (required): 4-digit year (e.g., `2025`)
- **month** (required): 1-12 (e.g., `1` or `01`)

### Query Parameters (Optional)
- **type**: Filter by specific deadline type
- **category**: Filter by category (`tax`, `payroll`, `compliance`, `super`, `other`)

### Examples

#### Get all deadlines for a month
```bash
GET /v1/deadlines/AU/2025/1
```

Response:
```json
{
  "country": "AU",
  "year": 2025,
  "month": 1,
  "deadlines": [
    {
      "id": "au-super-guarantee-2025-01-28",
      "name": "Q2 2024-25 Super Guarantee",
      "date": "2025-01-28",
      "type": "SUPER_GUARANTEE",
      "agency": "Australian Taxation Office"
    }
  ],
  "count": 2
}
```

#### Filter by category (81% less data!)
```bash
GET /v1/deadlines/AU/2025/2?category=tax
```

Response:
```json
{
  "country": "AU",
  "year": 2025,
  "month": 2,
  "deadlines": [
    {
      "id": "au-bas-monthly-2025-02-21",
      "name": "January 2025 Monthly BAS",
      "date": "2025-02-21",
      "type": "BAS_MONTHLY",
      "agency": "Australian Taxation Office"
    }
  ],
  "count": 2,
  "filters": {
    "category": "tax"
  }
}
```

#### Filter by specific type
```bash
GET /v1/deadlines/AU/2025/2?type=BAS_QUARTERLY
```

### Category Mappings

| Category | Included Types |
|----------|---------------|
| **tax** | BAS_QUARTERLY, BAS_MONTHLY, GST_ANNUAL, INCOME_TAX_*, FBT, PAYG_INSTALMENTS_*, TPAR |
| **payroll** | PAYG_WITHHOLDING_*, PAYROLL_TAX_*, STP_FINALISATION, PAYE, EMPLOYER_DEDUCTIONS |
| **compliance** | ANNUAL_COMPANY_REVIEW, WORKERS_COMP_* |
| **super** | SUPER_GUARANTEE, KIWISAVER |
| **other** | LAND_TAX_*, PROVISIONAL_TAX, RWT |

## Traditional Endpoints

### Australian Deadlines
```
GET /v1/au/ato/deadlines
```

#### Query Parameters
- **type**: Filter by deadline type (e.g., `BAS_QUARTERLY`)
- **from_date**: Start date (ISO format: `2025-01-01`)
- **to_date**: End date (ISO format: `2025-01-31`)
- **limit**: Number of results (default: 100, max: 1000)
- **nextToken**: Pagination token

#### Example
```bash
GET /v1/au/ato/deadlines?type=BAS_QUARTERLY&from_date=2025-01-01&to_date=2025-03-31
```

### New Zealand Deadlines
```
GET /v1/nz/ird/deadlines
```

Same query parameters as Australian endpoint.

## Simplified Global Endpoint

Calendarific-style API for easy migration:

```
GET /v1/deadlines
```

### Query Parameters
- **country**: Single country code (e.g., `AU`)
- **countries**: Multiple countries (e.g., `AU,NZ`)
- **year**: Filter by year
- **month**: Filter by month (1-12)
- **type**: Filter by deadline type
- **limit**: Results per page (default: 100)
- **offset**: Pagination offset

### Example
```bash
GET /v1/deadlines?country=AU&year=2025&month=1&type=BAS_QUARTERLY
```

## Response Formats

### Success Response
```json
{
  "deadlines": [...],
  "count": 10,
  "nextToken": "..."  // For pagination
}
```

### Deadline Object
```json
{
  "id": "unique-deadline-id",
  "type": "BAS_QUARTERLY",
  "name": "Q3 2024-25 BAS Statement",
  "description": "Quarterly Business Activity Statement",
  "dueDate": "2025-02-28",
  "jurisdiction": "AU",
  "agency": "Australian Taxation Office",
  "period": "2024-Q3",
  "applicableTo": ["All registered businesses"],
  "sourceUrl": "https://ato.gov.au/..."
}
```

## Error Handling

### Error Response Format
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional information"
}
```

### Common Error Codes
| Status | Code | Description |
|--------|------|-------------|
| 400 | INVALID_PARAMETERS | Invalid query parameters |
| 401 | UNAUTHORIZED | Invalid or missing API key |
| 403 | FORBIDDEN | API key doesn't have access |
| 404 | NOT_FOUND | Resource not found |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

## Rate Limiting

### Limits by Tier
| Tier | Rate Limit | Burst | Monthly Quota |
|------|------------|-------|---------------|
| Free | 10 req/sec | 20 | 10,000 |
| Developer | 50 req/sec | 100 | 100,000 |
| Professional | 100 req/sec | 200 | 1,000,000 |
| Enterprise | 500 req/sec | 1000 | Unlimited |

### Rate Limit Headers
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1643723400
```

## Best Practices

### 1. Use the Ultra-Simple Endpoint
- Cleanest API design
- Best performance
- Easiest to implement

### 2. Always Use Filtering
- Reduces data transfer by up to 89%
- Faster response times
- Lower bandwidth costs

### 3. Cache Responses
- Deadline data doesn't change frequently
- Cache for 24 hours minimum
- Use ETags when available

### 4. Handle Errors Gracefully
```javascript
try {
  const response = await fetch('/v1/deadlines/AU/2025/1', {
    headers: { 'x-api-key': API_KEY }
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error(`API Error: ${error.error}`);
  }
} catch (err) {
  console.error('Network error:', err);
}
```

### 5. Monitor Your Usage
```bash
GET /v1/auth/api-keys
Authorization: Bearer {idToken}

# Returns usage statistics for all your keys
```

## Code Examples

### JavaScript/Node.js
```javascript
const API_KEY = 'your-api-key';
const API_URL = 'https://api.complical.com';

// Get tax deadlines for current month
async function getTaxDeadlines() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  const response = await fetch(
    `${API_URL}/v1/deadlines/AU/${year}/${month}?category=tax`,
    { headers: { 'x-api-key': API_KEY } }
  );
  
  const data = await response.json();
  return data.deadlines;
}
```

### Python
```python
import requests
from datetime import datetime

API_KEY = 'your-api-key'
API_URL = 'https://api.complical.com'

def get_payroll_deadlines():
    now = datetime.now()
    
    response = requests.get(
        f"{API_URL}/v1/deadlines/AU/{now.year}/{now.month}",
        headers={'x-api-key': API_KEY},
        params={'category': 'payroll'}
    )
    
    response.raise_for_status()
    return response.json()['deadlines']
```

### Integration with Calendar
```javascript
// Add deadlines to Google Calendar
async function syncDeadlinesToCalendar() {
  const deadlines = await getTaxDeadlines();
  
  for (const deadline of deadlines) {
    await calendar.events.create({
      summary: deadline.name,
      description: `${deadline.description}\nAgency: ${deadline.agency}`,
      start: { date: deadline.date },
      end: { date: deadline.date },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 7 * 24 * 60 }, // 1 week
          { method: 'popup', minutes: 24 * 60 }      // 1 day
        ]
      }
    });
  }
}
```

## Migration Guide

### From Calendarific
```javascript
// Old Calendarific way
const holidays = await fetch(
  'https://calendarific.com/api/v2/holidays?country=AU&year=2025'
);

// New CompliCal way (better!)
const deadlines = await fetch(
  'https://api.complical.com/v1/deadlines/AU/2025/1',
  { headers: { 'x-api-key': API_KEY } }
);
```

### From Manual Tracking
Replace your spreadsheet with API calls:
```javascript
// Instead of manually checking dates
const isBasDue = checkSpreadsheet();

// Use the API
const deadlines = await getDeadlines('AU', 2025, 1, 'BAS_QUARTERLY');
const basDeadline = deadlines[0];
const daysUntilDue = calculateDaysUntil(basDeadline.date);
```

## Support

- **Documentation**: https://docs.complical.com
- **API Status**: https://status.complical.com
- **Email**: support@complical.com
- **GitHub**: https://github.com/complical/api-docs