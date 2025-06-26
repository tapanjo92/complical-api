import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  CognitoIdentityProviderClient, 
  AdminCreateUserCommand, 
  AdminSetUserPasswordCommand,
  AdminInitiateAuthCommand,
  AdminGetUserCommand,
  MessageActionType,
  AuthFlowType
} from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayClient, CreateApiKeyCommand } from '@aws-sdk/client-api-gateway';
import { z } from 'zod';
import * as crypto from 'crypto';

const cognito = new CognitoIdentityProviderClient({});
const apigateway = new APIGatewayClient({});

const USER_POOL_ID = process.env.USER_POOL_ID!;
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID!;

// Registration schema
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(1),
});

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const handler: APIGatewayProxyHandler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const path = event.path;

  try {
    // Handle registration
    if (path.endsWith('/register')) {
      let body;
      try {
        body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      } catch (parseError) {
        console.error('Failed to parse body:', event.body);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Invalid request body',
            message: 'Request body must be valid JSON',
          }),
        };
      }
      const { email, password, companyName } = registerSchema.parse(body);

      // Create user in Cognito
      const createUserCommand = new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'custom:company', Value: companyName },
          { Name: 'custom:tier', Value: 'free' },
        ],
        MessageAction: MessageActionType.SUPPRESS, // Don't send welcome email
        TemporaryPassword: crypto.randomBytes(32).toString('base64'),
      });

      await cognito.send(createUserCommand);

      // Set permanent password
      const setPasswordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        Password: password,
        Permanent: true,
      });

      await cognito.send(setPasswordCommand);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Registration successful',
        }),
      };
    }
    
    // Handle login
    if (path.endsWith('/login')) {
      let body;
      try {
        body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      } catch (parseError) {
        console.error('Failed to parse body:', event.body);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Invalid request body',
            message: 'Request body must be valid JSON',
          }),
        };
      }
      const { email, password } = loginSchema.parse(body);

      // Authenticate user
      const authCommand = new AdminInitiateAuthCommand({
        UserPoolId: USER_POOL_ID,
        ClientId: USER_POOL_CLIENT_ID,
        AuthFlow: AuthFlowType.ADMIN_NO_SRP_AUTH,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      const authResponse = await cognito.send(authCommand);
      
      if (!authResponse.AuthenticationResult?.IdToken) {
        throw new Error('Authentication failed');
      }

      // Get user attributes
      const getUserCommand = new AdminGetUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
      });

      const userResponse = await cognito.send(getUserCommand);
      const companyName = userResponse.UserAttributes?.find(attr => attr.Name === 'custom:company')?.Value || '';
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          token: authResponse.AuthenticationResult.IdToken,
          refreshToken: authResponse.AuthenticationResult.RefreshToken,
          email,
          companyName,
        }),
      };
    }

    // Unknown endpoint
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: 'Not found',
      }),
    };

  } catch (error: any) {
    console.error('Auth error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Validation error',
          details: error.errors,
        }),
      };
    }

    if (error.name === 'UsernameExistsException') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'User already exists',
          message: 'An account with this email already exists',
        }),
      };
    }

    if (error.name === 'NotAuthorizedException') {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          error: 'Authentication failed',
          message: 'Invalid email or password',
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Request failed',
        message: error.message || 'An unexpected error occurred',
      }),
    };
  }
};