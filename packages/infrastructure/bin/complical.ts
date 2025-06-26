#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CompliCalStack } from '../lib/complical-stack';
import { AuthStack } from '../lib/auth-stack';
import { ApiStack } from '../lib/api-stack';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

// Get environment from context
const targetEnv = app.node.tryGetContext('env') || 'dev';
const environments = app.node.tryGetContext('environments');
const envConfig = environments[targetEnv];

if (!envConfig) {
  throw new Error(`Environment ${targetEnv} not found in cdk.json context`);
}

const env = {
  account: envConfig.account || process.env.CDK_DEFAULT_ACCOUNT,
  region: envConfig.region || process.env.CDK_DEFAULT_REGION,
};

// Create the data stack (DynamoDB)
const dataStack = new CompliCalStack(app, `CompliCal-Data-${targetEnv}`, {
  env,
  environment: targetEnv,
  description: `CompliCal data layer - ${targetEnv} environment`,
});

// Create the auth stack (Cognito)
const authStack = new AuthStack(app, `CompliCal-Auth-${targetEnv}`, {
  env,
  environment: targetEnv,
  description: `CompliCal authentication - ${targetEnv} environment`,
});

// Create the API stack
const apiStack = new ApiStack(app, `CompliCal-Api-${targetEnv}`, {
  env,
  environment: targetEnv,
  description: `CompliCal API layer - ${targetEnv} environment`,
  userPool: authStack.userPool,
  userPoolClient: authStack.userPoolClient,
  deadlinesTable: dataStack.deadlinesTable,
  apiKeysTable: dataStack.apiKeysTable,
});

// Add dependencies
apiStack.addDependency(dataStack);
apiStack.addDependency(authStack);

// Create the Frontend stack for S3/CloudFront hosting
const frontendStack = new FrontendStack(app, `CompliCal-Frontend-${targetEnv}`, {
  env,
  environment: targetEnv,
  description: `CompliCal frontend hosting - ${targetEnv} environment`,
  apiUrl: apiStack.api.url,
  cognitoRegion: env.region!,
  userPoolId: authStack.userPool.userPoolId,
  clientId: authStack.userPoolClient.userPoolClientId,
});

// Frontend depends on API being deployed
frontendStack.addDependency(apiStack);