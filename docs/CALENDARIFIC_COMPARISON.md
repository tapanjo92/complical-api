# CompliCal vs Calendarific API Comparison

## Executive Summary

While both APIs provide date-based information, they serve fundamentally different purposes:
- **Calendarific**: Holiday and observance data for 230+ countries
- **CompliCal**: Business compliance deadlines for AU/NZ (currently)

## API Structure Comparison

### 1. Endpoint Design

#### Calendarific (Simple & Flat)
```
https://calendarific.com/api/v2/holidays?api_key=XXX&country=US&year=2025
```
- Single endpoint for all data
- Country and year as query parameters
- No path-based routing

#### CompliCal (Hierarchical & RESTful)
```
https://api.complical.com/v1/au/ato/deadlines?type=BAS_QUARTERLY
https://api.complical.com/v1/nz/ird/deadlines?type=GST_MONTHLY
```
- Hierarchical path structure: `/v1/{jurisdiction}/{agency}/deadlines`
- More complex but more organized
- Follows REST best practices

### 2. Authentication

#### Calendarific
- API key as URL parameter: `?api_key=XXX`
- Simple but less secure (key visible in URLs)
- No OAuth or JWT support

#### CompliCal
- API key in header: `X-API-Key: XXX`
- More secure (not in URL)
- Also supports JWT tokens for user auth
- OAuth 2.0 for machine-to-machine

### 3. Query Parameters

#### Calendarific
```
Required:
- api_key
- country (2-letter code)
- year

Optional:
- month
- day
- location (premium)
- type (premium)
```

#### CompliCal
```
Required:
- None (returns all deadlines)

Optional:
- type (specific deadline type)
- from_date (YYYY-MM-DD)
- to_date (YYYY-MM-DD)
- limit (pagination)
- nextToken (pagination)
```

### 4. Response Format

#### Calendarific
```json
{
  "meta": {
    "code": 200
  },
  "response": {
    "holidays": [
      {
        "name": "New Year's Day",
        "description": "New Year's Day is the first day of the year",
        "date": {
          "iso": "2025-01-01",
          "datetime": {
            "year": 2025,
            "month": 1,
            "day": 1
          }
        },
        "type": ["National holiday"]
      }
    ]
  }
}
```

#### CompliCal
```json
{
  "deadlines": [
    {
      "id": "au-bas-quarterly-2025-04-28-123456",
      "type": "BAS_QUARTERLY",
      "name": "Q3 2025 BAS Statement",
      "description": "Quarterly Business Activity Statement",
      "jurisdiction": "AU",
      "agency": "ATO",
      "dueDate": "2025-04-28",
      "period": "2025-Q3",
      "applicableTo": ["Businesses with GST turnover under $20M"],
      "sourceUrl": "https://www.ato.gov.au/business/bus/"
    }
  ],
  "count": 1,
  "filters": {
    "jurisdiction": "AU",
    "type": "BAS_QUARTERLY",
    "dateRange": {}
  },
  "nextToken": "eyJHU0kxUEs..."
}
```

### 5. Data Coverage

#### Calendarific
- **Countries**: 230+
- **Data Types**: Public holidays, observances, religious holidays
- **Languages**: 100+
- **Updates**: Daily (enterprise), Weekly (business), As needed (free)

#### CompliCal
- **Countries**: 2 (AU, NZ) - planning 4
- **Data Types**: Tax deadlines, compliance dates, regulatory filings
- **Languages**: English only
- **Updates**: Manual currently, planned automation

### 6. Pricing Models

#### Calendarific
- Free: 500 calls/month
- Starter: $100/year (10K calls/month)
- Business: $400/year (50K calls/month)
- Enterprise: $4,000/year (50M calls/month)

#### CompliCal (Planned)
- Developer: $19/month (10K calls)
- Professional: $99/month (100K calls)
- Enterprise: $499/month (unlimited)

## Key Differences

### 1. Simplicity vs Specificity
- **Calendarific**: Dead simple - one endpoint, minimal parameters
- **CompliCal**: More complex but provides richer, business-specific data

### 2. Global vs Regional
- **Calendarific**: Global coverage priority
- **CompliCal**: Deep regional expertise priority

### 3. Consumer vs Business Focus
- **Calendarific**: General purpose (holidays for apps, calendars)
- **CompliCal**: Business specific (compliance, tax, regulatory)

## Recommendations for CompliCal

### 1. Adopt Calendarific's Simplicity Where Possible
```bash
# Consider simplified endpoint option:
GET /v1/deadlines?country=AU&year=2025&type=BAS_QUARTERLY

# Instead of only:
GET /v1/au/ato/deadlines?type=BAS_QUARTERLY
```

### 2. Add Global Endpoint
```bash
# Like Calendarific's single endpoint:
GET /v1/deadlines?country=AU,NZ&from_date=2025-01-01&to_date=2025-12-31
```

### 3. Improve Response Meta
```json
{
  "meta": {
    "code": 200,
    "request_id": "abc123",
    "credits_remaining": 9500
  },
  "response": {
    "deadlines": [...],
    "pagination": {
      "total": 110,
      "limit": 50,
      "offset": 0
    }
  }
}
```

### 4. Add Country Code Support
- Support both `/au/` paths and `?country=AU` parameter
- Use ISO 3166-1 alpha-2 codes like Calendarific

### 5. Simplify Authentication Option
- Consider allowing API key in query param for read-only operations
- Keep header auth as recommended approach

### 6. Add Batch Country Support
```bash
# Multiple countries in one call (like Calendarific's approach):
GET /v1/deadlines?countries=AU,NZ,SG&year=2025
```

## Conclusion

While CompliCal's API is more sophisticated and follows better security practices, Calendarific's simplicity has clear advantages for developer adoption. Consider adding simplified endpoint options while maintaining the current detailed structure for advanced use cases.

### Quick Wins:
1. Add a simple `/v1/deadlines` endpoint with country parameter
2. Support API key in query parameter (with security warnings)
3. Add meta information to responses
4. Support batch country queries
5. Implement year-based filtering

This would make CompliCal easier to adopt while maintaining its enterprise-grade capabilities.