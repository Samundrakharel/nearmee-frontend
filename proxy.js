import { NextResponse } from 'next/server';

/**
 * Subdomain Routing Proxy (Next.js 16+)
 *
 * When a request arrives at a business subdomain (e.g. pizza-hut.nearmee.net),
 * this proxy rewrites it internally to /business/pizza-hut so the existing
 * business detail page is served — no URL change visible to the user.
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
]);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
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

  // Check if this is a subdomain of nearmee.net
  const subdomainSuffix = `.${BASE_DOMAIN}`;
  const isSubdomain = hostWithoutPort.endsWith(subdomainSuffix);

  if (!isSubdomain) {
    return NextResponse.next();
  }

  // Extract slug: "pizza-hut.nearmee.net" → "pizza-hut"
  const slug = hostWithoutPort.slice(0, hostWithoutPort.length - subdomainSuffix.length);

  // Ignore empty or reserved subdomains
  if (!slug || RESERVED_SUBDOMAINS.has(slug)) {
    return NextResponse.next();
  }

  // Prevent infinite rewrite loop
  if (pathname.startsWith('/business')) {
    return NextResponse.next();
  }

  // Rewrite to the business detail page
  // pizza-hut.nearmee.net/      → /business/pizza-hut
  // pizza-hut.nearmee.net/menu  → /business/pizza-hut/menu (future-proof)
  const rewritePath = pathname === '/' ? `/business/${slug}` : `/business/${slug}${pathname}`;
  const url = request.nextUrl.clone();
  url.pathname = rewritePath;
  url.search = search;

  return NextResponse.rewrite(url);
}
