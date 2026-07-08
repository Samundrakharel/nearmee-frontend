import { NextResponse } from 'next/server';

/**
 * Server-side proxy for ipapi.co.
 *
 * ipapi.co doesn't reliably send Access-Control-Allow-Origin, so calling it
 * directly from the browser gets blocked by CORS (especially from localhost
 * or once the free-tier rate limit kicks in). Server-to-server requests
 * aren't subject to CORS, so we fetch it here and hand back plain JSON.
 */
export async function GET(request) {
  // Forward the visitor's real IP so ipapi.co doesn't geolocate our own server.
  const forwardedFor = request.headers.get('x-forwarded-for');
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : null;
  const url = clientIp ? `https://ipapi.co/${clientIp}/json/` : 'https://ipapi.co/json/';

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'nearmee-frontend' } });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (err) {
    return NextResponse.json({ error: 'IP geolocation lookup failed' }, { status: 502 });
  }
}
