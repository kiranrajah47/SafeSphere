import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

const toastTypes = {
  success: {
    bg: 'bg-white border-emerald-200 text-slate-900',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600 bg-emerald-50'
  },
  error: {
    bg: 'bg-white border-red-200 text-slate-900',
    icon: AlertOctagon,
    iconColor: 'text-red-600 bg-red-50'
  },
  warning: {
    bg: 'bg-white border-amber-200 text-slate-900',
    icon: AlertTriangle,
    iconColor: 'text-amber-600 bg-amber-50'
  },
  info: {
    bg: 'bg-white border-indigo-200 text-slate-900',
    icon: Info,
    iconColor: 'text-indigo-600 bg-indigo-50'
  }
};

export function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const config = toastTypes[t.type] || toastTypes.info;
        const Icon = config.icon;

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex items-start justify-between animate-in slide-in-from-bottom-5 duration-200 ${config.bg}`}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-1.5 rounded-xl flex-shrink-0 ${config.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm">
                {t.title && <h4 className="font-bold text-slate-900 mb-0.5">{t.title}</h4>}
                <p className="text-slate-600 leading-snug">{t.message}</p>
              </div>
            </div>

            <button
              onClick={() => onRemove(t.id)}
              className="p-1 text-slate-400 hover:text-slate-700 transition-colors ml-3"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
