import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import AlertBanner from '../ui/AlertBanner';
import { useToast } from '../ui/ToastContext';
import API from '../../services/api';
import { Bell, Smartphone, Mail, ShieldAlert, AlertTriangle, Navigation, CheckCircle2, BookOpen, Save, RefreshCw } from 'lucide-react';

export default function NotificationPreferencesSection() {
  const { addToast } = useToast();

  const [prefs, setPrefs] = useState({
    inApp: true,
    sms: true,
    email: true,
    sosAlerts: true,
    communityAlerts: true,
    journeyWarnings: true,
    incidentUpdates: true,
    resourceUpdates: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch current notification preferences
  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const res = await API.get('/notifications/preferences');
      if (res.success && res.data?.notificationPreferences) {
        setPrefs(res.data.notificationPreferences);
      }
    } catch (err) {
      console.warn('[Preferences] Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleToggle = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await API.put('/notifications/preferences', prefs);
      if (res.success && res.data) {
        setPrefs(res.data);
        setMessage({ type: 'success', text: 'Notification preferences updated successfully!' });
        addToast({ type: 'success', title: 'Preferences Saved', message: 'Your notification delivery settings have been saved.' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Failed to save notification preferences.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
          <p className="text-xs font-semibold">Loading notification preferences...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSavePreferences}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Bell className="w-5 h-5 text-indigo-600" />
              Notification & Delivery Preferences
            </CardTitle>
            <Badge variant="indigo" size="sm">Multi-Channel</Badge>
          </div>
          <CardDescription>
            Choose how and when SafeSphere alerts you regarding emergency distress signals, community hazards, and journey warnings.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {message.text && (
            <AlertBanner type={message.type} onDismiss={() => setMessage({ type: '', text: '' })}>
              {message.text}
            </AlertBanner>
          )}

          {/* Section 1: Delivery Channels */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Delivery Channels
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: 'inApp', label: 'In-App Alerts', desc: 'Real-time popups & header bell', icon: Bell },
                { key: 'sms', label: 'SMS Notifications', desc: 'Direct Twilio emergency SMS', icon: Smartphone },
                { key: 'email', label: 'Email Notifications', desc: 'Email digests & alerts', icon: Mail }
              ].map((channel) => {
                const Icon = channel.icon;
                const active = prefs[channel.key];
                return (
                  <div
                    key={channel.key}
                    onClick={() => handleToggle(channel.key)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start space-x-3 ${
                      active
                        ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-indigo-600" />
                        {channel.label}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{channel.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Alert Categories */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Notification Categories
            </h4>

            <div className="space-y-2.5">
              {[
                { key: 'sosAlerts', label: 'SOS Emergency Alerts', desc: 'Distress signals triggered by you or nearby users', icon: ShieldAlert, color: 'text-red-600' },
                { key: 'communityAlerts', label: 'Community Safety Hazards', desc: 'Nearby fires, crimes, accidents, and road hazards', icon: AlertTriangle, color: 'text-amber-600' },
                { key: 'journeyWarnings', label: 'Safe Journey Escalations', desc: 'Overdue check-in warnings and trip watchdog alerts', icon: Navigation, color: 'text-rose-600' },
                { key: 'incidentUpdates', label: 'Incident Report Status', desc: 'Verification and resolution updates on submitted incident reports', icon: CheckCircle2, color: 'text-indigo-600' },
                { key: 'resourceUpdates', label: 'Safety & Health Guide Updates', desc: 'New first-aid articles, video tutorials, and safety guides', icon: BookOpen, color: 'text-emerald-600' }
              ].map((cat) => {
                const Icon = cat.icon;
                const active = prefs[cat.key];
                return (
                  <div
                    key={cat.key}
                    onClick={() => handleToggle(cat.key)}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 flex items-center justify-between transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        <Icon className={`w-4 h-4 ${cat.color}`} />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{cat.label}</h5>
                        <p className="text-[11px] text-slate-500">{cat.desc}</p>
                      </div>
                    </div>

                    <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${active ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                      <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t border-slate-100">
          <Button type="submit" variant="primary" icon={Save} loading={saving}>
            Save Preferences
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
