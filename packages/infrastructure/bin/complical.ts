#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CompliCalStack } from '../lib/complical-stack';

const app = new cdk.App();

// Get environment from context
const targetEnv = app.node.tryGetContext('env') || 'dev';
const environments = app.node.tryGetContext('environments');
const envConfig = environments[targetEnv];

if (!envConfig) {
  throw new Error(`Environment ${targetEnv} not found in cdk.json context`);
}

// Create the main stack
new CompliCalStack(app, `CompliCal-${targetEnv}`, {
  env: {
    account: envConfig.account || process.env.CDK_DEFAULT_ACCOUNT,
    region: envConfig.region || process.env.CDK_DEFAULT_REGION,
  },
  environment: targetEnv,
  description: `CompliCal compliance deadline API - ${targetEnv} environment`,
});