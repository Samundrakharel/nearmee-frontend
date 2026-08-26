// app/lib/auth-cookies.js

// Dynamic domain resolution helper.
// NOTE: window.location.hostname NEVER includes the port number.
// Cookie domain attributes MUST NOT include port numbers — they are ignored/rejected by browsers.
function getCookieDomain() {
  if (typeof window === 'undefined') return '';

  // hostname is always port-free: "hotel-yak-yeti.nearmee.local" not "hotel-yak-yeti.nearmee.local:3000"
  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Cannot set a wildcard cookie domain for localhost — return empty (no domain attr)
    return '';
  }

  // Matches doersmarketing.local AND any subdomain like hotel-yak-yeti.doersmarketing.local
  if (hostname === 'doersmarketing.local' || hostname.endsWith('.doersmarketing.local')) {
    return '.doersmarketing.local';
  }

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'doersmarketing.com';
  if (hostname === baseDomain || hostname.endsWith(`.${baseDomain}`)) {
    return `.${baseDomain}`;
  }

  return '';
}

/**
 * setTokens(access, refresh) → sets both cookies with appropriate attributes.
 */
export function setTokens(access, refresh) {
  if (typeof window === 'undefined') return;

  const domain = getCookieDomain();
  const domainStr = domain ? `; domain=${domain}` : "";
  const baseSecure = window.location.protocol === 'https:' ? '; secure' : '';

  // Access token cookie (expires in 15 minutes)
  const accessExpiry = new Date();
  accessExpiry.setTime(accessExpiry.getTime() + (15 * 60 * 1000));
  document.cookie = `access_token=${encodeURIComponent(access || "")}; expires=${accessExpiry.toUTCString()}${domainStr}; path=/; SameSite=Lax${baseSecure}`;

  // Refresh token cookie (expires in 7 days)
  if (refresh) {
    const refreshExpiry = new Date();
    refreshExpiry.setTime(refreshExpiry.getTime() + (7 * 24 * 60 * 60 * 1000));
    document.cookie = `refresh_token=${encodeURIComponent(refresh || "")}; expires=${refreshExpiry.toUTCString()}${domainStr}; path=/; SameSite=Lax${baseSecure}`;
  }
}

/**
 * getAccessToken() → reads access_token cookie
 */
export function getAccessToken() {
  if (typeof window === 'undefined') return null;

  const nameEQ = "access_token=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

/**
 * getRefreshToken() → reads refresh_token cookie
 */
export function getRefreshToken() {
  if (typeof window === 'undefined') return null;

  const nameEQ = "refresh_token=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

/**
 * clearTokens() → removes both cookies from the shared domain and current path
 */
export function clearTokens() {
  if (typeof window === 'undefined') return;

  const domain = getCookieDomain();
  const domainStr = domain ? `; domain=${domain}` : "";
  
  // Set expiration date in the past to delete the cookies
  document.cookie = `access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT${domainStr}; SameSite=Lax`;
  document.cookie = `refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT${domainStr}; SameSite=Lax`;
}
