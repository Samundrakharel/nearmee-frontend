import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export function proxy(request) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host');

  // Define the main domains (you can add more if needed)
  const mainDomains = ['localhost:3000', 'nearme.com', 'www.nearme.com'];

  // Extract subdomain
  let subdomain = null;
  if (host && !mainDomains.includes(host)) {
    // This logic assumes subdomains like "name.localhost:3000" or "name.nearme.com"
    const parts = host.split('.');
    if (parts.length > (host.includes('localhost') ? 1 : 2)) {
      subdomain = parts[0];
    }
  }

  // If a subdomain is detected, rewrite the path
  if (subdomain && subdomain !== 'www') {
    console.log(`Subdomain detected: ${subdomain}, rewriting to /business/${subdomain}`);
    
    // Prevent infinite loops if already at /business/[slug]
    if (!url.pathname.startsWith('/business')) {
       url.pathname = `/business/${subdomain}${url.pathname}`;
       return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}
