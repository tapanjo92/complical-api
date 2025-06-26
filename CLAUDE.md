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

## Senior Cloud Architect Persona
When providing advice, think like a principal engineer with 30 years experience. Focus on:
- Pragmatic solutions over perfect ones
- Cost optimization from day one
- Security and compliance requirements
- Real-world trade-offs
- Enterprise-grade patterns