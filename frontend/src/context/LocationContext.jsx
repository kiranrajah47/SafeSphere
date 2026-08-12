import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { LocationService } from '../services/locationService';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState({
    lat: 28.6139,
    lng: 77.2090,
    address: 'New Delhi, India (Default Position)',
    accuracy: 10,
    isDefault: true
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied'

  // Fetch Position
  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const pos = await LocationService.getCurrentPosition({ timeout: 8000 });
      const address = await LocationService.reverseGeocode(pos.lat, pos.lng);

      const newLoc = {
        lat: pos.lat,
        lng: pos.lng,
        accuracy: pos.accuracy,
        address,
        isDefault: false
      };

      setLocation(newLoc);
      setPermissionStatus('granted');
      setError(null);

      // Persist to backend if user logged in
      LocationService.shareLocation(pos.lat, pos.lng, address);
    } catch (err) {
      console.warn('[LocationContext] Geolocation error:', err.message);
      setError(err);

      if (err.code === 'PERMISSION_DENIED') {
        setPermissionStatus('denied');
      }

      // Keep existing location or default fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial single-shot location request on startup
    requestLocation();
  }, [requestLocation]);

  return (
    <LocationContext.Provider
      value={{
        location,
        loading,
        error,
        permissionStatus,
        requestLocation,
        shareLocation: (address) => LocationService.shareLocation(location.lat, location.lng, address || location.address)
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
