import React from 'react';
import { Info, CheckCircle2, AlertTriangle, AlertOctagon, X } from 'lucide-react';

export default function AlertBanner({
  title,
  children,
  type = 'info', // 'info' | 'success' | 'warning' | 'danger'
  onDismiss = null,
  className = ''
}) {
  const styles = {
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: Info,
      iconColor: 'text-blue-600'
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600'
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-600'
    },
    danger: {
      bg: 'bg-red-50 border-red-200 text-red-950',
      icon: AlertOctagon,
      iconColor: 'text-red-600'
    }
  };

  const current = styles[type] || styles.info;
  const Icon = current.icon;

  return (
    <div className={`p-4 rounded-xl border flex items-start justify-between shadow-2xs ${current.bg} ${className}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${current.iconColor}`} />
        <div className="text-xs sm:text-sm">
          {title && <h4 className="font-bold mb-0.5">{title}</h4>}
          <div className="leading-relaxed">{children}</div>
        </div>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-black/5 text-slate-500 transition-colors ml-3"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
