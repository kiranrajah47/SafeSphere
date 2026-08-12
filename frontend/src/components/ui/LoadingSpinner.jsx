import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 'md', label = 'Loading...' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className={`${sizes[size] || sizes.md} text-indigo-600 animate-spin`} />
      {label && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>}
    </div>
  );
}

export function SkeletonCard({ rows = 3 }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-200 rounded-md w-1/3" />
        <div className="h-4 bg-slate-200 rounded-full w-16" />
      </div>
      <div className="h-6 bg-slate-200 rounded-md w-2/3" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-3 bg-slate-100 rounded-md w-full" />
        ))}
      </div>
    </div>
  );
}
