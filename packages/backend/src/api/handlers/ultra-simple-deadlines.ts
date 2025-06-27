import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

// Initialize DynamoDB client
const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME!;

// Simple path parameter schema
const pathParamsSchema = z.object({
  country: z.enum(['AU', 'NZ']),
  year: z.string().regex(/^\d{4}$/).transform(Number),
  month: z.string().regex(/^(0?[1-9]|1[0-2])$/).transform(Number), // Allow 1 or 01
});

// Query parameter schema for filtering
const queryParamsSchema = z.object({
  type: z.string().optional(),
  category: z.enum(['tax', 'payroll', 'compliance', 'super', 'other']).optional(),
}).optional();

// Category mappings - which types belong to which category
const CATEGORY_MAPPINGS: Record<string, string[]> = {
  tax: [
    'BAS_QUARTERLY', 'BAS_MONTHLY', 'GST_ANNUAL', 'INCOME_TAX_INDIVIDUAL', 
    'INCOME_TAX_COMPANY', 'FBT', 'PAYG_INSTALMENTS_QUARTERLY', 'PAYG_INSTALMENTS_MONTHLY',
    'TPAR', 'GST_MONTHLY', 'GST_TWO_MONTHLY', 'GST_SIX_MONTHLY', 
    'INCOME_TAX_RETURN', 'COMPANY_TAX_RETURN', 'FBT_QUARTERLY', 'FBT_ANNUAL'
  ],
  payroll: [
    'PAYG_WITHHOLDING_MONTHLY', 'PAYG_WITHHOLDING_QUARTERLY', 'STP_FINALISATION',
    'PAYROLL_TAX_NSW', 'PAYROLL_TAX_VIC', 'PAYROLL_TAX_QLD', 'PAYROLL_TAX_SA',
    'PAYROLL_TAX_WA', 'PAYROLL_TAX_TAS', 'PAYROLL_TAX_NT', 'PAYROLL_TAX_ACT',
    'PAYE', 'EMPLOYER_DEDUCTIONS'
  ],
  compliance: [
    'ANNUAL_COMPANY_REVIEW', 'WORKERS_COMP_NSW', 'WORKERS_COMP_VIC', 
    'WORKERS_COMP_QLD', 'WORKERS_COMP_SA', 'WORKERS_COMP_WA', 
    'WORKERS_COMP_TAS', 'WORKERS_COMP_NT', 'WORKERS_COMP_ACT'
  ],
  super: [
    'SUPER_GUARANTEE', 'KIWISAVER'
  ],
  other: [
    'LAND_TAX_NSW', 'LAND_TAX_VIC', 'LAND_TAX_QLD', 'LAND_TAX_SA',
    'LAND_TAX_WA', 'LAND_TAX_TAS', 'LAND_TAX_ACT', 'PROVISIONAL_TAX', 'RWT'
  ]
};

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Ultra-simple deadlines handler invoked:', event.pathParameters);

  try {
    // Parse and validate path parameters
    const pathParams = pathParamsSchema.parse(event.pathParameters);
    const { country, year, month } = pathParams;

    // Parse query parameters for filtering
    const queryParams = queryParamsSchema.parse(event.queryStringParameters || {});
    const { type, category } = queryParams || {};

    // Calculate date range for the month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = month === 12 
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;

    // For simplicity, use scan with filters (in production, optimize with GSI)
    const scanCommand = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'jurisdiction = :country AND dueDate >= :start AND dueDate < :end',
      ExpressionAttributeValues: {
        ':country': country,
        ':start': startDate,
        ':end': endDate,
      },
    });

    const result = await dynamodb.send(scanCommand);
    let deadlines = result.Items || [];

    // Apply server-side filtering
    if (type) {
      // Filter by specific type
      deadlines = deadlines.filter(d => d.type === type);
    } else if (category) {
      // Filter by category
      const typesInCategory = CATEGORY_MAPPINGS[category] || [];
      deadlines = deadlines.filter(d => typesInCategory.includes(d.type));
    }

    // Sort by due date
    deadlines.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    // Format response - ultra simple!
    const formattedDeadlines = deadlines.map(deadline => ({
      id: deadline.id,
      name: deadline.name,
      date: deadline.dueDate,
      type: deadline.type,
      agency: deadline.agency,
    }));

    // Ultra-simple response format
    const response: any = {
      country,
      year,
      month,
      deadlines: formattedDeadlines,
      count: formattedDeadlines.length,
    };

    // Add filter info if filters were applied
    if (type || category) {
      response.filters = {
        ...(type && { type }),
        ...(category && { category }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(response),
    };

  } catch (error) {
    console.error('Error processing request:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Invalid request',
          details: 'Path must be /v1/deadlines/{country}/{year}/{month}',
          example: '/v1/deadlines/AU/2025/01',
        }),
      };
    }

    // Generic error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal server error',
      }),
    };
  }
};