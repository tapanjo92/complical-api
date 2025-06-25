# CompliCal Infrastructure

AWS CDK infrastructure for the CompliCal compliance deadline API.

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Node.js 20.x installed
3. AWS CDK CLI installed globally: `npm install -g aws-cdk`

## Initial Setup

1. **Configure AWS Account**
   ```bash
   # Account ID is already configured: 809555764832
   # Update if using a different AWS account
   ```

2. **Bootstrap CDK** (one-time per account/region)
   ```bash
   cd packages/infrastructure
   npm install
   cdk bootstrap aws://809555764832/ap-south-1
   ```

## Deployment

```bash
# Deploy to dev environment (default)
npm run deploy

# Deploy to specific environment
npm run cdk deploy -- --context env=prod

# See what changes will be deployed
npm run diff
```

## Stack Outputs

After deployment, you'll get:
- **ApiUrl**: The API Gateway endpoint URL
- **TableName**: DynamoDB table name for deadlines

## Architecture

- **DynamoDB Table**: Single table design with composite keys
  - PK/SK for main access patterns
  - GSI1 for jurisdiction queries (AU, NZ)
  - GSI2 for date-based queries
- **API Gateway**: REST API with CloudWatch logging
- **Lambda**: Health check endpoint (to be expanded)

## Testing

```bash
npm test
```