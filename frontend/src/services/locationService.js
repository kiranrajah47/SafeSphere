import API from './api';

const DEFAULT_COORDINATES = {
  lat: 28.6139,
  lng: 77.2090,
  address: 'New Delhi, India (Default Center)',
  accuracy: 10,
  isDefault: true
};

export const LocationService = {
  /**
   * Request single-shot current location using HTML5 Geolocation API
   */
  getCurrentPosition: (options = {}) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject({
          code: 'NOT_SUPPORTED',
          message: 'Geolocation is not supported by your browser.'
        });
      }

      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
        ...options
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          resolve({
            lat,
            lng,
            accuracy,
            timestamp: position.timestamp,
            isDefault: false
          });
        },
        (error) => {
          let errorMessage = 'An unknown location error occurred.';
          let errorCode = 'UNKNOWN';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorCode = 'PERMISSION_DENIED';
              errorMessage = 'Location permission was denied by your browser. Please enable location access in browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorCode = 'POSITION_UNAVAILABLE';
              errorMessage = 'Location information is currently unavailable. Please check your GPS or internet connection.';
              break;
            case error.TIMEOUT:
              errorCode = 'TIMEOUT';
              errorMessage = 'The request to fetch your location timed out. Retrying with default position...';
              break;
          }

          reject({
            code: errorCode,
            message: errorMessage,
            rawError: error,
            fallback: DEFAULT_COORDINATES
          });
        },
        defaultOptions
      );
    });
  },

  /**
   * Start watching user position continuously (Only when explicitly enabled by user)
   */
  watchPosition: (onSuccess, onError, options = {}) => {
    if (!navigator.geolocation) {
      onError({ code: 'NOT_SUPPORTED', message: 'Geolocation is not supported.' });
      return null;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
      ...options
    };

    return navigator.geolocation.watchPosition(
      (position) => {
        onSuccess({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        onError({
          code: error.code,
          message: error.message
        });
      },
      defaultOptions
    );
  },

  /**
   * Stop watching position
   */
  clearWatch: (watchId) => {
    if (watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  },

  /**
   * Free OpenStreetMap Nominatim reverse geocoding
   */
  reverseGeocode: async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'SafeSphere-SafetyApp/1.0'
          }
        }
      );
      if (!response.ok) throw new Error('Geocoding service unavailable');
      const data = await response.json();
      return data.display_name || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    } catch (e) {
      return `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }
  },

  /**
   * Share/persist location to SafeSphere backend
   */
  shareLocation: async (lat, lng, address = '') => {
    try {
      const res = await API.post('/location/share', {
        latitude: lat,
        longitude: lng,
        coordinates: [lng, lat],
        address
      });
      return res;
    } catch (err) {
      console.warn('[LocationService] Share location API error:', err.message);
      return { success: false, message: err.message };
    }
  },

  /**
   * Fetch location preferences
   */
  getLocationPreferences: async () => {
    try {
      const res = await API.get('/location/preferences');
      return res.data;
    } catch (err) {
      return { autoShareInEmergency: true, defaultRadiusKm: 5 };
    }
  }
};
