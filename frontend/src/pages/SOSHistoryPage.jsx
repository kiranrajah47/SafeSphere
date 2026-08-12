import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import API from '../services/api';
import { ShieldAlert, Clock, MapPin, CheckCircle2, XCircle, AlertOctagon } from 'lucide-react';

export default function SOSHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await API.get('/sos/history');
      if (res.success) {
        setHistory(res.data || []);
      }
    } catch (err) {
      console.warn('[SOSHistoryPage] Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <PageHeader
        title="Emergency SOS History Log"
        subtitle="Audit trail of all triggered emergency distress signals and resolution status"
        icon={ShieldAlert}
        badge={<Badge variant="red" size="sm">{history.length} Events Logged</Badge>}
      />

      {/* Events List */}
      {loading ? (
        <div className="space-y-4">
          <SkeletonCard rows={2} />
          <SkeletonCard rows={2} />
        </div>
      ) : history.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No Emergency Events Recorded"
          description="You have not triggered any emergency SOS alerts."
        />
      ) : (
        <div className="space-y-4">
          {history.map((event) => {
            const isFinished = event.status === 'resolved' || event.status === 'cancelled' || event.status === 'RESOLVED' || event.status === 'CANCELLED';
            const lat = event.latitude || event.location?.coordinates?.[1] || 0;
            const lng = event.longitude || event.location?.coordinates?.[0] || 0;

            return (
              <Card key={event._id} className="border-slate-200">
                <CardContent className="p-5 sm:p-6 space-y-3">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <Badge variant="red" size="sm">
                        {event.emergencyType || 'PANIC'} SOS
                      </Badge>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(event.triggeredAt || event.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <Badge variant={event.status === 'active' || event.status === 'ACTIVE' ? 'red' : 'slate'} size="sm">
                      Status: {event.status?.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Broadcast GPS Location:
                      </span>
                      <p className="font-mono font-bold text-slate-900">
                        {lat.toFixed(6)}, {lng.toFixed(6)}
                      </p>
                      <p className="text-slate-500 truncate">{event.location?.address}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-semibold">Distress Message:</span>
                      <p className="font-bold text-slate-900">{event.message || event.notes || 'Emergency distress signal'}</p>
                      <p className="text-slate-500">Notified Contacts: {event.contactsNotifiedCount || 0}</p>
                    </div>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
}
