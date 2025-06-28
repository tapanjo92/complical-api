# 🇳🇿 Current New Zealand Compliance Data

> What we currently have in the CompliCal database  
> Total: 9 deadlines | Last Updated: June 28, 2025

## 📋 Current NZ Deadlines

### 1️⃣ GST Returns - 3 types

| Type | Description | Frequency | Due Date | Count |
|------|-------------|-----------|----------|-------|
| `GST_MONTHLY` | GST Return (Monthly) | Monthly | 28th of following month | 1 |
| `GST_TWO_MONTHLY` | GST Return (2-Monthly) | Every 2 months | 28th after period | 1 |
| `GST_SIX_MONTHLY` | GST Return (6-Monthly) | Twice yearly | 28th after period | 1 |

**Who uses**:
- Monthly: Businesses with GST > $24 million
- 2-Monthly: Standard for most businesses
- 6-Monthly: Small businesses < $500k turnover

### 2️⃣ PAYE (Pay As You Earn) - 2 types

| Type | Description | Frequency | Due Date | Count |
|------|-------------|-----------|----------|-------|
| `PAYE` | Standard PAYE | Monthly | 20th of following month | 1 |
| `PAYE_LARGE_EMPLOYER` | Large Employer PAYE | Twice monthly | 5th and 20th | 1 |

**Who uses**:
- Standard: Most employers
- Large: Employers with PAYE > $500k annually

### 3️⃣ Income Tax - 2 types

| Type | Description | Due Date | Count |
|------|-------------|----------|-------|
| `PROVISIONAL_TAX_STANDARD` | Standard provisional tax | 3 installments | 1 |
| `INCOME_TAX_RETURN` | IR3 Individual return | July 7 | 1 |

**Missing provisional options**:
- We only have standard, missing ratio and AIM methods

### 4️⃣ Other Taxes - 2 types

| Type | Description | Frequency | Count |
|------|-------------|-----------|-------|
| `FBT_QUARTERLY` | Fringe Benefit Tax | Quarterly | 1 |
| `KIWISAVER` | KiwiSaver contributions | With PAYE | 1 |

---

## 📊 Data Structure Example

```json
{
  "type": "GST_TWO_MONTHLY",
  "name": "GST Return - 2 Monthly",
  "jurisdiction": "NZ",
  "agency": "IRD",
  "dueDate": "2025-02-28",
  "period": "Dec 2024 - Jan 2025",
  "applicableTo": ["gst_registered", "standard_filers"],
  "sourceUrl": "https://www.ird.govt.nz/gst/filing-and-paying",
  "filingRequirements": "File via myIR or paper return",
  "penalties": "Late filing penalty $250, plus 1% per month",
  "notes": "Can apply for extension if needed"
}
```

---

## 🔍 Coverage Analysis

### What We Cover ✅
- Basic GST compliance (all filing frequencies)
- Standard PAYE for most employers
- Basic income tax for individuals
- FBT and KiwiSaver basics

### Major Gaps ❌
- No ACC levies or returns
- No company tax returns
- No trust or estate obligations
- No excise duties
- No industry-specific compliance
- Missing many provisional tax options

### Quality Assessment
- **Completeness**: 18% (9 of ~50 potential)
- **Accuracy**: Based on 2024 rules
- **Relevance**: Covers most common obligations
- **Gaps**: Missing 80%+ of compliance landscape

---

## 🏢 Agency Coverage

| Agency | Have | Missing |
|--------|------|---------|
| **IRD** | 9 | ~35 |
| **ACC** | 0 | ~5 |
| **Companies Office** | 0 | ~3 |
| **MPI** | 0 | ~3 |
| **MBIE** | 0 | ~4 |
| **Total** | 9 | ~50 |

---

## 📈 Deadline Distribution

By frequency:
- **Monthly**: 2 (PAYE, GST monthly)
- **Bi-monthly**: 1 (GST 2-monthly)
- **Quarterly**: 1 (FBT)
- **Semi-annual**: 1 (GST 6-monthly)
- **Annual**: 4 (Income tax, provisional tax)
- **Other**: 0

By month (example deadlines):
- Most deadlines fall on 20th or 28th
- Tax returns due July 7
- Provisional tax has multiple dates

---

## ⚠️ Data Limitations

1. **Static Data**: Not connected to IRD systems
2. **Basic Coverage**: Only most common obligations
3. **No Variations**: Missing special circumstances
4. **Manual Updates**: Requires code changes
5. **No Validation**: Not verified against current law

---

> 📝 Note: This represents less than 20% of New Zealand compliance obligations. Suitable for basic reminders only.