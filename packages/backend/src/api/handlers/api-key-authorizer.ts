import { APIGatewayRequestAuthorizerHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
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

  // Optional: add context
  if (context) {
    authResponse.context = context;
  }

  return authResponse;
}

export const handler: APIGatewayRequestAuthorizerHandler = async (event) => {
  console.log('API Key Authorizer invoked:', JSON.stringify(event, null, 2));

  try {
    // Extract API key from header
    const apiKey = event.headers?.['x-api-key'] || event.headers?.['X-Api-Key'];

    if (!apiKey) {
      console.log('No API key provided');
      throw new Error('Unauthorized');
    }

    // Hash the provided API key
    const hashedKey = hashApiKey(apiKey);

    // Look up the hashed key in DynamoDB using GSI
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
    });

    const result = await dynamodb.send(queryCommand);

    if (!result.Items || result.Items.length === 0) {
      console.log('API key not found or inactive');
      throw new Error('Unauthorized');
    }

    const keyData = result.Items[0];

    // Check if key is expired
    const now = new Date();
    const expiresAt = new Date(keyData.expiresAt);

    if (expiresAt < now) {
      console.log('API key expired');
      
      // Update status to expired
      await dynamodb.send(new UpdateCommand({
        TableName: API_KEYS_TABLE,
        Key: { id: keyData.id },
        UpdateExpression: 'SET #status = :expired',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':expired': 'expired',
        },
      }));

      throw new Error('Unauthorized');
    }

    // Update last used timestamp and increment usage count
    await dynamodb.send(new UpdateCommand({
      TableName: API_KEYS_TABLE,
      Key: { id: keyData.id },
      UpdateExpression: 'SET lastUsed = :now, usageCount = usageCount + :inc',
      ExpressionAttributeValues: {
        ':now': now.toISOString(),
        ':inc': 1,
      },
    }));

    // Generate and return the policy
    const policy = generatePolicy(
      keyData.userEmail, // Use email as principal
      'Allow',
      event.methodArn,
      {
        userEmail: keyData.userEmail,
        apiKeyId: keyData.id,
        keyName: keyData.name,
      }
    );

    console.log('API key authorized for user:', keyData.userEmail);
    return policy;

  } catch (error) {
    console.error('Authorization error:', error);
    throw new Error('Unauthorized');
  }
};