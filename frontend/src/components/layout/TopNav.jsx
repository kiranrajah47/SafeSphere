import React from 'react';
import { useLocation as useGeoLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { MapPin, PhoneCall, Bell, Menu, Shield, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopNav({ onToggleMobileMenu, onTriggerSOSClick }) {
  const { location } = useGeoLocation();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 shadow-xs">
      <div className="flex items-center justify-between">
        
        {/* Mobile Hamburger & Logo (Visible on mobile) */}
        <div className="flex items-center space-x-3 md:hidden">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/" className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-base text-slate-900">SafeSphere</span>
          </Link>
        </div>

        {/* Desktop GPS Location Display */}
        <div className="hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-700 max-w-md truncate">
          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-slate-500 font-medium">GPS:</span>
          <span className="truncate text-slate-900">{location?.address || 'Detecting Location...'}</span>
        </div>

        {/* Right Quick Action Tools */}
        <div className="flex items-center space-x-3">
          
          {/* Quick SOS Trigger Button (Mobile & Desktop Header) */}
          <button
            onClick={onTriggerSOSClick}
            className="md:hidden py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 flex items-center space-x-1 animate-emergency-pulse uppercase tracking-wider"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SOS</span>
          </button>

          {/* National Hotline Button */}
          <a
            href="tel:112"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-colors"
            title="Call National Emergency Hotline 112"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-600" />
            <span>112 Hotline</span>
          </a>

          {/* Notifications Bell */}
          <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600" />
          </button>

          {/* User Profile Avatar Pill */}
          {user && (
            <Link
              to="/profile"
              className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </Link>
          )}

        </div>

      </div>
    </header>
  );
}
