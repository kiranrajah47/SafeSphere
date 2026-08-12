import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { BookOpen, PhoneCall, Shield, Hospital, Building2, MapPin, Search } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

export default function ResourcesPage() {
  const { location } = useLocation();
  const [hotlines, setHotlines] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    try {
      const hotlineRes = await API.get('/resources/hotlines');
      if (hotlineRes.success) {
        setHotlines(hotlineRes.data || []);
      }

      const nearbyRes = await API.get(`/resources/nearby?lat=${location.lat}&lng=${location.lng}&radiusKm=10`);
      if (nearbyRes.success) {
        setNearby(nearbyRes.data || []);
      }
    } catch (err) {
      console.warn('[ResourcesPage] Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [location.lat, location.lng]);

  const filteredHotlines = hotlines.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.phone.includes(searchQuery)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" />
            Emergency Services & Helplines Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            24/7 verified national toll-free emergency numbers, legal assistance helplines, and nearby emergency service points.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hotlines..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* National Toll-Free Hotlines Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-red-400" />
          National Emergency Helplines (24/7 Toll-Free)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHotlines.map((hotline) => (
            <div
              key={hotline._id || hotline.name}
              className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all flex items-center justify-between"
            >
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 uppercase">
                  {hotline.category}
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">{hotline.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Hours: {hotline.operatingHours}</p>
              </div>

              <a
                href={`tel:${hotline.phone}`}
                className="px-4 py-2.5 rounded-xl font-black text-sm text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/30 transition-all flex items-center space-x-1.5"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{hotline.phone}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Emergency Services Section */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          Nearby Local Emergency Services
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {nearby.map((res) => (
            <div
              key={res._id || res.name}
              className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  res.category === 'POLICE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {res.category}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">{res.operatingHours}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{res.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{res.address}</p>
              </div>

              <a
                href={`tel:${res.phone}`}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Station ({res.phone})</span>
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
