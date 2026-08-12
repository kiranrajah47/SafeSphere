import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { ShieldAlert, CheckCircle2, PhoneCall, AlertTriangle } from 'lucide-react';

export default function SafetyCheckModal({ isOpen, activeJourney, onConfirmSafe, onEscalate }) {
  const [countdownSeconds, setCountdownSeconds] = useState(60);

  useEffect(() => {
    if (!isOpen) return;

    setCountdownSeconds(60);
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onEscalate(); // Automatically trigger escalation if timer expires!
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !activeJourney) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      title="🚨 SAFESPHERE SAFETY CHECK"
      subtitle="Your expected trip arrival time has been reached"
      maxWidth="max-w-md"
    >
      <div className="space-y-5 text-center p-2">
        
        <div className="p-4 bg-red-50 text-red-600 rounded-full w-20 h-20 mx-auto flex items-center justify-center border-4 border-red-200 animate-emergency-pulse">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-slate-900">Are You Safe?</h3>
          <p className="text-xs text-slate-500 font-medium">
            Trip to <strong>"{activeJourney.destinationName}"</strong> watchdog timer expired. Confirm your safety to prevent emergency escalation.
          </p>
        </div>

        {/* Automatic Escalation Countdown Box */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            AUTOMATIC EMERGENCY ESCALATION IN:
          </span>
          <div className="text-4xl font-black font-mono text-red-400">
            00:{String(countdownSeconds).padStart(2, '0')}
          </div>
          <p className="text-[11px] text-slate-300">
            Emergency contacts will be alerted if unconfirmed.
          </p>
        </div>

        {/* Action Controls */}
        <div className="space-y-2 pt-2">
          <Button
            variant="primary"
            size="lg"
            icon={CheckCircle2}
            onClick={onConfirmSafe}
            className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30"
          >
            I AM SAFE (DISARM WATCHDOG)
          </Button>

          <Button
            variant="danger"
            size="md"
            icon={ShieldAlert}
            onClick={onEscalate}
            className="w-full"
          >
            EMERGENCY HELP (ESCALATE NOW)
          </Button>
        </div>

      </div>
    </Modal>
  );
}
