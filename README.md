# CompliCal API

**A trusted, developer-first API for government and compliance deadlines.**

## 1. The Core Problem

Businesses operate in a complex regulatory environment. They are required to meet hundreds of different deadlines for tax filings, license renewals, and other compliance obligations set by various government agencies. This information is critical but is often:

*   **Scattered** across dozens of non-standardized government websites.
*   **Presented** in non-machine-readable formats like PDFs and HTML tables.
*   **Subject to change** with little notice.

Failing to meet these deadlines results in direct financial penalties and significant business risk. Manually tracking this data is inefficient, error-prone, and does not scale.

## 2. The Solution: CompliCal

CompliCal solves this problem by providing a single, unified, and reliable source of truth for compliance deadlines, delivered via a clean and predictable REST API.

We handle the painful, ongoing work of sourcing, verifying, and maintaining this data, allowing developers and businesses to focus on their core products. We are a data-as-a-product company, and our product is trust.

## 3. Technology Stack

### Infrastructure as Code
*   **AWS CDK:** TypeScript-based infrastructure with type safety and testing
*   **Deployment:** CDK Pipelines with automated testing and rollback

### Backend
*   **Language:** TypeScript (Node.js 20.x runtime)
*   **API Framework:** Pure AWS SDK v3 with Lambda handlers
*   **Validation:** Zod for runtime type validation
*   **Web Scraping:** Playwright (headless browser) + Cheerio (HTML parsing)
*   **Testing:** Vitest with AWS SDK mocks
*   **Database Access:** DynamoDB DocumentClient with type-safe wrappers
*   **Authentication:** API Keys with SHA-256 hashing + JWT tokens via Cognito
*   **Usage Tracking:** API Gateway Access Logs + Async Lambda processing

### Frontend (Developer Portal)
*   **Framework:** Next.js 14 with App Router
*   **Styling:** Tailwind CSS + shadcn/ui components
*   **Authentication:** NextAuth.js with AWS Cognito provider
*   **API Client:** Auto-generated from OpenAPI specification
*   **Deployment:** Vercel or AWS Amplify Hosting

## 4. Quick Start

```bash
# 1. Register
curl -X POST "https://api.complical.com/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "SecurePass123!", "companyName": "Your Co"}'

# 2. Login and get token
curl -X POST "https://api.complical.com/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "SecurePass123!"}'

# 3. Create API key (use idToken from login)
curl -X POST "https://api.complical.com/v1/auth/api-keys" \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Production Key"}'

# 4. Use the API - Ultra-Simple Way (NEW!)
curl -X GET "https://api.complical.com/v1/deadlines/AU/2025/1" \
  -H "x-api-key: YOUR_API_KEY"

# 4b. With Smart Filtering (81% less data)
curl -X GET "https://api.complical.com/v1/deadlines/AU/2025/1?category=tax" \
  -H "x-api-key: YOUR_API_KEY"
```

See [API Quick Start Guide](./API_QUICKSTART.md) for detailed instructions.

## 5. Architectural Principles

This project is built on a foundation of modern cloud architecture designed for scalability, reliability, and low operational cost.

*   **Serverless-First:** All compute and infrastructure is provisioned using serverless technologies (AWS Lambda, API Gateway, DynamoDB). This eliminates idle costs and scales seamlessly from zero to millions of requests.
*   **Data is the Product:** Our primary asset is the accuracy and timeliness of our data. Our architecture prioritizes data verification, provides audit trails for every data point (i.e., links to the source), and is built around a robust data ingestion and quality assurance pipeline.
*   **Developer-Centric:** The API is designed for the developer experience. It is predictable, well-documented, and follows RESTful best practices. We provide clear request/response schemas and sensible error messages.
*   **Infrastructure as Code (IaC):** The entire infrastructure is defined in code (using AWS SAM or Terraform). This ensures reproducibility, enables automated deployments, and eliminates manual configuration errors.
*   **Automate Everything:** From CI/CD pipelines to data ingestion and monitoring, we automate relentlessly to ensure a lean operational footprint.

## 5. Security & Compliance

*   **Authentication:** OAuth 2.0/JWT for enterprise customers, API keys for developer tier
*   **Encryption:** TLS 1.3 in transit, AES-256 at rest (DynamoDB encryption)
*   **Rate Limiting:** Token bucket algorithm via API Gateway (100/min default, customizable by tier)
*   **Compliance Roadmap:** SOC 2 Type II certification planned for Year 1
*   **Data Privacy:** GDPR-compliant data handling, no PII storage, 90-day log retention

