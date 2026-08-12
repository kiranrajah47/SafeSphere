import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Select, TextArea } from '../components/ui/Select';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import AlertBanner from '../components/ui/AlertBanner';
import Modal from '../components/ui/Modal';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import { SkeletonCard } from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastContext';
import API from '../services/api';
import { 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  FileText, 
  Radio, 
  BookOpen, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Eye, 
  UserCheck, 
  UserX, 
  Plus, 
  Edit3, 
  Globe, 
  Lock,
  RefreshCw
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('OVERVIEW'); // 'OVERVIEW' | 'USERS' | 'INCIDENTS' | 'ALERTS' | 'RESOURCES'

  // Stats & Overview Data
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users Data
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // Incidents Data
  const [incidents, setIncidents] = useState([]);
  const [incidentsLoading, setIncidentsLoading] = useState(false);

  // Alerts Data
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  // Resources Data
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);

  // Create/Edit Resource Modal State
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    content: '',
    type: 'ARTICLE',
    categoryGroup: 'SAFETY',
    category: 'Personal safety',
    readTime: '5 min read',
    videoUrl: '',
    videoDuration: '',
    thumbnailUrl: ''
  });

  // Confirmation Modal
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Fetch Admin Stats
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await API.get('/admin/stats');
      if (res.success && res.data) setStats(res.data);
    } catch (err) {
      console.warn('[AdminPage] Stats error:', err.message);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await API.get(`/admin/users?search=${encodeURIComponent(userSearch)}`);
      if (res.success) setUsers(res.data || []);
    } catch (err) {
      console.warn('[AdminPage] Users error:', err.message);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch Incidents
  const fetchIncidents = async () => {
    setIncidentsLoading(true);
    try {
      const res = await API.get('/admin/incidents');
      if (res.success) setIncidents(res.data || []);
    } catch (err) {
      console.warn('[AdminPage] Incidents error:', err.message);
    } finally {
      setIncidentsLoading(false);
    }
  };

  // Fetch Alerts
  const fetchAlerts = async () => {
    setAlertsLoading(true);
    try {
      const res = await API.get('/admin/alerts');
      if (res.success) setAlerts(res.data || []);
    } catch (err) {
      console.warn('[AdminPage] Alerts error:', err.message);
    } finally {
      setAlertsLoading(false);
    }
  };

  // Fetch Resources
  const fetchResources = async () => {
    setResourcesLoading(true);
    try {
      const res = await API.get('/admin/resources');
      if (res.success) setResources(res.data || []);
    } catch (err) {
      console.warn('[AdminPage] Resources error:', err.message);
    } finally {
      setResourcesLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'USERS') fetchUsers();
    else if (activeTab === 'INCIDENTS') fetchIncidents();
    else if (activeTab === 'ALERTS') fetchAlerts();
    else if (activeTab === 'RESOURCES') fetchResources();
  }, [activeTab, userSearch]);

  // Handle Deactivate/Activate User
  const handleToggleUserStatus = async (targetUser) => {
    try {
      const res = await API.put(`/admin/users/${targetUser._id}/status`);
      if (res.success) {
        addToast({ type: 'info', title: 'User Status Updated', message: res.message });
        fetchUsers();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  // Handle Moderate Incident (Verify, Reject, Resolve)
  const handleModerateIncident = async (incidentId, newStatus) => {
    try {
      const res = await API.put(`/admin/incidents/${incidentId}/status`, { status: newStatus });
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Incident Status Updated',
          message: `Report status updated to "${newStatus}".`
        });
        fetchIncidents();
        fetchStats();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Moderation Failed', message: err.message });
    }
  };

  // Handle Delete Alert
  const handleDeleteAlert = (alertId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Inappropriate Alert',
      message: 'Are you sure you want to permanently delete this community alert from the public map?',
      onConfirm: async () => {
        try {
          const res = await API.delete(`/admin/alerts/${alertId}`);
          if (res.success) {
            addToast({ type: 'success', title: 'Alert Removed', message: 'Inappropriate alert deleted.' });
            fetchAlerts();
            fetchStats();
          }
        } catch (err) {
          addToast({ type: 'error', title: 'Deletion Failed', message: err.message });
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Handle Toggle Publish Resource
  const handleTogglePublish = async (resourceId) => {
    try {
      const res = await API.put(`/admin/resources/${resourceId}/publish`);
      if (res.success) {
        addToast({ type: 'info', title: 'Resource Status Updated', message: res.message });
        fetchResources();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  // Handle Save Resource Form
  const handleSaveResource = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingResource) {
        res = await API.put(`/admin/resources/${editingResource._id}`, resourceForm);
      } else {
        res = await API.post('/admin/resources', resourceForm);
      }

      if (res.success) {
        addToast({
          type: 'success',
          title: editingResource ? 'Resource Updated' : 'Resource Created',
          message: 'Safety resource guide saved.'
        });
        setShowResourceModal(false);
        setEditingResource(null);
        fetchResources();
        fetchStats();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <PageHeader
        title="Administrative Command Console"
        subtitle="Full system oversight, user access management, incident moderation, and resource publishing"
        icon={ShieldCheck}
        badge={<Badge variant="amber" size="sm">System Admin</Badge>}
        actions={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => { fetchStats(); if (activeTab === 'USERS') fetchUsers(); }}>
            Refresh Data
          </Button>
        }
      />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/80 rounded-2xl">
        {[
          { id: 'OVERVIEW', label: 'System Overview', icon: ShieldCheck },
          { id: 'USERS', label: 'User Management', icon: Users },
          { id: 'INCIDENTS', label: 'Incident Moderation', icon: FileText },
          { id: 'ALERTS', label: 'Community Alerts', icon: Radio },
          { id: 'RESOURCES', label: 'Resource Publisher', icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white text-indigo-600 shadow-md shadow-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SYSTEM OVERVIEW STATS */}
      {/* ========================================================================= */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          
          {/* 5 Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <Card className="border-l-4 border-l-indigo-600 shadow-2xs">
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Users</span>
                <div className="text-2xl font-black text-slate-900">{stats?.totalUsers || 0}</div>
                <p className="text-[11px] text-slate-500">Registered Platform Accounts</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-600 shadow-2xs">
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Active SOS Events</span>
                <div className="text-2xl font-black text-red-600 animate-pulse">{stats?.activeSOSCount || 0}</div>
                <p className="text-[11px] text-slate-500">Real-time Emergency Triggers</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500 shadow-2xs">
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Pending Reports</span>
                <div className="text-2xl font-black text-amber-600">{stats?.pendingIncidentsCount || 0}</div>
                <p className="text-[11px] text-slate-500">Awaiting Moderation</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-600 shadow-2xs">
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Verified Alerts</span>
                <div className="text-2xl font-black text-emerald-600">{stats?.verifiedAlertsCount || 0}</div>
                <p className="text-[11px] text-slate-500">Live Community Safety Pins</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-600 shadow-2xs">
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Resource Count</span>
                <div className="text-2xl font-black text-purple-600">{stats?.resourceCount || 0}</div>
                <p className="text-[11px] text-slate-500">Published Guides & Videos</p>
              </CardContent>
            </Card>

          </div>

          {/* Quick Recent SOS Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 font-extrabold text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" /> Recent Emergency SOS Dispatch Logs
              </CardTitle>
              <CardDescription>Live emergency activity across the network</CardDescription>
            </CardHeader>

            <CardContent>
              {stats?.recentSOS?.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No active or historical SOS events logged.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {stats?.recentSOS?.map((sos) => (
                    <div key={sos._id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900">{sos.user?.name || sos.userId?.name || 'User'}</span>
                        <p className="text-slate-500">Status: <Badge variant={sos.status === 'active' || sos.status === 'ACTIVE' ? 'red' : 'slate'} size="sm">{sos.status}</Badge></p>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">{new Date(sos.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'USERS' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-slate-900 font-extrabold text-base">Platform User Management</CardTitle>
                <CardDescription>View, search, deactivate, or assign administrative roles</CardDescription>
              </div>

              <div className="w-full sm:w-72">
                <Input
                  icon={Search}
                  placeholder="Search by name, email, phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {usersLoading ? (
              <SkeletonCard rows={4} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4">Joined</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900">{u.name}</div>
                          <div className="text-slate-500 text-[11px]">{u.email} • {u.phone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={u.role === 'admin' ? 'amber' : 'slate'} size="sm">
                            {u.role?.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={u.isActive !== false ? 'emerald' : 'red'} size="sm">
                            {u.isActive !== false ? 'Active' : 'Deactivated'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <Button
                            variant={u.isActive !== false ? 'danger' : 'outline'}
                            size="xs"
                            onClick={() => handleToggleUserStatus(u)}
                          >
                            {u.isActive !== false ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INCIDENT MODERATION */}
      {/* ========================================================================= */}
      {activeTab === 'INCIDENTS' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900 font-extrabold text-base">Incident Report Moderation Queue</CardTitle>
            <CardDescription>Review user-submitted incident reports and promote to Verified Alerts</CardDescription>
          </CardHeader>

          <CardContent>
            {incidentsLoading ? (
              <SkeletonCard rows={4} />
            ) : incidents.length === 0 ? (
              <EmptyState icon={FileText} title="No Incident Reports" description="No user incident reports found in queue." />
            ) : (
              <div className="space-y-4">
                {incidents.map((inc) => (
                  <div key={inc._id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900 text-sm">{inc.title}</span>
                        <Badge variant={inc.status === 'verified' ? 'emerald' : inc.status === 'pending' ? 'amber' : 'slate'} size="sm">
                          {inc.status?.toUpperCase()}
                        </Badge>
                        <Badge variant="purple" size="sm">{inc.incidentType || inc.category}</Badge>
                      </div>
                      <p className="text-xs text-slate-600">{inc.description}</p>
                      <p className="text-[11px] text-slate-400">Reporter: {inc.reporterId?.name || 'Anonymous'} • {new Date(inc.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {inc.status !== 'verified' && (
                        <Button variant="primary" size="xs" onClick={() => handleModerateIncident(inc._id, 'verified')} className="bg-emerald-600 hover:bg-emerald-700">
                          Approve & Verify
                        </Button>
                      )}
                      {inc.status !== 'rejected' && (
                        <Button variant="danger" size="xs" onClick={() => handleModerateIncident(inc._id, 'rejected')}>
                          Reject
                        </Button>
                      )}
                      {inc.status !== 'resolved' && (
                        <Button variant="outline" size="xs" onClick={() => handleModerateIncident(inc._id, 'resolved')}>
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: COMMUNITY ALERTS MODERATION */}
      {/* ========================================================================= */}
      {activeTab === 'ALERTS' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900 font-extrabold text-base">Community Alerts Moderation</CardTitle>
            <CardDescription>Review active community pins and remove false/inappropriate alerts</CardDescription>
          </CardHeader>

          <CardContent>
            {alertsLoading ? (
              <SkeletonCard rows={4} />
            ) : alerts.length === 0 ? (
              <EmptyState icon={Radio} title="No Active Alerts" description="No community safety alerts logged." />
            ) : (
              <div className="space-y-4">
                {alerts.map((alt) => (
                  <div key={alt._id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900 text-sm">{alt.title}</span>
                        <Badge variant={alt.severity === 'critical' ? 'red' : 'indigo'} size="sm">{alt.severity?.toUpperCase()}</Badge>
                        {alt.flaggedCount > 0 && <Badge variant="red" size="sm">Flagged ({alt.flaggedCount})</Badge>}
                      </div>
                      <p className="text-xs text-slate-600">{alt.description}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="danger" size="xs" icon={Trash2} onClick={() => handleDeleteAlert(alt._id)}>
                        Remove Inappropriate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: RESOURCE PUBLISHER */}
      {/* ========================================================================= */}
      {activeTab === 'RESOURCES' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 font-extrabold text-base">Safety & Health Resource Publisher</CardTitle>
                <CardDescription>Publish, edit, or remove video tutorials and safety articles</CardDescription>
              </div>

              <Button variant="primary" size="sm" icon={Plus} onClick={() => { setEditingResource(null); setShowResourceModal(true); }}>
                Create Resource
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {resourcesLoading ? (
              <SkeletonCard rows={4} />
            ) : resources.length === 0 ? (
              <EmptyState icon={BookOpen} title="No Resources Found" description="Click 'Create Resource' to publish articles or videos." />
            ) : (
              <div className="space-y-4">
                {resources.map((res) => (
                  <div key={res._id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900 text-sm">{res.title}</span>
                        <Badge variant={res.isPublished !== false ? 'emerald' : 'slate'} size="sm">
                          {res.isPublished !== false ? 'PUBLISHED' : 'UNPUBLISHED'}
                        </Badge>
                        <Badge variant="indigo" size="sm">{res.type}</Badge>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">{res.description}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="xs" onClick={() => handleTogglePublish(res._id)}>
                        {res.isPublished !== false ? 'Unpublish' : 'Publish'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
      />

    </div>
  );
}
