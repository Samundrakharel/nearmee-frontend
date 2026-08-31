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

const WELL_KNOWN_FILES = new Set(['/robots.txt', '/sitemap.xml', '/ads.txt']);

// Top-level routes that only exist on the main site. The business tab
// catch-all ([[...tab]]) only recognizes overview/reviews/menu, so rewriting
// these into /business/{slug}/... would 404 — redirect to the main domain
// instead (e.g. pizza-hut.nearmee.net/login → nearmee.net/login).
const MAIN_SITE_ONLY_SEGMENTS = new Set([
  'login', 'signup', 'forgot-password', 'account', 'search', 'category', 'about', 'contact', 'submit-business',
]);

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

  // Forwarded so Server Components (app/layout.js) can read the current
  // pathname via next/headers — there is no other way to get it there, since
  // layouts don't receive route params directly.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  const withPathname = { request: { headers: requestHeaders } };

  // Strip port (e.g. pizza-hut.nearmee.net:3000 → pizza-hut.nearmee.net)
  const hostWithoutPort = hostname.split(':')[0];

  // Pass through if this is the root domain (no subdomain)
  if (MAIN_DOMAINS.has(hostname) || MAIN_DOMAINS.has(hostWithoutPort)) {
    return NextResponse.next(withPathname);
  }

  // Check if this is a subdomain of nearmee.net or nearmee.local
  const isNearmeeNet = hostWithoutPort.endsWith(`.${BASE_DOMAIN}`);
  const isNearmeeLocal = hostWithoutPort.endsWith('.nearmee.local');

  if (!isNearmeeNet && !isNearmeeLocal) {
    return NextResponse.next(withPathname);
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
    return NextResponse.next(withPathname);
  }

  // Prevent infinite rewrite loop
  if (pathname.startsWith('/business')) {
    return NextResponse.next(withPathname);
  }

  // Send main-site-only routes back to the main domain instead of rewriting
  // them into a business tab that doesn't exist.
  const firstSegment = pathname.split('/')[1] || '';
  if (MAIN_SITE_ONLY_SEGMENTS.has(firstSegment)) {
    const mainHost = isNearmeeNet ? BASE_DOMAIN : 'nearmee.local';
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.hostname = mainHost;
    redirectUrl.port = hostname.includes(':') ? hostname.split(':')[1] : '';
    return NextResponse.redirect(redirectUrl);
  }

  // robots.txt/sitemap.xml/ads.txt are per-origin (RFC 9309) and served by
  // the Django backend for every subdomain (see restaurants/subdomain_urls.py).
  // Rewriting them into /business/{slug}/robots.txt etc. would land in the
  // [[...tab]] catch-all, which doesn't recognize those segments and silently
  // renders the Overview tab with a 200 instead of the real file.
  if (WELL_KNOWN_FILES.has(pathname)) {
    return NextResponse.next(withPathname);
  }

  // Rewrite to the business detail page
  // village-corner-bistro.nearmee.local/      → /business/village-corner-bistro
  // village-corner-bistro.nearmee.local/menu  → /business/village-corner-bistro/menu
  const rewritePath = pathname === '/' ? `/business/${slug}` : `/business/${slug}${pathname}`;

  const url = request.nextUrl.clone();
  url.pathname = rewritePath;
  url.search = search;

  return NextResponse.rewrite(url, withPathname);
}

// Support for both naming conventions if necessary
export default proxy;
