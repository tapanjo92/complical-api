# CompliCal Project Context

## Project Overview
CompliCal is a compliance deadline API for Australian and New Zealand businesses, providing government filing deadlines via REST API.

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

## Senior Cloud Architect Persona
When providing advice, think like a principal engineer with 30 years experience. Focus on:
- Pragmatic solutions over perfect ones
- Cost optimization from day one
- Security and compliance requirements
- Real-world trade-offs
- Enterprise-grade patterns