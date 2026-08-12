import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { ShieldAlert, Users, AlertTriangle, Radio, CheckCircle, XCircle, Megaphone, Plus } from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSOSCount: 0,
    pendingIncidentsCount: 0,
    totalIncidentsCount: 0,
    activeAlertsCount: 0
  });
  const [recentSOS, setRecentSOS] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Broadcast Alert Form
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertCategory, setAlertCategory] = useState('GENERAL');
  const [alertSeverity, setAlertSeverity] = useState('WARNING');
  const [broadcasting, setBroadcasting] = useState(false);

  const fetchAdminData = async () => {
    try {
      const statsRes = await API.get('/admin/stats');
      if (statsRes.success) {
        setStats(statsRes.data.stats || {});
        setRecentSOS(statsRes.data.recentSOS || []);
      }

      const incRes = await API.get('/incidents');
      if (incRes.success) {
        setIncidents(incRes.data || []);
      }

      const usersRes = await API.get('/admin/users');
      if (usersRes.success) {
        setUsers(usersRes.data || []);
      }
    } catch (err) {
      console.warn('[AdminPage] Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyIncident = async (id, status) => {
    try {
      const res = await API.put(`/incidents/${id}/status`, { status });
      if (res.success) {
        setIncidents(incidents.map(i => i._id === id ? res.data : i));
      }
    } catch (err) {
      alert('Failed to update incident: ' + err.message);
    }
  };

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    setBroadcasting(true);

    try {
      const res = await API.post('/alerts', {
        title: alertTitle,
        message: alertMessage,
        category: alertCategory,
        severity: alertSeverity
      });

      if (res.success) {
        alert('Community Safety Alert broadcasted in real-time across all connected clients!');
        setAlertTitle('');
        setAlertMessage('');
        fetchAdminData();
      }
    } catch (err) {
      alert('Broadcast failed: ' + err.message);
    } finally {
      setBroadcasting(false);
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      const res = await API.put(`/admin/users/${userId}/role`, { role });
      if (res.success) {
        setUsers(users.map(u => u._id === userId ? res.data : u));
      }
    } catch (err) {
      alert('Role update failed: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Emergency Command Console</h1>
            <p className="text-sm text-slate-400">System administration, live SOS dispatching, and community incident moderation.</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Registered Users</p>
          <h3 className="text-3xl font-black text-white mt-1">{stats.totalUsers}</h3>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-red-500/30 bg-red-950/20">
          <p className="text-xs text-red-400 font-medium flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> Active Emergency SOS
          </p>
          <h3 className="text-3xl font-black text-red-400 mt-1">{stats.activeSOSCount}</h3>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-amber-500/30">
          <p className="text-xs text-amber-400 font-medium">Pending Incident Verification</p>
          <h3 className="text-3xl font-black text-amber-400 mt-1">{stats.pendingIncidentsCount}</h3>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Total Community Incidents</p>
          <h3 className="text-3xl font-black text-white mt-1">{stats.totalIncidentsCount}</h3>
        </div>
      </div>

      {/* Broadcast Community Alert Form */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-amber-400" />
          Broadcast System Community Alert
        </h2>

        <form onSubmit={handleBroadcastAlert} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Alert Title</label>
              <input
                type="text"
                required
                value={alertTitle}
                onChange={(e) => setAlertTitle(e.target.value)}
                placeholder="e.g. Heavy Storm Warning / Road Closure"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Category</label>
              <select
                value={alertCategory}
                onChange={(e) => setAlertCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none"
              >
                <option value="GENERAL">General Safety</option>
                <option value="WEATHER">Severe Weather</option>
                <option value="SECURITY">Police & Security</option>
                <option value="INFRASTRUCTURE">Infrastructure</option>
                <option value="CIVIL_DEFENSE">Civil Defense</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Severity</label>
              <select
                value={alertSeverity}
                onChange={(e) => setAlertSeverity(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none"
              >
                <option value="INFO">Informational (Blue)</option>
                <option value="WARNING">Warning (Amber)</option>
                <option value="DANGER">Danger (Red)</option>
                <option value="CRITICAL">Critical Emergency (Pulsing)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Alert Message</label>
            <textarea
              required
              rows="2"
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              placeholder="Full text message broadcasted to all users..."
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={broadcasting}
            className="py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <Megaphone className="w-4 h-4" />
            <span>{broadcasting ? 'Broadcasting...' : 'Broadcast Real-Time Alert'}</span>
          </button>
        </form>
      </div>

      {/* Incident Verification Moderation Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Incident Moderation Queue
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Title & Description</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {incidents.map((inc) => (
                <tr key={inc._id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-semibold text-amber-400">{inc.category}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-100">{inc.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{inc.description}</p>
                  </td>
                  <td className="px-4 py-3 font-bold uppercase">{inc.severity}</td>
                  <td className="px-4 py-3 font-bold">{inc.status}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleVerifyIncident(inc._id, 'VERIFIED')}
                      className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded font-semibold hover:bg-emerald-600/30"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleVerifyIncident(inc._id, 'DISMISSED')}
                      className="px-2.5 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded font-semibold hover:bg-rose-600/30"
                    >
                      Dismiss
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
