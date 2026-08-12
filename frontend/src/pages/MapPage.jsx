import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import SafetyMap from '../components/map/SafetyMap';
import { useLocation } from '../context/LocationContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import AlertBanner from '../components/ui/AlertBanner';
import API from '../services/api';
import { MapPin, RefreshCw, Shield, PhoneCall, AlertTriangle, Layers, Navigation } from 'lucide-react';

export default function MapPage() {
  const { location, loading: locLoading, error: locError, permissionStatus, requestLocation } = useLocation();

  const [nearbyResources, setNearbyResources] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL'); // 'ALL' | 'POLICE' | 'HOSPITAL' | 'FIRE' | 'INCIDENT'
  const [dataLoading, setDataLoading] = useState(false);

  // Fetch Nearby Resources & Incidents for Map
  const fetchMapData = async () => {
    setDataLoading(true);
    try {
      const [resRes, incRes] = await Promise.all([
        API.get(`/resources/nearby?lat=${location.lat}&lng=${location.lng}&radiusKm=15`),
        API.get(`/incidents?lat=${location.lat}&lng=${location.lng}&radiusKm=15`)
      ]);

      if (resRes.success) setNearbyResources(resRes.data || []);
      if (incRes.success) setIncidents(incRes.data || []);
    } catch (err) {
      console.warn('[MapPage] Data fetch error:', err.message);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, [location.lat, location.lng]);

  // Combine and filter markers
  const allMarkers = [
    ...nearbyResources.map(r => ({ ...r, category: r.category || 'POLICE' })),
    ...incidents.map(i => ({ ...i, category: 'INCIDENT' }))
  ];

  const filteredMarkers = activeCategory === 'ALL'
    ? allMarkers
    : allMarkers.filter(m => m.category === activeCategory);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <PageHeader
        title="Interactive Safety Map"
        subtitle="Real-time OpenStreetMap navigation with nearby emergency stations and incident reports"
        icon={MapPin}
        badge={<Badge variant="indigo" size="sm">OpenStreetMap Engine</Badge>}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={locLoading || dataLoading}
            onClick={() => {
              requestLocation();
              fetchMapData();
            }}
          >
            Refresh GPS Position
          </Button>
        }
      />

      {/* Permission Denied Alert */}
      {permissionStatus === 'denied' && (
        <AlertBanner type="warning" title="Location Access Blocked">
          Your browser has denied location permissions. SafeSphere is currently displaying standard default coordinates. To enable your position, click the lock icon in your browser address bar and set Location to Allow.
        </AlertBanner>
      )}

      {/* Location Details Readout Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500">Current Address</p>
              <p className="text-xs font-extrabold text-slate-900 truncate">{location.address}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500">Coordinates</p>
              <p className="text-xs font-mono font-bold text-slate-900">
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500">Nearby Markers</p>
              <p className="text-xs font-extrabold text-slate-900">
                {filteredMarkers.length} Emergency Stations & Incidents
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'All Markers', count: allMarkers.length },
            { id: 'POLICE', label: 'Police Stations', count: allMarkers.filter(m => m.category === 'POLICE').length },
            { id: 'HOSPITAL', label: 'Hospitals', count: allMarkers.filter(m => m.category === 'HOSPITAL' || m.category === 'AMBULANCE').length },
            { id: 'FIRE', label: 'Fire Depts', count: allMarkers.filter(m => m.category === 'FIRE').length },
            { id: 'INCIDENT', label: 'Incidents', count: allMarkers.filter(m => m.category === 'INCIDENT').length }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Reusable Leaflet SafetyMap */}
      <SafetyMap
        center={[location.lat, location.lng]}
        zoom={14}
        userLocation={location}
        markers={filteredMarkers}
        loading={locLoading || dataLoading}
        error={locError}
        permissionStatus={permissionStatus}
        onRefreshLocation={requestLocation}
        height="h-[550px]"
      />

    </div>
  );
}
