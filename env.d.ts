// Cloudflare environment bindings
interface CloudflareEnv {
  DB: D1Database;
  UPLOADS: R2Bucket;
  bakesbycoral_stripe_secret_key: string;
  bakesbycoral_stripe_publishable_key: string;
  bakesbycoral_stripe_webhook_secret: string;
  bakesbycoral_resend_api_key: string;
  bakesbycoral_session_secret: string;
}

declare module '@cloudflare/next-on-pages' {
  export function getRequestContext(): {
    env: CloudflareEnv;
    ctx: ExecutionContext;
    cf: IncomingRequestCfProperties;
  };
}
