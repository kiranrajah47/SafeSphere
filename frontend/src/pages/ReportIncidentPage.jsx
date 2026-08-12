import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Select, TextArea } from '../components/ui/Select';
import Button from '../components/ui/Button';
import AlertBanner from '../components/ui/AlertBanner';
import Badge from '../components/ui/Badge';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastContext';
import API from '../services/api';
import { 
  FileText, 
  MapPin, 
  Clock, 
  Image as ImageIcon, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowLeft,
  Info
} from 'lucide-react';

export default function ReportIncidentPage() {
  const { location } = useLocation();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    incidentType: 'Accident',
    description: '',
    dateTime: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm format
    image: '',
    severity: 'medium'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const incidentTypes = [
    'Accident',
    'Theft',
    'Harassment',
    'Medical emergency',
    'Fire',
    'Road hazard',
    'Suspicious activity',
    'Missing person',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be signed in to submit an incident report.');
      return;
    }

    if (!formData.title || !formData.description) {
      setError('Please provide both an incident title and detailed description.');
      return;
    }

    setLoading(true);

    try {
      const res = await API.post('/incidents', {
        title: formData.title,
        incidentType: formData.incidentType,
        category: formData.incidentType,
        description: formData.description,
        dateTime: formData.dateTime,
        image: formData.image,
        severity: formData.severity,
        latitude: location.lat,
        longitude: location.lng,
        coordinates: [location.lng, location.lat],
        address: location.address
      });

      if (res.success && res.data) {
        addToast({
          type: 'success',
          title: 'Incident Report Submitted',
          message: 'Your report has been submitted as a "User Report (Pending Review)". Once verified by moderators, it will be published as a Verified Alert.'
        });
        navigate('/incidents');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit incident report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <PageHeader
        title="Submit Incident Report"
        subtitle="Report an observed incident or safety hazard to local community moderators"
        icon={FileText}
        actions={
          <Link to="/incidents">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back to Incidents
            </Button>
          </Link>
        }
      />

      {/* Moderation Workflow Disclaimer Banner */}
      <AlertBanner type="info" title="Verification & Moderation Policy">
        Submitted reports enter <strong>User Report (Pending)</strong> status for admin review. Once verified by authorized safety moderators, the report will be promoted to a <strong>Verified Alert</strong> on the public network.
      </AlertBanner>

      <Card className="shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900 font-extrabold text-lg">
            Incident Details & Evidence
          </CardTitle>
          <CardDescription>
            Fill in the details below. Exact GPS coordinates are attached automatically.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-6">
          
          {error && (
            <AlertBanner type="danger" onDismiss={() => setError('')}>
              {error}
            </AlertBanner>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Title */}
            <Input
              label="Incident Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Stolen Wallet at Bus Stop / Fallen Tree Hazard"
            />

            {/* Type & Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Incident Type"
                value={formData.incidentType}
                onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                options={incidentTypes.map(t => ({ value: t, label: t }))}
              />

              <Select
                label="Severity Level"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                options={[
                  { value: 'low', label: 'Low (Minor Notice)' },
                  { value: 'medium', label: 'Medium (Caution Required)' },
                  { value: 'high', label: 'High (Significant Risk)' },
                  { value: 'critical', label: 'Critical (Immediate Hazard)' }
                ]}
              />
            </div>

            {/* Description */}
            <TextArea
              label="Detailed Description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what occurred, people involved, vehicle descriptions, or specific landmarks..."
            />

            {/* Date Time & Image URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date & Time of Incident"
                type="datetime-local"
                required
                icon={Clock}
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
              />

              <Input
                label="Optional Image URL (Photo Evidence)"
                type="url"
                icon={ImageIcon}
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            {/* Location Readout */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Attached GPS Position:</span>
              </div>
              <p className="text-xs font-bold text-slate-900">{location.address}</p>
              <p className="text-[11px] font-mono text-slate-500">
                ({location.lat.toFixed(6)}, {location.lng.toFixed(6)})
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={CheckCircle2}
              className="w-full"
            >
              Submit Report for Verification
            </Button>

          </form>

        </CardContent>
      </Card>

    </div>
  );
}
