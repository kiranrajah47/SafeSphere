import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import PanicButton from '../components/sos/PanicButton';
import SafeMap from '../components/map/SafeMap';
import API from '../services/api';
import { 
  Shield, 
  Navigation, 
  AlertTriangle, 
  BookOpen, 
  Bot, 
  MapPin, 
  Users, 
  PhoneCall, 
  ShieldAlert, 
  Radio,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const { location } = useLocation();
  const [activeSOS, setActiveSOS] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [nearbyResources, setNearbyResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      if (user) {
        const sosRes = await API.get('/sos/active');
        if (sosRes.success) {
          setActiveSOS(sosRes.data || null);
        }
      }

      const incRes = await API.get(`/incidents?lat=${location.lat}&lng=${location.lng}&radiusKm=15`);
      if (incRes.success) {
        setRecentIncidents(incRes.data || []);
      }

      const resRes = await API.get(`/resources/nearby?lat=${location.lat}&lng=${location.lng}&radiusKm=10`);
      if (resRes.success) {
        setNearbyResources(resRes.data || []);
      }
    } catch (err) {
      console.warn('[HomePage] Data fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, location.lat, location.lng]);

  const handleTriggerSOS = async (emergencyType) => {
    try {
      const res = await API.post('/sos/trigger', {
        emergencyType,
        coordinates: [location.lng, location.lat],
        address: location.address
      });
      if (res.success && res.data) {
        setActiveSOS(res.data);
      }
    } catch (err) {
      alert('Failed to trigger SOS: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <PageHeader
        title={`Welcome back, ${user ? user.name.split(' ')[0] : 'Safety Guard'} 👋`}
        subtitle="SafeSphere Personal Safety & Emergency Assistance Platform Dashboard"
        icon={Shield}
        badge={<Badge variant="emerald" size="sm" icon={Radio}>Active Protection</Badge>}
        actions={
          <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
            <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span className="font-medium truncate max-w-xs">{location.address}</span>
          </div>
        }
      />

      {/* Main Panic SOS Hub & Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Panic Button Emergency Hub (5 cols) */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-red-600">
                <ShieldAlert className="w-5 h-5" />
                Emergency SOS Trigger
              </CardTitle>
              <Badge variant="red" size="sm">2.5s Hold / Tap</Badge>
            </div>
            <CardDescription>
              Instantly broadcast your live GPS location to emergency contacts and response teams.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <PanicButton onTriggerSOS={handleTriggerSOS} />
          </CardContent>
        </Card>

        {/* Live Safety Map Preview (7 cols) */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-indigo-600">
                <MapPin className="w-5 h-5" />
                Live Interactive Safety Map
              </CardTitle>
              <Link to="/map">
                <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
                  Expand Map
                </Button>
              </Link>
            </div>
            <CardDescription>
              Displays active emergency SOS events, police stations, hospitals, and crowd-reported hazards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SafeMap
              activeSOSList={activeSOS ? [activeSOS] : []}
              resourcesList={nearbyResources}
              incidentsList={recentIncidents}
            />
          </CardContent>
        </Card>

      </div>

      {/* Feature Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <Link to="/journey" className="group">
          <Card hover className="h-full">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Navigation className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Safe Journey
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Trip timer watchdog with periodic check-ins. Auto-escalates on timeout.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/incidents" className="group">
          <Card hover className="h-full">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Incidents Feed
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Crowd-sourced safety hazard reporting and community upvote confirmations.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/resources" className="group">
          <Card hover className="h-full">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Emergency Directory
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  24/7 verified national emergency hotlines, legal aid, and nearby stations.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/ai-assistant" className="group">
          <Card hover className="h-full">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  AI Safety Guard
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  AI safety advice for self-defense, night cab checklists, and emergency first aid.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

      </div>

    </div>
  );
}
