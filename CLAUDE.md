# CompliCal Project Context

## Project Overview
CompliCal is a compliance deadline API for Australian and New Zealand businesses, providing government filing deadlines via REST API.

## Progress Status
- ✅ Phase 0: Skipped (MVP approach - validate with working product)
- ✅ Phase 1.1: Foundational Setup - COMPLETE
- ✅ Phase 1.2: Data Sourcing & Ingestion - COMPLETE
- ✅ Phase 1.3: API Development & Deployment - COMPLETE
- ✅ Phase 1.4: Critical Fixes - COMPLETE
  - Removed hardcoded AWS account ID
  - Created unit tests (3/4 passing)
  - Fixed CORS to restrict to specific domains
  - Created .env.example file
- ✅ Phase 1.5: Go-to-Market Prep - COMPLETE
  - Created OpenAPI/Swagger documentation
  - Integrated Stripe billing with subscription tiers
  - Built Next.js frontend with landing page
  - Created developer portal with dashboard and API key management
- ⏳ Phase 1.6: Monitoring & Reliability - NEXT

## Key Architecture Decisions

### Technology Stack (LOCKED IN)
- **Infrastructure:** AWS CDK with TypeScript
- **Backend:** TypeScript/Node.js 20.x Lambda functions
- **Frontend:** Next.js 14 with Tailwind CSS + shadcn/ui
- **Database:** DynamoDB with GSIs for efficient querying
- **Authentication:** AWS Cognito (User Pools + Identity Pools)
- **Scraping:** Playwright + Cheerio

### AWS Services (CONFIRMED)
- API Gateway REST (not HTTP API) for usage plans
- Lambda with Node.js runtime
- DynamoDB with on-demand billing
- Cognito for M2M OAuth 2.0 authentication
- Step Functions for scraping orchestration
- CloudFront for API caching
- X-Ray for distributed tracing
- WAF for security

### Project Structure
```
├── infrastructure/     # CDK TypeScript
├── backend/           # Lambda functions
├── frontend/          # Next.js developer portal
└── shared/            # Shared types
```

### Key URLs to Scrape
- ATO: https://www.ato.gov.au/tax-and-super-professionals/lodgment-program/important-dates
- IRD: https://www.ird.govt.nz/key-dates
- ASIC: https://asic.gov.au/for-business/running-a-company/annual-statements/

### Critical Implementation Notes
1. Phase 0 (Legal/Market validation) must happen first
2. MVP timeline: 3-4 months (not 1-2)
3. E&O insurance required before launch
4. Implement billing in Phase 1, not Phase 2
5. All data must include source attribution
6. Strong disclaimers about data accuracy

### Testing Commands
```bash
npm test                    # Run all tests
cd infrastructure && cdk diff  # Check infrastructure changes
cd backend && npm run test     # Backend unit tests
```

### Deployment
```bash
cd infrastructure
npm run cdk deploy --all
```

### API Testing
```bash
# Health check (no auth)
curl https://i2wgl7t4za.execute-api.ap-south-1.amazonaws.com/dev/health

# Deadlines endpoint (requires auth)
curl -H "Authorization: Bearer <token>" https://i2wgl7t4za.execute-api.ap-south-1.amazonaws.com/dev/v1/au/ato/deadlines
```

## Phase 1.1 Accomplishments
- Created TypeScript monorepo with npm workspaces
- Set up CDK infrastructure with TypeScript
- Deployed to AWS account 809555764832 in ap-south-1 (Mumbai)
- Created DynamoDB table with GSIs for efficient querying
- Deployed API Gateway with health check endpoint
- API URL: https://rp1qwpmuy5.execute-api.ap-south-1.amazonaws.com/dev/

## Phase 1.2 Accomplishments
- Built backend package with TypeScript/ESM modules
- Created ATO scraper using Playwright/Cheerio (static data for MVP)
- Implemented Zod validation for data quality
- Successfully seeded 22 ATO deadlines into DynamoDB
- Created proper key structure for multiple access patterns:
  - By deadline type: PK = "DEADLINE#BAS_QUARTERLY"
  - By jurisdiction: GSI1PK = "JURISDICTION#AU"
  - By date: GSI2PK = "DATE#2024-03"

## Phase 1.3 Accomplishments
- Restructured CDK into three separate stacks (Data, Auth, API)
- Implemented Cognito User Pool with OAuth 2.0 machine-to-machine auth
- Created Lambda handlers for deadlines API with query parameters
- Built JWT authorizer for API Gateway authentication
- Deployed complete REST API with proper routing
- Successfully tested health and auth endpoints

