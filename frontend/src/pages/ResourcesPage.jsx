import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import ResourceCard from '../components/resources/ResourceCard';
import { useLocation } from '../context/LocationContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import AlertBanner from '../components/ui/AlertBanner';
import { SkeletonCard } from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import API from '../services/api';
import { 
  PhoneCall, 
  Search, 
  MapPin, 
  RefreshCw, 
  Shield, 
  HeartPulse, 
  Pill, 
  Flame, 
  Truck, 
  Navigation,
  CheckCircle2
} from 'lucide-react';

export default function ResourcesPage() {
  const { location, loading: locLoading, error: locError, permissionStatus, requestLocation } = useLocation();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = [
    { id: 'ALL', label: 'All Services', icon: PhoneCall },
    { id: 'POLICE', label: 'Police Stations', icon: Shield },
    { id: 'HOSPITAL', label: 'Hospitals / ER', icon: HeartPulse },
    { id: 'PHARMACY', label: '24/7 Pharmacies', icon: Pill },
    { id: 'FIRE', label: 'Fire Stations', icon: Flame },
    { id: 'AMBULANCE', label: 'Ambulance EMS', icon: Truck }
  ];

  const fetchNearbyResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(
        `/resources/nearby?lat=${location.lat}&lng=${location.lng}&category=${selectedCategory}&radiusKm=25`
      );
      if (res.success) {
        setResources(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load nearby emergency services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyResources();
  }, [location.lat, location.lng, selectedCategory]);

  // Client-side search filter
  const filteredResources = resources.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <PageHeader
        title="Nearby Emergency Assistance"
        subtitle="Locate 24/7 Police Stations, ER Hospitals, Pharmacies, and Fire & Ambulance services near your position"
        icon={PhoneCall}
        badge={<Badge variant="emerald" size="sm">OpenStreetMap Verified Directory</Badge>}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={locLoading || loading}
            onClick={() => {
              requestLocation();
              fetchNearbyResources();
            }}
          >
            Refresh GPS Location
          </Button>
        }
      />

      {/* Permission Denied Alert */}
      {permissionStatus === 'denied' && (
        <AlertBanner type="warning" title="Location Permission Denied">
          Browser location access is blocked. Nearby assistance is currently sorted relative to default central coordinates. Enable location permissions in browser settings for exact distance calculation.
        </AlertBanner>
      )}

      {/* Data Source Transparency Banner */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-950">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span>
            Showing emergency response places near <strong>{location.address}</strong>
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
          Haversine GPS Precision
        </span>
      </div>

      {/* Category Tabs Selector */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-400'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Filter Input Bar */}
      <div className="relative max-w-md">
        <Input
          icon={Search}
          placeholder="Filter nearby stations by name or street..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content State Engine */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard rows={3} />
          <SkeletonCard rows={3} />
          <SkeletonCard rows={3} />
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to Load Nearby Services"
          message={error}
          onRetry={fetchNearbyResources}
        />
      ) : filteredResources.length === 0 ? (
        <EmptyState
          icon={PhoneCall}
          title={searchQuery ? 'No Matching Services Found' : 'No Emergency Stations Nearby'}
          description={
            searchQuery
              ? `No emergency places matched "${searchQuery}". Try clearing your search filter.`
              : 'No emergency assistance services registered within your radius.'
          }
          actionLabel={searchQuery ? 'Clear Filter' : 'Refresh Location'}
          onAction={searchQuery ? () => setSearchQuery('') : fetchNearbyResources}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource._id || resource.name} resource={resource} />
          ))}
        </div>
      )}

    </div>
  );
}
