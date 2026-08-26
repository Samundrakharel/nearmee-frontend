'use client';

import { useLocation } from '../context/LocationContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBusinesses, searchCategories, getBusinessSubdomainUrl, getCategoryRoute } from '../lib/api';

function toSlug(str) {
  if (!str) return '';
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function Hero() {
  const router = useRouter();
  const { address, loading, setManualLocation, forwardGeocode, citySlug, stateSlug, countrySlug, country, state, city, stateCode, countryCode } = useLocation();
  const [locationValue, setLocationValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (address) {
      setLocationValue(address);
    }
  }, [address]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() && (!locationValue || locationValue === address)) {
      return;
    }

    setSearching(true);

    try {
      let activeCitySlug    = citySlug;
      let activeStateSlug   = stateSlug;
      let activeCountrySlug = countrySlug;
      let activeCountry     = country;
      let activeState       = state;
      let activeCity        = city;
      let activeCountryCode = countryCode;
      let activeStateCode   = stateCode;

      // 1. If location field was changed manually, geocode it and use the
      // freshly resolved location for this search — searching a place is
      // not the same as "where the user currently is", so we must not fall
      // back to stale context values that haven't re-rendered yet.
      if (locationValue && locationValue !== address) {
        const resolved = await setManualLocation(locationValue);
        if (resolved) {
          activeCitySlug    = toSlug(resolved.city);
          activeStateSlug   = toSlug(resolved.state);
          activeCountrySlug = toSlug(resolved.country);
          activeCountry     = resolved.country;
          activeState       = resolved.state;
          activeCity        = resolved.city;
          activeCountryCode = resolved.countryCode;
          activeStateCode   = resolved.stateCode;
        }
      }

      // 2. Smart Redirect: look for an exact business name match scoped to user's city
      if (searchQuery.trim()) {
        const params = { search: searchQuery.trim(), page_size: 10 };
        if (activeCitySlug)         params.city_slug    = activeCitySlug;
        else if (activeStateSlug)   params.state_slug   = activeStateSlug;
        else if (activeCountrySlug) params.country_slug = activeCountrySlug;

        const data = await getBusinesses(params);
        const results = data.results || [];

        // Logic: 
        // - Only redirect if there is an exact name match.
        // This prevents category searches (like "asian restaurant") from redirecting to a single business.
        const targetBusiness = results.find(
          biz => biz.name.toLowerCase() === searchQuery.trim().toLowerCase()
        );

        if (targetBusiness) {
          window.location.href = getBusinessSubdomainUrl(targetBusiness.slug || targetBusiness.id);
          setSearching(false);
          return;
        }
      }

        // 3. Fallback check: Is there an exact category name match?
        try {
          const catData = await searchCategories(searchQuery.trim());
          const catResults = catData.results || [];
          const targetCategory = catResults.find(
            cat => cat.name.toLowerCase() === searchQuery.trim().toLowerCase()
          );

          if (targetCategory) {
            const route = getCategoryRoute(targetCategory.slug, { country: activeCountry, state: activeState, city: activeCity, countryCode: activeCountryCode, stateCode: activeStateCode });
            router.push(route);
            setSearching(false);
            return;
          }
        } catch (err) {
          console.error('Category search error:', err);
        }

        // 4. Fallback: go to the dedicated search results page
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        router.push('/#businesses');
      }
    } catch (err) {
      console.error('Search error:', err);
      // Fallback search in case of API error
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } finally {
      setSearching(false);
    }
  };

  return (
    <section className="hero" id="hero" style={{ position: 'relative', background: 'linear-gradient(135deg, #18181b 0%, #27272a 40%, #3f3f46 100%)', padding: '100px 24px 90px', height: 'auto', minHeight: '360px', overflow: 'hidden' }}>
      {/* Decorative Radial Backgrounds */}
      <div style={{ position: 'absolute', top: '-50%', right: '-25%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255, 126, 103, 0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-30%', left: '-15%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255, 158, 141, 0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      
      <div className="hero-content" style={{ position: 'relative', zIndex: 2, maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
        <h1 className="text-h1" style={{ color: '#ffffff', fontSize: 'clamp(2.8rem, 6vw, 4.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '20px', lineHeight: 1.1 }}>
          DoersMarketing:<br />Real Finds, Nearby
        </h1>
        <p className="text-body-lg" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.15rem', lineHeight: '1.6', maxWidth: '720px', margin: '0 auto 36px', fontWeight: 300 }}>
          We sort out the clutter so you don't have to, helping you find everyday spots, trusted services, and verified picks near you.
        </p>
        <form className="hero-search" onSubmit={handleSearch} style={{ padding: '6px 6px 6px 24px', maxWidth: '720px', background: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(255, 126, 103, 0.2)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)', borderRadius: '100px', display: 'flex', alignItems: 'center', margin: '0 auto' }}>
          <div className="hero-search-input" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="What are you looking for?" 
              id="hero-search-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-body-lg fw-medium"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '1rem', color: '#18181b' }}
            />
          </div>
          <div className="hero-search-divider" style={{ width: '1px', height: '28px', background: 'rgba(255, 126, 103, 0.2)', margin: '0 16px' }} />
          <div className="hero-location-input" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '200px' }}>
            <span className="location-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <input 
              type="text" 
              placeholder={loading ? 'Location...' : 'Enter location...'} 
              id="hero-location-input" 
              value={locationValue}
              onChange={(e) => setLocationValue(e.target.value)}
              className="text-body-lg fw-medium"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '1rem', color: '#18181b' }}
            />
          </div>
          <button 
            type="submit" 
            className="btn-search hero-btn-search text-body fw-bold" 
            id="hero-btn-search"
            disabled={searching}
            style={{ background: 'linear-gradient(135deg, #ff7e67, #e0533c)', color: '#fff', border: 'none', borderRadius: '100px', padding: '0 32px', height: '48px', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.3s' }}
          >
            {searching ? '...' : 'Search'}
          </button>
        </form>
      </div>
    </section>
  );
}
