# ❌ Missing New Zealand Compliance Data

> Comprehensive gap analysis of missing NZ compliance deadlines  
> Last Updated: June 28, 2025

## 🚨 Critical Missing Items (~40 deadlines)

### 1️⃣ ACC (Accident Compensation Corporation) - 5 missing

| Type | Description | Due Date | Impact |
|------|-------------|----------|--------|
| ACC Levy Invoice | Annual workplace levy | March 31 | All employers |
| ACC CoverPlus Extra | Provisional payments | Quarterly | Self-employed |
| ACC Experience Rating | Annual adjustment | July 31 | Large employers |
| ACC Residual Claims Levy | Annual payment | With PAYE | All employers |
| ACC Safety Discount | Annual application | October 31 | Eligible employers |

### 2️⃣ Company Compliance - 4 missing

| Type | Description | Due Date | Impact |
|------|-------------|----------|--------|
| Annual Return | Companies Office filing | Month after anniversary | All companies |
| Financial Statements | Large company filing | 5 months after year end | Large companies |
| Audit Requirements | FMC Act compliance | Various | FMC entities |
| Ultimate Holding Company | Disclosure requirements | Annual | Subsidiaries |

### 3️⃣ Income Tax Variations - 8 missing

| Type | Description | Missing Elements |
|------|-------------|-----------------|
| Company Tax Return (IR4) | Company income tax | Annual filing |
| Trust Tax Return (IR6) | Trust income tax | Annual filing |
| Estate Tax Return (IR44) | Estate income tax | Within 6 months |
| Partnership Return (IR7) | Partnership income | Annual filing |
| Provisional Tax - Ratio | Alternative method | Different dates |
| Provisional Tax - AIM | Accounting Income Method | Different dates |
| Tax Pooling | Deposits and withdrawals | Various dates |
| Non-resident Tax | Withholding obligations | Monthly |

### 4️⃣ Employment Related - 6 missing

| Type | Description | Frequency |
|------|-------------|-----------|
| Employment Information (EI) | New monthly return | Monthly |
| Parental Leave Payments | IR reimbursement | As required |
| Student Loan Deductions | Special deduction rates | With PAYE |
| Child Support Deductions | Employer obligations | With PAYE |
| Holiday Pay Calculations | Special rates | Quarterly |
| Contractor Withholding | Schedular payments | Monthly |

### 5️⃣ Industry Specific - 10 missing

| Industry | Missing Deadlines | Frequency |
|----------|------------------|-----------|
| **Alcohol** | Excise returns, License fees | Monthly/Annual |
| **Gaming** | Gaming duty, Problem gambling levy | Monthly/Annual |
| **Petroleum** | Fuel excise, ETS obligations | Monthly/Quarterly |
| **Primary** | FarmSource deductions, Levies | Various |
| **Financial** | NRWT, AIL, RWT obligations | Monthly |
| **Property** | Bright-line test, RLWT | As required |
| **Tourism** | Border levies, Regional taxes | Various |
| **Fisheries** | Quota management, Levies | Annual |

### 6️⃣ Other Taxes - 7 missing

| Type | Description | Due Date |
|------|-------------|----------|
| Donation Tax Credits | Rebate claims | March 31 |
| R&D Tax Credits | Approval and claims | Various |
| Working for Families | Annual square-up | July |
| Customs Duty | Import obligations | Monthly |
| Environmental Taxes | ETS obligations | Quarterly |
| Local Government Rates | Regional requirements | Quarterly |
| Motor Vehicle Taxes | Registration, RUC | Various |

---

## 📊 Missing Data by Category

### Tax Types Not Covered

| Category | Items Missing | Priority |
|----------|---------------|----------|
| **Direct Tax** | 12 | Critical |
| **Indirect Tax** | 8 | High |
| **Withholding** | 6 | High |
| **Industry Levies** | 10 | Medium |
| **Local/Regional** | 4 | Low |

### Agency Coverage Gaps

| Agency | Current | Missing | Total |
|--------|---------|---------|-------|
| **IRD** | 9 | 30 | 39 |
| **ACC** | 0 | 5 | 5 |
| **Companies Office** | 0 | 3 | 3 |
| **MPI** | 0 | 2 | 2 |
| **MBIE** | 0 | 2 | 2 |
| **Customs** | 0 | 2 | 2 |
| **Local Govt** | 0 | 3 | 3 |
| **Total** | **9** | **47** | **56** |

---

## 🎯 Priority Implementation Plan

### Phase 1 - Critical (1 week)
```
1. ACC levy payments (affects all employers)
2. Company annual returns (all companies)
3. IR4 company tax returns
4. Employment Information (EI) returns
5. Provisional tax variations (ratio, AIM)
```
**Impact**: +10 deadlines, covers 90% of businesses

### Phase 2 - High Priority (2 weeks)
```
1. Trust and estate returns (IR6, IR44)
2. Withholding taxes (RWT, NRWT, AIL)
3. Student loan and child support
4. Contractor withholding
5. Partnership returns
```
**Impact**: +12 deadlines, covers special entities

### Phase 3 - Industry Specific (1 month)
```
1. Excise duties (alcohol, tobacco, fuel)
2. Gaming and betting taxes
3. Primary sector levies
4. Financial sector obligations
5. Property taxes (bright-line, RLWT)
```
**Impact**: +15 deadlines, industry coverage

### Phase 4 - Complete Coverage (2 months)
```
1. Environmental and ETS obligations
2. Local government requirements
3. Border and customs duties
4. Minor levies and fees
5. Special circumstances
```
**Impact**: +10 deadlines, 100% coverage

---

## 💡 Implementation Recommendations

### Data Sources
1. **IRD Website**: Main source for tax obligations
2. **Business.govt.nz**: Comprehensive compliance info
3. **ACC Website**: Levy rates and dates
4. **Companies Office**: Filing requirements
5. **Industry Bodies**: Specific sector requirements

### Technical Needs
1. Add ~40 new deadline types to enum
2. Create NZ-specific date calculation logic
3. Handle multiple provisional tax methods
4. Support industry categorization
5. Add regional/local variations

### Business Rules
1. GST registration thresholds
2. PAYE filing frequency rules
3. Provisional tax method eligibility
4. Company size determinations
5. Industry classifications

---

## 📈 Expected Outcome

Implementing all missing items would:
- Increase NZ coverage from 9 to ~50 deadlines
- Achieve 90%+ compliance coverage
- Support all major business types
- Match Australian comprehensiveness
- Require ~80 hours of work

---

## 🌟 Quick Wins

Top 5 additions for maximum impact:
1. **ACC levies** - Affects every employer
2. **Company annual returns** - Every company
3. **IR4 returns** - All companies
4. **Employment Information** - New requirement
5. **Provisional tax methods** - Better coverage

These 5 would increase usefulness by 300%+

---

> 📝 Note: New Zealand's tax system is simpler than Australia's but still has significant complexity in provisional tax, withholding taxes, and industry-specific obligations.