## Phase 1.4 Accomplishments
- Removed hardcoded AWS account ID from cdk.json for security
- Created unit tests for Lambda handler (3/4 tests passing)
- Fixed CORS configuration to restrict to specific domains
- Created .env.example file for environment variables

## Phase 1.5 Accomplishments
- Created comprehensive OpenAPI/Swagger documentation
- Built Stripe billing integration with three subscription tiers
- Developed Next.js landing page with features and code examples
- Built developer portal with:
  - Dashboard showing API usage and subscription status
  - API key management with create/revoke functionality
  - Authentication pages with Cognito integration
  - Responsive UI with Tailwind CSS

## Current State
- Infrastructure: ✅ Deployed and operational (3 stacks)
- Database: ✅ Populated with 22 real ATO deadlines
- API Endpoints: ✅ Live at https://i2wgl7t4za.execute-api.ap-south-1.amazonaws.com/dev/
- Authentication: ✅ Cognito OAuth 2.0 with JWT authorizer
- Health Check: ✅ Working at /health endpoint
- Deadlines API: ✅ Protected endpoint at /v1/au/ato/deadlines
- API Documentation: ✅ OpenAPI spec at /packages/backend/src/api/openapi.yaml
- Billing Integration: ✅ Stripe handler with 3 tiers (Developer/Professional/Enterprise)
- Frontend: ✅ Next.js app with landing page and developer portal
- Developer Dashboard: ✅ Dashboard, API key management, login pages

## Deployment Details
- API Gateway ID: i2wgl7t4za
- Cognito User Pool ID: ap-south-1_BtXXs77zt
- Cognito Client ID: 64pq56h3al1l1r7ehfhflgujib
- DynamoDB Table: complical-deadlines-dev

## Frontend Deployment (2025-06-26)
- **Deployment Method**: CloudFront + S3 (static export)
- **CloudFront URL**: https://d2xoxkdqlbm2pj.cloudfront.net
- **S3 Buckets**: 
  - Frontend: `complical-frontend-dev-809555764832`
  - Logs: `complical-frontend-logs-dev-809555764832`
- **CloudFront Logging**: Enabled to S3 bucket with 30-day retention
- **Status**: 🔄 UPDATING (fixing 403 error with S3Origin configuration)

### Frontend Configuration
- Next.js 14 with static export (`output: 'export'`)
- CloudFront Origin Access Identity (OAI) for S3 access
- Error pages redirect to index.html for client-side routing
- Configuration loaded from `/config.js` at runtime

### Recent Issues & Fixes
1. **Amplify Deployment**: Initially attempted, removed per user request
2. **403 Forbidden**: Fixed by updating S3Origin with OAI configuration
3. **CloudFront Logging**: Fixed ACL issues with proper bucket policy
4. **API Key Authorization (2025-06-26)**: 
   - Issue: API keys returned 403 Forbidden even when valid
   - Root cause: Keys weren't associated with usage plans due to CDK circular dependency
   - Solution: Store usage plan ID in SSM Parameter Store, Lambda reads it to associate keys
   - Script created: `/scripts/associate-api-keys.sh` to associate existing keys
5. **Rate Limiting**: 
   - Configured: 10 req/sec rate limit, 20 req burst, 10k/month quota
   - All API keys now properly associated with free tier usage plan
6. **User Authentication Flow**:
   - Traditional email/password registration via Cognito
   - JWT tokens for dashboard access (1 hour expiry)
   - API keys for API access (no expiry unless manually revoked)

## Latest Updates (2025-06-26 Evening)

### Pagination Implementation
- Added pagination support to deadlines API endpoints
- Query parameter `nextToken` for continuing result sets
- Base64-encoded pagination tokens for security
- Works for both AU and NZ jurisdictions
- Tested and working with `?limit=X&nextToken=Y` parameters

### Real Compliance Data Loaded
- **Australia (12 deadlines)**: BAS Quarterly/Monthly, PAYG Withholding, Super Guarantee, Income Tax, FBT
- **New Zealand (9 deadlines)**: GST Monthly/2-Monthly, PAYE, Provisional Tax, IR3, FBT Quarterly, KiwiSaver
- Data sourced from official government websites (ATO and IRD)
- Script: `/packages/infrastructure/scripts/load-real-deadlines.js`

### Security Testing Progress
✅ **Authentication & Authorization**
- API requires valid API key (403 without key)
- Protected endpoints require JWT token (401 without auth)
- Invalid credentials properly rejected

✅ **Injection Vulnerabilities**
- NoSQL injection attempts blocked by input validation
- SQL injection attempts rejected with 400 errors
- Path traversal in nextToken parameter prevented
- Malformed JSON in registration rejected

✅ **Security Headers**
- All security headers properly configured:
  - Strict-Transport-Security (HSTS)
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Content-Security-Policy
  - Referrer-Policy: strict-origin-when-cross-origin
