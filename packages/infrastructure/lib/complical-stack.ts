import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface CompliCalStackProps extends cdk.StackProps {
  environment: string;
}

export class CompliCalStack extends cdk.Stack {
  public readonly deadlinesTable: dynamodb.Table;
  public readonly apiKeysTable: dynamodb.Table;
  public readonly apiUsageTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: CompliCalStackProps) {
    super(scope, id, props);

    // DynamoDB table for compliance deadlines
    this.deadlinesTable = new dynamodb.Table(this, 'DeadlinesTable', {
      tableName: `complical-deadlines-${props.environment}`,
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      removalPolicy: props.environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // GSI for querying by jurisdiction
    this.deadlinesTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: {
        name: 'GSI1PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI1SK',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for querying by deadline date
    this.deadlinesTable.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: {
        name: 'GSI2PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI2SK',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // DynamoDB table for API keys
    this.apiKeysTable = new dynamodb.Table(this, 'ApiKeysTable', {
      tableName: `complical-api-keys-${props.environment}`,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      timeToLiveAttribute: 'ttl', // Enable TTL for automatic expiration
      removalPolicy: props.environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // GSI for querying by user email
    this.apiKeysTable.addGlobalSecondaryIndex({
      indexName: 'userEmail-createdAt-index',
      partitionKey: {
        name: 'userEmail',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for querying by hashed API key
    this.apiKeysTable.addGlobalSecondaryIndex({
      indexName: 'hashedKey-index',
      partitionKey: {
        name: 'hashedKey',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // DynamoDB table for API usage metrics
    this.apiUsageTable = new dynamodb.Table(this, 'ApiUsageTable', {
      tableName: `complical-api-usage-${props.environment}`,
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      timeToLiveAttribute: 'ttl', // Enable TTL for automatic cleanup
      removalPolicy: props.environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // Output the table names
    new cdk.CfnOutput(this, 'DeadlinesTableName', {
      value: this.deadlinesTable.tableName,
      description: 'DynamoDB table name for compliance deadlines',
    });

    new cdk.CfnOutput(this, 'ApiKeysTableName', {
      value: this.apiKeysTable.tableName,
      description: 'DynamoDB table name for API keys',
    });

    new cdk.CfnOutput(this, 'ApiUsageTableName', {
      value: this.apiUsageTable.tableName,
      description: 'DynamoDB table name for API usage metrics',
    });
  }
}