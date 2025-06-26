export const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://complical.com',
  'https://www.complical.com',
  'https://app.complical.com',
];

export const getAllowedOrigin = (origin?: string): string => {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  // Default to production domain
  return 'https://complical.com';
};

export const getSecurityHeaders = (origin?: string) => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': getAllowedOrigin(origin),
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key',
  'Access-Control-Max-Age': '3600',
  // Security headers
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none';",
});