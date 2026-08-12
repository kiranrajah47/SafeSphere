import React, { useState } from 'react';
import { Link, useNavigate, useLocation as useRouteLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Shield, AlertTriangle, MapPin, Navigation, BookOpen, Bot, User, LogOut, ShieldAlert, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const routeLocation = useRouteLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => routeLocation.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-tr from-red-600 to-rose-500 rounded-xl shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                SafeSphere
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                  LIVE
                </span>
              </span>
              <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block font-medium">Universal Personal Safety Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                isActive('/') ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Shield className="w-4 h-4 text-red-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/map"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                isActive('/map') ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Safety Map</span>
            </Link>

            <Link
              to="/journey"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                isActive('/journey') ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Safe Journey</span>
            </Link>

            <Link
              to="/incidents"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                isActive('/incidents') ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Incidents</span>
            </Link>

            <Link
              to="/resources"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                isActive('/resources') ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Resources</span>
            </Link>

            <Link
              to="/ai-assistant"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                isActive('/ai-assistant') ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Bot className="w-4 h-4 text-teal-400" />
              <span>AI Guard</span>
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  isActive('/admin') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Right Action Menu & User Info */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Real-time Socket status indicator */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-400">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{isConnected ? 'Live Engine' : 'Offline'}</span>
            </div>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center font-bold text-white text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 pr-1">{user.name.split(' ')[0]}</span>
                </Link>

                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-600/20 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-1.5 border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800">Dashboard</Link>
          <Link to="/map" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800">Safety Map</Link>
          <Link to="/journey" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800">Safe Journey</Link>
          <Link to="/incidents" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800">Incidents</Link>
          <Link to="/resources" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800">Resources</Link>
          <Link to="/ai-assistant" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800">AI Guard</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-amber-400 hover:bg-slate-800">Admin Console</Link>
          )}
          {user ? (
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-300">Profile ({user.name})</Link>
              <button onClick={() => { logout(); setMobileMenuOpen(false); navigate('/login'); }} className="text-sm text-rose-400">Logout</button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-800 flex space-x-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-1/2 text-center py-2 bg-slate-800 rounded-lg text-sm text-slate-200">Log in</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-1/2 text-center py-2 bg-red-600 rounded-lg text-sm text-white font-semibold">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
