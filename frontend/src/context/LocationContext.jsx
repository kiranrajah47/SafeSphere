import React, { createContext, useState, useEffect, useContext } from 'react';

const LocationContext = createContext();

// Default fallback coordinates (e.g. New Delhi: 28.6139, 77.2090)
const DEFAULT_LOCATION = {
  lat: 28.6139,
  lng: 77.2090,
  address: 'Central Square City Center',
  accuracy: 10
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [permissionState, setPermissionState] = useState('prompt'); // 'granted', 'denied', 'prompt'
  const [loading, setLoading] = useState(true);

  const requestLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      console.warn('[Geolocation] Browser does not support HTML5 Geolocation');
      setPermissionState('denied');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          address: `GPS Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`
        };
        setLocation(newLoc);
        setPermissionState('granted');
        setLoading(false);
      },
      (error) => {
        console.warn('[Geolocation Error]', error.message);
        setPermissionState('denied');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    requestLocation();

    // Continuous watchPosition for live movement
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            address: `GPS Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`
          });
        },
        (err) => {},
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
      );
    }

    return () => {
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const setManualLocation = (lat, lng, address = 'Selected Map Location') => {
    setLocation({ lat, lng, address, accuracy: 5 });
  };

  return (
    <LocationContext.Provider value={{ location, permissionState, loading, requestLocation, setManualLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
