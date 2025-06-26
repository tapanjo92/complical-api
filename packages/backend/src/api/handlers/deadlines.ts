import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';
import { getSecurityHeaders } from '../utils/security-headers.js';

const TABLE_NAME = process.env.TABLE_NAME || 'complical-deadlines-dev';
const REGION = process.env.AWS_REGION || 'ap-south-1';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Query parameters schema
const QueryParamsSchema = z.object({
  type: z.enum(['BAS_QUARTERLY', 'BAS_MONTHLY', 'PAYG_WITHHOLDING', 'SUPER_GUARANTEE', 'INCOME_TAX', 'FBT']).optional(),
  from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('50'),
});


export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Request:', JSON.stringify(event, null, 2));

  const origin = event.headers?.origin || event.headers?.Origin;
  const headers = getSecurityHeaders(origin);

  try {
    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: '',
      };
    }

    // Validate HTTP method
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({
          error: 'Method not allowed',
          message: 'This endpoint only supports GET requests',
        }),
      };
    }

    // Parse and validate query parameters
    const queryParams = QueryParamsSchema.parse(event.queryStringParameters || {});

    // Build DynamoDB query
    let queryInput: any = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: {
        ':pk': 'JURISDICTION#AU',
      },
      Limit: queryParams.limit,
    };

    // Add date range filter if provided
    if (queryParams.from_date || queryParams.to_date) {
      const conditions: string[] = ['GSI1PK = :pk'];
      
      if (queryParams.from_date && queryParams.to_date) {
        conditions.push('GSI1SK BETWEEN :from AND :to');
        queryInput.ExpressionAttributeValues[':from'] = queryParams.from_date;
        queryInput.ExpressionAttributeValues[':to'] = queryParams.to_date + 'Z'; // Add Z to include all items on that date
      } else if (queryParams.from_date) {
        conditions.push('GSI1SK >= :from');
        queryInput.ExpressionAttributeValues[':from'] = queryParams.from_date;
      } else if (queryParams.to_date) {
        conditions.push('GSI1SK <= :to');
        queryInput.ExpressionAttributeValues[':to'] = queryParams.to_date + 'Z';
      }
      
      queryInput.KeyConditionExpression = conditions.join(' AND ');
    }

    // Add type filter if provided
    if (queryParams.type) {
      queryInput.FilterExpression = '#type = :type';
      queryInput.ExpressionAttributeNames = { '#type': 'type' };
      queryInput.ExpressionAttributeValues[':type'] = queryParams.type;
    }

    // Execute query
    const result = await docClient.send(new QueryCommand(queryInput));

    // Transform results
    const deadlines = result.Items?.map(item => ({
      id: item.id,
      type: item.type,
      name: item.name,
      description: item.description,
      jurisdiction: item.jurisdiction,
      agency: item.agency,
      dueDate: item.dueDate,
      period: item.period,
      applicableTo: item.applicableTo,
      sourceUrl: item.sourceUrl,
      lastUpdated: item.lastUpdated,
    })) || [];

    // Build response
    const response = {
      deadlines,
      count: deadlines.length,
      lastEvaluatedKey: result.LastEvaluatedKey,
      filters: {
        jurisdiction: 'AU',
        type: queryParams.type,
        dateRange: {
          from: queryParams.from_date,
          to: queryParams.to_date,
        },
      },
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response, null, 2),
    };

  } catch (error) {
    console.error('Error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid request parameters',
          details: error.errors,
        }),
      };
    }

    // Handle other errors
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request',
      }),
    };
  }
};