## 6. Data Pipeline Architecture

*   **Ingestion Pipeline:** AWS Step Functions orchestrating Lambda scrapers
*   **Failure Handling:** Dead letter queues, exponential backoff, manual review queue
*   **Change Detection:** Hash-based content comparison, automated alerts on structure changes
*   **Data Verification:** Two-stage process - automated validation + human spot checks
*   **Version Control:** All data changes tracked in DynamoDB with rollback capability
*   **Source Attribution:** Every data point includes source URL, timestamp, and verification status

## 7. Operational Excellence

*   **Monitoring:** AWS X-Ray for distributed tracing, CloudWatch for metrics and logs
*   **Alerting:** PagerDuty integration for critical issues, Slack for warnings
*   **Error Tracking:** Sentry for application errors with 15-minute SLA for P1 issues
*   **Disaster Recovery:** Multi-region backup, 15-minute RPO, 1-hour RTO
*   **Incident Response:** On-call rotation, documented playbooks, post-mortem culture
*   **Performance SLOs:** 99.9% uptime, <100ms API latency p95

## 8. Legal & Liability Management

*   **Terms of Service:** Liability limited to subscription fees, "AS IS" data warranty
*   **Data Accuracy Disclaimer:** All responses include source verification requirements
*   **Insurance Coverage:** $5M E&O, $1M General Liability, $1M Cyber
*   **Compliance Notice:** Not affiliated with any government agency
*   **Audit Trail:** Complete data lineage from source to API response

## 9. AWS Services Architecture

### Core Services
*   **API Gateway (REST):** Request validation, usage plans, custom domain
*   **Lambda:** Python 3.11 runtime, 512MB for APIs, 2GB for scrapers
*   **DynamoDB:** Primary table with GSIs for jurisdiction and date queries
*   **Cognito User Pools:** Machine-to-machine authentication
*   **Cognito Identity Pools:** IAM role mapping for tier-based access

### Data Pipeline
*   **Step Functions:** Orchestrate scrape → validate → review → publish workflow
*   **EventBridge:** Schedule daily scraping at 2 AM AEST
*   **SQS:** Dead letter queue for failures, FIFO for data updates
*   **S3:** Raw HTML storage, data snapshots, static documentation

### Security & Monitoring
*   **CloudWatch:** Custom metrics, 90-day log retention, dashboards
*   **X-Ray:** Distributed tracing for performance analysis
*   **WAF:** Rate limiting, geographic restrictions, injection protection
*   **KMS:** Customer-managed encryption keys with rotation
*   **CloudTrail:** API audit logging with data events

### Developer Tools
*   **Systems Manager:** Parameter Store for config, Secrets Manager for credentials
*   **CodePipeline:** CI/CD with CodeBuild and blue/green deployments
*   **CloudFormation/SAM:** Infrastructure as code with nested stacks
*   **CloudFront:** API response caching with 5-minute TTL

## 10. Authentication Architecture

### Client Registration Flow
1. Admin creates Cognito app client with client credentials grant
2. Client receives `client_id` and `client_secret`
3. Credentials stored in customer's secrets management system

### Token Authentication Flow
```
POST /oauth2/token
Authorization: Basic base64(client_id:client_secret)
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&scope=api/read
```

### API Request Flow
1. Client requests token from Cognito (valid for 1 hour)
2. Lambda authorizer validates JWT token
3. IAM policy returned based on client tier
4. API Gateway enforces rate limits per usage plan

### Tier-Based Access Control
*   **Developer Tier:** 100 req/min, AU data only
*   **Professional Tier:** 1000 req/min, AU + NZ data
*   **Enterprise Tier:** Custom limits, all jurisdictions, webhooks

## 11. Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repo_url>
    cd CompliCal
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    cd infrastructure && npm install
    cd ../backend && npm install
    cd ../frontend && npm install
    ```
3.  **Configure AWS credentials:**
    ```bash
    aws configure
    ```
4.  **Deploy infrastructure:**
    ```bash
    cd infrastructure
    npm run cdk bootstrap
    npm run cdk deploy
    ```
5.  **Run tests:**
    ```bash
    npm test  # Runs all workspace tests
    ```

1.  **Clone the repository:**
    ```bash
    git clone <repo_url>
    cd CompliCal
    ```
2.  **Set up the environment:**
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    ```
3.  **Run tests:**
    ```bash
    pytest
    ```
4.  **Deploy to AWS:**
    ```bash
    sam build
    sam deploy --guided
    ```

---
*This document serves as the architectural and philosophical north star for the CompliCal project.*
