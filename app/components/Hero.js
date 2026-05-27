'use client';

import { useLocation } from '../context/LocationContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBusinesses, searchCategories, getBusinessSubdomainUrl, getCategoryRoute } from '../lib/api';

export default function Hero() {
  const router = useRouter();
  const { address, loading, setManualLocation, forwardGeocode, lat, lng, source, country, state, city } = useLocation();
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
      let currentLat = lat;
      let currentLng = lng;

      // 1. If location field was changed manually, geocode it immediately
      if (locationValue && locationValue !== address) {
        const result = await forwardGeocode(locationValue);
        if (result) {
          currentLat = result.lat;
          currentLng = result.lng;
          // Also update the context so other components know the new location
          await setManualLocation(locationValue);
        }
      }

      // 2. Perform a "Smart Redirect" check if search query exists
      if (searchQuery.trim()) {
        const params = { 
          search: searchQuery.trim(), 
          page_size: 10 // Get a small batch to check for exact match
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
            const route = getCategoryRoute(targetCategory.slug, { country, state, city });
            router.push(route);
            setSearching(false);
            return;
          }
        } catch (err) {
          console.error('Category search error:', err);
        }

        // 4. Fallback: Push search query to URL if no direct match found
      if (searchQuery.trim()) {
        router.push(`/?search=${encodeURIComponent(searchQuery.trim())}#businesses`);
      } else {
        router.push('/#businesses');
      }
    } catch (err) {
      console.error('Search error:', err);
      // Fallback search in case of API error
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}#businesses`);
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
