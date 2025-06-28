# 📋 New Zealand Compliance Type List

> Current and potential deadline types for NZ  
> Last Updated: June 28, 2025

## ✅ Current Types (9 implemented)

### GST Types
```
GST_MONTHLY              - GST Return (Turnover > $24M)
GST_TWO_MONTHLY         - GST Return (Standard)
GST_SIX_MONTHLY         - GST Return (Small business)
```

### PAYE Types
```
PAYE                    - Standard PAYE (Monthly)
PAYE_LARGE_EMPLOYER     - Large Employer PAYE (Twice monthly)
```

### Income Tax Types
```
PROVISIONAL_TAX_STANDARD - Standard method provisional tax
INCOME_TAX_RETURN       - IR3 Individual return
```

### Other Current Types
```
FBT_QUARTERLY           - Fringe Benefit Tax (Quarterly)
KIWISAVER              - KiwiSaver employer contributions
```

---

## ❌ Missing Types (~40 to implement)

### ACC Types (5)
```
ACC_LEVY_INVOICE        - Annual workplace safety levy
ACC_COVERPLUS_EXTRA     - Self-employed provisional payments
ACC_EXPERIENCE_RATING   - Large employer adjustments
ACC_RESIDUAL_CLAIMS     - Residual claims levy
ACC_SAFETY_DISCOUNT     - Workplace safety discount program
```

### Company & Trust Types (8)
```
COMPANY_ANNUAL_RETURN   - Companies Office annual return
COMPANY_TAX_RETURN      - IR4 Company income tax
FINANCIAL_STATEMENTS    - Large company reporting
TRUST_TAX_RETURN        - IR6 Trust return
ESTATE_TAX_RETURN       - IR44 Estate return
PARTNERSHIP_RETURN      - IR7 Partnership return
CHARITY_RETURN          - Charity annual return
FMC_REPORTING          - Financial Markets Conduct
```

### Employment Types (6)
```
EMPLOYMENT_INFORMATION  - Monthly EI return (new)
PARENTAL_LEAVE_PAYMENTS - Employer reimbursements
STUDENT_LOAN_EXTRA      - Extra deductions
CHILD_SUPPORT           - Employer deductions
SCHEDULAR_PAYMENTS      - Contractor withholding
HOLIDAY_PAY_LEVY        - Holiday pay calculations
```

### Provisional Tax Variations (4)
```
PROVISIONAL_TAX_RATIO   - Ratio method
PROVISIONAL_TAX_AIM     - Accounting Income Method
PROVISIONAL_TAX_VOLUNTARY - Voluntary payments
TAX_POOLING            - Tax pool deposits
```

### Withholding Taxes (5)
```
RWT                    - Resident Withholding Tax
NRWT                   - Non-Resident Withholding Tax
AIL                    - Approved Issuer Levy
RLWT                   - Residential Land Withholding Tax
CONTRACTOR_WITHHOLDING - Schedular payment withholding
```

### Excise & Duties (6)
```
ALCOHOL_EXCISE         - Alcohol excise returns
TOBACCO_EXCISE_NZ      - Tobacco excise returns
FUEL_EXCISE_NZ         - Petroleum fuel excise
GAMING_DUTY            - Gaming machine duty
BETTING_DUTY           - Racing and sports betting
CUSTOMS_DUTY           - Import duties
```

### Property & Investment (4)
```
BRIGHT_LINE_TAX        - Property speculation tax
PORTFOLIO_INVESTMENT   - PIE tax obligations
FOREIGN_INVESTMENT     - FIF obligations
RENTAL_INCOME          - Residential rental returns
```

### Environmental & Regional (4)
```
ETS_OBLIGATIONS        - Emissions Trading Scheme
WASTE_LEVY_NZ          - Waste disposal levy
REGIONAL_FUEL_TAX      - Auckland fuel tax
LOCAL_GOVT_RATES       - Council rates
```

### Industry Specific (4)
```
PRIMARY_SECTOR_LEVIES  - Agricultural levies
TOURISM_LEVY           - International visitor levy
FISHERIES_QUOTA        - Quota management fees
BIOSECURITY_LEVY       - Import biosecurity
```

---

## 🏢 Agency Breakdown

### IRD Types
- Current: 9
- Missing: 30
- Total potential: 39

### ACC Types
- Current: 0
- Missing: 5
- Total potential: 5

### Companies Office
- Current: 0
- Missing: 3
- Total potential: 3

### Other Agencies
- Current: 0
- Missing: 9
- Total potential: 9

---

## 📐 Type Naming Convention

### Pattern: `{CATEGORY}_{SUBCATEGORY}_{MODIFIER}`

Examples:
- `GST_MONTHLY` - Category: GST, Modifier: Monthly
- `PROVISIONAL_TAX_RATIO` - Category: Provisional Tax, Modifier: Ratio
- `ACC_LEVY_INVOICE` - Category: ACC, Subcategory: Levy Invoice

### Proposed Prefixes:
- **GST_** - Goods and Services Tax
- **PAYE_** - Pay As You Earn
- **ACC_** - Accident Compensation
- **FBT_** - Fringe Benefit Tax
- **RWT_** - Resident Withholding Tax
- **ETS_** - Emissions Trading Scheme

---

## 🎯 Implementation Priority

### Must Have (20 types)
All business essentials:
- ACC levies
- Company returns
- Core tax types
- Employment obligations

### Should Have (15 types)
Industry and special cases:
- Excise duties
- Withholding variations
- Property taxes
- Environmental

### Nice to Have (5 types)
Edge cases:
- Regional taxes
- Minor levies
- Special sectors

---

> 📝 Note: Type names should align with official IRD terminology where possible for clarity and searchability.