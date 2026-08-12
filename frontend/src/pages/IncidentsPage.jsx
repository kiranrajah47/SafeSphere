import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import AlertCard from '../components/alerts/AlertCard';
import AlertDetailModal from '../components/alerts/AlertDetailModal';
import SafetyMap from '../components/map/SafetyMap';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastContext';
import { useSocket } from '../context/SocketContext';
import Input from '../components/ui/Input';
import { Select, TextArea } from '../components/ui/Select';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import { SkeletonCard } from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import AlertBanner from '../components/ui/AlertBanner';
import API from '../services/api';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  MapPin, 
  Filter, 
  Layers, 
  List, 
  Map as MapIcon, 
  Clock, 
  CheckCircle2, 
  ShieldAlert 
} from 'lucide-react';

export default function IncidentsPage() {
  const { location } = useLocation();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { realtimeEventCounter } = useSocket();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('all'); // '24h' | '7d' | '30d' | 'all'
  const [radiusKm, setRadiusKm] = useState('50');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Detail Modal State
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Post Alert Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [postFormData, setPostFormData] = useState({
    title: '',
    description: '',
    category: 'Accident',
    severity: 'medium'
  });
  const [postError, setPostError] = useState('');
  const [posting, setPosting] = useState(false);

  // Delete Alert Confirmation State
  const [alertToDelete, setAlertToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Categories required by prompt
  const categoriesList = [
    'Accident',
    'Fire',
    'Crime',
    'Medical emergency',
    'Road hazard',
    'Suspicious activity',
    'Missing person',
    'Natural disaster',
    'Other'
  ];

  // Fetch Alerts
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await API.get(
        `/alerts?lat=${location.lat}&lng=${location.lng}&category=${categoryFilter}&severity=${severityFilter}&timeRange=${timeFilter}&radiusKm=${radiusKm}`
      );
      if (res.success) {
        setAlerts(res.data || []);
      }
    } catch (err) {
      console.warn('[IncidentsPage] Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [location.lat, location.lng, categoryFilter, severityFilter, timeFilter, radiusKm, realtimeEventCounter]);

  // Submit New Community Alert
  const handlePostAlert = async (e) => {
    e.preventDefault();
    setPostError('');

    if (!user) {
      addToast({ type: 'warning', title: 'Sign In Required', message: 'Please log in to report community safety alerts.' });
      return;
    }

    if (!postFormData.title || !postFormData.description) {
      setPostError('Please enter both a title and description.');
      return;
    }

    setPosting(true);

    try {
      const res = await API.post('/alerts', {
        title: postFormData.title,
        description: postFormData.description,
        category: postFormData.category,
        severity: postFormData.severity,
        latitude: location.lat,
        longitude: location.lng,
        coordinates: [location.lng, location.lat],
        address: location.address
      });

      if (res.success && res.data) {
        addToast({ type: 'success', title: 'Alert Posted', message: 'Your community safety alert is now live on the network.' });
        setShowPostModal(false);
        setPostFormData({ title: '', description: '', category: 'Accident', severity: 'medium' });
        fetchAlerts();
      }
    } catch (err) {
      setPostError(err.message || 'Failed to post community alert.');
    } finally {
      setPosting(false);
    }
  };

  // Flag / Report Inappropriate Alert
  const handleFlagAlert = async (alertItem) => {
    if (!user) {
      addToast({ type: 'warning', title: 'Sign In Required', message: 'Please log in to report false or inappropriate content.' });
      return;
    }

    try {
      const res = await API.post(`/alerts/${alertItem._id}/flag`);
      if (res.success) {
        addToast({
          type: 'info',
          title: 'Alert Reported',
          message: 'Thank you for helping keep the SafeSphere network clean. This alert has been flagged for moderation.'
        });
        fetchAlerts();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Report Action', message: err.message });
    }
  };

  // Delete Alert Action
  const handleConfirmDelete = async () => {
    if (!alertToDelete) return;
    setDeleting(true);
    try {
      const res = await API.delete(`/alerts/${alertToDelete._id}`);
      if (res.success) {
        addToast({ type: 'info', title: 'Alert Deleted', message: 'Community alert has been removed.' });
        setAlertToDelete(null);
        fetchAlerts();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Deletion Failed', message: err.message });
    } finally {
      setDeleting(false);
    }
  };

  // Client-side text search filter
  const filteredAlerts = alerts.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <PageHeader
        title="Community Safety Alerts & Incidents"
        subtitle="Real-time crowd-sourced safety notices, crime alerts, hazard warnings, and neighborhood reports"
        icon={AlertTriangle}
        badge={<Badge variant="amber" size="sm">{filteredAlerts.length} Active Alerts</Badge>}
        actions={
          <Button variant="danger" icon={Plus} onClick={() => setShowPostModal(true)}>
            Report Safety Alert
          </Button>
        }
      />

      {/* View Switcher & Filters Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        
        {/* Top Controls Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Input
              icon={Search}
              placeholder="Search title, hazard, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>

            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                viewMode === 'map' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>

        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          
          {/* Category Filter */}
          <Select
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Categories' },
              ...categoriesList.map(c => ({ value: c, label: c }))
            ]}
          />

          {/* Severity Filter */}
          <Select
            label="Severity"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Severities' },
              { value: 'critical', label: 'Critical' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' }
            ]}
          />

          {/* Time Range Filter */}
          <Select
            label="Time Range"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Time' },
              { value: '24h', label: 'Past 24 Hours' },
              { value: '7d', label: 'Past 7 Days' },
              { value: '30d', label: 'Past 30 Days' }
            ]}
          />

          {/* Nearby Radius Filter */}
          <Select
            label="Distance Radius"
            value={radiusKm}
            onChange={(e) => setRadiusKm(e.target.value)}
            options={[
              { value: '5', label: 'Within 5 km' },
              { value: '10', label: 'Within 10 km' },
              { value: '25', label: 'Within 25 km' },
              { value: '50', label: 'Within 50 km' }
            ]}
          />

        </div>

      </div>

      {/* Main Content Area: Grid or Map */}
      {viewMode === 'map' ? (
        <SafetyMap
          center={[location.lat, location.lng]}
          zoom={13}
          userLocation={location}
          markers={filteredAlerts.map(a => ({ ...a, category: 'INCIDENT' }))}
          height="h-[600px]"
        />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard rows={3} />
          <SkeletonCard rows={3} />
          <SkeletonCard rows={3} />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No Alerts Found"
          description="No community safety alerts match your current filter criteria."
          actionLabel="Report New Alert"
          onAction={() => setShowPostModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlerts.map((alertItem) => (
            <AlertCard
              key={alertItem._id}
              alertItem={alertItem}
              onViewDetails={(a) => setSelectedAlert(a)}
              onFlagAlert={handleFlagAlert}
            />
          ))}
        </div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <AlertDetailModal
          isOpen={Boolean(selectedAlert)}
          onClose={() => setSelectedAlert(null)}
          alertItem={selectedAlert}
          onFlagAlert={handleFlagAlert}
          onDeleteAlert={(a) => setAlertToDelete(a)}
        />
      )}

      {/* Post Community Alert Modal */}
      <Modal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        title="Report Community Safety Alert"
        subtitle="Broadcast a safety notice or hazard alert to nearby SafeSphere users"
      >
        {postError && (
          <AlertBanner type="danger" onDismiss={() => setPostError('')} className="mb-4">
            {postError}
          </AlertBanner>
        )}

        <form onSubmit={handlePostAlert} className="space-y-4">
          <Input
            label="Alert Title"
            required
            value={postFormData.title}
            onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
            placeholder="e.g. Fallen Tree Blocking Main Road"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Alert Category"
              value={postFormData.category}
              onChange={(e) => setPostFormData({ ...postFormData, category: e.target.value })}
              options={categoriesList.map(c => ({ value: c, label: c }))}
            />

            <Select
              label="Severity Level"
              value={postFormData.severity}
              onChange={(e) => setPostFormData({ ...postFormData, severity: e.target.value })}
              options={[
                { value: 'low', label: 'Low (Minor Notice)' },
                { value: 'medium', label: 'Medium (Caution)' },
                { value: 'high', label: 'High (Significant Hazard)' },
                { value: 'critical', label: 'Critical (Immediate Danger)' }
              ]}
            />
          </div>

          <TextArea
            label="Detailed Description"
            required
            rows={4}
            value={postFormData.description}
            onChange={(e) => setPostFormData({ ...postFormData, description: e.target.value })}
            placeholder="Provide relevant details about what happened, exact landmark, and advice for neighbors..."
          />

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Location Tag:</span>
            <span className="font-bold text-slate-900">{location.address}</span>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setShowPostModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={posting}>
              Broadcast Community Alert
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(alertToDelete)}
        onClose={() => setAlertToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Community Alert"
        message={`Are you sure you want to delete "${alertToDelete?.title}"?`}
        confirmText="Delete Alert"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />

    </div>
  );
}
