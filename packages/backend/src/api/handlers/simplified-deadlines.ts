import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || 'complical-deadlines-dev';

// Simplified query parameters schema (Calendarific style)
const SimplifiedQuerySchema = z.object({
  // Support both 'country' and 'countries' for flexibility
  country: z.string().optional(),
  countries: z.string().optional(),
  year: z.string().regex(/^\d{4}$/).optional(),
  month: z.string().regex(/^\d{1,2}$/).optional(),
  type: z.string().optional(),
  limit: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val, 10) : 50),
  offset: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val, 10) : 0),
  // Support API key in query param (with deprecation warning)
  api_key: z.string().optional()
});

// Country code mapping
const COUNTRY_MAPPING: Record<string, string> = {
  'AU': 'AU',
  'AUS': 'AU',
  'AUSTRALIA': 'AU',
  'NZ': 'NZ',
  'NZL': 'NZ',
  'NEW ZEALAND': 'NZ',
  'NEW_ZEALAND': 'NZ',
  'SG': 'SG',
  'SGP': 'SG',
  'SINGAPORE': 'SG'
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const baseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-API-Key,Authorization',
    'X-API-Version': 'v1'
  };
  
  const warning = event.queryStringParameters?.api_key ? 'Using API key in URL is deprecated. Please use X-API-Key header instead.' : undefined;
  const headers = warning ? { ...baseHeaders, 'X-Warning': warning } : baseHeaders;

  try {
    // Parse query parameters
    const query = SimplifiedQuerySchema.parse(event.queryStringParameters || {});
    
    // Handle multiple countries
    let countries: string[] = [];
    if (query.countries) {
      countries = query.countries.split(',').map(c => COUNTRY_MAPPING[c.toUpperCase()] || c.toUpperCase()).filter(Boolean);
    } else if (query.country) {
      const mapped = COUNTRY_MAPPING[query.country.toUpperCase()] || query.country.toUpperCase();
      countries = [mapped];
    } else {
      // Default to all countries if none specified
      countries = ['AU', 'NZ'];
    }

    // Build date range from year/month
    let fromDate: string | undefined;
    let toDate: string | undefined;
    
    if (query.year) {
      if (query.month) {
        const month = query.month.padStart(2, '0');
        fromDate = `${query.year}-${month}-01`;
        const lastDay = new Date(parseInt(query.year), parseInt(month), 0).getDate();
        toDate = `${query.year}-${month}-${lastDay}`;
      } else {
        fromDate = `${query.year}-01-01`;
        toDate = `${query.year}-12-31`;
      }
    }

    // Fetch deadlines for all requested countries
    const allDeadlines = [];
    let totalCount = 0;

    console.log('Querying for countries:', countries);
    console.log('Date range:', { fromDate, toDate });

    for (const country of countries) {
      let params: any = {
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `JURISDICTION#${country}`
        },
        Limit: query.limit + 100 // Get more to allow for filtering
      };
      
      console.log('Query params for', country, ':', JSON.stringify(params));

      // Add date filtering if specified
      if (fromDate && toDate) {
        params.KeyConditionExpression += ' AND GSI1SK BETWEEN :from AND :to';
        params.ExpressionAttributeValues[':from'] = fromDate;
        params.ExpressionAttributeValues[':to'] = toDate;
      }

      // Add type filtering
      if (query.type) {
        params.FilterExpression = '#type = :type';
        params.ExpressionAttributeNames = { '#type': 'type' };
        params.ExpressionAttributeValues[':type'] = query.type.toUpperCase();
      }

      const result = await docClient.send(new QueryCommand(params));
      
      console.log(`Query result for ${country}: ${result.Items?.length || 0} items`);
      
      if (result.Items) {
        const validDeadlines = result.Items.map(item => {
          try {
            // Filter by date range if specified
            if (fromDate && toDate) {
              if (item.dueDate < fromDate || item.dueDate > toDate) {
                return null;
              }
            }
            
            // Transform to Calendarific-style format
            return {
              name: item.name,
              description: item.description,
              country: item.jurisdiction,
              date: {
                iso: item.dueDate,
                datetime: {
                  year: parseInt(item.dueDate.substring(0, 4)),
                  month: parseInt(item.dueDate.substring(5, 7)),
                  day: parseInt(item.dueDate.substring(8, 10))
                }
              },
              type: [item.type],
              meta: {
                id: item.id,
                agency: item.agency,
                period: item.period,
                applicableTo: item.applicableTo,
                sourceUrl: item.sourceUrl
              }
            };
          } catch (error) {
            console.error('Error processing item:', error);
            return null;
          }
        }).filter(Boolean);
        
        allDeadlines.push(...validDeadlines);
        totalCount += validDeadlines.length;
      }
    }

    // Apply offset and limit
    const paginatedDeadlines = allDeadlines.slice(query.offset, query.offset + query.limit);

    // Build response in Calendarific style
    const response = {
      meta: {
        code: 200,
        request_id: event.requestContext.requestId,
        credits_remaining: null, // Would be populated from usage tracking
        warning: event.queryStringParameters?.api_key ? 'Using API key in URL is deprecated. Please use X-API-Key header instead.' : undefined
      },
      response: {
        deadlines: paginatedDeadlines,
        pagination: {
          total: totalCount,
          count: paginatedDeadlines.length,
          limit: query.limit,
          offset: query.offset,
          has_more: (query.offset + query.limit) < totalCount
        },
        filters: {
          countries: countries,
          year: query.year,
          month: query.month,
          type: query.type
        }
      }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response, null, 2)
    };

  } catch (error) {
    console.error('Error in simplified deadlines handler:', error);

    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          meta: {
            code: 400,
            request_id: event.requestContext.requestId
          },
          error: {
            message: 'Invalid request parameters',
            details: error.errors
          }
        }, null, 2)
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        meta: {
          code: 500,
          request_id: event.requestContext.requestId
        },
        error: {
          message: 'Internal server error'
        }
      }, null, 2)
    };
  }
};