- CORS restricted to allowed origins only

✅ **Rate Limiting (Partial)**
- Usage plans configured: 10 req/s, burst 20, 10k/month
- Testing shows very permissive limits (needs investigation)
- All API keys associated with free tier plan

### Pending Security Tests
- [ ] Cryptographic implementations review
- [ ] Input validation edge cases
- [ ] API key security (rotation, storage)
- [ ] Infrastructure security (IAM policies, network isolation)

### API Endpoints
- **Australia**: `/v1/au/ato/deadlines`
- **New Zealand**: `/v1/nz/ird/deadlines`
- Both support: `type`, `from_date`, `to_date`, `limit`, `nextToken`

### Testing Commands
```bash
# Test with pagination
curl -X GET "https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev/v1/au/ato/deadlines?limit=3" \
  -H "x-api-key: YOUR_API_KEY"

# Test NZ endpoints
curl -X GET "https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev/v1/nz/ird/deadlines" \
  -H "x-api-key: YOUR_API_KEY"
```

## Latest Session Update (2025-06-26 Night)

### Comprehensive Australian Data Loading
- Loaded 82 new Australian compliance deadlines (51 + 31)
- Total Australian deadlines now: 94 (was 12)
- Created scripts: 
  - `/packages/infrastructure/scripts/load-comprehensive-au-data.js` (Federal + NSW/VIC/QLD)
  - `/packages/infrastructure/scripts/load-remaining-states-payroll.js` (SA/WA/TAS/NT/ACT)

### Data Coverage Summary

#### Federal Coverage (44 deadlines) ✅
- **ATO**: BAS (14), PAYG Withholding (8), Super (7), Income Tax (2), Company Tax (1), FBT (3), PAYG Instalments (2), STP (1), TPAR (1)
- **ASIC**: Annual Company Reviews (3 examples)

#### State Coverage (50 deadlines) ✅
- **NSW**: 8 deadlines (Payroll Tax 6, Land Tax 1, Workers Comp 1)
- **Victoria**: 7 deadlines (Payroll Tax 6, Land Tax 1)
- **Queensland**: 6 deadlines (Payroll Tax 6)
- **South Australia**: 6 deadlines (Payroll Tax 6)
- **Western Australia**: 6 deadlines (Payroll Tax 6)
- **Tasmania**: 6 deadlines (Payroll Tax 6)
- **Northern Territory**: 6 deadlines (Payroll Tax 6)
- **ACT**: 7 deadlines (Payroll Tax 7)
- **All States Covered**: 100% payroll tax coverage achieved

#### State Tax Thresholds
- **NSW**: $1.2M annually
- **VIC**: $900K annually ($75K monthly)
- **QLD**: $1.3M annually
- **SA**: $1.5M annually
- **WA**: $1M annually
- **TAS**: $1.25M annually
- **NT**: $1.5M (increasing to $2.5M from July 2025)
- **ACT**: $2M annually (surcharges for >$50M businesses)

### Technical Updates
- Extended `DeadlineType` enum to support 38 types (added 10 new state payroll types)
- Added new agencies: Revenue NSW, SRO VIC, QRO, RevenueSA, RevenueWA, SRO Tasmania, Territory Revenue Office, ACT Revenue Office, icare NSW
- Updated Lambda handlers to recognize new types
- Created two data loading scripts:
  - `/packages/infrastructure/scripts/load-comprehensive-au-data.js` (51 deadlines)
  - `/packages/infrastructure/scripts/load-remaining-states-payroll.js` (31 deadlines)
- Deployed changes to production

### Security Analysis Completed
- ✅ Authentication & Authorization: Properly implemented
- ✅ Injection Protection: Input validation working
- ✅ Security Headers: All configured correctly
- ✅ Encryption: At rest and in transit
- ⚠️ IAM Permissions: Some wildcard resources need scoping
- ⚠️ Secrets Management: Should use AWS Secrets Manager
- ⚠️ Network: No VPC isolation

### Pending Work
**Phase 1.6 (Monitoring & Reliability)**
- AWS X-Ray tracing
- CloudWatch dashboards
- EventBridge scheduled scraping
- Step Functions orchestration
- CloudFront caching
- WAF implementation

**Data Expansion Needed**
- 5 missing states/territories
- Stamp duty, vehicle taxes, insurance levies
- Industry-specific deadlines
- Fair Work compliance

## Senior Cloud Architect Persona
When providing advice, think like a principal engineer with 30 years experience. Focus on:
- Pragmatic solutions over perfect ones
- Cost optimization from day one
- Security and compliance requirements
- Real-world trade-offs
- Enterprise-grade patterns