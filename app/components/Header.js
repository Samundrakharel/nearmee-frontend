'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getBusinesses, searchCategories, getRestaurantCategories, getBusinessSubdomainUrl, getCategoryRoute, isBusinessSubdomain, getMainDomainUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

// Top-level category groups for the second navbar row.
// Each entry has a label, icon, and optional sub-categories that expand on hover.
const NAV_CATEGORIES = [
  {
    label: 'RESTAURANT',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
    slug: 'restaurant',
  },
];

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

  const { address, loading, setManualLocation, lat, lng, source, country, state, city, stateCode, countryCode } = useLocation();
  const [locationValue, setLocationValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [mounted, setMounted] = useState(false);

  // Sub-category dropdown state
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [subCategories, setSubCategories] = useState({});
  const dropdownTimerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname + window.location.search);
    }
  }, [pathname]);

  // Fetch categories for dropdown menus
  useEffect(() => {
    let cancelled = false;
    getRestaurantCategories()
      .then((data) => {
        if (cancelled) return;
        const cats = (data.results || []).filter((c) => c.is_active !== false);
        // Group categories by slug-prefix or just list them all under each nav group
        const grouped = {};
        NAV_CATEGORIES.forEach((nav) => {
          grouped[nav.slug] = cats.filter((c) => {
            const name = c.name.toLowerCase();
            if (nav.slug === 'restaurant') return name.includes('restaurant') || name.includes('food') || name.includes('dining') || name.includes('pizza') || name.includes('burger') || name.includes('sushi') || name.includes('bbq') || name.includes('steak') || name.includes('seafood') || name.includes('mexican') || name.includes('italian') || name.includes('chinese') || name.includes('indian') || name.includes('thai') || name.includes('vegan') || name.includes('vegetarian') || name.includes('bakery') || name.includes('breakfast') || name.includes('brunch');
            return false;
          }).slice(0, 8); // Limit dropdown items
        });
        setSubCategories(grouped);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const getLoginHref = () => {
    if (!mounted || typeof window === 'undefined') return '/login';
    const isSub = isBusinessSubdomain();
    if (isSub) {
      return `${getMainDomainUrl()}/login?next=${encodeURIComponent(window.location.href)}`;
    }
    if (pathname === '/login' || pathname === '/signup') return '/login';
    return `/login?next=${encodeURIComponent(currentPath)}`;
  };

  // getSignupHref kept for potential future use (sign-up is accessible from login page)

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
      let activeCountry = country;
      let activeState = state;
      let activeCity = city;
      let activeCountryCode = countryCode;
      let activeStateCode = stateCode;

      // 1. If location field was manually changed, geocode it and use the
      // freshly resolved location for this search — searching a place is
      // not the same as "where the user currently is", so we must not fall
      // back to stale context values that haven't re-rendered yet.
      if (locationValue && locationValue !== address) {
        const resolved = await setManualLocation(locationValue);
        if (resolved) {
          currentLat = resolved.lat;
          currentLng = resolved.lng;
          activeCountry = resolved.country;
          activeState = resolved.state;
          activeCity = resolved.city;
          activeCountryCode = resolved.countryCode;
          activeStateCode = resolved.stateCode;
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
            const route = getCategoryRoute(targetCategory.slug, { country: activeCountry, state: activeState, city: activeCity, countryCode: activeCountryCode, stateCode: activeStateCode });
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

  const handleDropdownEnter = (slug) => {
    clearTimeout(dropdownTimerRef.current);
    setActiveDropdown(slug);
  };

  const handleDropdownLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const handleCategoryClick = (cat) => {
    const route = getCategoryRoute(cat.slug, { country, state, city, countryCode, stateCode });
    router.push(route);
    setActiveDropdown(null);
  };

  return (
    <header className="header-wheree" id="header">
      {/* ===== TOP ROW ===== */}
      <div className="header-top-row">
        <div className="header-top-inner">
          {/* Logo */}
          <a
            href="/"
            className="logo"
            id="header-logo"
            onClick={(e) => {
              e.preventDefault();
              setIsMobileSearchOpen(false);
              setIsMobileMenuOpen(false);
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

          {/* Search Bar — always visible in top row (Wheree-style unified pill) */}
          <form className="header-search-unified" onSubmit={handleSearch}>
            <div className="header-search-field header-search-query">
              <svg className="header-search-field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search Brand or Category"
                id="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <span className="header-search-divider" />
            <div className="header-search-field header-search-location">
              <svg className="header-search-field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <input
                type="text"
                placeholder={loading ? 'Detecting location...' : 'Enter city or area'}
                id="location-input"
                value={locationValue}
                onChange={(e) => setLocationValue(e.target.value)}
              />
            </div>
            <button type="submit" className="header-search-btn" id="btn-search" disabled={searching}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          </form>

          {/* Right-side actions */}
          <div className="header-top-actions">
            <Link href="/submit-business" className="header-btn-business" id="btn-for-business">
              Nearmee for business
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/account" className="header-btn-login" id="btn-account">
                  <span className="header-user-avatar">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="header-user-greeting">{greeting}, {userName || 'User'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="header-btn-login"
                  id="btn-logout"
                  style={{ cursor: 'pointer' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {mounted && isBusinessSubdomain() ? (
                  <a href={getLoginHref()} className="header-btn-login" id="btn-login">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    Log in
                  </a>
                ) : (
                  <Link href={getLoginHref()} className="header-btn-login" id="btn-login">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    Log in
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile toggle buttons */}
          <div className="header-mobile-actions">
            <button
              className="header-mobile-btn"
              onClick={() => setIsMobileSearchOpen(true)}
              aria-label="Search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
            <button
              className="header-mobile-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isMobileMenuOpen ? (
                  <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                ) : (
                  <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ===== BOTTOM ROW — Category Tabs ===== */}
      <div className="header-bottom-row">
        <div className="header-bottom-inner">
          <nav className="header-category-tabs">
            {NAV_CATEGORIES.map((navCat) => (
              <div
                key={navCat.slug}
                className={`header-cat-tab ${activeDropdown === navCat.slug ? 'active' : ''}`}
                onMouseEnter={() => handleDropdownEnter(navCat.slug)}
                onMouseLeave={handleDropdownLeave}
              >
                <button className="header-cat-tab-btn">
                  {navCat.icon}
                  <span>{navCat.label}</span>
                  <svg className="header-cat-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Dropdown */}
                {activeDropdown === navCat.slug && subCategories[navCat.slug]?.length > 0 && (
                  <div className="header-cat-dropdown" onMouseEnter={() => handleDropdownEnter(navCat.slug)} onMouseLeave={handleDropdownLeave}>
                    {subCategories[navCat.slug].map((cat) => (
                      <button
                        key={cat.id || cat.slug}
                        className="header-cat-dropdown-item"
                        onClick={() => handleCategoryClick(cat)}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="header-bottom-actions">
            <Link href="/#businesses" className="header-action-link" id="btn-write-review">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Write review
            </Link>
          </div>
        </div>
      </div>

      {/* ===== MOBILE MENU ===== */}
      {isMobileMenuOpen && (
        <div className="header-mobile-menu">
          <div className="header-mobile-menu-inner">
            {NAV_CATEGORIES.map((navCat) => (
              <div key={navCat.slug} className="header-mobile-cat-group">
                <div className="header-mobile-cat-title">
                  {navCat.icon}
                  <span>{navCat.label}</span>
                </div>
                {subCategories[navCat.slug]?.length > 0 && (
                  <div className="header-mobile-cat-items">
                    {subCategories[navCat.slug].map((cat) => (
                      <button
                        key={cat.id || cat.slug}
                        className="header-mobile-cat-item"
                        onClick={() => { handleCategoryClick(cat); setIsMobileMenuOpen(false); }}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="header-mobile-links">
              <Link href="/#businesses" className="header-mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                Write review
              </Link>
              <Link href="/submit-business" className="header-mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                Nearmee for business
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/account" className="header-mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                    My Account
                  </Link>
                  <button className="header-mobile-link" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                    Logout
                  </button>
                </>
              ) : (
                <Link href={getLoginHref()} className="header-mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                  Log in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

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
