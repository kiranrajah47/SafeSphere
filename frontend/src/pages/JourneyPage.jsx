import React, { useState, useEffect, useRef } from 'react';
import PageHeader from '../components/layout/PageHeader';
import JourneyStatusCard from '../components/journey/JourneyStatusCard';
import SafetyCheckModal from '../components/journey/SafetyCheckModal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import AlertBanner from '../components/ui/AlertBanner';
import { SkeletonCard } from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastContext';
import { LocationService } from '../services/locationService';
import API from '../services/api';
import { 
  Navigation, 
  MapPin, 
  Clock
} from 'lucide-react';

export default function JourneyPage() {
  const { location } = useLocation();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeJourney, setActiveJourney] = useState(null);
  const [journeyHistory, setJourneyHistory] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [destinationName, setDestinationName] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('30');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [starting, setStarting] = useState(false);
  const [formError, setFormError] = useState('');

  // Safety Check Modal State
  const [showSafetyCheck, setShowSafetyCheck] = useState(false);

  // Geolocation Watcher Reference
  const watchIdRef = useRef(null);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      if (user) {
        const [activeRes, contactsRes, historyRes] = await Promise.all([
          API.get('/journey/active'),
          API.get('/contacts'),
          API.get('/journey/history')
        ]);

        if (activeRes.success) setActiveJourney(activeRes.data || null);
        if (contactsRes.success) {
          const list = contactsRes.data || [];
          setContacts(list);
          const primary = list.find(c => c.isPrimary);
          if (primary) setSelectedContactId(primary._id);
          else if (list.length > 0) setSelectedContactId(list[0]._id);
        }
        if (historyRes.success) setJourneyHistory(historyRes.data || []);
      }
    } catch (err) {
      console.warn('[JourneyPage] Data fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Periodic Watchdog check for overdue active journey
  useEffect(() => {
    if (!activeJourney || activeJourney.status === 'completed' || activeJourney.status === 'cancelled') return;

    const checkOverdue = () => {
      const expected = new Date(activeJourney.expectedArrivalTime).getTime();
      if (Date.now() > expected && !showSafetyCheck) {
        setShowSafetyCheck(true);
      }
    };

    checkOverdue();
    const interval = setInterval(checkOverdue, 5000);
    return () => clearInterval(interval);
  }, [activeJourney, showSafetyCheck]);

  // Foreground Periodic Location Watcher (Updates backend every 15s while active)
  useEffect(() => {
    if (activeJourney && activeJourney.status === 'in_progress' && !activeJourney.isPaused) {
      watchIdRef.current = LocationService.watchPosition(
        async (pos) => {
          try {
            await API.put('/journey/location', {
              latitude: pos.lat,
              longitude: pos.lng,
              address: location.address
            });
          } catch (e) {}
        },
        (err) => console.warn('[LocationWatch Error]', err.message),
        { maximumAge: 10000, timeout: 10000 }
      );
    } else {
      if (watchIdRef.current !== null) {
        LocationService.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        LocationService.clearWatch(watchIdRef.current);
      }
    };
  }, [activeJourney, location.address]);

  // Start Journey Handler
  const handleStartJourney = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!user) {
      addToast({ type: 'warning', title: 'Sign In Required', message: 'Please log in to start Safe Journey watchdog.' });
      return;
    }

    if (!destinationName.trim()) {
      setFormError('Please enter a destination name.');
      return;
    }

    setStarting(true);

    try {
      const res = await API.post('/journey/start', {
        destinationName: destinationName.trim(),
        estimatedDurationMinutes: estimatedDuration,
        contactId: selectedContactId,
        latitude: location.lat,
        longitude: location.lng,
        address: location.address
      });

      if (res.success && res.data) {
        setActiveJourney(res.data);
        setDestinationName('');
        addToast({
          type: 'success',
          title: 'Safe Journey Started 🛡️',
          message: `Watchdog active for trip to "${res.data.destinationName}".`
        });
      }
    } catch (err) {
      setFormError(err.message || 'Failed to start journey.');
    } finally {
      setStarting(false);
    }
  };

  // Toggle Pause
  const handlePauseToggle = async () => {
    try {
      const res = await API.put('/journey/pause');
      if (res.success && res.data) {
        setActiveJourney(res.data);
        addToast({
          type: 'info',
          title: res.data.isPaused ? 'Journey Paused' : 'Journey Resumed',
          message: res.data.isPaused ? 'Timer watchdog temporarily paused.' : 'Foreground tracking resumed.'
        });
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  // Complete Journey
  const handleCompleteJourney = async () => {
    try {
      const res = await API.post('/journey/complete');
      if (res.success) {
        setActiveJourney(null);
        setShowSafetyCheck(false);
        addToast({
          type: 'success',
          title: 'Welcome Back! Safe Arrival Confirmed 🎉',
          message: 'Safe Journey watchdog has been disarmed.'
        });
        fetchData();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Completion Failed', message: err.message });
    }
  };

  // Cancel Journey
  const handleCancelJourney = async () => {
    try {
      const res = await API.post('/journey/cancel');
      if (res.success) {
        setActiveJourney(null);
        setShowSafetyCheck(false);
        addToast({
          type: 'info',
          title: 'Safe Journey Cancelled',
          message: 'Watchdog session disarmed.'
        });
        fetchData();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Cancellation Failed', message: err.message });
    }
  };

  // Escalate Overdue Journey
  const handleEscalateJourney = async () => {
    try {
      const res = await API.post('/journey/escalate');
      if (res.success) {
        setShowSafetyCheck(false);
        addToast({
          type: 'error',
          title: '🚨 JOURNEY ESCALATED TO CONTACTS',
          message: 'Emergency SMS alert dispatched to your trusted contacts.'
        });
        fetchData();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Escalation Error', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <PageHeader
        title="Safe Journey Mode"
        subtitle="Shared travel safety with arrival watchdog timers and emergency contact escalations"
        icon={Navigation}
        badge={<Badge variant={activeJourney ? 'emerald' : 'slate'} size="sm">{activeJourney ? 'Watchdog Running' : 'Idle'}</Badge>}
      />

      {/* Browser Limitations Transparency Banner */}
      <AlertBanner type="info" title="Foreground Location Tracking Notice">
        SafeSphere provides reliable foreground location tracking while your browser tab remains active. Keep this browser tab open during travel to maintain continuous GPS position updates and watchdog protection.
      </AlertBanner>

      {/* Active Journey Status Card */}
      {activeJourney && (
        <JourneyStatusCard
          activeJourney={activeJourney}
          onPauseToggle={handlePauseToggle}
          onComplete={handleCompleteJourney}
          onCancel={handleCancelJourney}
          onTriggerSafetyCheck={() => setShowSafetyCheck(true)}
        />
      )}

      {/* Start New Journey Form Card */}
      {!activeJourney && (
        <Card className="shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900 font-extrabold text-lg flex items-center gap-2">
              <Navigation className="w-5 h-5 text-indigo-600" />
              Configure Safe Journey Watchdog
            </CardTitle>
            <CardDescription>
              Set your destination and expected travel duration to arm automated check-ins
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            
            {formError && (
              <AlertBanner type="danger" onDismiss={() => setFormError('')}>
                {formError}
              </AlertBanner>
            )}

            <form onSubmit={handleStartJourney} className="space-y-5">
              
              <Input
                label="Destination Name / Address"
                required
                value={destinationName}
                onChange={(e) => setDestinationName(e.target.value)}
                placeholder="e.g. Home / Central Railway Station / Office"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <Select
                  label="Expected Travel Duration"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  options={[
                    { value: '15', label: '15 Minutes (Quick Trip)' },
                    { value: '30', label: '30 Minutes (Standard Commute)' },
                    { value: '45', label: '45 Minutes' },
                    { value: '60', label: '60 Minutes (1 Hour)' },
                    { value: '90', label: '90 Minutes (1.5 Hours)' },
                    { value: '120', label: '120 Minutes (2 Hours)' }
                  ]}
                />

                <Select
                  label="Notified Guardian Contact"
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  options={
                    contacts.length === 0
                      ? [{ value: '', label: 'No contacts added (Select None)' }]
                      : contacts.map(c => ({
                          value: c._id,
                          label: `${c.name} (${c.relationship}) ${c.isPrimary ? '⭐ Primary' : ''}`
                        }))
                  }
                />

              </div>

              {/* Start Position Readout */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-600" /> Start Position:
                </span>
                <span className="font-bold text-slate-900 truncate max-w-xs">{location.address}</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={starting}
                icon={Navigation}
                className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25"
              >
                Arm Watchdog & Start Safe Journey
              </Button>

            </form>

          </CardContent>
        </Card>
      )}

      {/* Historical Journeys Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 font-extrabold text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600" />
            Travel & Safe Journey History
          </CardTitle>
          <CardDescription>Log of completed and disarmed Safe Journey sessions</CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <SkeletonCard rows={2} />
          ) : journeyHistory.length === 0 ? (
            <EmptyState
              icon={Navigation}
              title="No Past Journeys"
              description="Your travel history will be logged here whenever you complete a Safe Journey."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {journeyHistory.map((j) => (
                <div key={j._id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900">{j.destinationName}</span>
                      <Badge
                        variant={j.status === 'completed' || j.status === 'COMPLETED' ? 'emerald' : 'slate'}
                        size="sm"
                      >
                        {j.status?.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-slate-500">
                      Duration: {j.estimatedDurationMinutes} mins • Guardian: {j.trustedContact?.name || 'Self Guard'}
                    </p>
                  </div>

                  <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap">
                    {new Date(j.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Safety Check Overdue Modal */}
      <SafetyCheckModal
        isOpen={showSafetyCheck}
        activeJourney={activeJourney}
        onConfirmSafe={handleCompleteJourney}
        onEscalate={handleEscalateJourney}
      />

    </div>
  );
}
