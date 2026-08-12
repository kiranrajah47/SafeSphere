import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, MapPin, XCircle } from 'lucide-react';
import API from '../../services/api';

export default function SOSActiveModal({ activeSOS, onCancelSOS, onResolveSOS }) {
  const [loading, setLoading] = useState(false);

  if (!activeSOS) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg glass-panel rounded-3xl border border-red-500/40 p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Pulsing Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="p-3 bg-red-600/20 text-red-500 rounded-2xl border border-red-500/40 animate-pulse">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              EMERGENCY SOS IS ACTIVE
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            </h3>
            <p className="text-xs text-red-400 font-semibold">
              Live Location Broadcasting to Emergency Contacts & Responders
            </p>
          </div>
        </div>

        {/* SOS Details */}
        <div className="my-5 space-y-3 bg-slate-900/90 rounded-2xl p-4 border border-slate-800 text-sm">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Emergency Category:</span>
            <span className="font-bold text-red-400 uppercase bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
              {activeSOS.emergencyType || 'PANIC'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Contacts Notified:</span>
            <span className="font-semibold text-slate-200">{activeSOS.contactsNotifiedCount || 0} Trusted Contacts</span>
          </div>

          <div className="flex items-start space-x-2 text-xs text-slate-300 pt-1">
            <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 font-medium">Last Broadcasted GPS:</strong>
              <p className="text-slate-400 mt-0.5">{activeSOS.location?.address || 'Live Coordinates Active'}</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await onCancelSOS();
              setLoading(false);
            }}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center space-x-2"
          >
            <XCircle className="w-5 h-5 text-slate-400" />
            <span>Cancel SOS (False Alarm)</span>
          </button>

          <button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await onResolveSOS(activeSOS._id);
              setLoading(false);
            }}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>I Am Safe (Resolve)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
