import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export interface CompliCalStackProps extends cdk.StackProps {
  environment: string;
}

export class CompliCalStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CompliCalStackProps) {
    super(scope, id, props);

    // DynamoDB table for compliance deadlines
    const deadlinesTable = new dynamodb.Table(this, 'DeadlinesTable', {
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
    deadlinesTable.addGlobalSecondaryIndex({
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
    deadlinesTable.addGlobalSecondaryIndex({
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

    // Lambda function for health check
    const healthCheckFn = new lambda.Function(this, 'HealthCheckFunction', {
      functionName: `complical-health-${props.environment}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'healthy',
              environment: '${props.environment}',
              timestamp: new Date().toISOString(),
            }),
          };
        };
      `),
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        ENVIRONMENT: props.environment,
      },
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'CompliCalApi', {
      restApiName: `complical-api-${props.environment}`,
      description: 'CompliCal compliance deadline API',
      deployOptions: {
        stageName: props.environment,
        tracingEnabled: true,
        metricsEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: props.environment !== 'prod',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
      },
    });

    // Health check endpoint
    const health = api.root.addResource('health');
    health.addMethod('GET', new apigateway.LambdaIntegration(healthCheckFn));

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'CompliCal API endpoint URL',
    });

    // Output the table name
    new cdk.CfnOutput(this, 'TableName', {
      value: deadlinesTable.tableName,
      description: 'DynamoDB table name for compliance deadlines',
    });
  }
}