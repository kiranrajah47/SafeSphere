import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Select, TextArea } from '../components/ui/Select';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import AlertBanner from '../components/ui/AlertBanner';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastContext';
import API from '../services/api';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  HeartPulse, 
  Users, 
  Camera, 
  Clock, 
  ShieldCheck, 
  Save, 
  KeyRound, 
  CheckCircle2, 
  FileText,
  AlertTriangle
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('DETAILS'); // 'DETAILS' | 'MEDICAL' | 'PASSWORD' | 'CONTACTS'
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Medical Info Form State
  const [bloodGroup, setBloodGroup] = useState('Unknown');
  const [allergies, setAllergies] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [updatingMedical, setUpdatingMedical] = useState(false);
  const [medicalMessage, setMedicalMessage] = useState({ type: '', text: '' });

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Fetch Full Profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get('/users/profile');
      if (res.success && res.data) {
        const p = res.data;
        setProfileData(p);
        setName(p.name || '');
        setPhone(p.phone || '');
        setProfileImage(p.profileImage || p.avatar || '');

        if (p.medicalInfo) {
          setBloodGroup(p.medicalInfo.bloodGroup || 'Unknown');
          setAllergies(Array.isArray(p.medicalInfo.allergies) ? p.medicalInfo.allergies.join(', ') : p.medicalInfo.allergies || '');
          setMedicalConditions(Array.isArray(p.medicalInfo.medicalConditions) ? p.medicalInfo.medicalConditions.join(', ') : p.medicalInfo.medicalConditions || '');
          setEmergencyNotes(p.medicalInfo.emergencyNotes || '');
        }
      }
    } catch (err) {
      console.warn('[ProfilePage] Error loading profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Update Profile Details Handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });
    setUpdatingProfile(true);

    try {
      const res = await API.put('/users/profile', {
        name: name.trim(),
        phone: phone.trim(),
        profileImage: profileImage.trim()
      });

      if (res.success && res.data) {
        updateUserProfile(res.data);
        setProfileMessage({ type: 'success', text: 'Profile details updated successfully.' });
        addToast({ type: 'success', title: 'Profile Updated', message: 'Account details saved.' });
      }
    } catch (err) {
      setProfileMessage({ type: 'danger', text: err.message || 'Failed to update profile.' });
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Update Medical Info Handler
  const handleUpdateMedical = async (e) => {
    e.preventDefault();
    setMedicalMessage({ type: '', text: '' });
    setUpdatingMedical(true);

    try {
      const res = await API.put('/users/medical', {
        bloodGroup,
        allergies,
        medicalConditions,
        emergencyNotes: emergencyNotes.trim()
      });

      if (res.success && res.data) {
        updateUserProfile({ medicalInfo: res.data });
        setMedicalMessage({ type: 'success', text: 'Emergency medical information saved.' });
        addToast({ type: 'success', title: 'Medical Profile Saved', message: 'Emergency medical notes updated.' });
      }
    } catch (err) {
      setMedicalMessage({ type: 'danger', text: err.message || 'Failed to save medical info.' });
    } finally {
      setUpdatingMedical(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'danger', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'danger', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setUpdatingPassword(true);

    try {
      const res = await API.put('/users/change-password', {
        currentPassword,
        newPassword
      });

      if (res.success) {
        setPasswordMessage({ type: 'success', text: res.message });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        addToast({ type: 'success', title: 'Password Changed', message: 'Your password has been updated.' });
      }
    } catch (err) {
      setPasswordMessage({ type: 'danger', text: err.message || 'Failed to change password.' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <PageHeader
        title="User Safety Profile"
        subtitle="Manage personal account credentials, profile photo, and emergency medical records"
        icon={User}
      />

      {/* Top Profile Summary Card */}
      <Card className="shadow-md border-slate-200 bg-gradient-to-r from-white via-slate-50 to-indigo-50/20">
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          
          {/* Avatar Circle */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-indigo-600/30 overflow-hidden border-2 border-white">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
          </div>

          {/* User Details Readout */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user?.name}</h2>
                <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
              </div>

              <div className="flex items-center space-x-2 justify-center sm:justify-end">
                <Badge variant={user?.role === 'admin' ? 'amber' : 'indigo'} size="sm">
                  Role: {user?.role?.toUpperCase()}
                </Badge>
                <Badge variant="emerald" size="sm">
                  Verified Account
                </Badge>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-indigo-600" /> {user?.phone || 'No phone added'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" /> Member Since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026'}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-red-600" /> {profileData?.emergencyContacts?.length || 0} Emergency Contacts
              </span>
            </div>

          </div>

        </CardContent>
      </Card>

      {/* Tab Navigation Controls */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/80 rounded-2xl">
        {[
          { id: 'DETAILS', label: 'Account Details', icon: User },
          { id: 'MEDICAL', label: 'Emergency Medical Info', icon: HeartPulse },
          { id: 'PASSWORD', label: 'Change Password', icon: KeyRound },
          { id: 'CONTACTS', label: 'Emergency Contacts', icon: Users }
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
      {/* TAB 1: ACCOUNT DETAILS */}
      {/* ========================================================================= */}
      {activeTab === 'DETAILS' && (
        <Card className="shadow-md border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900 font-extrabold text-base">Account Profile Details</CardTitle>
            <CardDescription>Update your display name, contact phone number, and avatar</CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            
            {profileMessage.text && (
              <AlertBanner type={profileMessage.type} onDismiss={() => setProfileMessage({ type: '', text: '' })}>
                {profileMessage.text}
              </AlertBanner>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Full Name"
                required
                icon={User}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input
                label="Email Address (Account ID)"
                type="email"
                disabled
                icon={Mail}
                value={user?.email || ''}
                helperText="Email address cannot be changed."
              />

              <Input
                label="Phone Number (SMS Notifications)"
                type="tel"
                required
                icon={Phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <Input
                label="Profile Image URL"
                type="url"
                icon={Camera}
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />

              <Button type="submit" variant="primary" loading={updatingProfile} icon={Save}>
                Save Profile Details
              </Button>
            </form>

          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EMERGENCY MEDICAL INFO */}
      {/* ========================================================================= */}
      {activeTab === 'MEDICAL' && (
        <Card className="shadow-md border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900 font-extrabold text-base flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-red-600" />
              Emergency Medical & Health Information
            </CardTitle>
            <CardDescription>
              Critical medical data accessed by emergency responders during an SOS dispatch
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            
            {medicalMessage.text && (
              <AlertBanner type={medicalMessage.type} onDismiss={() => setMedicalMessage({ type: '', text: '' })}>
                {medicalMessage.text}
              </AlertBanner>
            )}

            <AlertBanner type="info" title="Privacy Note">
              Medical information is strictly protected and only shared with emergency contacts during an active Emergency SOS dispatch.
            </AlertBanner>

            <form onSubmit={handleUpdateMedical} className="space-y-4">
              
              <Select
                label="Blood Group"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                options={[
                  { value: 'Unknown', label: 'Unknown / Unspecified' },
                  { value: 'A+', label: 'A Positive (A+)' },
                  { value: 'A-', label: 'A Negative (A-)' },
                  { value: 'B+', label: 'B Positive (B+)' },
                  { value: 'B-', label: 'B Negative (B-)' },
                  { value: 'O+', label: 'O Positive (O+)' },
                  { value: 'O-', label: 'O Negative (O-)' },
                  { value: 'AB+', label: 'AB Positive (AB+)' },
                  { value: 'AB-', label: 'AB Negative (AB-)' }
                ]}
              />

              <Input
                label="Known Allergies (Comma-separated)"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Peanuts, Bee stings"
              />

              <Input
                label="Pre-existing Medical Conditions"
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                placeholder="e.g. Asthma, Diabetes Type 1, Hypertension"
              />

              <TextArea
                label="Special Emergency Instructions / Notes"
                rows={3}
                value={emergencyNotes}
                onChange={(e) => setEmergencyNotes(e.target.value)}
                placeholder="e.g. Carry inhaler in jacket pocket / Medical alert bracelet on left wrist"
              />

              <Button type="submit" variant="primary" loading={updatingMedical} icon={Save} className="bg-red-600 hover:bg-red-700">
                Save Emergency Medical Info
              </Button>

            </form>

          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CHANGE PASSWORD */}
      {/* ========================================================================= */}
      {activeTab === 'PASSWORD' && (
        <Card className="shadow-md border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900 font-extrabold text-base">Change Password</CardTitle>
            <CardDescription>Update your SafeSphere account authentication password</CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            
            {passwordMessage.text && (
              <AlertBanner type={passwordMessage.type} onDismiss={() => setPasswordMessage({ type: '', text: '' })}>
                {passwordMessage.text}
              </AlertBanner>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              
              <Input
                label="Current Password"
                type="password"
                required
                icon={Lock}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Input
                label="New Password"
                type="password"
                required
                icon={Lock}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Input
                label="Confirm New Password"
                type="password"
                required
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Button type="submit" variant="primary" loading={updatingPassword} icon={CheckCircle2}>
                Update Password
              </Button>

            </form>

          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EMERGENCY CONTACTS SUMMARY */}
      {/* ========================================================================= */}
      {activeTab === 'CONTACTS' && (
        <Card className="shadow-md border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 font-extrabold text-base">Trusted Emergency Contacts</CardTitle>
              <a href="/contacts">
                <Button variant="outline" size="sm">Manage All Contacts</Button>
              </a>
            </div>
            <CardDescription>Contacts notified during an Emergency SOS</CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {profileData?.emergencyContacts?.length === 0 ? (
              <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No Emergency Contacts Linked</p>
                <p className="text-xs text-slate-500">Add trusted contacts to receive automated SMS alerts.</p>
                <a href="/contacts" className="inline-block pt-2">
                  <Button variant="primary" size="sm">Add Emergency Contact</Button>
                </a>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {profileData?.emergencyContacts?.map((c) => (
                  <div key={c._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900">{c.name}</span>
                        <Badge variant="purple" size="sm">{c.relationship}</Badge>
                      </div>
                      <p className="text-slate-500 font-medium mt-0.5">{c.phone}</p>
                    </div>
                    <a href={`tel:${c.phone}`} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-indigo-600 font-bold">
                      Call
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
