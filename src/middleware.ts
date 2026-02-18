import { NextRequest, NextResponse } from 'next/server';

// Security headers applied to all responses
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function addSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

// Map of domains to tenant slugs
const TENANT_DOMAINS: Record<string, string> = {
  'bakesbycoral.com': 'bakes-by-coral',
  'www.bakesbycoral.com': 'bakes-by-coral',
  // Development domains
  'localhost:3000': 'bakes-by-coral',
};

// Production domains that should be indexed
const PRODUCTION_DOMAINS = ['bakesbycoral.com', 'www.bakesbycoral.com'];

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || 'localhost:3000';
  const { pathname } = request.nextUrl;

  // Skip middleware for static files
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') // Static files
  ) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Block indexing on non-production domains (e.g. workers.dev)
  if (!PRODUCTION_DOMAINS.includes(host) && !host.startsWith('localhost')) {
    const response = addSecurityHeaders(NextResponse.next());
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  // Add security headers to API and admin routes
  if (pathname.startsWith('/api') || pathname.startsWith('/admin')) {
    return addSecurityHeaders(NextResponse.next());
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
