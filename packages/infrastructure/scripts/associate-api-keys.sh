#!/bin/bash

# Get the usage plan ID
USAGE_PLAN_ID="osdyjp"

# Get all API key IDs
API_KEYS=$(aws apigateway get-api-keys --query 'items[?enabled==`true`].id' --output text)

echo "Associating API keys with usage plan $USAGE_PLAN_ID..."

for KEY_ID in $API_KEYS; do
    echo "Associating API key: $KEY_ID"
    aws apigateway create-usage-plan-key \
        --usage-plan-id $USAGE_PLAN_ID \
        --key-id $KEY_ID \
        --key-type API_KEY \
        2>/dev/null || echo "  - Already associated or error"
done

echo "Done! Associated all API keys with the usage plan."