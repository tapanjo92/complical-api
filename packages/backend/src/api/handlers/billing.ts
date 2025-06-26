import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Stripe from 'stripe';
import { z } from 'zod';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

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
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://complical.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

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
        // TODO: Create user in Cognito, assign tier
        console.log('Checkout completed:', session);
        break;
        
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        // TODO: Update user tier in Cognito
        console.log('Subscription updated:', subscription);
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