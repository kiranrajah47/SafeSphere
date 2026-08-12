import React from 'react';
import Button from './Button';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No Data Available',
  description = 'There are no items to display at this moment.',
  actionLabel = null,
  onAction = null,
  className = ''
}) {
  return (
    <div className={`bg-white border border-slate-200 border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
