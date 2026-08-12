import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import ContactCard from '../components/contacts/ContactCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import { SkeletonCard } from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import AlertBanner from '../components/ui/AlertBanner';
import { useToast } from '../components/ui/ToastContext';
import API from '../services/api';
import { Users, Plus, Search, ShieldCheck, PhoneCall, AlertCircle } from 'lucide-react';

export default function ContactsPage() {
  const { addToast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Add / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    isPrimary: false
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation Dialog State
  const [contactToDelete, setContactToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Contacts
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/contacts');
      if (res.success) {
        setContacts(res.data || []);
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Error Loading Contacts', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Open Form Modal for Creating New Contact
  const handleOpenAddModal = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      relationship: '',
      phone: '',
      email: '',
      isPrimary: contacts.length === 0 // Default primary if first contact
    });
    setFormError('');
    setShowModal(true);
  };

  // Open Form Modal for Editing Existing Contact
  const handleOpenEditModal = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name || '',
      relationship: contact.relationship || '',
      phone: contact.phone || '',
      email: contact.email || '',
      isPrimary: contact.isPrimary || false
    });
    setFormError('');
    setShowModal(true);
  };

  // Save Contact (Add or Edit)
  const handleSaveContact = async (e) => {
    e.preventDefault();
    setFormError('');

    // Phone Validation: Minimum 7 digits
    const digitsOnly = formData.phone.replace(/\D/g, '');
    if (digitsOnly.length < 7) {
      setFormError('Please enter a valid phone number with at least 7 digits.');
      return;
    }

    setSubmitting(true);

    try {
      if (editingContact) {
        // Update Existing Contact
        const res = await API.put(`/contacts/${editingContact._id}`, formData);
        if (res.success && res.data) {
          addToast({ type: 'success', title: 'Contact Updated', message: `${res.data.name} updated successfully.` });
          setShowModal(false);
          fetchContacts();
        }
      } else {
        // Create New Contact
        const res = await API.post('/contacts', formData);
        if (res.success && res.data) {
          addToast({ type: 'success', title: 'Contact Added', message: `${res.data.name} added to trusted emergency contacts.` });
          setShowModal(false);
          fetchContacts();
        }
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save contact.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Primary Contact
  const handleTogglePrimary = async (contact) => {
    try {
      const res = await API.put(`/contacts/${contact._id}`, { isPrimary: !contact.isPrimary });
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Primary Contact Updated',
          message: `${contact.name} is now ${!contact.isPrimary ? 'set as primary' : 'no longer primary'}.`
        });
        fetchContacts();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to Update Primary Status', message: err.message });
    }
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;
    setDeleting(true);

    try {
      const res = await API.delete(`/contacts/${contactToDelete._id}`);
      if (res.success) {
        addToast({ type: 'info', title: 'Contact Deleted', message: `${contactToDelete.name} has been removed.` });
        setContactToDelete(null);
        fetchContacts();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Deletion Failed', message: err.message });
    } finally {
      setDeleting(false);
    }
  };

  // Filter contacts by search query
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.relationship.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <PageHeader
        title="Trusted Emergency Contacts"
        subtitle="Manage the trusted people who receive automated notifications when you trigger an Emergency SOS"
        icon={Users}
        actions={
          <Button variant="danger" icon={Plus} onClick={handleOpenAddModal}>
            Add Trusted Contact
          </Button>
        }
      />

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Input
            icon={Search}
            placeholder="Search by name, relation, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <p className="text-xs font-semibold text-slate-500">
          Showing <span className="text-slate-900 font-bold">{filteredContacts.length}</span> of {contacts.length} emergency contacts
        </p>
      </div>

      {/* Contact Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard rows={3} />
          <SkeletonCard rows={3} />
          <SkeletonCard rows={3} />
        </div>
      ) : filteredContacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchQuery ? 'No Matching Contacts' : 'No Emergency Contacts Added'}
          description={
            searchQuery
              ? `No contacts matched your search query "${searchQuery}".`
              : 'Add at least one trusted contact (parent, spouse, friend) to ensure emergency alerts reach your loved ones.'
          }
          actionLabel={searchQuery ? 'Clear Search' : 'Add Emergency Contact'}
          onAction={searchQuery ? () => setSearchQuery('') : handleOpenAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact._id}
              contact={contact}
              onEdit={handleOpenEditModal}
              onDelete={(c) => setContactToDelete(c)}
              onTogglePrimary={handleTogglePrimary}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingContact ? 'Edit Emergency Contact' : 'Add Trusted Emergency Contact'}
        subtitle="Saved contacts will be alerted immediately with your GPS position during an SOS"
      >
        {formError && (
          <AlertBanner type="danger" onDismiss={() => setFormError('')} className="mb-4">
            {formError}
          </AlertBanner>
        )}

        <form onSubmit={handleSaveContact} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Sarah Smith"
          />

          <Input
            label="Relationship"
            type="text"
            required
            value={formData.relationship}
            onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            placeholder="Parent / Spouse / Sibling / Friend"
          />

          <Input
            label="Phone Number (SMS Enabled)"
            type="tel"
            required
            helperText="Include country code if applicable (e.g. +1 555 019 2834)"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 555 019 2834"
          />

          <Input
            label="Email Address (Optional)"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="sarah@example.com"
          />

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isPrimaryCheck"
              checked={formData.isPrimary}
              onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
            />
            <label htmlFor="isPrimaryCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
              Set as Primary Emergency Contact
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingContact ? 'Update Contact' : 'Save Emergency Contact'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(contactToDelete)}
        onClose={() => setContactToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Emergency Contact"
        message={`Are you sure you want to remove ${contactToDelete?.name} from your trusted emergency contacts list?`}
        confirmText="Remove Contact"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />

    </div>
  );
}
