import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as logsDestinations from 'aws-cdk-lib/aws-logs-destinations';
import * as path from 'path';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export interface ApiStackProps extends cdk.StackProps {
  environment: string;
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  deadlinesTable: dynamodb.Table;
  apiKeysTable: dynamodb.Table;
  apiUsageTable: dynamodb.Table;
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Create Cognito authorizer
    const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'ApiAuthorizer', {
      cognitoUserPools: [props.userPool],
      authorizerName: `complical-cognito-authorizer-${props.environment}`,
      resultsCacheTtl: cdk.Duration.minutes(5),
    });

    // Create custom API key authorizer Lambda (optimized version)
    const apiKeyAuthorizerFn = new NodejsFunction(this, 'ApiKeyAuthorizerFunction', {
      functionName: `complical-api-key-authorizer-${props.environment}`,
      entry: path.join(__dirname, '../../backend/src/api/handlers/api-key-authorizer-optimized.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      environment: {
        API_KEYS_TABLE: props.apiKeysTable.tableName,
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

    // Grant permissions to read API keys table (read-only)
    props.apiKeysTable.grantReadData(apiKeyAuthorizerFn);

    // Create custom API key authorizer
    const apiKeyAuthorizer = new apigateway.RequestAuthorizer(this, 'ApiKeyAuthorizer', {
      handler: apiKeyAuthorizerFn,
      authorizerName: `complical-api-key-authorizer-${props.environment}`,
      identitySources: ['method.request.header.x-api-key'],
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

    // Simplified Deadlines Lambda Function (Calendarific-style)
    const simplifiedDeadlinesFn = new NodejsFunction(this, 'SimplifiedDeadlinesFunction', {
      functionName: `complical-simplified-deadlines-${props.environment}`,
      entry: path.join(__dirname, '../../backend/src/api/handlers/simplified-deadlines.ts'),
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
    props.deadlinesTable.grantReadData(simplifiedDeadlinesFn);

    // Ultra-Simple Deadlines Lambda Function
    const ultraSimpleDeadlinesFn = new NodejsFunction(this, 'UltraSimpleDeadlinesFunction', {
      functionName: `complical-ultra-simple-deadlines-${props.environment}`,
      entry: path.join(__dirname, '../../backend/src/api/handlers/ultra-simple-deadlines.ts'),
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
    props.deadlinesTable.grantReadData(ultraSimpleDeadlinesFn);

    // Billing Lambda Function
    const billingFn = new NodejsFunction(this, 'BillingFunction', {
      functionName: `complical-billing-${props.environment}`,
      entry: path.join(__dirname, '../../backend/src/api/handlers/billing.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        ENVIRONMENT: props.environment,
        USER_POOL_ID: props.userPool.userPoolId,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
        STRIPE_PRICE_DEVELOPER: process.env.STRIPE_PRICE_DEVELOPER || 'price_developer',
        STRIPE_PRICE_PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional',
        STRIPE_PRICE_ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
      bundling: {
        externalModules: ['aws-sdk'],
        minify: true,
        sourceMap: true,
      },
      tracing: lambda.Tracing.ACTIVE,
    });

    // Grant Cognito permissions to billing function
    props.userPool.grant(billingFn, 'cognito-idp:AdminCreateUser', 'cognito-idp:AdminAddUserToGroup');

    // We'll create the auth function later after we have the usage plan ID

    // Create CloudWatch log group for API Gateway access logs
    const apiLogGroup = new logs.LogGroup(this, 'ApiAccessLogs', {
      logGroupName: `/aws/apigateway/complical-${props.environment}`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: props.environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

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
        // Enable access logging
        accessLogDestination: new apigateway.LogGroupLogDestination(apiLogGroup),
        accessLogFormat: apigateway.AccessLogFormat.custom(JSON.stringify({
          requestId: apigateway.AccessLogField.contextRequestId(),
          requestTime: apigateway.AccessLogField.contextRequestTime(),
          identity: {
            sourceIp: apigateway.AccessLogField.contextIdentitySourceIp(),
            userAgent: apigateway.AccessLogField.contextIdentityUserAgent(),
          },
          authorizer: {
            principalId: apigateway.AccessLogField.contextAuthorizerPrincipalId(),
            apiKeyId: '$context.authorizer.apiKeyId',
            userEmail: '$context.authorizer.userEmail',
            keyName: '$context.authorizer.keyName',
          },
          httpMethod: apigateway.AccessLogField.contextHttpMethod(),
          path: apigateway.AccessLogField.contextPath(),
          protocol: apigateway.AccessLogField.contextProtocol(),
          responseLength: apigateway.AccessLogField.contextResponseLength(),
          status: apigateway.AccessLogField.contextStatus(),
          error: {
            message: apigateway.AccessLogField.contextErrorMessage(),
            responseType: apigateway.AccessLogField.contextErrorResponseType(),
          },
        })),
        methodOptions: {
          '/*/*': {
            throttlingRateLimit: 10,
            throttlingBurstLimit: 20,
          },
        },
      },
      defaultCorsPreflightOptions: {
        allowOrigins: [
          'http://localhost:3000',  // Local development
          'https://complical.com',  // Production domain
          'https://www.complical.com',
          'https://app.complical.com',  // App subdomain
          'https://d2xoxkdqlbm2pj.cloudfront.net',  // CloudFront domain
        ],
        allowMethods: ['GET', 'POST', 'OPTIONS', 'DELETE'],
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-CSRF-Token',
        ],
        allowCredentials: true,
        maxAge: cdk.Duration.hours(1),
      },
    });

    // API structure: /v1/au/ato/deadlines and /v1/nz/ird/deadlines
    const v1 = this.api.root.addResource('v1');
    
    // Simplified global endpoint (Calendarific-style)
    const globalDeadlines = v1.addResource('deadlines');
    
    // Ultra-simple endpoint: /v1/deadlines/{country}/{year}/{month}
    const countryResource = globalDeadlines.addResource('{country}');
    const yearResource = countryResource.addResource('{year}');
    const monthResource = yearResource.addResource('{month}');
    
    // Australian endpoints
    const au = v1.addResource('au');
    const ato = au.addResource('ato');
    const deadlines = ato.addResource('deadlines');
    
    // New Zealand endpoints
    const nz = v1.addResource('nz');
    const ird = nz.addResource('ird');
    const nzDeadlines = ird.addResource('deadlines');

    // Auth endpoints: /v1/auth/*
    const auth = v1.addResource('auth');
    const register = auth.addResource('register');
    const login = auth.addResource('login');
    const logout = auth.addResource('logout');
    const refresh = auth.addResource('refresh');
    const apiKeys = auth.addResource('api-keys');

    // Billing endpoints: /v1/billing/*
    const billing = v1.addResource('billing');
    const checkout = billing.addResource('checkout');
    const webhooks = billing.addResource('webhooks');
    const subscription = billing.addResource('subscription');

    // Add GET method for simplified global endpoint
    globalDeadlines.addMethod('GET', new apigateway.LambdaIntegration(simplifiedDeadlinesFn), {
      authorizer: apiKeyAuthorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      requestParameters: {
        'method.request.querystring.country': false,
        'method.request.querystring.countries': false,
        'method.request.querystring.year': false,
        'method.request.querystring.month': false,
        'method.request.querystring.type': false,
        'method.request.querystring.limit': false,
        'method.request.querystring.offset': false,
        'method.request.querystring.api_key': false,  // Support API key in URL (deprecated)
      },
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.X-Warning': true,
          },
        },
        {
          statusCode: '400',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
        {
          statusCode: '403',
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

    // Add GET method for ultra-simple endpoint
    monthResource.addMethod('GET', new apigateway.LambdaIntegration(ultraSimpleDeadlinesFn), {
      authorizer: apiKeyAuthorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      requestParameters: {
        'method.request.path.country': true,
        'method.request.path.year': true,
        'method.request.path.month': true,
        'method.request.querystring.type': false,
        'method.request.querystring.category': false,
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
          statusCode: '403',
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

    // Add GET method with custom API key authorizer - Australia
    deadlines.addMethod('GET', new apigateway.LambdaIntegration(deadlinesFn), {
      authorizer: apiKeyAuthorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      requestParameters: {
        'method.request.querystring.type': false,
        'method.request.querystring.from_date': false,
        'method.request.querystring.to_date': false,
        'method.request.querystring.limit': false,
        'method.request.querystring.nextToken': false,
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
    
    // Add GET method with custom API key authorizer - New Zealand
    nzDeadlines.addMethod('GET', new apigateway.LambdaIntegration(deadlinesFn), {
      authorizer: apiKeyAuthorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      requestParameters: {
        'method.request.querystring.type': false,
        'method.request.querystring.from_date': false,
        'method.request.querystring.to_date': false,
        'method.request.querystring.limit': false,
        'method.request.querystring.nextToken': false,
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

    // Billing endpoints
    // POST /v1/billing/checkout - Create checkout session (requires auth)
    checkout.addMethod('POST', new apigateway.LambdaIntegration(billingFn), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
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

    // POST /v1/billing/webhooks - Stripe webhook (no auth)
    webhooks.addMethod('POST', new apigateway.LambdaIntegration(billingFn), {
      methodResponses: [
        {
          statusCode: '200',
        },
        {
          statusCode: '400',
        },
      ],
    });

    // GET /v1/billing/subscription - Get subscription status (requires auth)
    subscription.addMethod('GET', new apigateway.LambdaIntegration(billingFn), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      apiKeyRequired: true,
      methodResponses: [
        {
          statusCode: '200',
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
          const origin = event.headers?.origin || event.headers?.Origin;
          const allowedOrigins = [
            'http://localhost:3000',
            'https://complical.com',
            'https://www.complical.com',
            'https://app.complical.com',
          ];
          
          const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : 'https://complical.com';
          
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': allowedOrigin,
              'Access-Control-Allow-Methods': 'GET, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key',
              'Access-Control-Max-Age': '3600',
              // Security headers
              'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
              'X-Content-Type-Options': 'nosniff',
              'X-Frame-Options': 'DENY',
              'X-XSS-Protection': '1; mode=block',
              'Referrer-Policy': 'strict-origin-when-cross-origin',
              'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none';",
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

    // Create Usage Plans
    const freeTierPlan = new apigateway.UsagePlan(this, 'FreeTierPlan', {
      name: `complical-free-tier-${props.environment}`,
      description: 'Free tier with 10,000 requests per month',
      throttle: {
        rateLimit: 10,  // requests per second
        burstLimit: 20, // burst capacity
      },
      quota: {
        limit: 10000,   // 10,000 requests
        period: apigateway.Period.MONTH,
      },
    });
    
    // Store usage plan ID in SSM for Lambda to use
    new ssm.StringParameter(this, 'FreeTierPlanIdParameter', {
      parameterName: `/complical/${props.environment}/usage-plan/free-tier-id`,
      stringValue: freeTierPlan.usagePlanId,
      description: 'Free tier usage plan ID for API key association',
    });
    
    // We'll add the API stage after deployment to avoid circular dependency

    // Create paid tier plans (for future use)
    // const developerPlan = new apigateway.UsagePlan(this, 'DeveloperPlan', {
    //   name: `complical-developer-${props.environment}`,
    //   description: 'Developer tier with 100,000 requests per month',
    //   throttle: {
    //     rateLimit: 50,
    //     burstLimit: 100,
    //   },
    //   quota: {
    //     limit: 100000,
    //     period: apigateway.Period.MONTH,
    //   },
    // });

    // const professionalPlan = new apigateway.UsagePlan(this, 'ProfessionalPlan', {
    //   name: `complical-professional-${props.environment}`,
    //   description: 'Professional tier with 1,000,000 requests per month',
    //   throttle: {
    //     rateLimit: 100,
    //     burstLimit: 200,
    //   },
    //   quota: {
    //     limit: 1000000,
    //     period: apigateway.Period.MONTH,
    //   },
    // });

    // const enterprisePlan = new apigateway.UsagePlan(this, 'EnterprisePlan', {
    //   name: `complical-enterprise-${props.environment}`,
    //   description: 'Enterprise tier with unlimited requests',
    //   throttle: {
    //     rateLimit: 500,
    //     burstLimit: 1000,
    //   },
    //   // No quota for enterprise
    // });

    // Auth Lambda Function for registration (created after usage plans)
    const authFn = new NodejsFunction(this, 'AuthFunction', {
      functionName: `complical-auth-${props.environment}`,
      entry: path.join(__dirname, '../../backend/src/api/handlers/auth-secure.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        ENVIRONMENT: props.environment,
        USER_POOL_ID: props.userPool.userPoolId,
        USER_POOL_CLIENT_ID: props.userPoolClient.userPoolClientId,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
      bundling: {
        externalModules: ['aws-sdk'],
        minify: true,
        sourceMap: true,
      },
      tracing: lambda.Tracing.ACTIVE,
    });

    // Grant permissions for user management
    props.userPool.grant(authFn, 
      'cognito-idp:AdminCreateUser',
      'cognito-idp:AdminSetUserPassword', 
      'cognito-idp:AdminInitiateAuth',
      'cognito-idp:AdminGetUser'
    );
    
    // Grant permissions to manage API keys and usage plans
    authFn.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'apigateway:POST',  // Create API key
        'apigateway:PUT',   // Update API key
        'apigateway:GET',   // Get API key details
      ],
      resources: ['*'],  // API keys don't have ARNs until created
    }));

    // Add Lambda permission for the registration endpoint
    register.addMethod('POST', new apigateway.LambdaIntegration(authFn), {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
          },
        },
        {
          statusCode: '400',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
          },
        },
        {
          statusCode: '500',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
          },
        },
      ],
    });
    
    // Add Lambda permission for the login endpoint
    login.addMethod('POST', new apigateway.LambdaIntegration(authFn), {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
          },
        },
        {
          statusCode: '400',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
          },
        },
        {
          statusCode: '401',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
          },
        },
        {
          statusCode: '500',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
          },
        },
      ],
    });

    // Add Lambda permission for the logout endpoint
    logout.addMethod('POST', new apigateway.LambdaIntegration(authFn), {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
          },
        },
        {
          statusCode: '500',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
          },
        },
      ],
    });

    // Add Lambda permission for the refresh endpoint
    refresh.addMethod('POST', new apigateway.LambdaIntegration(authFn), {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
          },
        },
        {
          statusCode: '401',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
          },
        },
        {
          statusCode: '500',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
          },
        },
      ],
    });

    // API Keys Lambda Function
    const apiKeysFn = new NodejsFunction(this, 'ApiKeysFunction', {
      functionName: `complical-api-keys-${props.environment}`,
      entry: path.join(__dirname, '../../backend/src/api/handlers/api-keys-secure.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        ENVIRONMENT: props.environment,
        API_KEYS_TABLE: props.apiKeysTable.tableName,
        USAGE_PLAN_SSM_PARAMETER: `/complical/${props.environment}/usage-plan/free-tier-id`,
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
    props.apiKeysTable.grantReadWriteData(apiKeysFn);
    
    // Grant API Gateway permissions
    apiKeysFn.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'apigateway:POST',     // Create API key
        'apigateway:GET',      // Get API key
        'apigateway:DELETE',   // Delete API key
        'apigateway:PATCH',    // Update API key
        'apigateway:PUT',      // Associate with usage plan
      ],
      resources: ['*'],
    }));
    
    // Grant SSM parameter read permission
    apiKeysFn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ssm:GetParameter'],
      resources: [`arn:aws:ssm:${this.region}:${this.account}:parameter/complical/${props.environment}/usage-plan/*`],
    }));

    // Add API key management endpoints
    // POST /v1/auth/api-keys - Create new API key
    apiKeys.addMethod('POST', new apigateway.LambdaIntegration(apiKeysFn), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      methodResponses: [
        {
          statusCode: '201',
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

    // GET /v1/auth/api-keys - List user's API keys
    apiKeys.addMethod('GET', new apigateway.LambdaIntegration(apiKeysFn), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      methodResponses: [
        {
          statusCode: '200',
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

    // Add resource for specific API key operations
    const apiKeyId = apiKeys.addResource('{id}');
    
    // DELETE /v1/auth/api-keys/{id} - Delete an API key
    apiKeyId.addMethod('DELETE', new apigateway.LambdaIntegration(apiKeysFn), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      methodResponses: [
        {
          statusCode: '204',
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
          statusCode: '404',
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

    // Now add the API stage to the usage plan
    freeTierPlan.addApiStage({
      api: this.api,
      stage: this.api.deploymentStage,
    });

    // Export usage plan IDs for use in auth handler
    new cdk.CfnOutput(this, 'FreeTierPlanId', {
      value: freeTierPlan.usagePlanId,
      exportName: `${this.stackName}-FreeTierPlanId`,
    });

    // Create Lambda function for processing usage logs
    const usageProcessorFn = new NodejsFunction(this, 'UsageProcessorFunction', {
      functionName: `complical-usage-processor-${props.environment}`,
      entry: path.join(__dirname, '../../backend/src/api/handlers/process-usage-logs.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.minutes(5),
      memorySize: 512,
      environment: {
        API_KEYS_TABLE: props.apiKeysTable.tableName,
        API_USAGE_TABLE: props.apiUsageTable.tableName,
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
    props.apiKeysTable.grantReadWriteData(usageProcessorFn);
    props.apiUsageTable.grantReadWriteData(usageProcessorFn);

    // Create subscription filter to send logs to Lambda
    apiLogGroup.addSubscriptionFilter('UsageProcessorSubscription', {
      destination: new logsDestinations.LambdaDestination(usageProcessorFn),
      filterPattern: logs.FilterPattern.allEvents(),
    });

    // Grant CloudWatch Logs permission to invoke the Lambda
    usageProcessorFn.addPermission('AllowCloudWatchLogs', {
      principal: new iam.ServicePrincipal('logs.amazonaws.com'),
      sourceArn: apiLogGroup.logGroupArn,
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'CompliCal API endpoint URL',
    });

    new cdk.CfnOutput(this, 'ApiId', {
      value: this.api.restApiId,
      description: 'API Gateway ID',
    });

    new cdk.CfnOutput(this, 'ApiAccessLogGroup', {
      value: apiLogGroup.logGroupName,
      description: 'CloudWatch log group for API access logs',
    });
  }
}