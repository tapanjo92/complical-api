# CompliCal API: Project Roadmap

This document outlines the phased development plan for the CompliCal API, from initial prototype to a scalable, multi-market product.

---

## Phase 0: Market Validation & Legal Foundation

**(Target: 1 Month - BEFORE any development)**

**Goal:** Validate the business model, establish legal framework, and ensure market demand before writing code.

### Sub-Phase 0.1: Legal & Risk Assessment

*   **Task 0.1.1:** Engage tech lawyer for Terms of Service and liability review ($3-5k budget).
*   **Task 0.1.2:** Research data resale rights for AU/NZ government information.
*   **Task 0.1.3:** Obtain E&O insurance quotes and establish LLC structure.
*   **Task 0.1.4:** Draft initial Terms of Service with liability limitations.

### Sub-Phase 0.2: Market Validation

*   **Task 0.2.1:** Conduct 20+ customer discovery interviews with target personas.
*   **Task 0.2.2:** Analyze competitors (Avalara, TaxJar, local players).
*   **Task 0.2.3:** Validate pricing model with potential customers.
*   **Task 0.2.4:** Create simple landing page to gauge interest and capture emails.
*   **Task 0.2.5:** Secure 3-5 design partners willing to test MVP.

---

## Phase 1: Minimum Viable Product (MVP) - The Australian ATO Core

**(Target: 3-4 Months)**

**Goal:** Launch a functional, reliable API for the most critical Australian Taxation Office (ATO) deadlines. Prove the core business model and gain the first 1-5 developer customers.

### Sub-Phase 1.1: Foundational Setup

*   **Task 1.1.1:** Initialize Git repository and create `README.md` and `ROADMAP.md`.
*   **Task 1.1.2:** Set up Python project structure (`pyproject.toml`, virtual environment).
*   **Task 1.1.3:** Set up AWS account and configure AWS CLI/credentials locally.
*   **Task 1.1.4:** Define initial Infrastructure as Code (IaC) using AWS SAM (`template.yaml`). This will include:
    *   A single Lambda function.
    *   An API Gateway endpoint.
    *   A DynamoDB table with a simple primary key.

### Sub-Phase 1.2: Data Sourcing & Ingestion (The Hard Part)

*   **Task 1.2.1:** Manually research and identify the top 5 most critical ATO deadlines for small businesses (BAS, PAYG, Superannuation).
*   **Task 1.2.2:** Write a standalone Python script (`scripts/ingest_ato.py`) to scrape these dates from the ATO website.
*   **Task 1.2.3:** Manually verify the scraped data for 100% accuracy.
*   **Task 1.2.4:** Write a script to load this verified data into the DynamoDB table.

### Sub-Phase 1.3: API Development & Deployment

*   **Task 1.3.1:** Develop the core Lambda handler function in Python to read data from DynamoDB.
*   **Task 1.3.2:** Implement the first API endpoint: `GET /v1/au/ato/deadlines`.
*   **Task 1.3.3:** Implement basic API key authentication using API Gateway.
*   **Task 1.3.4:** Write unit tests for the Lambda handler.
*   **Task 1.3.5:** Set up a basic CI/CD pipeline using GitHub Actions to automatically test and deploy the SAM application.

### Sub-Phase 1.4: Go-to-Market Prep

*   **Task 1.4.1:** Create simple, clear API documentation with OpenAPI/Swagger.
*   **Task 1.4.2:** Integrate Stripe for subscription billing (free tier + paid).
*   **Task 1.4.3:** Implement API versioning (v1) from the start.
*   **Task 1.4.4:** Set up basic landing page with developer portal.
*   **Task 1.4.5:** Launch with existing design partners from Phase 0.

### Sub-Phase 1.5: Monitoring & Reliability

*   **Task 1.5.1:** Configure CloudWatch alarms for API latency and error rates.
*   **Task 1.5.2:** Implement data accuracy monitoring with daily reports.
*   **Task 1.5.3:** Set up Sentry for error tracking and alerting.
*   **Task 1.5.4:** Create runbooks for common operational issues.
*   **Task 1.5.5:** Implement automated backup for DynamoDB tables.

---

## Phase 2: Productization & NZ Expansion

**(Target: 3-6 Months)**

**Goal:** Harden the product, expand to the New Zealand market, and implement proper billing and customer management.

### Sub-Phase 2.1: Hardening & Scaling

*   **Task 2.1.1:** Implement robust logging and monitoring for the API.
*   **Task 2.1.2:** Configure AWS CloudFront for caching to improve performance and reduce cost.
*   **Task 2.1.3:** Automate the data ingestion script to run on a schedule (e.g., weekly via an EventBridge rule).

### Sub-Phase 2.2: New Zealand Market Entry

*   **Task 2.2.1:** Research and identify the core compliance deadlines for NZ's Inland Revenue Department (IRD).
*   **Task 2.2.2:** Adapt the ingestion script to handle the IRD website.
*   **Task 2.2.3:** Update the DynamoDB schema to support multiple jurisdictions (`AU`, `NZ`).
*   **Task 2.2.4:** Create the new API endpoint: `GET /v1/nz/ird/deadlines`.

### Sub-Phase 2.3: Enterprise Features

*   **Task 2.3.1:** Implement OAuth 2.0/JWT authentication for enterprise customers.
*   **Task 2.3.2:** Add audit logging for all API calls with 90-day retention.
*   **Task 2.3.3:** Create webhook system for real-time deadline change notifications.
*   **Task 2.3.4:** Define SLAs (99.9% uptime, <100ms latency p95).
*   **Task 2.3.5:** Build admin dashboard for data quality monitoring.

---

## Phase 3: Expansion to New Verticals & Agencies

**(Target: 6-12 Months)**

**Goal:** Become the definitive compliance API for the AU/NZ region by expanding into new government agencies.

*   **Task 3.1:** Expand data sourcing to include the Australian Securities and Investments Commission (ASIC).
*   **Task 3.2:** Launch the `GET /v1/au/asic/deadlines` endpoint.
*   **Task 3.3:** Research and add state-level deadlines (e.g., Payroll Tax for NSW, VIC).
*   **Task 3.4:** Begin exploring other English-speaking markets like the UK or Canada.
*   **Task 3.5:** Investigate official government APIs to replace scraping where possible.
*   **Task 3.6:** Implement ML-based change detection for website structure changes.
*   **Task 3.7:** Achieve SOC 2 Type II certification.

---

## Risk Mitigation Strategy (Ongoing)

### Technical Risks
*   **Scraper Failures:** Implement redundant scraping methods, manual fallback processes
*   **Data Accuracy:** Two-stage verification, source attribution, customer disclaimers
*   **Scale Issues:** Design for horizontal scaling from day one, use caching aggressively

### Business Risks
*   **Customer Concentration:** No single customer >20% of revenue
*   **Competitive Threats:** Focus on data quality and developer experience as differentiators
*   **Regulatory Changes:** Maintain relationships with government agencies

### Operational Risks
*   **Key Person Dependency:** Document everything, automate processes
*   **Data Source Changes:** Monitor for website changes, maintain scraper test suite
*   **Security Breaches:** Follow AWS security best practices, regular penetration testing
