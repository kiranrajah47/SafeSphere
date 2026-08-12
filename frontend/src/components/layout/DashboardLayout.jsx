import React, { useState } from 'react';
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
import { ToastProvider } from '../ui/ToastContext';

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const { location } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [activeSOS, setActiveSOS] = useState(null);

  const handleTriggerSOS = async (emergencyType) => {
    try {
      const res = await API.post('/sos/trigger', {
        emergencyType,
        coordinates: [location.lng, location.lat],
        address: location.address
      });
      if (res.success && res.data) {
        setActiveSOS(res.data);
        setShowPanicModal(false);
      }
    } catch (err) {
      alert('Failed to trigger SOS: ' + err.message);
    }
  };

  const handleCancelSOS = async () => {
    try {
      const res = await API.post('/sos/cancel');
      if (res.success) {
        setActiveSOS(null);
      }
    } catch (err) {
      alert('Cancel failed: ' + err.message);
    }
  };

  const handleResolveSOS = async (sosId) => {
    try {
      const res = await API.post('/sos/resolve', { sosId });
      if (res.success) {
        setActiveSOS(null);
      }
    } catch (err) {
      alert('Resolve failed: ' + err.message);
    }
  };

  return (
    <ToastProvider>
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
        {activeSOS && (
          <SOSActiveModal
            activeSOS={activeSOS}
            onCancelSOS={handleCancelSOS}
            onResolveSOS={handleResolveSOS}
          />
        )}

      </div>
    </ToastProvider>
  );
}
