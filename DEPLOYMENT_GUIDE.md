# CompliCal Deployment Guide

## Prerequisites
- AWS Account with appropriate permissions
- Node.js 20.x and npm installed
- AWS CLI configured with credentials
- Git repository access

## Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/complical.git
cd complical
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Environment Variables
Create `.env` file in the infrastructure directory:
```bash
cd packages/infrastructure
cp .env.example .env
```

Edit `.env` with your values:
```env
AWS_ACCOUNT_ID=your-account-id
AWS_REGION=ap-south-1
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_DEVELOPER=price_...
STRIPE_PRICE_PROFESSIONAL=price_...
STRIPE_PRICE_ENTERPRISE=price_...
```

## Infrastructure Deployment

### 1. Bootstrap CDK (First Time Only)
```bash
npm run cdk bootstrap
```

### 2. Deploy All Stacks
```bash
npm run cdk deploy --all
```

This deploys three stacks in order:
1. **CompliCal-Data-dev** - DynamoDB tables
2. **CompliCal-Auth-dev** - Cognito user pool
3. **CompliCal-Api-dev** - API Gateway, Lambda functions

### 3. Load Initial Data
```bash
# Load Australian compliance data
node scripts/load-comprehensive-au-data.js
node scripts/load-remaining-states-payroll.js

# Load New Zealand data
node scripts/load-nz-data.js
```

## Frontend Deployment

### 1. Build Frontend
```bash
cd packages/frontend
npm run build
```

### 2. Deploy to CloudFront
```bash
cd packages/infrastructure
npm run cdk deploy CompliCal-Frontend-dev
```

## Post-Deployment Configuration

### 1. Update Frontend Configuration
Create `/public/config.js` in the frontend:
```javascript
window.COMPLICAL_CONFIG = {
  API_URL: 'https://your-api-id.execute-api.ap-south-1.amazonaws.com/dev',
  COGNITO_USER_POOL_ID: 'ap-south-1_xxxxxxx',
  COGNITO_CLIENT_ID: 'xxxxxxxxxxxxxxxxxx',
  STRIPE_PUBLISHABLE_KEY: 'pk_test_...'
};
```

### 2. Test the Deployment
```bash
# Health check
curl https://your-api-id.execute-api.ap-south-1.amazonaws.com/dev/health

# Create test user and API key
bash complete-api-test.sh
```

## Monitoring Setup

### 1. CloudWatch Dashboards
The CDK automatically creates:
- API Gateway metrics dashboard
- Lambda function metrics
- DynamoDB table metrics

### 2. Alarms
Configure alarms for:
- API Gateway 4xx/5xx errors > 1%
- Lambda function errors > 1%
- DynamoDB throttling
- Monthly API usage approaching limits

### 3. Access Logs
API Gateway access logs are automatically sent to:
- Log Group: `/aws/apigateway/complical-dev`
- Processed by: `complical-usage-processor-dev` Lambda

## Updating the Application

### 1. Code Updates
```bash
# Make your changes
git add .
git commit -m "Your changes"

# Deploy updates
npm run cdk deploy --all
```

### 2. Data Updates
```bash
# Run scraper for latest data
node scripts/scrape-ato-deadlines.js

# Or manually add deadlines
node scripts/add-deadline.js
```

## Rollback Procedures

### 1. Infrastructure Rollback
```bash
# List stack events
aws cloudformation describe-stack-events \
  --stack-name CompliCal-Api-dev \
  --region ap-south-1

# Rollback to previous version
npm run cdk deploy --all --rollback
```

### 2. Data Rollback
DynamoDB point-in-time recovery is enabled:
```bash
# Restore table to specific time
aws dynamodb restore-table-to-point-in-time \
  --source-table-name complical-deadlines-dev \
  --target-table-name complical-deadlines-dev-restored \
  --restore-date-time 2025-06-27T12:00:00Z
```

## Security Checklist

- [ ] All secrets in AWS Secrets Manager or Parameter Store
- [ ] API keys have appropriate expiration times
- [ ] CORS configured for allowed domains only
- [ ] WAF rules enabled for common attacks
- [ ] API Gateway rate limiting configured
- [ ] CloudWatch alarms for suspicious activity
- [ ] Regular security audits scheduled

## Troubleshooting

### API Gateway 403 Errors
1. Check API key is valid
2. Verify authorizer cache (5 min TTL)
3. Check CloudWatch logs for authorizer Lambda

### Usage Tracking Not Updating
1. Verify access logs are being written
2. Check usage processor Lambda logs
3. Confirm log subscription filter is active

### Frontend Authentication Issues
1. Check Cognito user pool settings
2. Verify CORS configuration
3. Check browser console for errors

## Production Checklist

Before going to production:
- [ ] Remove all console.log statements
- [ ] Set appropriate log levels
- [ ] Configure custom domain
- [ ] Enable AWS WAF
- [ ] Set up monitoring alerts
- [ ] Document runbooks
- [ ] Load test the API
- [ ] Security audit completed
- [ ] Backup procedures tested
- [ ] Disaster recovery plan documented