import { APIGatewayClient, CreateUsagePlanKeyCommand } from '@aws-sdk/client-api-gateway';

const apigateway = new APIGatewayClient({});

export async function associateApiKeyWithUsagePlan(apiKeyId: string, usagePlanId: string): Promise<void> {
  try {
    const command = new CreateUsagePlanKeyCommand({
      usagePlanId,
      keyId: apiKeyId,
      keyType: 'API_KEY',
    });

    await apigateway.send(command);
    console.log(`Successfully associated API key ${apiKeyId} with usage plan ${usagePlanId}`);
  } catch (error: any) {
    // Ignore if already associated
    if (error.name === 'ConflictException') {
      console.log(`API key ${apiKeyId} already associated with usage plan`);
      return;
    }
    throw error;
  }
}