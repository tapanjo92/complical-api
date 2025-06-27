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
// Australian deadline types
const AUDeadlineTypes = z.enum([
  // Federal - ATO
  'BAS_QUARTERLY',
  'BAS_MONTHLY',
  'PAYG_WITHHOLDING',
  'PAYG_INSTALMENTS',
  'SUPER_GUARANTEE',
  'INCOME_TAX',
  'COMPANY_TAX',
  'FBT',
  'GST',
  'STP_FINALISATION',
  'TPAR',
  
  // Federal - ASIC
  'ASIC_ANNUAL_REVIEW',
  
  // State Revenue
  'PAYROLL_TAX_NSW',
  'PAYROLL_TAX_NSW_ANNUAL',
  'PAYROLL_TAX_VIC',
  'PAYROLL_TAX_VIC_ANNUAL',
  'PAYROLL_TAX_QLD',
  'PAYROLL_TAX_QLD_ANNUAL',
  'PAYROLL_TAX_SA',
  'PAYROLL_TAX_SA_ANNUAL',
  'PAYROLL_TAX_WA',
  'PAYROLL_TAX_WA_ANNUAL',
  'PAYROLL_TAX_TAS',
  'PAYROLL_TAX_TAS_ANNUAL',
  'PAYROLL_TAX_NT',
  'PAYROLL_TAX_NT_ANNUAL',
  'PAYROLL_TAX_ACT',
  'PAYROLL_TAX_ACT_ANNUAL',
  'LAND_TAX_NSW',
  'LAND_TAX_VIC',
  'LAND_TAX_QLD',
  'LAND_TAX_SA',
  'LAND_TAX_WA',
  'LAND_TAX_TAS',
  'LAND_TAX_ACT',
  
  // Other Compliance
  'WORKERS_COMP_NSW',
  'WORKERS_COMP_VIC',
  'WORKERS_COMP_QLD',
  'WORKERS_COMP_SA',
  'WORKERS_COMP_WA',
  'WORKERS_COMP_TAS',
  'WORKERS_COMP_NT',
  'WORKERS_COMP_ACT',
]);

// New Zealand deadline types  
const NZDeadlineTypes = z.enum(['GST_MONTHLY', 'GST_2MONTHLY', 'GST_6MONTHLY', 'PAYE', 'PAYE_LARGE', 'PROVISIONAL_TAX', 'PROVISIONAL_TAX_RATIO', 'PROVISIONAL_TAX_AIM', 'IR3', 'FBT_QUARTERLY', 'FBT_ANNUAL', 'KIWISAVER']);

const QueryParamsSchema = z.object({
  type: z.string().optional(),
  from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('50'),
  nextToken: z.string().optional(), // For pagination
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
    
    // Determine jurisdiction from path
    const path = event.path;
    let jurisdiction = 'AU'; // default
    let validTypes: typeof AUDeadlineTypes | typeof NZDeadlineTypes = AUDeadlineTypes;
    
    if (path.includes('/nz/')) {
      jurisdiction = 'NZ';
      validTypes = NZDeadlineTypes;
    }
    
    // Validate type if provided
    if (queryParams.type) {
      try {
        validTypes.parse(queryParams.type);
      } catch (e) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Invalid deadline type',
            message: `Invalid type for ${jurisdiction}. Valid types are: ${validTypes.options.join(', ')}`,
          }),
        };
      }
    }

    // Build DynamoDB query
    let queryInput: any = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `JURISDICTION#${jurisdiction}`,
      },
      Limit: queryParams.limit,
    };

    // Handle pagination
    if (queryParams.nextToken) {
      try {
        const decodedToken = JSON.parse(Buffer.from(queryParams.nextToken, 'base64').toString('utf-8'));
        queryInput.ExclusiveStartKey = decodedToken;
      } catch (error) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Invalid pagination token',
            message: 'The provided nextToken is invalid or corrupted',
          }),
        };
      }
    }

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

    // Build response with meta information
    const response: any = {
      meta: {
        code: 200,
        request_id: event.requestContext?.requestId,
        version: 'v1',
      },
      deadlines,
      count: deadlines.length,
      filters: {
        jurisdiction,
        type: queryParams.type,
        dateRange: {
          from: queryParams.from_date,
          to: queryParams.to_date,
        },
      },
    };

    // Add pagination token if there are more results
    if (result.LastEvaluatedKey) {
      response.nextToken = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
    }

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
          meta: {
            code: 400,
            request_id: event.requestContext?.requestId,
          },
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
        meta: {
          code: 500,
          request_id: event.requestContext?.requestId,
        },
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request',
      }),
    };
  }
};