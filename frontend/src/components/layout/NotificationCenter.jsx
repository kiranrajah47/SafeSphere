import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../ui/ToastContext';
import API from '../../services/api';
import { 
  Bell, 
  CheckCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Navigation, 
  BookOpen, 
  Clock, 
  X,
  Info
} from 'lucide-react';

export default function NotificationCenter() {
  const { socket } = useSocket();
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);

  // Fetch in-app notifications
  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.warn('[NotificationCenter] Fetch error:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen for real-time in-app notification socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewInAppNotification = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((count) => count + 1);

      addToast({
        type: notif.type.includes('sos') || notif.type.includes('warning') ? 'error' : 'info',
        title: notif.title,
        message: notif.message
      });
    };

    socket.on('new_in_app_notification', handleNewInAppNotification);

    return () => {
      socket.off('new_in_app_notification', handleNewInAppNotification);
    };
  }, [socket]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark single notification as read
  const handleMarkAsRead = async (id) => {
    try {
      const res = await API.put(`/notifications/${id}/read`);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.warn('[NotificationCenter] Mark read error:', err.message);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const res = await API.put('/notifications/read-all');
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        addToast({ type: 'success', title: 'Notifications Cleared', message: 'All in-app notifications marked as read.' });
      }
    } catch (err) {
      console.warn('[NotificationCenter] Mark all read error:', err.message);
    }
  };

  // Icon mapping helper
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'sos_created':
      case 'sos_resolved':
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      case 'nearby_alert':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'incident_verified':
        return <CheckCircle2 className="w-4 h-4 text-indigo-600" />;
      case 'journey_warning':
        return <Navigation className="w-4 h-4 text-rose-600" />;
      case 'resource_update':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors relative"
        title="In-App Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] rounded-full bg-red-600 text-white font-extrabold text-[10px] flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden flex flex-col max-h-[480px]">
          
          {/* Panel Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xs text-slate-900">In-App Safety Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-2 py-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg flex items-center space-x-1 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Read All</span>
                </button>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs font-semibold">No in-app notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start space-x-3 ${
                    notif.isRead ? 'bg-white hover:bg-slate-50' : 'bg-indigo-50/40 hover:bg-indigo-50/70 border-l-4 border-indigo-600'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-900">{notif.title}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
}
