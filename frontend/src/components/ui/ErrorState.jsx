import React from 'react';
import Button from './Button';
import { AlertOctagon, RotateCw } from 'lucide-react';

export default function ErrorState({
  title = 'Something Went Wrong',
  description = 'An error occurred while loading this section. Please try again.',
  onRetry = null,
  className = ''
}) {
  return (
    <div className={`bg-red-50/50 border border-red-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="p-3 rounded-2xl bg-red-100 text-red-600 border border-red-200">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-base font-bold text-red-950">{title}</h3>
        <p className="text-xs text-red-700 max-w-sm mt-1 leading-relaxed">{description}</p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <Button variant="danger" size="sm" icon={RotateCw} onClick={onRetry}>
            Retry Request
          </Button>
        </div>
      )}
    </div>
  );
}
