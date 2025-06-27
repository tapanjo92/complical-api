# CompliCal API Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Create an Account
```bash
curl -X POST "https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "YourSecurePassword123!",
    "companyName": "Your Company Name"
  }'
```

### 2. Login to Get Access Token
```bash
curl -X POST "https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "YourSecurePassword123!"
  }'
```

Save the `idToken` from the response.

### 3. Create Your API Key
```bash
ID_TOKEN="<your-id-token-from-login>"

curl -X POST "https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev/v1/auth/api-keys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -d '{
    "name": "My First API Key",
    "description": "Development key",
    "expiresIn": 90
  }'
```

⚠️ **IMPORTANT**: Save the `apiKey` from the response immediately! You won't be able to see it again.

### 4. Make Your First API Call
```bash
API_KEY="<your-api-key-from-step-3>"

# Get Australian compliance deadlines
curl -X GET "https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev/v1/au/ato/deadlines?limit=5" \
  -H "x-api-key: $API_KEY"
```

## 📊 Response Example
```json
{
  "deadlines": [
    {
      "id": "au-payroll-tax-act-2025-01-14",
      "type": "PAYROLL_TAX_ACT",
      "name": "ACT Payroll Tax - December 2024",
      "description": "Monthly payroll tax return",
      "dueDate": "2025-01-14",
      "jurisdiction": "AU",
      "agency": "ACT Revenue Office",
      "applicableTo": ["ACT employers exceeding threshold"]
    }
  ],
  "count": 5,
  "nextToken": "eyJ..."
}
```

## 🔑 Understanding API Keys vs API Key IDs

| What | API Key | API Key ID |
|------|---------|------------|
| **Purpose** | Authentication credential | Management identifier |
| **Example** | `CWyCxw4ESM6H67ucncHiF9Xi4XKUYv3x6LdvUNZZ` | `l5x4tkmqoi` |
| **Usage** | In `x-api-key` header | In management endpoints |
| **Secret?** | YES - Never share! | No - Safe to share |

## 🌍 Available Endpoints

### Ultra-Simple Endpoint (NEW! Recommended)
- `/v1/deadlines/{country}/{year}/{month}` - Cleanest API design
  - Example: `/v1/deadlines/AU/2025/1` for January 2025

### Traditional Endpoints (RESTful)
- `/v1/au/ato/deadlines` - Australian deadlines
- `/v1/nz/ird/deadlines` - New Zealand deadlines

### Simplified Global Endpoint
- `/v1/deadlines?country=AU` - Calendarific-style API

## 🎯 Common Use Cases

### Ultra-Simple: Get Monthly Deadlines
```bash
# All January 2025 deadlines for Australia
curl -X GET "https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev/v1/deadlines/AU/2025/1" \
  -H "x-api-key: $API_KEY"

# Only tax deadlines for February
curl -X GET "https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev/v1/deadlines/AU/2025/2?category=tax" \
  -H "x-api-key: $API_KEY"

# Only BAS deadlines for March
curl -X GET "https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev/v1/deadlines/AU/2025/3?type=BAS_QUARTERLY" \
  -H "x-api-key: $API_KEY"
```

### Get Upcoming Deadlines (Next 7 Days)
```bash
curl -X GET "https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev/v1/au/ato/deadlines?from_date=$(date +%Y-%m-%d)&to_date=$(date -d '+7 days' +%Y-%m-%d)" \
  -H "x-api-key: $API_KEY"
```

### Filter by Category (NEW!)
```bash
# Get all payroll-related deadlines
curl -X GET "https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev/v1/deadlines/AU/2025/2?category=payroll" \
  -H "x-api-key: $API_KEY"
```

## 📈 Usage Limits
- **Rate Limit**: 10 requests/second
- **Burst Limit**: 20 requests
- **Monthly Quota**: 10,000 requests (free tier)

## 🛠️ Troubleshooting

### 403 Forbidden
- Check your API key is correct
- Ensure you're using the API key, not the API key ID
- Verify the key hasn't expired

### 400 Bad Request
- Check date format (YYYY-MM-DD)
- Verify deadline type is valid
- Ensure query parameters are properly encoded

## 📚 Next Steps
- Read the [full API documentation](./API_DOCUMENTATION.md)
- Check out [example integrations](./examples/)
- Join our [developer community](https://complical.com/community)

## 🆘 Need Help?
- Email: support@complical.com
- GitHub Issues: https://github.com/complical/api/issues
- API Status: https://status.complical.com