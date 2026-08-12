import React, { useState, useEffect } from 'react';
import SafeMap from '../components/map/SafeMap';
import API from '../services/api';
import { MapPin, Plus, Filter, Shield, Hospital, AlertTriangle } from 'lucide-react';

export default function MapPage() {
  const [activeSOSList, setActiveSOSList] = useState([]);
  const [resourcesList, setResourcesList] = useState([]);
  const [incidentsList, setIncidentsList] = useState([]);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [selectedPin, setSelectedPin] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Incident Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('HARASSMENT');
  const [severity, setSeverity] = useState('MEDIUM');
  const [submitting, setSubmitting] = useState(false);

  const fetchMapData = async () => {
    try {
      // Fetch active SOS alerts
      const sosRes = await API.get('/sos/active');
      if (sosRes.success && Array.isArray(sosRes.data)) {
        setActiveSOSList(sosRes.data);
      }

      // Fetch emergency resources
      const resRes = await API.get('/resources/nearby');
      if (resRes.success) {
        setResourcesList(resRes.data || []);
      }

      // Fetch incident reports
      const incRes = await API.get('/incidents');
      if (incRes.success) {
        setIncidentsList(incRes.data || []);
      }
    } catch (err) {
      console.warn('[MapPage] Error fetching data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  const handleMapClick = (lat, lng) => {
    setSelectedPin({ lat, lng });
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    if (!selectedPin) {
      alert('Please click a location on the map to pin the incident first.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/incidents', {
        title,
        description,
        category,
        severity,
        coordinates: [selectedPin.lng, selectedPin.lat]
      });

      if (res.success && res.data) {
        setIncidentsList([res.data, ...incidentsList]);
        setShowReportModal(false);
        setTitle('');
        setDescription('');
        setSelectedPin(null);
        alert('Incident report pinned successfully on the safety map!');
      }
    } catch (err) {
      alert('Failed to submit report: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredIncidents = filterCategory === 'ALL'
    ? incidentsList
    : incidentsList.filter(i => i.category === filterCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-400" />
            Interactive Emergency & Safety Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time visualization of live emergency SOS triggers, police stations, ER hospitals, and crowd-reported hazards.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {selectedPin ? (
            <button
              onClick={() => setShowReportModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center space-x-2 animate-bounce"
            >
              <Plus className="w-4 h-4" />
              <span>Report Incident at Pinned Spot</span>
            </button>
          ) : (
            <p className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20">
              💡 Tip: Click anywhere on map to select coordinates for reporting
            </p>
          )}
        </div>
      </div>

      {/* Filter Category Toolbar */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="text-slate-400 flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" /> Filter Layer:
        </span>
        {['ALL', 'HARASSMENT', 'ACCIDENT', 'THEFT', 'HAZARD', 'SUSPICIOUS_ACTIVITY'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filterCategory === cat
                ? 'bg-slate-800 text-white border-blue-500'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Interactive Map */}
      <SafeMap
        activeSOSList={activeSOSList}
        resourcesList={resourcesList}
        incidentsList={filteredIncidents}
        onMapClick={handleMapClick}
        selectedPin={selectedPin}
      />

      {/* Incident Report Modal Form */}
      {showReportModal && selectedPin && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Report Incident at Selected Coordinates
            </h3>

            <form onSubmit={handleCreateIncident} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken street lights / Suspicious activity"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none"
                  >
                    <option value="HARASSMENT">Harassment</option>
                    <option value="ACCIDENT">Accident</option>
                    <option value="THEFT">Theft / Robbery</option>
                    <option value="HAZARD">Road / Infra Hazard</option>
                    <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
                <textarea
                  required
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide helpful details for community members..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="w-1/2 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-500 text-sm shadow-lg shadow-amber-600/30"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
