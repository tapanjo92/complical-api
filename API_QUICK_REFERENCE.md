# CompliCal API Quick Reference Card

## 🚀 Ultra-Simple Endpoint (Recommended)

### Base Format
```
GET /v1/deadlines/{country}/{year}/{month}
```

### Examples
```bash
# All deadlines for January 2025
GET /v1/deadlines/AU/2025/1

# Only tax deadlines (81% less data!)
GET /v1/deadlines/AU/2025/2?category=tax

# Only BAS deadlines
GET /v1/deadlines/AU/2025/2?type=BAS_QUARTERLY

# Payroll deadlines
GET /v1/deadlines/AU/2025/2?category=payroll
```

### Categories
- **tax**: BAS, GST, Income Tax, FBT
- **payroll**: PAYG, Payroll Tax, STP
- **compliance**: Annual Reviews, Workers Comp
- **super**: Super Guarantee, KiwiSaver
- **other**: Land Tax, Provisional Tax

## 📊 Response Format
```json
{
  "country": "AU",
  "year": 2025,
  "month": 2,
  "deadlines": [{
    "id": "au-bas-quarterly-2025-02-28",
    "name": "Q2 BAS Statement",
    "date": "2025-02-28",
    "type": "BAS_QUARTERLY",
    "agency": "ATO"
  }],
  "count": 1,
  "filters": { "type": "BAS_QUARTERLY" }
}
```

## 🔑 Authentication
```bash
# Include API key in header
x-api-key: YOUR_API_KEY_HERE
```

## 📈 Performance Impact
| Filter | Response Size | Speed |
|--------|--------------|-------|
| No filter | 2,219 bytes | 200ms |
| category=tax | 420 bytes | 50ms |
| type=BAS_QUARTERLY | 250 bytes | 40ms |

## 🌏 Countries
- **AU**: Australia
- **NZ**: New Zealand

## 📅 Date Format
- Year: 4 digits (2025)
- Month: 1-12 (both 1 and 01 work)
- Dates in responses: ISO format (YYYY-MM-DD)

## ⚡ One-Liner Examples
```bash
# Current month tax deadlines
curl -H "x-api-key: $KEY" \
  "https://api.complical.com/v1/deadlines/AU/$(date +%Y)/$(date +%-m)?category=tax"

# Next month payroll
curl -H "x-api-key: $KEY" \
  "https://api.complical.com/v1/deadlines/AU/$(date +%Y)/$(date -d 'next month' +%-m)?category=payroll"
```

## 🔗 Full Docs
https://docs.complical.com