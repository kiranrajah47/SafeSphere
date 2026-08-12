import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import PanicButton from '../components/sos/PanicButton';
import SOSActiveModal from '../components/sos/SOSActiveModal';
import SafeMap from '../components/map/SafeMap';
import API from '../services/api';
import { Shield, Navigation, AlertTriangle, BookOpen, Bot, MapPin, Users, HeartPulse, ShieldAlert, Radio } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const { location } = useLocation();
  const [activeSOS, setActiveSOS] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [nearbyResources, setNearbyResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      if (user) {
        const sosRes = await API.get('/sos/active');
        if (sosRes.success) {
          setActiveSOS(sosRes.data || null);
        }
      }

      // Fetch nearby incidents
      const incRes = await API.get(`/incidents?lat=${location.lat}&lng=${location.lng}&radiusKm=15`);
      if (incRes.success) {
        setRecentIncidents(incRes.data || []);
      }

      // Fetch nearby resources
      const resRes = await API.get(`/resources/nearby?lat=${location.lat}&lng=${location.lng}&radiusKm=10`);
      if (resRes.success) {
        setNearbyResources(resRes.data || []);
      }
    } catch (err) {
      console.warn('[HomePage] Data fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, location.lat, location.lng]);

  const handleTriggerSOS = async (emergencyType) => {
    try {
      const res = await API.post('/sos/trigger', {
        emergencyType,
        coordinates: [location.lng, location.lat],
        address: location.address
      });
      if (res.success && res.data) {
        setActiveSOS(res.data);
      }
    } catch (err) {
      alert('Failed to trigger SOS: ' + err.message);
    }
  };

  const handleCancelSOS = async () => {
    try {
      const res = await API.post('/sos/cancel');
      if (res.success) {
        setActiveSOS(null);
      }
    } catch (err) {
      alert('Cancel failed: ' + err.message);
    }
  };

  const handleResolveSOS = async (sosId) => {
    try {
      const res = await API.post('/sos/resolve', { sosId });
      if (res.success) {
        setActiveSOS(null);
      }
    } catch (err) {
      alert('Resolve failed: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Active SOS Modal Overlay */}
      {activeSOS && (
        <SOSActiveModal
          activeSOS={activeSOS}
          onCancelSOS={handleCancelSOS}
          onResolveSOS={handleResolveSOS}
        />
      )}

      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 glass-panel border border-slate-800 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Universal Safety & Emergency Platform</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Hello, {user ? user.name.split(' ')[0] : 'Safety Guard'} 👋
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              SafeSphere provides instant 24/7 Emergency SOS, live GPS location sharing, crowd-sourced safety alerts, and safe journey watching.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-xs font-semibold text-slate-300">
            <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-slate-400">Current Position</p>
              <p className="text-slate-100 font-bold">{location.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Panic SOS Command Hub & Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Panic Button Component (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Emergency SOS Trigger
            </h3>
            <span className="text-xs text-slate-400 font-medium">1-Tap / 2.5s Hold</span>
          </div>

          <PanicButton onTriggerSOS={handleTriggerSOS} />
        </div>

        {/* Live Safety Map Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              Live Safety Map & Services
            </h3>
            <Link to="/map" className="text-xs font-semibold text-blue-400 hover:underline">
              Expand Full Map →
            </Link>
          </div>

          <SafeMap
            activeSOSList={activeSOS ? [activeSOS] : []}
            resourcesList={nearbyResources}
            incidentsList={recentIncidents}
          />
        </div>
      </div>

      {/* Feature Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <Link
          to="/journey"
          className="p-6 rounded-2xl glass-card hover:bg-slate-800/80 border border-slate-800 transition-all hover:scale-[1.02] group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Navigation className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Safe Journey</h4>
          <p className="text-xs text-slate-400 mt-1">
            Set destination and check-in timer. Watchdog alerts contacts if you don't check in.
          </p>
        </Link>

        <Link
          to="/incidents"
          className="p-6 rounded-2xl glass-card hover:bg-slate-800/80 border border-slate-800 transition-all hover:scale-[1.02] group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">Crowd Incidents</h4>
          <p className="text-xs text-slate-400 mt-1">
            Report hazards, harassment, or suspicious activity to keep your neighborhood safe.
          </p>
        </Link>

        <Link
          to="/resources"
          className="p-6 rounded-2xl glass-card hover:bg-slate-800/80 border border-slate-800 transition-all hover:scale-[1.02] group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">Emergency Directory</h4>
          <p className="text-xs text-slate-400 mt-1">
            24/7 National emergency hotlines, legal aid, police stations, and medical services.
          </p>
        </Link>

        <Link
          to="/ai-assistant"
          className="p-6 rounded-2xl glass-card hover:bg-slate-800/80 border border-slate-800 transition-all hover:scale-[1.02] group"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Bot className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">AI Safety Guard</h4>
          <p className="text-xs text-slate-400 mt-1">
            Instant step-by-step guidance for self-defense, travel safety, and medical emergency first aid.
          </p>
        </Link>
      </div>

    </div>
  );
}
