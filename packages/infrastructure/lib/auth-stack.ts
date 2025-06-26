import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export interface AuthStackProps extends cdk.StackProps {
  environment: string;
}

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    // Create Cognito User Pool
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `complical-users-${props.environment}`,
      selfSignUpEnabled: false, // No self-signup for API clients
      signInAliases: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
        },
      },
      customAttributes: {
        tier: new cognito.StringAttribute({
          minLen: 1,
          maxLen: 50,
          mutable: true,
        }),
        rate_limit: new cognito.NumberAttribute({
          min: 1,
          max: 10000,
          mutable: true,
        }),
        company: new cognito.StringAttribute({
          minLen: 1,
          maxLen: 256,
          mutable: true,
        }),
      },
      passwordPolicy: {
        minLength: 16,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: props.environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // Create resource server for OAuth scopes
    new cognito.UserPoolResourceServer(this, 'ResourceServer', {
      userPool: this.userPool,
      identifier: 'api',
      userPoolResourceServerName: 'CompliCal API',
      scopes: [
        {
          scopeName: 'read',
          scopeDescription: 'Read access to compliance deadlines',
        },
        {
          scopeName: 'write',
          scopeDescription: 'Write access (future use)',
        },
      ],
    });

    // Create User Pool Client for web app authentication
    this.userPoolClient = new cognito.UserPoolClient(this, 'WebClient', {
      userPool: this.userPool,
      userPoolClientName: `complical-web-client-${props.environment}`,
      generateSecret: false, // No secret for web clients
      authFlows: {
        adminUserPassword: true,  // Enable admin auth for backend login
        custom: false,
        userPassword: true,       // Enable user password auth
        userSrp: true,           // Enable SRP for secure auth
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: false,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [
          'http://localhost:3000/auth/callback',
          'https://complical.com/auth/callback',
          'https://app.complical.com/auth/callback',
        ],
        logoutUrls: [
          'http://localhost:3000',
          'https://complical.com',
          'https://app.complical.com',
        ],
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
      enableTokenRevocation: true,
    });

    // Add a default admin user group
    new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'admins',
      description: 'Admin users with full access',
      precedence: 1,
    });

    // Add tier groups
    const tiers = ['developer', 'professional', 'enterprise'];
    tiers.forEach((tier, index) => {
      new cognito.CfnUserPoolGroup(this, `${tier}Group`, {
        userPoolId: this.userPool.userPoolId,
        groupName: tier,
        description: `${tier} tier users`,
        precedence: index + 10,
      });
    });

    // Outputs
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'UserPoolDomain', {
      value: `https://cognito-idp.${this.region}.amazonaws.com/${this.userPool.userPoolId}`,
      description: 'Cognito User Pool Domain',
    });
  }
}