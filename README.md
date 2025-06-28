# CompliCal API

**A trusted, developer-first API for government and compliance deadlines.**

> 🎯 **438 compliance deadlines** | 🇦🇺 **429 Australian** | 🇳🇿 **9 New Zealand** | ⚡ **Sub-second response**

## 1. The Core Problem

Businesses operate in a complex regulatory environment. They are required to meet hundreds of different deadlines for tax filings, license renewals, and other compliance obligations set by various government agencies. This information is critical but is often:

*   **Scattered** across dozens of non-standardized government websites.
*   **Presented** in non-machine-readable formats like PDFs and HTML tables.
*   **Subject to change** with little notice.

Failing to meet these deadlines results in direct financial penalties and significant business risk. Manually tracking this data is inefficient, error-prone, and does not scale.

## 2. The Solution: CompliCal

CompliCal solves this problem by providing a single, unified, and reliable source of truth for compliance deadlines, delivered via a clean and predictable REST API.

We handle the painful, ongoing work of sourcing, verifying, and maintaining this data, allowing developers and businesses to focus on their core products. We are a data-as-a-product company, and our product is trust.

### 📊 Coverage at a Glance

| Category | Federal | State | Total |
|----------|---------|-------|-------|
| **Tax & Revenue** | 185 | - | 185 |
| **Vehicle & Transport** | - | 96 | 96 |
| **Industry Specific** | - | 77 | 77 |
| **Compliance & Reporting** | 34 | 17 | 51 |
| **Employment & Fair Work** | 29 | - | 29 |
| **Total** | **219** | **210** | **438** |

## 3. Technology Stack

### Infrastructure as Code
*   **AWS CDK:** TypeScript-based infrastructure with type safety and testing
*   **Deployment:** CDK Pipelines with automated testing and rollback

### Backend
*   **Language:** TypeScript (Node.js 20.x runtime)
*   **API Framework:** Pure AWS SDK v3 with Lambda handlers
*   **Validation:** Zod for runtime type validation

### Data Storage
*   **Primary:** DynamoDB with single-table design
*   **Caching:** CloudFront with 5-minute TTL
*   **Search:** GSI for jurisdiction and date-based queries

### Security
*   **Authentication:** AWS Cognito + API Keys (SHA-256 hashed)
*   **Authorization:** Lambda custom authorizers with 5-minute cache
*   **Encryption:** At rest (DynamoDB) and in transit (TLS 1.2+)

## 4. Quick Start

### Get an API Key

```bash
# 1. Register
curl -X POST https://api.complical.com/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@company.com",
    "password": "SecurePass123!",
    "companyName": "Your Company"
  }'

# 2. Create API Key (use JWT from login)
curl -X POST https://api.complical.com/v1/auth/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "Production Key"}'
```

### Make Your First Request

```bash
# Ultra-simple endpoint - Get July 2025 Australian deadlines
curl -X GET https://api.complical.com/v1/deadlines/AU/2025/7 \
  -H "x-api-key: YOUR_API_KEY"
```

### Filter by Category

```bash
# Get only vehicle-related deadlines
curl -X GET https://api.complical.com/v1/deadlines/AU/2025/7?category=vehicle \
  -H "x-api-key: YOUR_API_KEY"
```

## 5. API Endpoints

### 🎯 Ultra-Simple Endpoint (Recommended)
```
GET /v1/deadlines/{country}/{year}/{month}
```

**Query Parameters:**
- `type`: Filter by specific deadline type
- `category`: Filter by category (tax, payroll, vehicle, property, etc.)

### 📊 Available Categories

| Category | Description | Example Deadlines |
|----------|-------------|-------------------|
| `tax` | Federal & income taxes | BAS, GST, Excise |
| `payroll` | Employment taxes | PAYG, Payroll Tax |
| `vehicle` | Vehicle-related | Registration, Stamp Duty |
| `property` | Property taxes | Land Tax, Stamp Duty |
| `industry` | Industry-specific | Mining, Gaming |

## 6. Example Response

```json
{
  "country": "AU",
  "year": 2025,
  "month": 7,
  "deadlines": [
    {
      "id": "abc123",
      "name": "NSW Vehicle Registration Renewal",
      "date": "2025-07-15",
      "type": "VEHICLE_REGO_NSW",
      "agency": "SERVICE_NSW"
    }
  ],
  "count": 8,
  "filters": {
    "category": "vehicle"
  }
}
```

## 7. Documentation

- 📚 [API Documentation](./API_DOCUMENTATION.md)
- 🧪 [API Testing Guide](./docs/API_TESTING_GUIDE_V2.md)
- 📊 [Data Coverage Report](./docs/DATA_COVERAGE.md)
- 🚀 [Deployment Guide](./DEPLOYMENT_GUIDE.md)

## 8. Rate Limits

- **Free Tier:** 10,000 requests/month
- **Rate:** 10 requests/second
- **Burst:** 20 requests

## 9. Support

- **Email:** support@complical.com
- **GitHub:** [github.com/complical/api](https://github.com/complical/api)
- **Status:** [status.complical.com](https://status.complical.com)