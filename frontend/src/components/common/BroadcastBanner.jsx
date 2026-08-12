import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { AlertOctagon, X } from 'lucide-react';

export default function BroadcastBanner() {
  const { latestCommunityAlert, dismissCommunityAlert } = useSocket();

  if (!latestCommunityAlert) return null;

  const severityColors = {
    INFO: 'bg-blue-600/90 border-blue-500 text-blue-100',
    WARNING: 'bg-amber-600/90 border-amber-500 text-amber-100',
    DANGER: 'bg-red-600/90 border-red-500 text-red-100',
    CRITICAL: 'bg-rose-700/95 border-rose-500 text-white animate-pulse'
  };

  return (
    <div className={`w-full px-4 py-3 border-b shadow-lg backdrop-blur-md flex items-center justify-between transition-all ${severityColors[latestCommunityAlert.severity] || severityColors.INFO}`}>
      <div className="max-w-7xl mx-auto flex items-center space-x-3 text-sm font-medium">
        <AlertOctagon className="w-5 h-5 flex-shrink-0 animate-bounce" />
        <div>
          <span className="font-bold uppercase tracking-wider text-xs mr-2 px-2 py-0.5 rounded bg-black/20">
            {latestCommunityAlert.category || 'COMMUNITY ALERT'}
          </span>
          <strong className="font-semibold">{latestCommunityAlert.title}:</strong> {latestCommunityAlert.message}
        </div>
      </div>

      <button
        onClick={dismissCommunityAlert}
        className="p-1 rounded-md hover:bg-black/20 transition-colors ml-4 text-white"
        title="Dismiss Alert"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
