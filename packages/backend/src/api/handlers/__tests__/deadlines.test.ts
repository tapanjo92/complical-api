import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handler } from '../deadlines';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Mock AWS SDK
vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: vi.fn(() => ({
      send: vi.fn(),
    })),
  },
  QueryCommand: vi.fn(),
}));

describe('Deadlines Lambda Handler', () => {
  let mockEvent: Partial<APIGatewayProxyEvent>;

  beforeEach(() => {
    mockEvent = {
      httpMethod: 'GET',
      headers: {},
      queryStringParameters: null,
      pathParameters: null,
      body: null,
    };
  });

  it('should return 200 for OPTIONS request (CORS)', async () => {
    mockEvent.httpMethod = 'OPTIONS';
    
    const result = await handler(mockEvent as APIGatewayProxyEvent);
    
    expect(result.statusCode).toBe(200);
    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin');
  });

  it('should return 405 for non-GET requests', async () => {
    mockEvent.httpMethod = 'POST';
    
    const result = await handler(mockEvent as APIGatewayProxyEvent);
    
    expect(result.statusCode).toBe(405);
    expect(JSON.parse(result.body)).toHaveProperty('error', 'Method not allowed');
  });

  it('should validate query parameters', async () => {
    mockEvent.queryStringParameters = {
      type: 'INVALID_TYPE',
    };
    
    const result = await handler(mockEvent as APIGatewayProxyEvent);
    
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toHaveProperty('error', 'Invalid request parameters');
  });

  it('should accept valid query parameters', async () => {
    mockEvent.queryStringParameters = {
      type: 'BAS_QUARTERLY',
      from_date: '2024-01-01',
      to_date: '2024-12-31',
      limit: '50',
    };

    // Mock DynamoDB response
    const mockSend = vi.fn().mockResolvedValue({
      Items: [
        {
          id: 'test-deadline',
          type: 'BAS_QUARTERLY',
          name: 'Test Deadline',
          dueDate: '2024-03-31',
        },
      ],
    });

    vi.mocked(DynamoDBDocumentClient.from).mockReturnValue({
      send: mockSend,
    } as any);
    
    const result = await handler(mockEvent as APIGatewayProxyEvent);
    
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('deadlines');
    expect(body).toHaveProperty('count');
  });
});