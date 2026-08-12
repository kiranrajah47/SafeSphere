import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ui/ToastContext';

const defaultContext = {
  socket: null,
  isConnected: false,
  activeSOSAlerts: [],
  latestCommunityAlert: null,
  dismissCommunityAlert: () => {},
  realtimeEventCounter: 0
};

const SocketContext = createContext(defaultContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();

  // useToast is safe because ToastProvider wraps SocketProvider in App.jsx
  const addToastRef = useRef(addToast);
  useEffect(() => {
    addToastRef.current = addToast;
  }, [addToast]);

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeSOSAlerts, setActiveSOSAlerts] = useState([]);
  const [latestCommunityAlert, setLatestCommunityAlert] = useState(null);
  const [realtimeEventCounter, setRealtimeEventCounter] = useState(0);
  const handledEventKeysRef = useRef(new Set());

  const bump = useCallback(() => setRealtimeEventCounter(c => c + 1), []);

  const shouldProcessEvent = useCallback((eventKey) => {
    if (handledEventKeysRef.current.has(eventKey)) {
      return false;
    }
    handledEventKeysRef.current.add(eventKey);
    setTimeout(() => {
      handledEventKeysRef.current.delete(eventKey);
    }, 4000);
    return true;
  }, []);

  useEffect(() => {
    // Get JWT token from localStorage (stored as part of safesphere_user object)
    let token = null;
    try {
      const raw = localStorage.getItem('safesphere_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        token = parsed?.token || null;
      }
    } catch (_) {}

    const backendHost = `${window.location.protocol}//${window.location.hostname}:5000`;

    const socketInstance = io(backendHost, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 10000,
      auth: { token }
    });

    socketInstance.on('connect', () => {
      console.log('[SocketContext] Connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('[SocketContext] Disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('reconnect', () => {
      console.log('[SocketContext] Reconnected gracefully');
      setIsConnected(true);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[SocketContext] Connection error (backend may be offline):', err.message);
    });

    // ---- Event Handlers ----

    const handleSOSCreated = (data) => {
      const sosId = data?.sos?._id || data?._id || `${data?.user?._id}-${data?.timestamp}`;
      const eventKey = `sos-created-${sosId}`;
      if (!shouldProcessEvent(eventKey)) return;

      console.log('[Socket] sos-created', data);
      setActiveSOSAlerts(prev => [data, ...prev]);
      bump();

      // Only show broadcast toast to OTHER users (creator gets their immediate HTTP toast)
      const creatorId = data?.user?._id || data?.sos?.user;
      if (user?._id && creatorId && String(user._id) === String(creatorId)) {
        return; // Skip duplicate toast for creator
      }

      addToastRef.current?.({
        type: 'error',
        title: '🚨 Emergency SOS Activated',
        message: `${data?.user?.name || 'A user'} triggered an SOS near ${data?.sos?.location?.address || 'your area'}.`,
        duration: 4000
      });
    };

    const handleSOSResolved = (data) => {
      const sosId = data?.sosId || data?._id;
      const eventKey = `sos-resolved-${sosId}`;
      if (!shouldProcessEvent(eventKey)) return;

      console.log('[Socket] sos-resolved', sosId);
      setActiveSOSAlerts(prev => prev.filter(a => (a.sos?._id || a._id) !== sosId));
      bump();

      addToastRef.current?.({
        type: 'success',
        title: 'Emergency SOS Resolved',
        message: 'The emergency SOS has been safely resolved.',
        duration: 4000
      });
    };

    const handleAlertCreated = (alert) => {
      const alertId = alert?._id || `${alert?.title}-${alert?.createdAt}`;
      const eventKey = `alert-created-${alertId}`;
      if (!shouldProcessEvent(eventKey)) return;

      console.log('[Socket] alert-created', alert);
      setLatestCommunityAlert(alert);
      bump();

      addToastRef.current?.({
        type: 'warning',
        title: `⚠️ Safety Alert: ${alert?.title || 'New Alert'}`,
        message: `New ${alert?.severity?.toUpperCase() || 'MEDIUM'} severity ${alert?.category || ''} alert near ${alert?.address || 'your area'}.`,
        duration: 4000
      });
    };

    const handleAlertUpdated = (alert) => {
      console.log('[Socket] alert-updated', alert);
      bump();
    };

    const handleIncidentVerified = (report) => {
      const reportId = report?._id || `${report?.title}`;
      const eventKey = `incident-verified-${reportId}`;
      if (!shouldProcessEvent(eventKey)) return;

      console.log('[Socket] incident-verified', report);
      bump();

      addToastRef.current?.({
        type: 'info',
        title: 'Verified Alert Published',
        message: `Moderators verified "${report?.title || 'an incident'}" as a community safety alert.`,
        duration: 4000
      });
    };

    const handleJourneyStarted = (journey) => {
      console.log('[Socket] journey-started', journey);
      bump();
    };

    const handleJourneyWarning = (data) => {
      const journeyId = data?.journey?._id || data?._id;
      const eventKey = `journey-warning-${journeyId}`;
      if (!shouldProcessEvent(eventKey)) return;

      console.log('[Socket] journey-warning', data);
      bump();

      addToastRef.current?.({
        type: 'error',
        title: '🚨 Safe Journey Warning',
        message: `Trip to "${data?.journey?.destinationName || 'destination'}" has exceeded expected arrival time.`,
        duration: 5000
      });
    };

    // Register event listeners
    const events = [
      ['sos-created', 'sos_created', handleSOSCreated],
      ['sos-resolved', 'sos_resolved', handleSOSResolved],
      ['alert-created', 'alert_created', handleAlertCreated],
      ['alert-updated', 'alert_updated', handleAlertUpdated],
      ['incident-verified', 'incident_verified', handleIncidentVerified],
      ['journey-started', 'journey_started', handleJourneyStarted],
      ['journey-warning', 'journey_warning', handleJourneyWarning]
    ];

    events.forEach(([hyphen, underscore, handler]) => {
      socketInstance.on(hyphen, handler);
      socketInstance.on(underscore, handler);
    });

    setSocket(socketInstance);

    return () => {
      events.forEach(([hyphen, underscore, handler]) => {
        socketInstance.off(hyphen, handler);
        socketInstance.off(underscore, handler);
      });
      socketInstance.disconnect();
    };
  }, [user?._id, bump, shouldProcessEvent]);

  const dismissCommunityAlert = useCallback(() => {
    setLatestCommunityAlert(null);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        activeSOSAlerts,
        latestCommunityAlert,
        dismissCommunityAlert,
        realtimeEventCounter
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext) || defaultContext;
