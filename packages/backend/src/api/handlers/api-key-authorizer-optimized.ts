import { APIGatewayRequestAuthorizerHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import * as crypto from 'crypto';

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const API_KEYS_TABLE = process.env.API_KEYS_TABLE!;

// Helper function to hash API key
function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

// Helper function to generate policy
function generatePolicy(principalId: string, effect: string, resource: string, context?: any) {
  const authResponse: any = {
    principalId,
  };

  if (effect && resource) {
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    };
    authResponse.policyDocument = policyDocument;
  }

  // Add context for downstream use
  if (context) {
    authResponse.context = context;
  }

  return authResponse;
}

export const handler: APIGatewayRequestAuthorizerHandler = async (event) => {
  try {
    // Extract API key from header
    const apiKey = event.headers?.['x-api-key'] || event.headers?.['X-Api-Key'];

    if (!apiKey) {
      throw new Error('Unauthorized');
    }

    // Hash the provided API key
    const hashedKey = hashApiKey(apiKey);

    // Query DynamoDB using GSI for the hashed key
    // Only look for active keys (expired keys are automatically removed by TTL)
    const queryCommand = new QueryCommand({
      TableName: API_KEYS_TABLE,
      IndexName: 'hashedKey-index',
      KeyConditionExpression: 'hashedKey = :hash',
      FilterExpression: '#status = :active',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':hash': hashedKey,
        ':active': 'active',
      },
      Limit: 1, // We only need one match
    });

    const result = await dynamodb.send(queryCommand);

    if (!result.Items || result.Items.length === 0) {
      throw new Error('Unauthorized');
    }

    const keyData = result.Items[0];

    // Generate and return the policy
    // Pass key metadata as context for access logging
    const policy = generatePolicy(
      keyData.userEmail, // Use email as principal
      'Allow',
      event.methodArn,
      {
        apiKeyId: keyData.id,
        userEmail: keyData.userEmail,
        keyName: keyData.name,
      }
    );

    return policy;

  } catch (error) {
    // Any error results in unauthorized
    throw new Error('Unauthorized');
  }
};