'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isLoggedIn, updateProfile, isBusinessSubdomain } from '../lib/api';

function toSlug(str) {
  if (!str) return '';
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [locationState, setLocation] = useState({
    lat: null,
    lng: null,
    address: '',
    city: '',
    state: '',
    country: '',
    loading: true,
    error: null,
    denied: false,       // true when user explicitly denies permission
    source: null,        // 'gps' | 'manual' | 'saved' | 'ip'
  });

  const updateLocationState = useCallback((newState, options = {}) => {
    const { persist = true } = options;
    setLocation(prev => ({ ...prev, ...newState, loading: false }));

    // Save to localStorage for persistence for guest users.
    // Skipped for one-off manual searches so they don't overwrite the
    // user's actual (GPS/IP-based) home location.
    if (persist && newState.lat && newState.lng) {
      localStorage.setItem('nearmee_user_location', JSON.stringify({
        lat: newState.lat,
        lng: newState.lng,
        address: newState.address || '',
        city: newState.city || '',
        state: newState.state || '',
        country: newState.country || '',
        source: newState.source || 'gps',
        timestamp: Date.now()
      }));
    }
  }, []);

  const persistToBackend = async (lat, lng, address) => {
    if (isLoggedIn()) {
      try {
        await updateProfile({
          lat: parseFloat(lat.toFixed(6)),
          lng: parseFloat(lng.toFixed(6)),
          location: address
        });
        console.log('Location persisted to backend');
      } catch (err) {
        console.error('Failed to persist location to backend:', err);
      }
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
        {
          headers: {
            'Accept-Language': 'en',
          }
        }
      );
      const data = await response.json();
      
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || data.address?.county || '';
      const state = data.address?.state || '';
      const country = data.address?.country || '';
      const address = data.display_name || '';
      
      let simplifiedAddress = '';
      if (city) {
        simplifiedAddress = `${city}${state ? ', ' + state : ''}`;
      } else if (address) {
        // Fallback to first two parts of display_name
        simplifiedAddress = address.split(',').slice(0, 2).join(',').trim();
      }
      
      return {
        address: simplifiedAddress,
        city: city,
        state: state,
        country: country
      };
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      return { address: '', city: '', state: '', country: '' };
    }
  };

  /**
   * Forward geocode: convert a place name (city/area) to lat/lng.
   * Uses Nominatim free API.
   */
  const forwardGeocode = async (query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          headers: {
            'Accept-Language': 'en',
          }
        }
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name,
        };
      }
      return null;
    } catch (err) {
      console.error('Forward geocoding failed:', err);
      return null;
    }
  };

  /**
   * IP-based geolocation fallback using ipapi.co, routed through our own
   * /api/ip-location so the browser never calls ipapi.co directly (it
   * doesn't reliably send CORS headers, especially from localhost).
   * Returns country/region-level lat & lng — no API key needed.
   */
  const ipGeolocate = useCallback(async () => {
    try {
      const res = await fetch('/api/ip-location');
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        // Show only the country name for IP-based fallback
        const country = data.country_name || '';
        const state = data.region || '';
        const city = data.city || '';
        const address = country;

        const locationData = {
          lat: data.latitude,
          lng: data.longitude,
          address,
          city,
          state,
          country,
          source: 'ip',
          denied: true,   // GPS was still denied; just showing fallback
          error: 'Showing results near your country. Allow location for better results.',
        };
        updateLocationState(locationData);
        console.info('Using IP-based location fallback:', address);
      } else {
        updateLocationState({ error: 'Could not determine location.', loading: false, denied: true });
      }
    } catch (err) {
      console.error('IP geolocation failed:', err);
      updateLocationState({ error: 'Could not determine location.', loading: false, denied: true });
    }
  }, [updateLocationState]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      // Browser doesn't support GPS — fall back to IP location
      ipGeolocate();
      return;
    }

    setLocation(prev => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const geoData = await reverseGeocode(latitude, longitude);
        
        const locationData = {
          lat: latitude,
          lng: longitude,
          address: geoData.address,
          city: geoData.city,
          state: geoData.state,
          country: geoData.country,
          source: 'gps',
          denied: false,
          error: null
        };
        updateLocationState(locationData);
        
        persistToBackend(latitude, longitude, geoData.address);
      },
      async (err) => {
        let errorMessage = 'Failed to get location';
        let isDenied = false;
        switch(err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied.';
            isDenied = true;
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        console.warn('Geolocation warning:', errorMessage, err);

        // Fall back to IP geolocation instead of showing blank results
        await ipGeolocate();
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  }, [updateLocationState, ipGeolocate]);

  /**
   * Set location manually by searching a place name.
   * This is a one-off "look at this place" query, not the user's home
   * location — it updates in-memory context only, and deliberately does
   * NOT persist to localStorage or the backend profile, so it doesn't
   * clobber the user's real (GPS/IP-based) saved location.
   * Returns true if successful, false otherwise.
   */
  const setManualLocation = useCallback(async (query) => {
    if (!query || !query.trim()) return false;

    setLocation(prev => ({ ...prev, loading: true }));

    const result = await forwardGeocode(query);
    if (result) {
      const geoData = await reverseGeocode(result.lat, result.lng);
      const locationData = {
        lat: result.lat,
        lng: result.lng,
        address: query, // Use the user's input as the display name
        city: geoData.city || '',
        state: geoData.state || '',
        country: geoData.country || '',
        source: 'manual',
        denied: false,
        error: null,
      };
      updateLocationState(locationData, { persist: false });
      return true;
    } else {
      updateLocationState({
        error: `Could not find "${query}". Try a different city or area.`,
        loading: false,
      });
      return false;
    }
  }, [updateLocationState]);

  useEffect(() => {
    // 1. Try to load from localStorage first for immediate UI
    const savedLocation = localStorage.getItem('nearmee_user_location');
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        // Use saved location if it's less than 24 hours old
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setLocation({
            lat: parsed.lat,
            lng: parsed.lng,
            address: parsed.address,
            city: parsed.city || '',
            state: parsed.state || '',
            country: parsed.country || '',
            loading: false,
            error: null,
            denied: false,
            source: parsed.source || 'saved',
          });
        }
      } catch (e) {
        console.error('Failed to parse saved location');
      }
    }

    // 2. Request fresh location from browser
    // ONLY if we are NOT on a business subdomain
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'nearmee.net';
      const isSub = hostname !== baseDomain && 
                    hostname !== 'localhost' && 
                    hostname !== '127.0.0.1' && 
                    !hostname.startsWith('www.');
      
      if (!isSub) {
        requestLocation();
      }
    }
  }, [requestLocation]);

  const contextValue = {
    ...locationState,
    citySlug:    toSlug(locationState.city),
    stateSlug:   toSlug(locationState.state),
    countrySlug: toSlug(locationState.country),
    requestLocation,
    setManualLocation,
    forwardGeocode,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
