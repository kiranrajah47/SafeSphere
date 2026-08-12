import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { useToast } from '../components/ui/ToastContext';
import { useSocket } from '../context/SocketContext';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import AlertBanner from '../components/ui/AlertBanner';
import Modal from '../components/ui/Modal';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import Input from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { LoadingSpinner, SkeletonCard } from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import SOSActiveModal from '../components/sos/SOSActiveModal';
import API from '../services/api';
import { 
  Shield, 
  ShieldAlert, 
  MapPin, 
  Users, 
  PhoneCall, 
  Navigation, 
  AlertTriangle, 
  BookOpen, 
  Bot, 
  Radio, 
  Plus, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  Activity, 
  ArrowRight,
  Sparkles,
  Phone,
  Flame,
  HeartPulse,
  Info
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const { location, requestLocation } = useLocation();
  const { addToast } = useToast();
  const { realtimeEventCounter } = useSocket();

  // State Management
  const [activeSOS, setActiveSOS] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [nearbyResources, setNearbyResources] = useState([]);
  const [communityAlerts, setCommunityAlerts] = useState([]);
  const [activeJourney, setActiveJourney] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // SOS Confirmation Dialog State
  const [showSOSConfirmDialog, setShowSOSConfirmDialog] = useState(false);
  const [selectedEmergencyType, setSelectedEmergencyType] = useState('PANIC');
  const [sosLoading, setSosLoading] = useState(false);

  // Add Contact Modal State
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [addingContact, setAddingContact] = useState(false);

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (user) {
        // 1. Fetch Active SOS Status
        const sosRes = await API.get('/sos/active');
        if (sosRes.success) setActiveSOS(sosRes.data || null);

        // 2. Fetch User Emergency Contacts
        const contactsRes = await API.get('/contacts');
        if (contactsRes.success) setContacts(contactsRes.data || []);

        // 3. Fetch Active Safe Journey
        const journeyRes = await API.get('/journey/active');
        if (journeyRes.success) setActiveJourney(journeyRes.data || null);
      }

      // 4. Fetch Nearby Services
      const resRes = await API.get(`/resources/nearby?lat=${location.lat}&lng=${location.lng}&radiusKm=10`);
      if (resRes.success) setNearbyResources(resRes.data || []);

      // 5. Fetch Community Alerts
      const alertsRes = await API.get('/alerts');
      if (alertsRes.success) setCommunityAlerts(alertsRes.data || []);

      // 6. Fetch Recent Incidents
      const incRes = await API.get(`/incidents?lat=${location.lat}&lng=${location.lng}&radiusKm=15`);
      if (incRes.success) setRecentIncidents(incRes.data || []);

    } catch (err) {
      console.warn('[HomePage] Data fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, location.lat, location.lng, realtimeEventCounter]);

  // Execute SOS Trigger
  const handleConfirmSOS = async () => {
    setSosLoading(true);
    try {
      const lat = location?.lat || 28.6139;
      const lng = location?.lng || 77.2090;

      const res = await API.post('/sos/trigger', {
        emergencyType: selectedEmergencyType,
        latitude: lat,
        longitude: lng,
        coordinates: [lng, lat],
        address: location?.address || 'Live Location'
      });

      if (res.success && res.data) {
        setActiveSOS(res.data);
        setShowSOSConfirmDialog(false);
        addToast({
          type: 'error',
          title: '🚨 EMERGENCY SOS ACTIVATED',
          message: `Live ${selectedEmergencyType} alert is now broadcasting your GPS coordinates.`
        });
      }
    } catch (err) {
      const errorMsg = err.message.includes('authorized') || err.message.includes('token')
        ? 'You must be signed in to trigger an Emergency SOS Alert. Please log in first.'
        : err.message.includes('Network') || err.message.includes('ECONNREFUSED')
        ? 'Backend API server is offline. Please start the backend with npm run dev on port 5000.'
        : err.message;

      addToast({
        type: 'error',
        title: 'SOS Dispatch Error',
        message: errorMsg
      });
    } finally {
      setSosLoading(false);
    }
  };

  // Cancel SOS
  const handleCancelSOS = async () => {
    try {
      const res = await API.post('/sos/cancel');
      if (res.success) {
        setActiveSOS(null);
        addToast({
          type: 'info',
          title: 'SOS Alert Cancelled',
          message: 'Your emergency SOS session has been safely cancelled.'
        });
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  // Resolve SOS
  const handleResolveSOS = async (sosId) => {
    try {
      const res = await API.post('/sos/resolve', { sosId });
      if (res.success) {
        setActiveSOS(null);
        addToast({
          type: 'success',
          title: 'Marked Safe',
          message: 'Glad you are safe! Emergency SOS has been resolved.'
        });
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  // Add Contact Handler
  const handleAddContact = async (e) => {
    e.preventDefault();
    setAddingContact(true);
    try {
      const res = await API.post('/contacts', {
        name: newContactName,
        relationship: newContactRelation,
        phone: newContactPhone
      });

      if (res.success && res.data) {
        setContacts([...contacts, res.data]);
        setShowAddContactModal(false);
        setNewContactName('');
        setNewContactRelation('');
        setNewContactPhone('');
        addToast({
          type: 'success',
          title: 'Contact Saved',
          message: `${newContactName} added to trusted emergency contacts.`
        });
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to Save Contact', message: err.message });
    } finally {
      setAddingContact(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Welcome Section & System Header */}
      <PageHeader
        title={`Hello, ${user ? user.name.split(' ')[0] : 'Safety Guard'} 👋`}
        subtitle="Personal Safety, Emergency Dispatch & Community Protection Console"
        icon={Shield}
        badge={<Badge variant="emerald" size="sm" icon={Radio}>24/7 Protection Active</Badge>}
        actions={
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
            <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        }
      />

      {/* Active Running SOS Alert Banner */}
      {activeSOS && (
        <AlertBanner type="danger" title="🚨 EMERGENCY SOS ALERT IS CURRENTLY ACTIVE">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-1">
            <p className="text-xs text-red-900">
              Live location broadcasting active for <strong>{activeSOS.emergencyType}</strong> emergency. Emergency contacts notified.
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="danger" size="sm" onClick={() => handleResolveSOS(activeSOS._id)}>
                I Am Safe (Resolve)
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancelSOS}>
                Cancel SOS
              </Button>
            </div>
          </div>
        </AlertBanner>
      )}

      {/* 2. Prominent Emergency SOS Hub & 3. Current Location Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* SECTION 2: Large Prominent Emergency SOS Button Card (7 Cols) */}
        <Card className="lg:col-span-7 border-red-200 bg-gradient-to-br from-white via-red-50/20 to-rose-50/40 relative overflow-hidden flex flex-col justify-between shadow-md">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-red-600 font-extrabold text-lg">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
                EMERGENCY SOS DISPATCH
              </CardTitle>
              <Badge variant="red" size="sm">Instant Response</Badge>
            </div>
            <CardDescription>
              Tap or select emergency category to trigger immediate SOS dispatch and live location broadcasting.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 flex flex-col items-center justify-center space-y-6">
            
            {/* Emergency Category Selector */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { id: 'PANIC', label: 'Panic SOS', icon: ShieldAlert, color: 'text-red-600' },
                { id: 'MEDICAL', label: 'Medical ER', icon: HeartPulse, color: 'text-rose-600' },
                { id: 'FIRE', label: 'Fire Rescue', icon: Flame, color: 'text-amber-600' },
                { id: 'CRIME', label: 'Crime Alert', icon: Shield, color: 'text-indigo-600' }
              ].map((type) => {
                const Icon = type.icon;
                const isSelected = selectedEmergencyType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedEmergencyType(type.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-2 ring-red-400'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : type.color}`} />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Huge Visually Distinct SOS Button */}
            <button
              onClick={() => setShowSOSConfirmDialog(true)}
              className="group relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 text-white shadow-2xl shadow-red-600/40 border-4 border-white flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 animate-emergency-pulse cursor-pointer select-none"
            >
              <ShieldAlert className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md group-hover:scale-110 transition-transform" />
              <span className="text-2xl sm:text-3xl font-black tracking-widest mt-1 text-white drop-shadow">
                SOS
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/25 mt-1 text-red-100">
                CLICK TO DISPATCH
              </span>
            </button>

            <p className="text-xs text-slate-500 text-center font-medium max-w-sm">
              Pressing SOS immediately notifies your emergency contacts and broadcasts real-time GPS coordinates to emergency responders.
            </p>

          </CardContent>
        </Card>

        {/* SECTION 3: Current Location Card (5 Cols) */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-indigo-600">
                <MapPin className="w-5 h-5" />
                Current GPS Location
              </CardTitle>
              <Button variant="ghost" size="sm" icon={RefreshCw} onClick={requestLocation} title="Refresh Location">
                Refresh
              </Button>
            </div>
            <CardDescription>Real-time HTML5 Geolocation coordinates</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Address</h4>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{location.address}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Latitude</p>
                <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">{location.lat.toFixed(6)}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Longitude</p>
                <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">{location.lng.toFixed(6)}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
              <span className="text-indigo-900 font-semibold">GPS Precision Accuracy:</span>
              <Badge variant="indigo" size="sm">~{Math.round(location.accuracy || 10)} meters</Badge>
            </div>
          </CardContent>

          <CardFooter>
            <Link to="/map" className="w-full">
              <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right" className="w-full">
                Open Full Interactive Map
              </Button>
            </Link>
          </CardFooter>
        </Card>

      </div>

      {/* Grid Layout for Cards 4, 5, 6, 7 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* SECTION 4: Emergency Contacts Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Users className="w-5 h-5 text-red-600" />
                Emergency Contacts
              </CardTitle>
              <Badge variant="red" size="sm">{contacts.length} Trusted</Badge>
            </div>
            <CardDescription>Contacts notified during Emergency SOS</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {contacts.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Contacts Added"
                description="Add trusted emergency contacts to automatically notify them when you trigger SOS."
                actionLabel="Add Contact"
                onAction={() => setShowAddContactModal(true)}
              />
            ) : (
              contacts.slice(0, 3).map((contact) => (
                <div key={contact._id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900">{contact.name}</span>
                      <Badge variant="purple" size="sm">{contact.relationship}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{contact.phone}</p>
                  </div>

                  <a href={`tel:${contact.phone}`} className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-indigo-600">
                    <PhoneCall className="w-4 h-4" />
                  </a>
                </div>
              ))
            )}
          </CardContent>

          <CardFooter>
            <Button variant="outline" size="sm" icon={Plus} onClick={() => setShowAddContactModal(true)} className="w-full">
              Add Emergency Contact
            </Button>
          </CardFooter>
        </Card>

        {/* SECTION 5: Nearby Assistance Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <PhoneCall className="w-5 h-5 text-blue-600" />
                Nearby Emergency Services
              </CardTitle>
              <Badge variant="indigo" size="sm">24/7 Stations</Badge>
            </div>
            <CardDescription>Nearby Police, ER Hospitals, and Fire Depts</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {nearbyResources.slice(0, 3).map((res) => (
              <div key={res._id || res.name} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{res.name}</span>
                  <Badge variant={res.category === 'POLICE' ? 'indigo' : 'emerald'} size="sm">
                    {res.category}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 truncate">{res.address}</p>
              </div>
            ))}
          </CardContent>

          <CardFooter>
            <Link to="/resources" className="w-full">
              <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right" className="w-full">
                View All Emergency Services
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* SECTION 7: Safe Journey Mode Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Navigation className="w-5 h-5 text-emerald-600" />
                Safe Journey Mode
              </CardTitle>
              <Badge variant={activeJourney ? 'emerald' : 'slate'} size="sm">
                {activeJourney ? 'Watchdog Running' : 'Idle'}
              </Badge>
            </div>
            <CardDescription>Trip timer watchdog with automated check-ins</CardDescription>
          </CardHeader>

          <CardContent>
            {activeJourney ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <p className="text-xs text-emerald-800 font-semibold">Active Trip Destination:</p>
                <h4 className="text-base font-extrabold text-emerald-950">{activeJourney.destinationName}</h4>
                <p className="text-xs text-emerald-700 font-medium">
                  Expected Arrival: {new Date(activeJourney.expectedArrivalTime).toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <EmptyState
                icon={Navigation}
                title="No Trip Active"
                description="Travelling late or alone? Activate Safe Journey mode so our watchdog tracks your arrival."
              />
            )}
          </CardContent>

          <CardFooter>
            <Link to="/journey" className="w-full">
              <Button variant={activeJourney ? 'primary' : 'outline'} size="sm" icon={Navigation} className="w-full">
                {activeJourney ? 'Manage Safe Journey' : 'Configure Safe Journey'}
              </Button>
            </Link>
          </CardFooter>
        </Card>

      </div>

      {/* SECTION 6 & SECTION 8 & SECTION 9 Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SECTION 6: Active Community Alerts (6 Cols) */}
        <Card className="lg:col-span-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                Active Community Safety Alerts
              </CardTitle>
              <Badge variant="amber" size="sm">{communityAlerts.length} Broadcasts</Badge>
            </div>
            <CardDescription>Official safety announcements and neighborhood alerts</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {communityAlerts.length === 0 ? (
              <EmptyState
                icon={AlertTriangle}
                title="No Active Alerts"
                description="No safety alerts currently active in your area."
              />
            ) : (
              communityAlerts.slice(0, 3).map((alertItem) => (
                <AlertBanner
                  key={alertItem._id}
                  type={alertItem.severity === 'CRITICAL' || alertItem.severity === 'DANGER' ? 'danger' : 'warning'}
                  title={alertItem.title}
                >
                  {alertItem.message}
                </AlertBanner>
              ))
            )}
          </CardContent>
        </Card>

        {/* SECTION 8: Direct Dial Emergency Hotlines (6 Cols) */}
        <Card className="lg:col-span-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-red-600">
                <PhoneCall className="w-5 h-5" />
                Direct Emergency Hotlines (24/7)
              </CardTitle>
              <Badge variant="red" size="sm">Toll-Free</Badge>
            </div>
            <CardDescription>Direct dial emergency services</CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: 'National Emergency', phone: '112', color: 'bg-red-600 hover:bg-red-700 text-white' },
              { label: 'Police Service', phone: '100', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
              { label: 'Ambulance / ER', phone: '102', color: 'bg-rose-600 hover:bg-rose-700 text-white' },
              { label: 'Fire Dept / Rescue', phone: '101', color: 'bg-amber-600 hover:bg-amber-700 text-white' }
            ].map((hotline) => (
              <a
                key={hotline.phone}
                href={`tel:${hotline.phone}`}
                className={`p-3.5 rounded-xl text-center font-bold transition-all shadow-xs ${hotline.color} flex flex-col items-center justify-center space-y-1`}
              >
                <span className="text-xs uppercase tracking-wider font-medium opacity-90">{hotline.label}</span>
                <span className="text-lg font-black tracking-wide flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4" /> {hotline.phone}
                </span>
              </a>
            ))}
          </CardContent>
        </Card>

      </div>

      {/* SECTION 9: Recent Safety Activity Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Activity className="w-5 h-5 text-indigo-600" />
              Recent Safety Activity & Incidents Feed
            </CardTitle>
            <Link to="/incidents">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                View All Incidents
              </Button>
            </Link>
          </div>
          <CardDescription>Crowd-sourced neighborhood safety updates</CardDescription>
        </CardHeader>

        <CardContent>
          {recentIncidents.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No Recent Incidents"
              description="Your community feed is clear and calm."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {recentIncidents.slice(0, 4).map((inc) => (
                <div key={inc._id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="amber" size="sm">{inc.category}</Badge>
                      <span className="text-xs font-bold text-slate-900">{inc.title}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{inc.description}</p>
                  </div>

                  <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">
                    {new Date(inc.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Emergency SOS Action */}
      <ConfirmationDialog
        isOpen={showSOSConfirmDialog}
        onClose={() => setShowSOSConfirmDialog(false)}
        onConfirm={handleConfirmSOS}
        title="🚨 CONFIRM EMERGENCY SOS DISPATCH"
        message={`Are you sure you want to trigger a ${selectedEmergencyType} Emergency SOS Alert? This will broadcast your live GPS coordinates to emergency contacts.`}
        confirmText="YES, DISPATCH SOS NOW"
        cancelText="Cancel"
        variant="danger"
        loading={sosLoading}
      />

      {/* Add Emergency Contact Modal */}
      <Modal
        isOpen={showAddContactModal}
        onClose={() => setShowAddContactModal(false)}
        title="Add Trusted Emergency Contact"
        subtitle="This contact will be alerted whenever you trigger an Emergency SOS"
      >
        <form onSubmit={handleAddContact} className="space-y-4">
          <Input
            label="Contact Full Name"
            required
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
            placeholder="e.g. Sarah Smith"
          />

          <Input
            label="Relationship"
            required
            value={newContactRelation}
            onChange={(e) => setNewContactRelation(e.target.value)}
            placeholder="Parent / Spouse / Friend"
          />

          <Input
            label="Phone Number"
            type="tel"
            required
            value={newContactPhone}
            onChange={(e) => setNewContactPhone(e.target.value)}
            placeholder="+1 555 019 2834"
          />

          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAddContactModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={addingContact}>
              Save Contact
            </Button>
          </div>
        </form>
      </Modal>

      {/* SOS Active Modal Overlay */}
      {activeSOS && (
        <SOSActiveModal
          activeSOS={activeSOS}
          onCancelSOS={handleCancelSOS}
          onResolveSOS={handleResolveSOS}
        />
      )}

    </div>
  );
}
