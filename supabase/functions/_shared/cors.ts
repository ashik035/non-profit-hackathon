/**
 * CORS Configuration - Restricted to approved domains
 * SECURITY: DO NOT use '*' as origin - use explicit whitelist
 */

// Static allowlist (exact origins)
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
  'https://non-profit-hackathon.vercel.app',
  'https://controltower.collabai.software',
];

/**
 * Whether an app origin is allowed (OAuth return URLs, CORS).
 */
export function isAllowedAppOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;

  if (ALLOWED_ORIGINS.includes(origin)) return true;

  const isLovablePreview =
    origin.endsWith('.lovableproject.com') || origin.endsWith('.lovable.app');
  const isLocalhost =
    origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
  const isVercelPreview =
    origin.endsWith('.vercel.app') && origin.startsWith('https://');
  const isNonprofitAi =
    origin.endsWith('.nonprofitai.software') && origin.startsWith('https://');

  return isLovablePreview || isLocalhost || isVercelPreview || isNonprofitAi;
}

/**
 * Get CORS headers based on request origin
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = isAllowedAppOrigin(origin);
  const allowedOrigin = isAllowed ? (origin as string) : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Max-Age': '3600',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  };
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Max-Age': '3600',
};

export function handleCorsPreflight(origin: string | null): Response {
  return new Response('ok', {
    headers: getCorsHeaders(origin),
    status: 200,
  });
}
