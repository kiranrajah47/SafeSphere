import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ui/ToastContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeSOSAlerts, setActiveSOSAlerts] = useState([]);
  const [latestCommunityAlert, setLatestCommunityAlert] = useState(null);
  const [realtimeEventCounter, setRealtimeEventCounter] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('safesphere_token');

    // Connect socket to backend host
    const socketInstance = io(window.location.origin.replace('3000', '5000'), {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      auth: { token }
    });

    socketInstance.on('connect', () => {
      console.log('[SocketContext] Connected to real-time engine:', socketInstance.id);
      setIsConnected(true);

      if (user) {
        socketInstance.emit('join_user_room', user._id);
        if (user.role === 'admin' || user.role === 'responder') {
          socketInstance.emit('join_admin_room');
        }
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('[SocketContext] Disconnected from server:', reason);
      setIsConnected(false);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('[SocketContext] Reconnected gracefully on attempt:', attemptNumber);
      setIsConnected(true);
    });

    // 1. SOS Created Event Handler
    const handleSOSCreated = (data) => {
      console.log('🚨 REAL-TIME EVENT [sos-created]:', data);
      setActiveSOSAlerts((prev) => [data, ...prev]);
      setRealtimeEventCounter(prev => prev + 1);

      addToast({
        type: 'error',
        title: '🚨 EMERGENCY SOS DISTRESS SIGNAL',
        message: `${data?.user?.name || 'A user'} has triggered an Emergency SOS near ${data?.sos?.location?.address || 'your area'}.`
      });
    };

    // 2. SOS Resolved Event Handler
    const handleSOSResolved = ({ sosId }) => {
      console.log('✅ REAL-TIME EVENT [sos-resolved]:', sosId);
      setActiveSOSAlerts((prev) => prev.filter((item) => (item.sos?._id || item._id) !== sosId));
      setRealtimeEventCounter(prev => prev + 1);

      addToast({
        type: 'success',
        title: 'Emergency SOS Resolved',
        message: 'The active emergency SOS signal has been resolved safely.'
      });
    };

    // 3. Community Alert Created Handler
    const handleAlertCreated = (alert) => {
      console.log('📢 REAL-TIME EVENT [alert-created]:', alert);
      setLatestCommunityAlert(alert);
      setRealtimeEventCounter(prev => prev + 1);

      addToast({
        type: 'warning',
        title: `Safety Alert: ${alert.title}`,
        message: `New ${alert.severity?.toUpperCase()} severity ${alert.category} alert posted near ${alert.address || 'your area'}.`
      });
    };

    // 4. Alert Updated Handler
    const handleAlertUpdated = (alert) => {
      console.log('📢 REAL-TIME EVENT [alert-updated]:', alert);
      setRealtimeEventCounter(prev => prev + 1);
    };

    // 5. Incident Verified Handler
    const handleIncidentVerified = (report) => {
      console.log('🛡️ REAL-TIME EVENT [incident-verified]:', report);
      setRealtimeEventCounter(prev => prev + 1);

      addToast({
        type: 'info',
        title: 'Verified Incident Alert Published',
        message: `Moderators have verified and published "${report.title}" as a Verified Alert.`
      });
    };

    // 6. Journey Started Handler
    const handleJourneyStarted = (journey) => {
      console.log('🛡️ REAL-TIME EVENT [journey-started]:', journey);
      setRealtimeEventCounter(prev => prev + 1);
    };

    // 7. Journey Warning / Escalation Handler
    const handleJourneyWarning = (data) => {
      console.log('🚨 REAL-TIME EVENT [journey-warning]:', data);
      setRealtimeEventCounter(prev => prev + 1);

      addToast({
        type: 'error',
        title: '🚨 SAFE JOURNEY ESCALATION ALERT',
        message: `Trip to "${data?.journey?.destinationName || 'destination'}" by ${data?.user?.name || 'user'} exceeded expected arrival check-in.`
      });
    };

    // Attach listeners for both hyphenated and underscored event names
    socketInstance.on('sos-created', handleSOSCreated);
    socketInstance.on('sos_created', handleSOSCreated);

    socketInstance.on('sos-resolved', handleSOSResolved);
    socketInstance.on('sos_resolved', handleSOSResolved);

    socketInstance.on('alert-created', handleAlertCreated);
    socketInstance.on('alert_created', handleAlertCreated);

    socketInstance.on('alert-updated', handleAlertUpdated);
    socketInstance.on('alert_updated', handleAlertUpdated);

    socketInstance.on('incident-verified', handleIncidentVerified);
    socketInstance.on('incident_verified', handleIncidentVerified);

    socketInstance.on('journey-started', handleJourneyStarted);
    socketInstance.on('journey_started', handleJourneyStarted);

    socketInstance.on('journey-warning', handleJourneyWarning);
    socketInstance.on('journey_warning', handleJourneyWarning);

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?._id, user?.role]);

  const dismissCommunityAlert = () => setLatestCommunityAlert(null);

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

export const useSocket = () => useContext(SocketContext);
