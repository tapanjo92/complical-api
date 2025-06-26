// Configuration loader for static deployment
declare global {
  interface Window {
    COMPLICAL_CONFIG?: {
      API_URL: string;
      COGNITO_REGION: string;
      COGNITO_USER_POOL_ID: string;
      COGNITO_CLIENT_ID: string;
      STRIPE_PUBLISHABLE_KEY: string;
    };
  }
}

// Default configuration for development
const defaultConfig = {
  API_URL: 'https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev',
  COGNITO_REGION: 'ap-south-1',
  COGNITO_USER_POOL_ID: 'ap-south-1_BtXXs77zt',
  COGNITO_CLIENT_ID: '64pq56h3al1l1r7ehfhflgujib',
  STRIPE_PUBLISHABLE_KEY: '',
};

// Get configuration from window object or use defaults
export const getConfig = () => {
  if (typeof window !== 'undefined' && window.COMPLICAL_CONFIG) {
    return window.COMPLICAL_CONFIG;
  }
  return defaultConfig;
};

export const config = getConfig();