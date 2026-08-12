import React, { useState, useRef } from 'react';
import { ShieldAlert, AlertOctagon, Flame, HeartPulse, ShieldCheck } from 'lucide-react';

export default function PanicButton({ onTriggerSOS }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [emergencyType, setEmergencyType] = useState('PANIC');
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const HOLD_DURATION_MS = 2500; // 2.5s hold delay

  const startHold = () => {
    setHolding(true);
    setProgress(0);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setProgress(pct);

      if (elapsed >= HOLD_DURATION_MS) {
        clearInterval(timerRef.current);
        setHolding(false);
        setProgress(100);
        triggerAction();
      }
    }, 40);
  };

  const endHold = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setHolding(false);
    setProgress(0);
  };

  const triggerAction = () => {
    if (onTriggerSOS) {
      onTriggerSOS(emergencyType);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-panel rounded-3xl border border-red-500/20 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Emergency Type Selector Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 z-10">
        {[
          { id: 'PANIC', label: 'Panic', icon: ShieldAlert, color: 'text-red-400' },
          { id: 'MEDICAL', label: 'Medical', icon: HeartPulse, color: 'text-rose-400' },
          { id: 'FIRE', label: 'Fire', icon: Flame, color: 'text-amber-400' },
          { id: 'CRIME', label: 'Crime / Safety', icon: ShieldCheck, color: 'text-indigo-400' }
        ].map((type) => {
          const Icon = type.icon;
          const selected = emergencyType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setEmergencyType(type.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                selected
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 ring-2 ring-red-400'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${type.color}`} />
              <span>{type.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Hold-to-Trigger Button */}
      <div className="relative group cursor-pointer z-10 select-none">
        {/* Animated Radial Pulse Rings */}
        <div className="absolute inset-0 rounded-full bg-red-600/30 animate-sos-pulse pointer-events-none" />

        <button
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={startHold}
          onTouchEnd={endHold}
          onClick={triggerAction}
          className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 border-4 border-red-400/80 shadow-[0_0_50px_rgba(220,38,38,0.5)] flex flex-col items-center justify-center transition-transform active:scale-95 group-hover:scale-105"
        >
          <AlertOctagon className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-md animate-bounce" />
          <span className="text-2xl sm:text-3xl font-black tracking-widest text-white mt-1 drop-shadow">
            EMERGENCY SOS
          </span>
          <span className="text-[11px] font-semibold text-red-100 uppercase tracking-wider mt-1 px-2 py-0.5 rounded bg-black/20">
            {holding ? 'HOLDING...' : 'HOLD 2.5s OR TAP'}
          </span>
        </button>

        {/* Circular Progress Overlay */}
        {holding && (
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#ffffff"
              strokeWidth="6"
              strokeDasharray="289"
              strokeDashoffset={289 - (289 * progress) / 100}
              className="transition-all ease-linear"
            />
          </svg>
        )}
      </div>

      <p className="mt-6 text-xs text-slate-400 text-center font-medium max-w-sm z-10">
        Broadcasting will instantly share your live GPS location, trigger emergency notifications to trusted contacts, and notify admin responders.
      </p>
    </div>
  );
}
