import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Shield, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  BookOpen, 
  Bot, 
  ShieldAlert, 
  User, 
  LogOut,
  X 
} from 'lucide-react';

export function MobileDrawer({ isOpen, onClose, onTriggerSOSClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!isOpen) return null;

  const navItems = [
    { label: 'Dashboard', path: '/', icon: Shield },
    { label: 'Safety Map', path: '/map', icon: MapPin },
    { label: 'Safe Journey', path: '/journey', icon: Navigation },
    { label: 'Incidents Feed', path: '/incidents', icon: AlertTriangle },
    { label: 'Emergency Directory', path: '/resources', icon: BookOpen },
    { label: 'AI Safety Guard', path: '/ai-assistant', icon: Bot },
    { label: 'My Profile & Contacts', path: '/profile', icon: User },
  ];

  if (user?.role === 'admin' || user?.role === 'responder') {
    navItems.push({ label: 'Admin Console', path: '/admin', icon: ShieldAlert });
  }

  return (
    <div className="fixed inset-0 z-[1000] md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Sidebar */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 shadow-2xl p-6 flex flex-col justify-between z-10">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/" onClick={onClose} className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-slate-900">SafeSphere</span>
            </Link>

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <button
            onClick={() => { onClose(); onTriggerSOSClick(); }}
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-700 flex items-center justify-center space-x-2 animate-emergency-pulse uppercase tracking-wider"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Emergency SOS</span>
          </button>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold ${
                    isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {user && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs">
              <p className="font-bold text-slate-900">{user.name}</p>
              <p className="text-slate-500">{user.email}</p>
            </div>
            <button onClick={logout} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function MobileBottomBar({ onTriggerSOSClick }) {
  const location = useLocation();

  const items = [
    { label: 'Home', path: '/', icon: Shield },
    { label: 'Map', path: '/map', icon: MapPin },
    { label: 'Journey', path: '/journey', icon: Navigation },
    { label: 'Incidents', path: '/incidents', icon: AlertTriangle },
    { label: 'Directory', path: '/resources', icon: BookOpen }
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 md:hidden py-2 px-4 shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center space-y-1 py-1 px-2 rounded-lg text-[10px] font-semibold ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
