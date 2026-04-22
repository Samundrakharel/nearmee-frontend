'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isLoggedIn, updateProfile, isBusinessSubdomain } from '../lib/api';

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [locationState, setLocation] = useState({
    lat: null,
    lng: null,
    address: '',
    loading: true,
    error: null,
    denied: false,       // true when user explicitly denies permission
    source: null,        // 'gps' | 'manual' | 'saved'
  });

  const updateLocationState = useCallback((newState) => {
    setLocation(prev => ({ ...prev, ...newState, loading: false }));
    
    // Save to localStorage for persistence for guest users
    if (newState.lat && newState.lng) {
      localStorage.setItem('nearmee_user_location', JSON.stringify({
        lat: newState.lat,
        lng: newState.lng,
        address: newState.address || '',
        source: newState.source || 'gps',
        timestamp: Date.now()
      }));
    }
  }, []);

  const persistToBackend = async (lat, lng, address) => {
    if (isLoggedIn()) {
      try {
        await updateProfile({
          lat: lat,
          lng: lng,
          location_name: address
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
      const address = data.display_name || '';
      
      let simplifiedAddress = '';
      if (city) {
        simplifiedAddress = `${city}${state ? ', ' + state : ''}`;
      } else if (address) {
        // Fallback to first two parts of display_name
        simplifiedAddress = address.split(',').slice(0, 2).join(',').trim();
      }
      
      return simplifiedAddress;
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      return '';
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

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      updateLocationState({ error: 'Geolocation not supported', loading: false, denied: true });
      return;
    }

    setLocation(prev => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude);
        
        const locationData = { lat: latitude, lng: longitude, address, source: 'gps', denied: false, error: null };
        updateLocationState(locationData);
        
        persistToBackend(latitude, longitude, address);
      },
      (err) => {
        let errorMessage = 'Failed to get location';
        let isDenied = false;
        switch(err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Search for a location below.';
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
        updateLocationState({ 
          error: errorMessage, 
          denied: isDenied,
          loading: false 
        });
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  }, [updateLocationState]);

  /**
   * Set location manually by searching a place name.
   * Geocodes the query and updates context + localStorage.
   * Returns true if successful, false otherwise.
   */
  const setManualLocation = useCallback(async (query) => {
    if (!query || !query.trim()) return false;

    setLocation(prev => ({ ...prev, loading: true }));

    const result = await forwardGeocode(query);
    if (result) {
      const locationData = {
        lat: result.lat,
        lng: result.lng,
        address: query, // Use the user's input as the display name
        source: 'manual',
        denied: false,
        error: null,
      };
      updateLocationState(locationData);
      persistToBackend(result.lat, result.lng, query);
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
