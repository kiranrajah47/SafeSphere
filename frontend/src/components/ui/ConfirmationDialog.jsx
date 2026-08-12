import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  loading = false
}) {
  const icons = {
    danger: { icon: AlertOctagon, color: 'text-red-600 bg-red-50 border-red-200' },
    warning: { icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    info: { icon: HelpCircle, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' }
  };

  const current = icons[variant] || icons.danger;
  const Icon = current.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start space-x-4 py-2">
        <div className={`p-3 rounded-xl border flex-shrink-0 ${current.color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
}
