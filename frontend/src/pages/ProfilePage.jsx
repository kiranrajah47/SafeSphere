import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { User, Phone, HeartPulse, Plus, Trash2, ShieldCheck, Mail, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Emergency Contact Form Modal
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactRelation, setContactRelation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Medical Info Form
  const [bloodGroup, setBloodGroup] = useState(user?.medicalInfo?.bloodGroup || 'A+');
  const [allergies, setAllergies] = useState(user?.medicalInfo?.allergies?.join(', ') || '');
  const [conditions, setConditions] = useState(user?.medicalInfo?.medicalConditions?.join(', ') || '');
  const [emergencyNotes, setEmergencyNotes] = useState(user?.medicalInfo?.emergencyNotes || '');
  const [medicalSaved, setMedicalSaved] = useState(false);

  const fetchContacts = async () => {
    try {
      const res = await API.get('/users/contacts');
      if (res.success) {
        setContacts(res.data || []);
      }
    } catch (err) {
      console.warn('[ProfilePage] Error fetching contacts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put('/users/profile', { name, phone });
      if (res.success && res.data) {
        updateUserProfile(res.data);
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      }
    } catch (err) {
      alert('Profile update failed: ' + err.message);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/users/contacts', {
        name: contactName,
        relationship: contactRelation,
        phone: contactPhone,
        email: contactEmail
      });

      if (res.success && res.data) {
        setContacts([...contacts, res.data]);
        setShowContactModal(false);
        setContactName('');
        setContactRelation('');
        setContactPhone('');
        setContactEmail('');
      }
    } catch (err) {
      alert('Failed to add contact: ' + err.message);
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      const res = await API.delete(`/users/contacts/${id}`);
      if (res.success) {
        setContacts(contacts.filter(c => c._id !== id));
      }
    } catch (err) {
      alert('Failed to delete contact: ' + err.message);
    }
  };

  const handleUpdateMedical = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put('/users/medical', {
        bloodGroup,
        allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
        medicalConditions: conditions.split(',').map(s => s.trim()).filter(Boolean),
        emergencyNotes
      });

      if (res.success && res.data) {
        updateUserProfile({ medicalInfo: res.data });
        setMedicalSaved(true);
        setTimeout(() => setMedicalSaved(false), 3000);
      }
    } catch (err) {
      alert('Failed to update medical info: ' + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-red-600/30">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{user?.name}</h1>
            <p className="text-xs text-slate-400 font-medium">Role: <span className="text-red-400 font-bold uppercase">{user?.role}</span> • {user?.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Trusted Emergency Contacts Section */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-red-400" />
              Trusted Emergency Contacts ({contacts.length})
            </h2>
            <button
              onClick={() => setShowContactModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-600/20 transition-all flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </div>

          <div className="space-y-3">
            {contacts.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
                No emergency contacts added yet. Please add at least 1 trusted contact to receive automated SOS alerts.
              </p>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact._id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-red-400 uppercase px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                      {contact.relationship}
                    </span>
                    <h4 className="font-bold text-white text-sm mt-1">{contact.name}</h4>
                    <p className="text-xs text-slate-400 font-semibold">{contact.phone}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteContact(contact._id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Medical Information Profile */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-400" />
              Emergency Medical Profile
            </h2>
            {medicalSaved && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleUpdateMedical} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Allergies (Comma separated)</label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Penicillin, Peanuts, Latex"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Pre-existing Medical Conditions</label>
              <input
                type="text"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="Asthma, Diabetes, Hypertension"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Emergency Notes for First Responders</label>
              <textarea
                rows="2"
                value={emergencyNotes}
                onChange={(e) => setEmergencyNotes(e.target.value)}
                placeholder="Special medical instructions or organ donor information..."
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs uppercase tracking-wider transition-all"
            >
              Update Medical Profile
            </button>
          </form>
        </div>

      </div>

      {/* Modal for Adding Emergency Contact */}
      {showContactModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">Add Trusted Emergency Contact</h3>

            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Contact Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Sarah Smith"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Relationship</label>
                <input
                  type="text"
                  required
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                  placeholder="Parent / Spouse / Friend"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Phone Number (SMS Enabled)</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 555 019 2834"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="w-1/2 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 text-xs shadow-lg shadow-red-600/30"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
