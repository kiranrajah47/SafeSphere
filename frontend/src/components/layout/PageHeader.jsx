import React from 'react';

export default function PageHeader({
  title,
  subtitle,
  icon: Icon = null,
  actions = null,
  badge = null,
  className = ''
}) {
  return (
    <div className={`bg-white border border-slate-200/90 p-6 sm:p-8 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`}>
      <div className="space-y-1">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 flex-shrink-0">
              <Icon className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
              {badge}
            </div>
            {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">{subtitle}</p>}
          </div>
        </div>
      </div>

      {actions && (
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
