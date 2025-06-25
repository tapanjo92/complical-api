import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

// Environment variables
const USER_POOL_ID = process.env.USER_POOL_ID!;
const CLIENT_ID = process.env.CLIENT_ID!;

// Create verifier instance (cached outside handler for reuse)
const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: 'access',
  clientId: CLIENT_ID,
});

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  console.log('Auth request:', JSON.stringify({ 
    methodArn: event.methodArn,
    type: event.type 
  }));

  try {
    // Extract token from Authorization header
    const token = event.authorizationToken.replace('Bearer ', '');
    
    // Verify the token
    const payload = await verifier.verify(token);
    console.log('Token verified successfully:', payload.sub);

    // Extract user information
    const principalId = payload.sub;
    const tier = payload['custom:tier'] || 'developer';
    const rateLimit = payload['custom:rate_limit'] || '100';

    // Generate IAM policy
    const policy = generatePolicy(principalId, 'Allow', event.methodArn, {
      tier,
      rateLimit,
      userId: principalId,
    });

    return policy;

  } catch (error) {
    console.error('Authorization failed:', error);
    
    // Return explicit deny on auth failure
    return generatePolicy('unauthorized', 'Deny', event.methodArn);
  }
};

function generatePolicy(
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string,
  context?: Record<string, any>
): APIGatewayAuthorizerResult {
  const policy: APIGatewayAuthorizerResult = {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };

  // Add context for Lambda functions to access
  if (context && effect === 'Allow') {
    policy.context = context;
  }

  // Add usage identifier for API Gateway caching
  policy.usageIdentifierKey = principalId;

  return policy;
}