import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { 
  Navigation, 
  Clock, 
  Pause, 
  Play, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  User, 
  ShieldAlert, 
  Radio, 
  AlertTriangle 
} from 'lucide-react';

export default function JourneyStatusCard({
  activeJourney,
  onPauseToggle,
  onComplete,
  onCancel,
  onTriggerSafetyCheck
}) {
  const [timeLeftMs, setTimeLeftMs] = useState(0);

  useEffect(() => {
    if (!activeJourney || !activeJourney.expectedArrivalTime) return;

    const updateTimer = () => {
      const diff = new Date(activeJourney.expectedArrivalTime).getTime() - Date.now();
      setTimeLeftMs(diff > 0 ? diff : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeJourney]);

  if (!activeJourney) return null;

  const isOverdue = new Date() > new Date(activeJourney.expectedArrivalTime);
  const minutesLeft = Math.floor(timeLeftMs / 60000);
  const secondsLeft = Math.floor((timeLeftMs % 60000) / 1000);

  return (
    <Card className={`border-2 overflow-hidden shadow-lg ${
      isOverdue 
        ? 'border-red-400 bg-gradient-to-br from-white via-red-50/20 to-rose-50/40' 
        : activeJourney.isPaused 
        ? 'border-amber-300 bg-amber-50/20'
        : 'border-emerald-300 bg-gradient-to-br from-white via-emerald-50/15 to-white'
    }`}>
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Navigation className={`w-5 h-5 ${isOverdue ? 'text-red-600 animate-bounce' : 'text-emerald-600'}`} />
            <CardTitle className="text-slate-900 font-black text-lg">
              ACTIVE SAFE JOURNEY
            </CardTitle>
          </div>

          <Badge variant={isOverdue ? 'red' : activeJourney.isPaused ? 'amber' : 'emerald'} size="sm">
            {isOverdue ? 'OVERDUE WATCHDOG' : activeJourney.isPaused ? 'PAUSED' : 'WATCHDOG RUNNING'}
          </Badge>
        </div>
        <CardDescription>Foreground GPS tracking & automated arrival watchdog active</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        
        {/* Destination & Countdown Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Destination</span>
            <h3 className="text-lg font-black text-slate-900 truncate">{activeJourney.destinationName}</h3>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              {activeJourney.currentLocation?.address || 'Live Coordinates En Route'}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border shadow-2xs flex flex-col justify-center ${
            isOverdue ? 'bg-red-600 text-white border-red-700' : 'bg-slate-900 text-white border-slate-800'
          }`}>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
              {isOverdue ? 'ATTENTION: TRIP OVERDUE' : 'EXPECTED ARRIVAL COUNTDOWN'}
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider mt-1">
              {isOverdue ? '00:00 (EXCEEDED)' : `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`}
            </div>
            <p className="text-[11px] text-slate-300 font-medium mt-0.5">
              Expected: {new Date(activeJourney.expectedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

        </div>

        {/* Trusted Contact Info */}
        {activeJourney.trustedContact && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Notified Guardian</span>
                <span className="font-bold text-slate-900">{activeJourney.trustedContact.name} ({activeJourney.trustedContact.relationship})</span>
              </div>
            </div>
            <span className="text-slate-500 font-mono font-semibold">{activeJourney.trustedContact.phone}</span>
          </div>
        )}

        {/* Overdue Warning Callout */}
        {isOverdue && (
          <div className="p-3.5 rounded-xl bg-red-100 border border-red-300 text-red-950 text-xs space-y-1">
            <div className="flex items-center space-x-1.5 font-extrabold text-red-900">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Arrival Time Exceeded! Please Confirm Your Safety.</span>
            </div>
            <p className="text-red-800">
              If you do not disarm the watchdog, your emergency contact will be alerted automatically.
            </p>
          </div>
        )}

      </CardContent>

      <CardFooter className="p-4 sm:p-6 bg-slate-50/50 border-t border-slate-200/80 flex flex-wrap gap-2.5 justify-between">
        
        <div className="flex items-center space-x-2">
          {/* Pause / Resume */}
          <Button
            variant="secondary"
            size="sm"
            icon={activeJourney.isPaused ? Play : Pause}
            onClick={onPauseToggle}
          >
            {activeJourney.isPaused ? 'Resume Trip' : 'Pause Trip'}
          </Button>

          {/* Cancel */}
          <Button
            variant="outline"
            size="sm"
            icon={XCircle}
            onClick={onCancel}
          >
            Cancel Trip
          </Button>
        </div>

        {/* Complete Journey */}
        <Button
          variant="primary"
          size="md"
          icon={CheckCircle2}
          onClick={onComplete}
          className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25"
        >
          I Have Arrived Safely (Complete)
        </Button>

      </CardFooter>
    </Card>
  );
}
