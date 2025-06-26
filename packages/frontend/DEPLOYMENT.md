# Frontend Deployment Guide

## AWS Amplify Gen2 Deployment

The frontend is deployed using AWS Amplify Gen2 via CDK infrastructure.

### Prerequisites

1. Backend stacks must be deployed first:
   - CompliCal-Data-dev
   - CompliCal-Auth-dev  
   - CompliCal-Api-dev

2. Set up your GitHub repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/complical.git
   git push -u origin main
   ```

### Deploy Frontend

1. From infrastructure directory:
   ```bash
   cd packages/infrastructure
   npx cdk deploy CompliCal-Frontend-dev
   ```

2. Connect to GitHub (one-time setup):
   - Go to AWS Amplify Console
   - Find your app (complical-frontend-dev)
   - Click "Connect repository"
   - Choose GitHub and authorize
   - Select your repository and main branch

3. Environment variables are automatically set from CDK

### Manual Deployment (Alternative)

If you prefer manual Amplify deployment:

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Initialize in frontend directory
cd packages/frontend
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

### Post-Deployment

1. Access your app at the Amplify URL
2. Set up custom domain (optional):
   - In Amplify Console, go to Domain management
   - Add domain: app.complical.com
   - Follow DNS configuration instructions

### Monitoring

- Build logs: Amplify Console > App > Build logs
- Access logs: CloudWatch Logs
- Metrics: CloudWatch Metrics > AWS/Amplify

### Troubleshooting

1. Build failures:
   - Check Node version (should be 18.x or 20.x)
   - Verify all environment variables are set
   - Check build logs for specific errors

2. Runtime errors:
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Check CORS configuration