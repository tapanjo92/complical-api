import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Stripe from 'stripe';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminAddUserToGroupCommand } from '@aws-sdk/client-cognito-identity-provider';
import { getSecurityHeaders } from '../utils/security-headers.js';
import { z } from 'zod';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({ 
  region: process.env.AWS_REGION || 'ap-south-1' 
});

const USER_POOL_ID = process.env.USER_POOL_ID || '';

// Pricing tiers
const PRICING_TIERS = {
  developer: {
    priceId: process.env.STRIPE_PRICE_DEVELOPER || 'price_developer',
    name: 'Developer',
    price: 0,
    limits: {
      requests: 1000,
      rateLimit: 100,
    },
  },
  professional: {
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional',
    name: 'Professional',
    price: 49,
    limits: {
      requests: 50000,
      rateLimit: 1000,
    },
  },
  enterprise: {
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
    name: 'Enterprise',
    price: 299,
    limits: {
      requests: -1, // Unlimited
      rateLimit: 10000,
    },
  },
};

// Request schemas
const CreateCheckoutSchema = z.object({
  tier: z.enum(['developer', 'professional', 'enterprise']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  customerEmail: z.string().email(),
});

const ManageSubscriptionSchema = z.object({
  customerId: z.string(),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const origin = event.headers?.origin || event.headers?.Origin;
  const headers = getSecurityHeaders(origin);

  try {
    // Handle OPTIONS for CORS
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    // Route based on path
    const path = event.path.split('/').pop();

    switch (path) {
      case 'checkout':
        return await handleCheckout(event, headers);
      
      case 'webhook':
        return await handleWebhook(event, headers);
        
      case 'portal':
        return await handlePortal(event, headers);
        
      case 'plans':
        return handlePlans(headers);
        
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Not found' }),
        };
    }
  } catch (error) {
    console.error('Billing error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid request',
          details: error.errors,
        }),
      };
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process billing request',
      }),
    };
  }
};

async function handleCheckout(
  event: APIGatewayProxyEvent,
  headers: Record<string, string>
): Promise<APIGatewayProxyResult> {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const body = CreateCheckoutSchema.parse(JSON.parse(event.body || '{}'));
  const tier = PRICING_TIERS[body.tier];

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: tier.price > 0 ? [{
      price: tier.priceId,
      quantity: 1,
    }] : undefined,
    mode: tier.price > 0 ? 'subscription' : 'payment',
    success_url: body.successUrl,
    cancel_url: body.cancelUrl,
    customer_email: body.customerEmail,
    metadata: {
      tier: body.tier,
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      sessionId: session.id,
      url: session.url,
    }),
  };
}

async function handleWebhook(
  event: APIGatewayProxyEvent,
  headers: Record<string, string>
): Promise<APIGatewayProxyResult> {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing signature' }),
    };
  }

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body || '',
      sig,
      webhookSecret
    );

    // Handle the event
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
        
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true }),
    };
  } catch (err) {
    console.error('Webhook error:', err);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Webhook error' }),
    };
  }
}

async function handlePortal(
  event: APIGatewayProxyEvent,
  headers: Record<string, string>
): Promise<APIGatewayProxyResult> {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const body = ManageSubscriptionSchema.parse(JSON.parse(event.body || '{}'));

  // Create portal session for customer to manage subscription
  const session = await stripe.billingPortal.sessions.create({
    customer: body.customerId,
    return_url: `${process.env.APP_URL}/dashboard`,
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      url: session.url,
    }),
  };
}

function handlePlans(headers: Record<string, string>): APIGatewayProxyResult {
  const plans = Object.entries(PRICING_TIERS).map(([key, tier]) => ({
    id: key,
    name: tier.name,
    price: tier.price,
    limits: tier.limits,
    features: getFeatures(key),
  }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ plans }),
  };
}

function getFeatures(tier: string): string[] {
  const baseFeatures = [
    'Access to AU compliance deadlines',
    'RESTful API access',
    'Email support',
  ];

  const tierFeatures = {
    developer: [
      ...baseFeatures,
      '1,000 API calls/month',
      '100 requests/minute rate limit',
      'Community support',
    ],
    professional: [
      ...baseFeatures,
      '50,000 API calls/month',
      '1,000 requests/minute rate limit',
      'Priority email support',
      'Webhook notifications',
      'Custom integrations',
    ],
    enterprise: [
      ...baseFeatures,
      'Unlimited API calls',
      '10,000 requests/minute rate limit',
      '24/7 phone support',
      'Custom SLA',
      'Dedicated account manager',
      'Multi-region access',
    ],
  };

  return tierFeatures[tier as keyof typeof tierFeatures] || baseFeatures;
}

// Helper function to handle checkout completion
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout completion:', session.id);
  
  if (!session.customer_email || !session.metadata?.tier) {
    console.error('Missing required session data');
    return;
  }

  const email = session.customer_email;
  const tier = session.metadata.tier as keyof typeof PRICING_TIERS;
  const customerId = session.customer as string;

  try {
    // Create Cognito user
    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'custom:stripe_customer_id', Value: customerId },
        { Name: 'custom:subscription_tier', Value: tier },
      ],
      MessageAction: 'SUPPRESS', // Don't send welcome email
      TemporaryPassword: generateTempPassword(),
    });

    await cognitoClient.send(createUserCommand);
    console.log('Created Cognito user:', email);

    // Add user to appropriate group
    const addToGroupCommand = new AdminAddUserToGroupCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      GroupName: `tier_${tier}`,
    });

    await cognitoClient.send(addToGroupCommand);
    console.log(`Added user to group: tier_${tier}`);

  } catch (error) {
    console.error('Error creating Cognito user:', error);
    // Could implement retry logic or dead letter queue here
  }
}

// Helper function to handle subscription updates
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('Processing subscription update:', subscription.id);
  
  // Get customer email from Stripe
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  
  if (!customer.email) {
    console.error('Customer email not found');
    return;
  }

  // Determine new tier based on subscription status
  let newTier = 'developer'; // Default to free tier
  
  if (subscription.status === 'active') {
    // Find which price ID matches
    for (const [tierName, tierConfig] of Object.entries(PRICING_TIERS)) {
      if (subscription.items.data.some((item: any) => item.price.id === tierConfig.priceId)) {
        newTier = tierName;
        break;
      }
    }
  }

  // Update user attributes in Cognito
  // Note: In production, you'd use AdminUpdateUserAttributes command
  console.log(`Would update user ${customer.email} to tier: ${newTier}`);
}

// Generate temporary password for Cognito user
function generateTempPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}