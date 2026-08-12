import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import API from '../services/api';
import { Navigation, Clock, CheckCircle, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function JourneyPage() {
  const { location } = useLocation();
  const [activeJourney, setActiveJourney] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [destinationName, setDestinationName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [checkInInterval, setCheckInInterval] = useState(10);
  const [starting, setStarting] = useState(false);

  const fetchActiveJourney = async () => {
    try {
      const res = await API.get('/journey/active');
      if (res.success && res.data) {
        setActiveJourney(res.data);
      } else {
        setActiveJourney(null);
      }
    } catch (err) {
      console.warn('[JourneyPage] Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveJourney();
  }, []);

  const handleStartJourney = async (e) => {
    e.preventDefault();
    setStarting(true);
    try {
      const res = await API.post('/journey/start', {
        destinationName,
        estimatedDurationMinutes: parseInt(durationMinutes),
        checkInIntervalMinutes: parseInt(checkInInterval),
        startCoordinates: [location.lng, location.lat]
      });

      if (res.success && res.data) {
        setActiveJourney(res.data);
        alert('Safe Journey Watchdog activated! Perform periodic check-ins until arrival.');
      }
    } catch (err) {
      alert('Failed to start journey: ' + err.message);
    } finally {
      setStarting(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const res = await API.post('/journey/check-in');
      if (res.success && res.data) {
        setActiveJourney(res.data);
        alert('Check-in confirmed! Timer refreshed.');
      }
    } catch (err) {
      alert('Check-in failed: ' + err.message);
    }
  };

  const handleCompleteJourney = async () => {
    try {
      const res = await API.post('/journey/complete');
      if (res.success) {
        setActiveJourney(null);
        alert('Safe Journey completed successfully! Glad you arrived safely.');
      }
    } catch (err) {
      alert('Failed to end journey: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center space-x-4">
        <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
          <Navigation className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Safe Journey Mode</h1>
          <p className="text-sm text-slate-400">
            Travelling alone at night or in unfamiliar areas? Set your trip timer and let the automated watchdog protect you.
          </p>
        </div>
      </div>

      {/* Active Journey Widget */}
      {activeJourney ? (
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/40 bg-slate-900/90 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-xl font-bold text-white">Journey In Progress</h2>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">
              WATCHDOG ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400">Destination</p>
              <h3 className="text-lg font-bold text-slate-100">{activeJourney.destinationName}</h3>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400">Expected Arrival</p>
              <h3 className="text-lg font-bold text-emerald-400">
                {new Date(activeJourney.expectedArrivalTime).toLocaleTimeString()}
              </h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-3 text-xs text-amber-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
              Remember to tap <strong>"I Am Safe (Check-in)"</strong> periodically or complete the trip upon arrival. If the expected arrival time expires without check-in, an automated Emergency SOS will be dispatched to your trusted contacts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={handleCheckIn}
              className="flex-1 py-3.5 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <Clock className="w-5 h-5" />
              <span>I Am Safe (Check-in)</span>
            </button>

            <button
              onClick={handleCompleteJourney}
              className="flex-1 py-3.5 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Arrived Safely (End Trip)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Journey Setup Form */
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-white">Start New Safe Journey</h2>

          <form onSubmit={handleStartJourney} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Destination Name / Landmark
              </label>
              <input
                type="text"
                required
                value={destinationName}
                onChange={(e) => setDestinationName(e.target.value)}
                placeholder="e.g. Home, University Hostel, Central Station"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Estimated Trip Duration (Minutes)
                </label>
                <input
                  type="number"
                  required
                  min="5"
                  max="300"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Check-in Interval (Minutes)
                </label>
                <input
                  type="number"
                  required
                  min="3"
                  max="60"
                  value={checkInInterval}
                  onChange={(e) => setCheckInInterval(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={starting}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <Navigation className="w-5 h-5" />
              <span>{starting ? 'Initializing Watchdog...' : 'Activate Safe Journey Watchdog'}</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
