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
    <section className="hero" id="hero">
      <div className="hero-bg">
        <img
          src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&q=80"
          alt="City skyline at night"
        />
      </div>
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1 className="text-h1">Find the Best Local Businesses Near You</h1>
        <p className="text-body-lg fw-light">
          Restaurants, plumbers, doctors, and more — discover top-rated businesses in your city.
        </p>
        <form className="hero-search glass" onSubmit={handleSearch} style={{ padding: '0 0 0 24px', maxWidth: '800px' }}>
          <div className="hero-search-input">
            <span className="search-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Restaurants, plumbers, doctors..." 
              id="hero-search-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-body-lg fw-medium"
            />
          </div>
          <div className="hero-search-divider" />
          <div className="hero-location-input">
            <span className="location-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <input 
              type="text" 
              placeholder={loading ? 'Location...' : 'Kathmandu...'} 
              id="hero-location-input" 
              value={locationValue}
              onChange={(e) => setLocationValue(e.target.value)}
              className="text-body-lg fw-medium"
            />
          </div>
          <button 
            type="submit" 
            className="btn-search hero-btn-search text-body fw-bold" 
            id="hero-btn-search"
            disabled={searching}
          >
            {searching ? '...' : 'Search'}
          </button>
        </form>
        
      </div>
    </section>
  );
}
