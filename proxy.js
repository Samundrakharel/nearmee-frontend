import { NextResponse } from 'next/server';

/**
 * Subdomain Routing Proxy
 * 
 * Handles rewriting business subdomains (e.g., pizza-hut.nearmee.net)
 * to internal routes (/business/pizza-hut).
 */

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'nearmee.net';

// Subdomains that should NOT be treated as business slugs
const RESERVED_SUBDOMAINS = new Set(['www', 'app', 'api', 'admin', 'mail', 'smtp', 'staging']);

// Main domains (root domain — no subdomain routing)
const MAIN_DOMAINS = new Set([
  'nearmee.net',
  'www.nearmee.net',
  'localhost',
  'localhost:3000',
  'nearmee.local',
  'nearmee.local:3000',
]);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Strip port (e.g. pizza-hut.nearmee.net:3000 → pizza-hut.nearmee.net)
  const hostWithoutPort = hostname.split(':')[0];

  // Pass through if this is the root domain (no subdomain)
  if (MAIN_DOMAINS.has(hostname) || MAIN_DOMAINS.has(hostWithoutPort)) {
    return NextResponse.next();
  }

  // Check if this is a subdomain of nearmee.net or nearmee.local
  const isNearmeeNet = hostWithoutPort.endsWith(`.${BASE_DOMAIN}`);
  const isNearmeeLocal = hostWithoutPort.endsWith('.nearmee.local');

  if (!isNearmeeNet && !isNearmeeLocal) {
    return NextResponse.next();
  }

  // Extract slug
  let slug = '';
  if (isNearmeeNet) {
    slug = hostWithoutPort.slice(0, hostWithoutPort.length - BASE_DOMAIN.length - 1);
  } else if (isNearmeeLocal) {
    slug = hostWithoutPort.slice(0, hostWithoutPort.length - '.nearmee.local'.length);
  }

  // Ignore empty or reserved subdomains
  if (!slug || RESERVED_SUBDOMAINS.has(slug)) {
    return NextResponse.next();
  }

  // Prevent infinite rewrite loop
  if (pathname.startsWith('/business')) {
    return NextResponse.next();
  }

  // Rewrite to the business detail page
  // village-corner-bistro.nearmee.local/      → /business/village-corner-bistro
  // village-corner-bistro.nearmee.local/menu  → /business/village-corner-bistro/menu
  const rewritePath = pathname === '/' ? `/business/${slug}` : `/business/${slug}${pathname}`;
  
  const url = request.nextUrl.clone();
  url.pathname = rewritePath;
  url.search = search;

  return NextResponse.rewrite(url);
}

// Support for both naming conventions if necessary
export default proxy;
