import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, MapPin, XCircle, PhoneCall, Radio, Info } from 'lucide-react';
import Button from '../ui/Button';

export default function SOSActiveModal({ activeSOS, onCancelSOS, onResolveSOS }) {
  const [loading, setLoading] = useState(false);

  if (!activeSOS) return null;

  const lat = activeSOS.latitude || activeSOS.location?.coordinates?.[1] || 0;
  const lng = activeSOS.longitude || activeSOS.location?.coordinates?.[0] || 0;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-red-200 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        
        {/* Pulsing Top Bar */}
        <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-100">
          <div className="p-3 bg-red-100 text-red-600 rounded-2xl border border-red-200 animate-pulse flex-shrink-0">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-black text-red-600 tracking-tight">EMERGENCY SOS ACTIVE</h3>
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live Location Broadcasting & Contacts Notification Engine Active
            </p>
          </div>
        </div>

        {/* SOS Session Summary */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
          
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-semibold">Emergency Category:</span>
            <span className="font-extrabold text-red-600 uppercase bg-red-100 px-2.5 py-0.5 rounded border border-red-200">
              {activeSOS.emergencyType || 'PANIC'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-semibold">Contacts Notified:</span>
            <span className="font-bold text-slate-900">{activeSOS.contactsNotifiedCount || 0} Trusted Contacts</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-semibold">Notification Service:</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              {activeSOS.notificationResult?.mode === 'TWILIO' ? 'Twilio SMS Dispatched' : 'Dev Mock Console Dispatch'}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 font-semibold">Broadcast GPS Coordinates:</span>
              <p className="text-slate-900 font-mono font-bold mt-0.5">
                {lat.toFixed(6)}, {lng.toFixed(6)} ({activeSOS.location?.address || 'Live Location'})
              </p>
            </div>
          </div>

        </div>

        {/* Clear Emergency Disclaimer */}
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Emergency Disclaimer:</strong> National emergency responders (112/911) are NOT automatically dispatched by this platform unless manually dialed below.
          </p>
        </div>

        {/* Direct Dial Hotline Quick Action */}
        <div className="flex gap-2">
          <a
            href="tel:112"
            className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-700 shadow-xs flex items-center justify-center space-x-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Direct Call National Helpline (112)</span>
          </a>
        </div>

        {/* Modal Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
          <Button
            variant="secondary"
            className="flex-1"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await onCancelSOS();
              setLoading(false);
            }}
          >
            Cancel SOS (False Alarm)
          </Button>

          <Button
            variant="danger"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await onResolveSOS(activeSOS._id);
              setLoading(false);
            }}
          >
            I Am Safe (Resolve)
          </Button>
        </div>

      </div>
    </div>
  );
}
