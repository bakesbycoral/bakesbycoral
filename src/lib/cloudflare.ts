// Cloudflare context helper that works in both local dev and production

interface CloudflareEnv {
  DB: D1Database;
  UPLOADS: R2Bucket;
  bakesbycoral_stripe_secret_key: string;
  bakesbycoral_stripe_publishable_key: string;
  bakesbycoral_stripe_webhook_secret: string;
  bakesbycoral_resend_api_key: string;
  bakesbycoral_session_secret: string;
}

const cloudflareRequestContextSymbol = Symbol.for('__cloudflare-request-context__');

function getRequestContextSafe() {
  return (globalThis as { [key: symbol]: unknown })[cloudflareRequestContextSymbol] as
    | { env: CloudflareEnv }
    | undefined;
}

// In local development, we'll use environment variables
// In production on Cloudflare, we use getRequestContext
export function getEnv(): CloudflareEnv {
  // Check if we're in Cloudflare Pages environment
  if (typeof process !== 'undefined' && process.env.CF_PAGES) {
    const ctx = getRequestContextSafe();
    if (ctx) return ctx.env;
  }

  // Local development - getRequestContext should work with wrangler pages dev
  const ctx = getRequestContextSafe();
  if (ctx) return ctx.env;

  // Fallback for pure next dev without wrangler
  throw new Error(
    'Cloudflare bindings not available. Run with "npm run preview" for full functionality, or use "npm run dev" for UI-only development.'
  );
}
