import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { MobileDrawer, MobileBottomBar } from './MobileNav';
import BroadcastBanner from '../common/BroadcastBanner';
import SOSActiveModal from '../sos/SOSActiveModal';
import Modal from '../ui/Modal';
import PanicButton from '../sos/PanicButton';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { ToastProvider, useToast } from '../ui/ToastContext';

function DashboardLayoutContent({ children }) {
  const { user } = useAuth();
  const { location } = useLocation();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [activeSOS, setActiveSOS] = useState(null);
  const [dismissActiveModal, setDismissActiveModal] = useState(false);

  const handleTriggerSOS = async (emergencyType = 'PANIC') => {
    if (!user) {
      addToast({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please sign in to your SafeSphere account to trigger an Emergency SOS Alert.',
        duration: 4000
      });
      navigate('/login');
      return;
    }

    try {
      const res = await API.post('/sos/trigger', {
        emergencyType,
        latitude: location.lat || 28.6139,
        longitude: location.lng || 77.2090,
        coordinates: [location.lng || 77.2090, location.lat || 28.6139],
        address: location.address || 'Live Location'
      });
      
      if (res.success && res.data) {
        setActiveSOS(res.data);
        setDismissActiveModal(false);
        setShowPanicModal(false);
        addToast({
          type: 'success',
          title: 'SOS Alert Sent',
          message: 'Your emergency contacts have been notified.',
          duration: 4000
        });
      }
    } catch (err) {
      const errorMsg = err.message.includes('authorized') || err.message.includes('token')
        ? 'Please sign in to trigger an Emergency SOS Alert.'
        : err.message.includes('Network') || err.message.includes('ECONNREFUSED')
        ? 'Backend API server is unreachable. Please verify backend is running on port 5000.'
        : err.message;

      addToast({
        type: 'error',
        title: 'SOS could not be sent',
        message: errorMsg,
        duration: 5000
      });
      setShowPanicModal(false);
      if (err.message.includes('authorized') || err.message.includes('token')) {
        navigate('/login');
      }
    }
  };

  const handleCancelSOS = async () => {
    try {
      const res = await API.post('/sos/cancel');
      if (res.success) {
        setActiveSOS(null);
        addToast({
          type: 'info',
          title: 'SOS Alert Cancelled',
          message: 'Your emergency SOS session has been safely cancelled.',
          duration: 4000
        });
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Cancel Failed', message: err.message, duration: 4000 });
    }
  };

  const handleResolveSOS = async (sosId) => {
    try {
      const res = await API.post('/sos/resolve', { sosId });
      if (res.success) {
        setActiveSOS(null);
        addToast({
          type: 'success',
          title: 'Marked Safe',
          message: 'Glad you are safe! Emergency SOS has been resolved.',
          duration: 4000
        });
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Resolve Failed', message: err.message, duration: 4000 });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Desktop Sidebar */}
      <Sidebar onTriggerSOSClick={() => setShowPanicModal(true)} />

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onTriggerSOSClick={() => setShowPanicModal(true)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <TopNav
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          onTriggerSOSClick={() => setShowPanicModal(true)}
        />

        <BroadcastBanner />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} SafeSphere. Universal Personal Safety Platform.</p>
            <p className="font-semibold text-slate-600">Major Academic Project</p>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Quick Action Navigation Bar */}
      <MobileBottomBar onTriggerSOSClick={() => setShowPanicModal(true)} />

      {/* Global Panic Trigger Modal */}
      <Modal
        isOpen={showPanicModal}
        onClose={() => setShowPanicModal(false)}
        title="Emergency SOS Hub"
        subtitle="Instant 24/7 Panic Trigger & Emergency Dispatch"
        maxWidth="max-w-xl"
      >
        <PanicButton onTriggerSOS={handleTriggerSOS} />
      </Modal>

      {/* Active Emergency SOS Running Overlay */}
      {activeSOS && !dismissActiveModal && (
        <SOSActiveModal
          activeSOS={activeSOS}
          onCancelSOS={handleCancelSOS}
          onResolveSOS={handleResolveSOS}
          onClose={() => setDismissActiveModal(true)}
        />
      )}

    </div>
  );
}

export default function DashboardLayout({ children }) {
  return <DashboardLayoutContent>{children}</DashboardLayoutContent>;
}
