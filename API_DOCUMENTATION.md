# 📚 CompliCal API Documentation v2

> Complete API reference for Australian & New Zealand compliance deadlines  
> Base URL: `https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev`

## 🚀 Quick Start

```bash
# Get your API key after registration
curl -X POST https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@company.com","password":"SecurePass123!","companyName":"Your Company"}'

# Test with ultra-simple endpoint
curl -X GET https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev/v1/deadlines/AU/2025/7 \
  -H "x-api-key: YOUR_API_KEY"
```

## 🔑 Authentication

All API endpoints require an API key passed in the `x-api-key` header:

```bash
-H "x-api-key: YOUR_API_KEY"
```

## 📍 Endpoints

### 1️⃣ Ultra-Simple Endpoint (Recommended)

```
GET /v1/deadlines/{country}/{year}/{month}
```

**Path Parameters:**
- `country`: AU or NZ
- `year`: 4-digit year (e.g., 2025)
- `month`: 1-12 (accepts both 1 and 01)

**Query Parameters:**
- `type`: Filter by specific deadline type
- `category`: Filter by category (see categories below)

**Example:**
```bash
# Get all July 2025 deadlines for Australia
GET /v1/deadlines/AU/2025/7

# Get only vehicle-related deadlines
GET /v1/deadlines/AU/2025/7?category=vehicle

# Get specific type
GET /v1/deadlines/AU/2025/1?type=FUEL_EXCISE
```

### 2️⃣ Simplified Endpoint (Calendarific-style)

```
GET /v1/deadlines
```

**Query Parameters:**
- `country`: AU, NZ (or multiple: AU,NZ)
- `year`: 2025
- `month`: 1-12
- `type`: Specific deadline type
- `limit`: Results per page (default: 100)
- `offset`: Pagination offset

**Example:**
```bash
GET /v1/deadlines?country=AU&year=2025&month=3
```

### 3️⃣ Traditional Endpoints

```
GET /v1/{country}/{agency}/deadlines
```

**Available Routes:**
- `/v1/au/ato/deadlines` - Australian Tax Office
- `/v1/nz/ird/deadlines` - NZ Inland Revenue

**Query Parameters:**
- `type`: Deadline type filter
- `from_date`: Start date (YYYY-MM-DD)
- `to_date`: End date (YYYY-MM-DD)
- `limit`: Results per page
- `nextToken`: Pagination token

## 📊 Categories & Types

### 🏷️ Filter Categories

Use the `category` parameter to filter by these groups:

| Category | Description | Example Types |
|----------|-------------|---------------|
| `tax` | Federal & income taxes | BAS, GST, Income Tax, Excise |
| `payroll` | Employment-related taxes | PAYG, Payroll Tax, STP |
| `compliance` | Corporate compliance | ASIC reviews, Workers Comp |
| `super` | Superannuation | Super Guarantee |
| `property` | Property-related taxes | Land Tax, Stamp Duty, Foreign Surcharge |
| `vehicle` | Vehicle-related | Registration, Vehicle Stamp Duty |
| `industry` | Industry-specific | Mining Royalties, Gaming Tax |
| `insurance` | Insurance duties | Insurance Stamp Duty |
| `emergency` | Emergency levies | ESL, Fire Services Levy |

### 📋 Complete Type Reference

#### Federal Types (219 total)

**Business Activity (26)**
- `BAS_QUARTERLY` - Quarterly BAS
- `BAS_MONTHLY` - Monthly BAS

**Employment (9)**
- `PAYG_WITHHOLDING` - PAYG withholding
- `STP_FINALISATION` - Single Touch Payroll

**Excise Duties (149)**
- `FUEL_EXCISE` - Monthly fuel excise
- `TOBACCO_EXCISE` - Weekly tobacco excise
- `ALCOHOL_EXCISE` - Monthly alcohol excise
- `LUXURY_CAR_TAX` - Quarterly LCT
- `WINE_EQUALISATION_TAX` - Quarterly WET
- `PETROLEUM_RESOURCE_RENT_TAX` - Quarterly PRRT
- `MAJOR_BANK_LEVY` - Quarterly bank levy

**Other Federal**
- `INCOME_TAX` - Annual income tax
- `COMPANY_TAX` - Company tax return
- `FBT` - Fringe Benefits Tax
- `GST` - Goods & Services Tax
- `SUPER_GUARANTEE` - Super contributions
- `ASIC_ANNUAL_REVIEW` - Company review
- `R_AND_D_TAX_INCENTIVE` - R&D registration
- `FUEL_TAX_CREDITS` - Fuel tax claims
- `DIVISION_7A_LOANS` - Loan repayments
- `EMDG_APPLICATION` - Export grants
- `WGEA_REPORTING` - Gender equality
- `MODERN_AWARD_UPDATE` - Award increases
- `SUPER_GUARANTEE_INCREASE` - SG rate change

