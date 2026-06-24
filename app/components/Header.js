'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getBusinesses, searchCategories, getBusinessSubdomainUrl, getCategoryRoute, isBusinessSubdomain, getMainDomainUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const userName = user?.first_name || user?.username || '';
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  const [greeting, setGreeting] = useState(getGreeting);

  const { address, loading, setManualLocation, forwardGeocode, lat, lng, source, country, state, city } = useLocation();
  const [locationValue, setLocationValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname + window.location.search);
    }
  }, [pathname]);

  const getLoginHref = () => {
    if (typeof window === 'undefined') return '/login';
    const isSub = isBusinessSubdomain();
    if (isSub) {
      return `${getMainDomainUrl()}/login?next=${encodeURIComponent(window.location.href)}`;
    }
    if (pathname === '/login' || pathname === '/signup') return '/login';
    return `/login?next=${encodeURIComponent(currentPath)}`;
  };

  const getSignupHref = () => {
    if (typeof window === 'undefined') return '/signup';
    const isSub = isBusinessSubdomain();
    if (isSub) {
      return `${getMainDomainUrl()}/signup?next=${encodeURIComponent(window.location.href)}`;
    }
    if (pathname === '/login' || pathname === '/signup') return '/signup';
    return `/signup?next=${encodeURIComponent(currentPath)}`;
  };

  // Compute home URL once — avoids hydration race conditions
  const getHomeUrl = () => {
    if (typeof window === 'undefined') return '/';
    const hostname = window.location.hostname;
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'nearmee.net';
    const isSub = hostname !== baseDomain &&
                  hostname !== 'localhost' &&
                  hostname !== '127.0.0.1' &&
                  !hostname.startsWith('www.');
    if (isSub) {
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';
      return `${protocol}//${baseDomain}${port}`;
    }
    return '/';
  };

  useEffect(() => {
    if (address) {
      setLocationValue(address);
    }
  }, [address]);

  useEffect(() => {
    const interval = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() && (!locationValue || locationValue === address)) {
      return;
    }

    setSearching(true);

    try {
      let currentLat = lat;
      let currentLng = lng;

      // 1. If location field was manually changed, geocode it
      if (locationValue && locationValue !== address) {
        const result = await forwardGeocode(locationValue);
        if (result) {
          currentLat = result.lat;
          currentLng = result.lng;
          await setManualLocation(locationValue);
        } else {
          alert(`Could not find location "${locationValue}". Please try a different address.`);
          setSearching(false);
          return;
        }
      }

      // 2. Smart Redirect check
      if (searchQuery.trim()) {
        const params = { 
          search: searchQuery.trim(), 
          page_size: 10 
        };
        
        if (currentLat && currentLng) {
          params.lat = currentLat;
          params.lng = currentLng;
          // Use a large radius for IP-based (country-level) location,
          // tight radius for GPS / manual location.
          params.radius = source === 'ip' ? 500 : 10;
        }

        const data = await getBusinesses(params);
        const results = data.results || [];

        // Logic: 
        // - Only redirect if there is an exact name match.
        // This prevents category searches from redirecting to a single business.
        const targetBusiness = results.find(
          biz => biz.name.toLowerCase() === searchQuery.trim().toLowerCase()
        );

        if (targetBusiness) {
          window.location.href = getBusinessSubdomainUrl(targetBusiness.slug || targetBusiness.id);
          return;
        }
      }

        // 3. Fallback check: Is there an exact category name match?
        try {
          if (!searchQuery.trim()) throw new Error('empty');
          const catData = await searchCategories(searchQuery.trim());
          const catResults = catData.results || [];
          const targetCategory = catResults.find(
            cat => cat.name.toLowerCase() === searchQuery.trim().toLowerCase()
          );

          if (targetCategory) {
            const route = getCategoryRoute(targetCategory.slug, { country, state, city });
            router.push(route);
            return;
          }
        } catch (err) {
          console.error('Category search error:', err);
        }

        // 4. Navigate to home page with search query
      const targetUrl = searchQuery.trim() ? `/?search=${encodeURIComponent(searchQuery.trim())}#businesses` : '/#businesses';
      router.push(targetUrl);
    } catch (err) {
      console.error('Search error:', err);
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}#businesses`);
    } finally {
      setSearching(false);
    }
  };

  return (
    <header className="header glass" id="header">
      <div className="header-inner">
        {/* Logo — always an <a> tag; href computed at click time to avoid hydration race */}
        <a
          href="/"
          className="logo"
          id="header-logo"
          onClick={(e) => {
            e.preventDefault();
            setIsMobileSearchOpen(false);
            const dest = getHomeUrl();
            if (dest === '/') {
              window.location.href = '/';
            } else {
              window.location.href = dest;
            }
          }}
        >
          <svg width="100" height="35" viewBox="0 0 110 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="28" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="24" fill="#3B82F6" style={{ letterSpacing: '-1px' }}>near</text>
            <circle cx="75" cy="20" r="18" fill="#3B82F6" />
            <text x="60" y="28" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="24" fill="white" style={{ letterSpacing: '-1px' }}>me</text>
          </svg>
        </a>

        {/* Search Bar - Hidden on Home Page */}
        {pathname !== '/' && (
          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-input-group">
              <span className="search-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="What are you looking for?"
                id="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="location-input-group">
              <span className="location-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              </span>
              <input
                type="text"
                placeholder={loading ? 'Detecting location...' : 'Enter city or area'}
                id="location-input"
                value={locationValue}
                onChange={(e) => setLocationValue(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-search" id="btn-search" disabled={searching}>
              {searching ? '...' : 'Search'}
            </button>
          </form>
        )}

        {/* Nav Links */}
        <nav className="nav-links">
          {pathname !== '/' && (
            <button 
              className="mobile-search-toggle" 
              onClick={() => setIsMobileSearchOpen(true)}
              style={{
                display: 'none',
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#3B82F6',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          )}
          <style>{`
            @media (max-width: 900px) {
              .mobile-search-toggle { display: flex !important; }
            }
          `}</style>
          {isAuthenticated ? (
            <>
              <Link href="/account" style={{ textDecoration: 'none' }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--color-text-dark)',
                }}>
                  <span style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}>
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </span>
                  {userName && <span style={{ whiteSpace: 'nowrap' }}>{greeting}, {userName}</span>}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn-login"
                id="btn-logout"
                style={{ cursor: 'pointer' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {typeof window !== 'undefined' && isBusinessSubdomain() ? (
                <>
                  <a href={getLoginHref()} className="btn-login" id="btn-login">Login</a>
                  <a href={getSignupHref()} className="btn-signup" id="btn-signup">Sign Up</a>
                </>
              ) : (
                <>
                  <Link href={getLoginHref()} className="btn-login" id="btn-login">Login</Link>
                  <Link href={getSignupHref()} className="btn-signup" id="btn-signup">Sign Up</Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="mobile-search-overlay">
          <button 
            className="mobile-search-close"
            onClick={() => setIsMobileSearchOpen(false)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', color: 'var(--color-text-dark)' }}>Search Nearmee</h2>
          
          <form 
            onSubmit={(e) => {
              handleSearch(e);
              setIsMobileSearchOpen(false);
            }}
            className="mobile-search-form"
          >
            <div className="mobile-search-input-group">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input 
                  type="text" 
                  placeholder="What are you looking for?" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1.1rem' }}
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <input 
                  type="text" 
                  placeholder="Location" 
                  value={locationValue}
                  onChange={(e) => setLocationValue(e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1.1rem' }}
                />
              </div>
              <button 
                type="submit" 
                className="btn-search" 
                style={{ height: '56px', borderRadius: '16px', width: '100%', margin: '10px 0 0', fontSize: '1.1rem' }}
                disabled={searching}
              >
                {searching ? 'Searching...' : 'Search Now'}
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
