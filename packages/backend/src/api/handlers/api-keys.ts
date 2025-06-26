import { APIGatewayProxyHandler } from 'aws-lambda';
import { APIGatewayClient, CreateApiKeyCommand, DeleteApiKeyCommand, GetApiKeysCommand, CreateUsagePlanKeyCommand } from '@aws-sdk/client-api-gateway';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { z } from 'zod';
import * as crypto from 'crypto';

const apigateway = new APIGatewayClient({});
const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ssm = new SSMClient({});

const API_KEYS_TABLE = process.env.API_KEYS_TABLE!;
const USAGE_PLAN_SSM_PARAMETER = process.env.USAGE_PLAN_SSM_PARAMETER!;

// Cache the usage plan ID
let cachedUsagePlanId: string | null = null;

async function getUsagePlanId(): Promise<string | null> {
  if (cachedUsagePlanId) {
    return cachedUsagePlanId;
  }

  try {
    const command = new GetParameterCommand({
      Name: USAGE_PLAN_SSM_PARAMETER,
    });
    const response = await ssm.send(command);
    cachedUsagePlanId = response.Parameter?.Value || null;
    return cachedUsagePlanId;
  } catch (error) {
    console.error('Failed to get usage plan ID from SSM:', error);
    return null;
  }
}

// Schema for creating API key
const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const handler: APIGatewayProxyHandler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    // Extract user email from JWT claims
    const claims = event.requestContext.authorizer?.claims;
    if (!claims?.email) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const userEmail = claims.email;
    const path = event.path;
    const method = event.httpMethod;

    // POST /v1/auth/api-keys - Create new API key
    if (method === 'POST' && path.endsWith('/api-keys')) {
      const body = JSON.parse(event.body || '{}');
      const { name, description } = createApiKeySchema.parse(body);

      // Generate unique API key name
      const timestamp = Date.now();
      const apiKeyName = `${userEmail}-${name.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}`;

      // Create API key in API Gateway
      const createCommand = new CreateApiKeyCommand({
        name: apiKeyName,
        description: description || `API key for ${userEmail}`,
        enabled: true,
        tags: {
          userEmail,
          keyName: name,
        },
      });

      const apiKeyResponse = await apigateway.send(createCommand);

      if (!apiKeyResponse.id || !apiKeyResponse.value) {
        throw new Error('Failed to create API key');
      }

      // Associate with usage plan
      const usagePlanId = await getUsagePlanId();
      if (usagePlanId) {
        try {
          const associateCommand = new CreateUsagePlanKeyCommand({
            usagePlanId,
            keyId: apiKeyResponse.id,
            keyType: 'API_KEY',
          });
          await apigateway.send(associateCommand);
          console.log(`Associated API key ${apiKeyResponse.id} with usage plan ${usagePlanId}`);
        } catch (error: any) {
          // Log but don't fail if association fails
          console.error('Failed to associate API key with usage plan:', error);
        }
      } else {
        console.warn('No usage plan ID available, API key created without usage plan association');
      }

      // Store API key metadata in DynamoDB
      const keyMetadata = {
        id: apiKeyResponse.id,
        userEmail,
        name,
        description,
        createdAt: new Date().toISOString(),
        lastUsed: null,
        status: 'active',
      };

      await dynamodb.send(new PutCommand({
        TableName: API_KEYS_TABLE,
        Item: keyMetadata,
      }));

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          id: apiKeyResponse.id,
          name,
          description,
          apiKey: apiKeyResponse.value,
          createdAt: keyMetadata.createdAt,
        }),
      };
    }

    // GET /v1/auth/api-keys - List user's API keys
    if (method === 'GET' && path.endsWith('/api-keys')) {
      const queryCommand = new QueryCommand({
        TableName: API_KEYS_TABLE,
        IndexName: 'userEmail-createdAt-index',
        KeyConditionExpression: 'userEmail = :email',
        ExpressionAttributeValues: {
          ':email': userEmail,
        },
      });

      const result = await dynamodb.send(queryCommand);

      // Don't return the actual API key values, just metadata
      const keys = result.Items?.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        createdAt: item.createdAt,
        lastUsed: item.lastUsed,
        status: item.status,
      })) || [];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ apiKeys: keys }),
      };
    }

    // DELETE /v1/auth/api-keys/{id} - Delete an API key
    if (method === 'DELETE' && path.includes('/api-keys/')) {
      const keyId = path.split('/').pop();
      if (!keyId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid API key ID' }),
        };
      }

      // Verify ownership by checking DynamoDB
      const getCommand = new GetCommand({
        TableName: API_KEYS_TABLE,
        Key: { id: keyId },
      });

      const keyData = await dynamodb.send(getCommand);
      
      if (!keyData.Item || keyData.Item.userEmail !== userEmail) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'API key not found' }),
        };
      }

      // Delete from API Gateway
      const deleteCommand = new DeleteApiKeyCommand({
        apiKey: keyId,
      });

      await apigateway.send(deleteCommand);

      // Delete from DynamoDB
      await dynamodb.send(new DeleteCommand({
        TableName: API_KEYS_TABLE,
        Key: { id: keyId },
      }));

      return {
        statusCode: 204,
        headers,
        body: '',
      };
    }

    // Unknown endpoint
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };

  } catch (error: any) {
    console.error('API key management error:', error);
    
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