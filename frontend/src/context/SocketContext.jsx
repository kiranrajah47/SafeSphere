import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeSOSAlerts, setActiveSOSAlerts] = useState([]);
  const [latestCommunityAlert, setLatestCommunityAlert] = useState(null);

  useEffect(() => {
    // Connect socket to backend host
    const socketInstance = io(window.location.origin.replace('3000', '5000'), {
      transports: ['websocket', 'polling'],
      autoConnect: true
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

    socketInstance.on('disconnect', () => {
      console.log('[SocketContext] Disconnected from server');
      setIsConnected(false);
    });

    socketInstance.on('sos_alert_created', (data) => {
      console.log('🚨 REAL-TIME SOS EVENT:', data);
      setActiveSOSAlerts((prev) => [data, ...prev]);
    });

    socketInstance.on('sos_alert_resolved', ({ sosId }) => {
      setActiveSOSAlerts((prev) => prev.filter((item) => (item.sos?._id || item._id) !== sosId));
    });

    socketInstance.on('community_alert_new', (alert) => {
      console.log('📢 COMMUNITY ALERT BROADCAST:', alert);
      setLatestCommunityAlert(alert);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?._id, user?.role]);

  const dismissCommunityAlert = () => setLatestCommunityAlert(null);

  return (
    <SocketContext.Provider value={{ socket, isConnected, activeSOSAlerts, latestCommunityAlert, dismissCommunityAlert }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