#### State Types (210 total per state)

**Payroll Tax (8 per state)**
- `PAYROLL_TAX_NSW` - NSW monthly
- `PAYROLL_TAX_NSW_ANNUAL` - NSW annual
- Similar for VIC, QLD, SA, WA, TAS, NT, ACT

**Land Tax (1 per state except NT)**
- `LAND_TAX_NSW`, `LAND_TAX_VIC`, etc.

**Stamp Duty (3 types per state)**
- `STAMP_DUTY_PROPERTY_NSW` - Property transfers
- `STAMP_DUTY_VEHICLE_NSW` - Vehicle duty
- `STAMP_DUTY_INSURANCE_NSW` - Insurance duty

**Vehicle Registration (1 per state)**
- `VEHICLE_REGO_NSW`, `VEHICLE_REGO_VIC`, etc.

**Workers Compensation (1 per state)**
- `WORKERS_COMP_NSW`, `WORKERS_COMP_VIC`, etc.

**Industry Specific**
- `MINING_ROYALTIES_NSW` - Quarterly mining
- `GAMING_TAX_NSW` - Monthly gaming
- `ENVIRONMENTAL_LEVY` - Environmental fees
- `WASTE_LEVY` - Waste disposal

**Other State Taxes**
- `FOREIGN_SURCHARGE_NSW` - Foreign buyer duty
- `ABSENTEE_OWNER_VIC` - Absentee surcharge
- `EMERGENCY_SERVICES_LEVY_NSW` - ESL
- `FIRE_SERVICES_LEVY_VIC` - Fire levy

## 📄 Response Format

### Ultra-Simple Response
```json
{
  "country": "AU",
  "year": 2025,
  "month": 7,
  "deadlines": [
    {
      "id": "abc123",
      "name": "Q1 2025-26 BAS",
      "date": "2025-07-28",
      "type": "BAS_QUARTERLY",
      "agency": "ATO"
    }
  ],
  "count": 15,
  "filters": {
    "category": "tax"
  }
}
```

### Traditional Response
```json
{
  "deadlines": [
    {
      "id": "abc123",
      "type": "BAS_QUARTERLY",
      "name": "Q1 2025-26 BAS",
      "description": "Quarterly Business Activity Statement",
      "jurisdiction": "AU",
      "agency": "ATO",
      "dueDate": "2025-07-28",
      "period": "Q1 2025-26",
      "applicableTo": ["gst_registered"],
      "sourceUrl": "https://ato.gov.au/...",
      "filingRequirements": "Lodge via ATO online",
      "penalties": "GIC applies from due date"
    }
  ],
  "pagination": {
    "hasMore": false,
    "nextToken": null
  }
}
```

## 🧪 Testing Examples

### Get Vehicle Registrations
```bash
# All vehicle deadlines for July
curl -X GET "$BASE_URL/v1/deadlines/AU/2025/7?category=vehicle" \
  -H "x-api-key: $API_KEY"
```

### Get Property Taxes
```bash
# Property-related deadlines (land tax, stamp duty)
curl -X GET "$BASE_URL/v1/deadlines/AU/2025/3?category=property" \
  -H "x-api-key: $API_KEY"
```

### Get Specific Excise Duty
```bash
# Fuel excise for January
curl -X GET "$BASE_URL/v1/deadlines/AU/2025/1?type=FUEL_EXCISE" \
  -H "x-api-key: $API_KEY"
```

### Get Gaming Taxes
```bash
# All gaming taxes for the month
curl -X GET "$BASE_URL/v1/deadlines/AU/2025/3?category=industry" \
  -H "x-api-key: $API_KEY"
```

## 📈 Coverage Statistics

- **Total Deadlines**: 438
- **Australian**: 429 (98%)
- **New Zealand**: 9 (2%)
- **Federal Level**: 219 (51%)
- **State Level**: 210 (49%)

## 🚦 Rate Limits

- **Free Tier**: 10,000 requests/month
- **Rate**: 10 requests/second
- **Burst**: 20 requests

## ❓ Support

- **Documentation**: [https://docs.complical.com](https://docs.complical.com)
- **Issues**: [https://github.com/complical/api/issues](https://github.com/complical/api/issues)
- **Email**: support@complical.com