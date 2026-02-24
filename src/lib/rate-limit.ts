// Simple in-memory rate limiter for edge runtime
// Uses a Map to track request counts per IP with sliding window

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup stale entries periodically (every 100 checks)
let cleanupCounter = 0;
function cleanupStaleEntries() {
  cleanupCounter++;
  if (cleanupCounter % 100 !== 0) return;
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  maxRequests: number;  // Max requests per window
  windowMs: number;     // Window size in milliseconds
}

// Predefined rate limit configs
export const RATE_LIMITS = {
  login: { maxRequests: 5, windowMs: 15 * 60 * 1000 },       // 5 per 15 min
  setup: { maxRequests: 3, windowMs: 60 * 60 * 1000 },       // 3 per hour
  publicForm: { maxRequests: 10, windowMs: 60 * 60 * 1000 },  // 10 per hour
  contact: { maxRequests: 5, windowMs: 60 * 60 * 1000 },      // 5 per hour
  newsletter: { maxRequests: 5, windowMs: 60 * 60 * 1000 },   // 5 per hour
  couponValidation: { maxRequests: 30, windowMs: 60 * 60 * 1000 }, // 30 per hour
  quoteToken: { maxRequests: 20, windowMs: 15 * 60 * 1000 },  // 20 per 15 min
  cron: { maxRequests: 5, windowMs: 60 * 60 * 1000 },         // 5 per hour
  emailSend: { maxRequests: 10, windowMs: 60 * 60 * 1000 },   // 10 per hour
  contractToken: { maxRequests: 20, windowMs: 15 * 60 * 1000 }, // 20 per 15 min
} as const;

export function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Check if request is rate limited.
 * Returns { limited: false } if allowed, or { limited: true, retryAfterMs } if blocked.
 */
export function checkRateLimit(
  ip: string,
  endpoint: string,
  config: RateLimitConfig
): { limited: boolean; retryAfterMs?: number; remaining?: number } {
  cleanupStaleEntries();

  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return { limited: false, remaining: config.maxRequests - 1 };
  }

  if (entry.count >= config.maxRequests) {
    return { limited: true, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { limited: false, remaining: config.maxRequests - entry.count };
}

/**
 * Helper to apply rate limiting and return a 429 response if exceeded.
 * Returns null if request is allowed, or a NextResponse if blocked.
 */
export function rateLimit(
  request: Request,
  endpoint: string,
  config: RateLimitConfig
): Response | null {
  const ip = getClientIp(request);
  const result = checkRateLimit(ip, endpoint, config);

  if (result.limited) {
    const retryAfterSeconds = Math.ceil((result.retryAfterMs || 60000) / 1000);
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfterSeconds),
        },
      }
    );
  }

  return null;
}
