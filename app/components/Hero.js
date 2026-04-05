'use client';

import { useLocation } from '../context/LocationContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const router = useRouter();
  const { address, loading, setManualLocation, lat, lng } = useLocation();
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
    setSearching(true);

    // If location field was changed manually, geocode the new location
    if (locationValue && locationValue !== address) {
      await setManualLocation(locationValue);
    }

    // Push search query to URL so Businesses component can use it
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/');
    }

    // Scroll to businesses section
    const businessesSection = document.getElementById('businesses');
    if (businessesSection) {
      businessesSection.scrollIntoView({ behavior: 'smooth' });
    }

    setSearching(false);
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
        <h1>Find the Best Local Businesses Near You</h1>
        <p>
          Restaurants, plumbers, doctors, and more — discover top-rated businesses in your city.
        </p>
        <form className="hero-search" onSubmit={handleSearch}>
          <div className="hero-search-input">
            <span className="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            />
          </div>
          <div className="hero-search-divider" />
          <div className="hero-location-input">
            <span className="location-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </span>
            <input 
              type="text" 
              placeholder={loading ? 'Detecting location...' : 'Enter city or area'} 
              id="hero-location-input" 
              value={locationValue}
              onChange={(e) => setLocationValue(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="btn-search" 
            id="hero-btn-search"
            disabled={searching}
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>
        
      </div>
    </section>
  );
}
