import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import ResourceCard from '../components/resources/ResourceCard';
import GuideCard from '../components/resources/GuideCard';
import VideoPlayerModal from '../components/resources/VideoPlayerModal';
import ResourceDetailModal from '../components/resources/ResourceDetailModal';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastContext';
import Input from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import AlertBanner from '../components/ui/AlertBanner';
import { SkeletonCard } from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import API from '../services/api';
import { 
  BookOpen, 
  PhoneCall, 
  Search, 
  MapPin, 
  RefreshCw, 
  ShieldCheck, 
  HeartPulse, 
  Bookmark, 
  Play, 
  FileText, 
  CheckCircle2,
  Info,
  Flame,
  Pill,
  Truck
} from 'lucide-react';

export default function ResourcesPage() {
  const { location, loading: locLoading, requestLocation } = useLocation();
  const { user } = useAuth();
  const { addToast } = useToast();

  // Top Level Tab Switcher: 'CENTER' (Resource Center) | 'STATIONS' (Nearby Stations)
  const [activeMainTab, setActiveMainTab] = useState('CENTER');

  // Resource Center State
  const [guides, setGuides] = useState([]);
  const [guidesLoading, setGuidesLoading] = useState(true);
  const [groupFilter, setGroupFilter] = useState('ALL'); // 'ALL' | 'SAFETY' | 'HEALTH' | 'BOOKMARKS'
  const [subCategoryFilter, setSubCategoryFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'ARTICLE' | 'VIDEO'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for Guides
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Nearby Assistance Stations State
  const [nearbyResources, setNearbyResources] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [stationCategory, setStationCategory] = useState('ALL');

  // All Safety & Health Sub-Categories
  const safetySubCategories = [
    'Personal safety',
    'Emergency preparedness',
    'Fire safety',
    'Road safety',
    'Travel safety',
    'Disaster preparedness'
  ];

  const healthSubCategories = [
    'First aid',
    'CPR',
    'Basic emergency response',
    'Mental wellbeing',
    'Accident response',
    'General health awareness'
  ];

  // Fetch Guides for Resource Center
  const fetchGuides = async () => {
    setGuidesLoading(true);
    try {
      let url = `/resources/guides?categoryGroup=${groupFilter === 'BOOKMARKS' ? 'ALL' : groupFilter}&type=${typeFilter}`;
      if (groupFilter === 'BOOKMARKS') url += '&bookmarkedOnly=true';
      if (subCategoryFilter !== 'ALL') url += `&category=${encodeURIComponent(subCategoryFilter)}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await API.get(url);
      if (res.success) {
        setGuides(res.data || []);
      }
    } catch (err) {
      console.warn('[ResourcesPage] Guides fetch error:', err.message);
    } finally {
      setGuidesLoading(false);
    }
  };

  // Fetch Nearby Stations
  const fetchNearbyStations = async () => {
    setNearbyLoading(true);
    try {
      const res = await API.get(
        `/resources/nearby?lat=${location.lat}&lng=${location.lng}&category=${stationCategory}&radiusKm=25`
      );
      if (res.success) setNearbyResources(res.data || []);
    } catch (err) {
      console.warn('[ResourcesPage] Nearby stations fetch error:', err.message);
    } finally {
      setNearbyLoading(false);
    }
  };

  useEffect(() => {
    if (activeMainTab === 'CENTER') {
      fetchGuides();
    } else {
      fetchNearbyStations();
    }
  }, [activeMainTab, groupFilter, subCategoryFilter, typeFilter, searchQuery, stationCategory, location.lat, location.lng]);

  // Toggle Bookmark Handler
  const handleToggleBookmark = async (guide) => {
    if (!user) {
      addToast({ type: 'warning', title: 'Sign In Required', message: 'Please log in to bookmark resources.' });
      return;
    }

    try {
      const res = await API.post(`/resources/guides/${guide._id}/bookmark`);
      if (res.success) {
        addToast({
          type: 'info',
          title: res.isBookmarked ? 'Bookmarked' : 'Bookmark Removed',
          message: res.isBookmarked ? `Saved "${guide.title}" to your bookmarks.` : 'Removed from bookmarks.'
        });
        fetchGuides();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Bookmark Error', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <PageHeader
        title="Safety & Health Center & Emergency Directory"
        subtitle="Educational guides, CPR / First Aid tutorials, and 24/7 emergency response stations"
        icon={BookOpen}
        badge={<Badge variant="indigo" size="sm">Safety Knowledgebase</Badge>}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={locLoading}
            onClick={requestLocation}
          >
            Refresh Location
          </Button>
        }
      />

      {/* Main Top Tab Switcher */}
      <div className="flex items-center justify-between p-1.5 bg-slate-200/80 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveMainTab('CENTER')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all ${
            activeMainTab === 'CENTER'
              ? 'bg-white text-indigo-600 shadow-md shadow-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Resource Center</span>
        </button>

        <button
          onClick={() => setActiveMainTab('STATIONS')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all ${
            activeMainTab === 'STATIONS'
              ? 'bg-white text-indigo-600 shadow-md shadow-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Nearby Stations</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: SAFETY & HEALTH RESOURCE CENTER */}
      {/* ========================================================================= */}
      {activeMainTab === 'CENTER' && (
        <div className="space-y-6">
          
          {/* Medical Disclaimer Banner */}
          <AlertBanner type="warning" title="Important Medical Disclaimer">
            The health, CPR, and first aid information in this center is provided for educational and emergency response awareness purposes only and does not constitute professional medical advice. In the event of a medical emergency, call 112 immediately.
          </AlertBanner>

          {/* Group Filter Tabs (ALL / SAFETY / HEALTH / BOOKMARKS) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'ALL', label: 'All Resources', icon: BookOpen },
                { id: 'SAFETY', label: 'Safety Guides', icon: ShieldCheck },
                { id: 'HEALTH', label: 'Health & First Aid', icon: HeartPulse },
                { id: 'BOOKMARKS', label: 'My Bookmarks', icon: Bookmark }
              ].map((grp) => {
                const Icon = grp.icon;
                const isSelected = groupFilter === grp.id;

                return (
                  <button
                    key={grp.id}
                    onClick={() => {
                      setGroupFilter(grp.id);
                      setSubCategoryFilter('ALL');
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                    <span>{grp.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Type Selector (All / Articles / Videos) */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {[
                { id: 'ALL', label: 'All Format' },
                { id: 'ARTICLE', label: 'Articles' },
                { id: 'VIDEO', label: 'Videos' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTypeFilter(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    typeFilter === t.id ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Category Pills & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="relative w-full sm:w-80">
              <Input
                icon={Search}
                placeholder="Search CPR, first aid, fire safety..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Sub-Category Select */}
            <div className="w-full sm:w-64">
              <Select
                value={subCategoryFilter}
                onChange={(e) => setSubCategoryFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Sub-Categories' },
                  ...(groupFilter === 'SAFETY' ? safetySubCategories : groupFilter === 'HEALTH' ? healthSubCategories : [...safetySubCategories, ...healthSubCategories]).map(c => ({ value: c, label: c }))
                ]}
              />
            </div>

          </div>

          {/* Guide Cards Grid */}
          {guidesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard rows={4} />
              <SkeletonCard rows={4} />
              <SkeletonCard rows={4} />
            </div>
          ) : guides.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={groupFilter === 'BOOKMARKS' ? 'No Bookmarked Resources' : 'No Guides Found'}
              description={
                groupFilter === 'BOOKMARKS'
                  ? 'You have not bookmarked any safety or health guides yet. Click the bookmark icon on any guide to save it here.'
                  : 'No guides match your search query or filter selection.'
              }
              actionLabel={groupFilter === 'BOOKMARKS' ? 'Browse All Guides' : 'Clear Filters'}
              onAction={() => {
                setGroupFilter('ALL');
                setSubCategoryFilter('ALL');
                setTypeFilter('ALL');
                setSearchQuery('');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide) => (
                <GuideCard
                  key={guide._id}
                  guide={guide}
                  onSelectGuide={(g) => {
                    if (g.type === 'VIDEO') setSelectedVideo(g);
                    else setSelectedGuide(g);
                  }}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: NEARBY EMERGENCY STATIONS */}
      {/* ========================================================================= */}
      {activeMainTab === 'STATIONS' && (
        <div className="space-y-6">
          
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: 'All Services', icon: PhoneCall },
              { id: 'POLICE', label: 'Police Stations', icon: ShieldCheck },
              { id: 'HOSPITAL', label: 'Hospitals / ER', icon: HeartPulse },
              { id: 'PHARMACY', label: '24/7 Pharmacies', icon: Pill },
              { id: 'FIRE', label: 'Fire Stations', icon: Flame },
              { id: 'AMBULANCE', label: 'Ambulance EMS', icon: Truck }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setStationCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
                  stationCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {nearbyLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard rows={3} />
              <SkeletonCard rows={3} />
            </div>
          ) : nearbyResources.length === 0 ? (
            <EmptyState
              icon={PhoneCall}
              title="No Emergency Stations Found"
              description="No nearby emergency assistance places found for the selected category."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyResources.map((res) => (
                <ResourceCard key={res._id || res.name} resource={res} />
              ))}
            </div>
          )}

        </div>
      )}

      {/* Article Detail Modal */}
      {selectedGuide && (
        <ResourceDetailModal
          isOpen={Boolean(selectedGuide)}
          onClose={() => setSelectedGuide(null)}
          guide={selectedGuide}
          onToggleBookmark={handleToggleBookmark}
        />
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal
          isOpen={Boolean(selectedVideo)}
          onClose={() => setSelectedVideo(null)}
          guide={selectedVideo}
        />
      )}

    </div>
  );
}
