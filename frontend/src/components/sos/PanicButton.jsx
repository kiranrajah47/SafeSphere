import React, { useState } from 'react';
import { ShieldAlert, HeartPulse, Flame, ShieldCheck, AlertOctagon } from 'lucide-react';

export default function PanicButton({ onTriggerSOS }) {
  const [emergencyType, setEmergencyType] = useState('PANIC');

  const categories = [
    { id: 'PANIC', label: 'Panic SOS', icon: ShieldAlert, color: 'text-red-600' },
    { id: 'MEDICAL', label: 'Medical ER', icon: HeartPulse, color: 'text-rose-600' },
    { id: 'FIRE', label: 'Fire Rescue', icon: Flame, color: 'text-amber-600' },
    { id: 'CRIME', label: 'Crime Alert', icon: ShieldCheck, color: 'text-indigo-600' }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white via-red-50/20 to-rose-50/30 rounded-2xl border border-red-200/80 shadow-xs relative overflow-hidden select-none">
      
      {/* Category Selector Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 z-10">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = emergencyType === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setEmergencyType(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                isSelected
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-2 ring-red-400'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : cat.color}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Prominent Emergency Button */}
      <button
        onClick={() => onTriggerSOS(emergencyType)}
        className="group relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 text-white shadow-2xl shadow-red-600/40 border-4 border-white flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 animate-emergency-pulse cursor-pointer"
      >
        <AlertOctagon className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md group-hover:scale-110 transition-transform" />
        <span className="text-2xl sm:text-3xl font-black tracking-widest mt-1 text-white drop-shadow">
          SOS
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/25 mt-1 text-red-100">
          CLICK TO DISPATCH
        </span>
      </button>

      {/* Warning text */}
      <div className="mt-6 p-3 rounded-xl bg-red-50 border border-red-200 text-center max-w-sm">
        <p className="text-[11px] font-bold text-red-900 uppercase tracking-wider flex items-center justify-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5" /> Emergency Dispatch Notice
        </p>
        <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
          Triggering SOS will request your current GPS coordinates, alert trusted contacts, and log a distress event.
        </p>
      </div>

    </div>
  );
}
