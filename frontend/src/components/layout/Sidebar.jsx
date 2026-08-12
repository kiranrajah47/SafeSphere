import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
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
  Radio,
  ChevronRight,
  PhoneCall
} from 'lucide-react';

export default function Sidebar({ onTriggerSOSClick }) {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: Shield, color: 'text-indigo-600' },
    { label: 'Safety Map', path: '/map', icon: MapPin, color: 'text-blue-600' },
    { label: 'Safe Journey', path: '/journey', icon: Navigation, color: 'text-emerald-600' },
    { label: 'Incidents Feed', path: '/incidents', icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Directory', path: '/resources', icon: BookOpen, color: 'text-purple-600' },
    { label: 'AI Safety Guard', path: '/ai-assistant', icon: Bot, color: 'text-teal-600' },
  ];

  if (user?.role === 'admin' || user?.role === 'responder') {
    navItems.push({
      label: 'Admin Console',
      path: '/admin',
      icon: ShieldAlert,
      color: 'text-amber-600',
      badge: 'Admin'
    });
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 z-30 shadow-xs hidden md:flex">
      
      {/* Top Brand Section */}
      <div className="p-6 space-y-6">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-200">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
              SafeSphere
            </span>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Safety Platform</p>
          </div>
        </Link>

        {/* SOS Emergency Quick Button in Sidebar */}
        <button
          onClick={onTriggerSOSClick}
          className="w-full py-3 px-4 rounded-xl font-extrabold text-xs text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-md shadow-red-600/25 transition-all flex items-center justify-center space-x-2 animate-emergency-pulse uppercase tracking-wider"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Emergency SOS</span>
        </button>

        {/* Main Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : item.color}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Status Section */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
        
        {/* Engine Socket Status */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200/80 text-[11px] font-semibold text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            Live Protection Engine
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase">{isConnected ? 'Online' : 'Offline'}</span>
        </div>

        {/* User Card */}
        {user ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <Link to="/profile" className="flex items-center space-x-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">{user.name}</h4>
                <p className="text-[10px] text-slate-500 font-medium capitalize truncate">{user.role}</p>
              </div>
            </Link>

            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="w-full py-2.5 px-3 rounded-xl font-bold text-xs text-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors block"
          >
            Sign In to SafeSphere
          </Link>
        )}
      </div>

    </aside>
  );
}
