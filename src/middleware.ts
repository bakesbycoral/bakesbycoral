import { NextRequest, NextResponse } from 'next/server';

// Map of domains to tenant slugs
const TENANT_DOMAINS: Record<string, string> = {
  'bakesbycoral.com': 'bakes-by-coral',
  'www.bakesbycoral.com': 'bakes-by-coral',
  'leango.com': 'leango',
  'www.leango.com': 'leango',
  // Development domains
  'localhost:3000': 'bakes-by-coral',
};

// Paths that should be rewritten for LeanGo tenant
const LEANGO_PATHS = [
  '/how-we-work',
  '/our-approach',
  '/training',
  '/apps',
  '/analytics',
  '/industries',
  '/about',
  '/careers',
  '/blog',
  '/contact',
  '/book',
];

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || 'localhost:3000';
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and admin
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next();
  }

  // Determine tenant from host
  const tenant = TENANT_DOMAINS[host];

  // If this is a LeanGo domain
  if (tenant === 'leango') {
    // Rewrite root to LeanGo home
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/leango';
      return NextResponse.rewrite(url);
    }

    // Rewrite LeanGo-specific paths
    for (const path of LEANGO_PATHS) {
      if (pathname === path || pathname.startsWith(`${path}/`)) {
        const url = request.nextUrl.clone();
        url.pathname = `/leango${pathname}`;
        return NextResponse.rewrite(url);
      }
    }
  }

  // For development: allow direct access to /leango/* paths
  if (pathname.startsWith('/leango')) {
    return NextResponse.next();
  }

  return NextResponse.next();
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
