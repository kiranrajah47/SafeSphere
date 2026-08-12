import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { AlertTriangle, ThumbsUp, MapPin, Plus, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

export default function IncidentsPage() {
  const { location } = useLocation();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('HARASSMENT');
  const [severity, setSeverity] = useState('MEDIUM');
  const [submitting, setSubmitting] = useState(false);

  const fetchIncidents = async () => {
    try {
      const res = await API.get('/incidents');
      if (res.success) {
        setIncidents(res.data || []);
      }
    } catch (err) {
      console.warn('[IncidentsPage] Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleUpvote = async (id) => {
    try {
      const res = await API.post(`/incidents/${id}/upvote`);
      if (res.success) {
        setIncidents(incidents.map(inc => inc._id === id ? res.data : inc));
      }
    } catch (err) {
      alert('Upvote failed: ' + err.message);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await API.post('/incidents', {
        title,
        description,
        category,
        severity,
        coordinates: [location.lng, location.lat],
        address: location.address
      });

      if (res.success && res.data) {
        setIncidents([res.data, ...incidents]);
        setShowModal(false);
        setTitle('');
        setDescription('');
        alert('Incident report submitted to community feed!');
      }
    } catch (err) {
      alert('Submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            Crowd-Sourced Community Incident Feed
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Report hazards, suspicious activities, or harassment to alert nearby community members and local authorities.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-600/20 transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Report Safety Incident</span>
        </button>
      </div>

      {/* Incident List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {incidents.length === 0 ? (
          <div className="col-span-full p-12 text-center glass-panel rounded-3xl text-slate-400 border border-slate-800">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No active incidents reported nearby</h3>
            <p className="text-xs text-slate-400 mt-1">Your community is currently safe and clear.</p>
          </div>
        ) : (
          incidents.map((incident) => (
            <div
              key={incident._id}
              className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                    {incident.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    incident.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {incident.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{incident.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">{incident.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  {incident.location?.address || 'Pinned Location'}
                </span>

                <button
                  onClick={() => handleUpvote(incident._id)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>{incident.upvotes?.length || 0} Confirmations</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal dialog for submitting report */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-4">Submit Community Safety Incident</h3>

            <form onSubmit={handleCreateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unsafe road conditions / Harassment report"
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
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Detailed Description</label>
                <textarea
                  required
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the situation clearly..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-500 text-sm shadow-lg shadow-amber-600/30"
                >
                  {submitting ? 'Submitting...' : 'Post Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
