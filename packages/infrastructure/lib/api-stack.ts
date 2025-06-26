import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export interface ApiStackProps extends cdk.StackProps {
  environment: string;
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  deadlinesTable: dynamodb.Table;
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Lambda Authorizer
    const authorizerFn = new NodejsFunction(this, 'AuthorizerFunction', {
      functionName: `complical-authorizer-${props.environment}`,
      entry: path.join(__dirname, '../../backend/src/api/authorizer/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      environment: {
        USER_POOL_ID: props.userPool.userPoolId,
        CLIENT_ID: props.userPoolClient.userPoolClientId,
        ENVIRONMENT: props.environment,
      },
      bundling: {
        externalModules: ['aws-sdk'],
        minify: true,
        sourceMap: true,
      },
    });

    // Create authorizer
    const authorizer = new apigateway.TokenAuthorizer(this, 'ApiAuthorizer', {
      handler: authorizerFn,
      authorizerName: `complical-authorizer-${props.environment}`,
      resultsCacheTtl: cdk.Duration.minutes(5),
    });

    // Deadlines Lambda Function
    const deadlinesFn = new NodejsFunction(this, 'DeadlinesFunction', {
      functionName: `complical-deadlines-${props.environment}`,
      entry: path.join(__dirname, '../../backend/src/api/handlers/deadlines.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TABLE_NAME: props.deadlinesTable.tableName,
        ENVIRONMENT: props.environment,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
      bundling: {
        externalModules: ['aws-sdk'],
        minify: true,
        sourceMap: true,
      },
      tracing: lambda.Tracing.ACTIVE,
    });

    // Grant permissions
    props.deadlinesTable.grantReadData(deadlinesFn);

    // Create API
    this.api = new apigateway.RestApi(this, 'CompliCalApi', {
      restApiName: `complical-api-${props.environment}`,
      description: 'CompliCal compliance deadline API',
      deployOptions: {
        stageName: props.environment,
        tracingEnabled: true,
        metricsEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: props.environment !== 'prod',
        throttlingBurstLimit: 1000,
        throttlingRateLimit: 100,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: [
          'http://localhost:3000',  // Local development
          'https://complical.com',  // Production domain
          'https://www.complical.com',
          'https://app.complical.com',  // App subdomain
        ],
        allowMethods: ['GET', 'OPTIONS'],
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        maxAge: cdk.Duration.hours(1),
      },
    });

    // API structure: /v1/au/ato/deadlines
    const v1 = this.api.root.addResource('v1');
    const au = v1.addResource('au');
    const ato = au.addResource('ato');
    const deadlines = ato.addResource('deadlines');

    // Add GET method with authorizer
    deadlines.addMethod('GET', new apigateway.LambdaIntegration(deadlinesFn), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      requestParameters: {
        'method.request.querystring.type': false,
        'method.request.querystring.from_date': false,
        'method.request.querystring.to_date': false,
        'method.request.querystring.limit': false,
      },
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
        {
          statusCode: '400',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
        {
          statusCode: '401',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
        {
          statusCode: '500',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
      ],
    });

    // Health check endpoint (no auth)
    const health = this.api.root.addResource('health');
    const healthFn = new lambda.Function(this, 'HealthCheckFunction', {
      functionName: `complical-health-${props.environment}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
              status: 'healthy',
              environment: '${props.environment}',
              timestamp: new Date().toISOString(),
              version: '1.0.0',
            }),
          };
        };
      `),
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
    });

    health.addMethod('GET', new apigateway.LambdaIntegration(healthFn));

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'CompliCal API endpoint URL',
    });

    new cdk.CfnOutput(this, 'ApiId', {
      value: this.api.restApiId,
      description: 'API Gateway ID',
    });
  }
}