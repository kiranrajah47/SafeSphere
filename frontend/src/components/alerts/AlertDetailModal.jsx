import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  User, 
  Flag, 
  Trash2, 
  CheckCircle2, 
  Navigation,
  ShieldAlert
} from 'lucide-react';

export default function AlertDetailModal({ alertItem, isOpen, onClose, onFlagAlert, onDeleteAlert }) {
  const { user } = useAuth();
  const [flagging, setFlagging] = useState(false);

  if (!alertItem) return null;

  const isAuthorOrAdmin = user && (user._id === alertItem.createdBy?._id || user.role === 'admin');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={alertItem.title}
      subtitle={`Category: ${alertItem.category} • Severity: ${alertItem.severity?.toUpperCase()}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        
        {/* Badges Row */}
        <div className="flex items-center space-x-2">
          <Badge variant="indigo" size="sm">{alertItem.category}</Badge>
          <Badge variant={alertItem.severity === 'critical' ? 'red' : 'amber'} size="sm">
            Severity: {alertItem.severity?.toUpperCase()}
          </Badge>
          <Badge variant="slate" size="sm">
            Distance: {alertItem.distanceText || 'Nearby'}
          </Badge>
        </div>

        {/* Full Description */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">Description</h4>
          <p className="text-sm font-medium text-slate-900 leading-relaxed">
            {alertItem.description}
          </p>
        </div>

        {/* Location Readout */}
        <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start space-x-2 text-xs">
          <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-indigo-950">Address / Location:</span>
            <p className="text-indigo-900 font-medium mt-0.5">{alertItem.location?.address}</p>
            <p className="text-indigo-700 font-mono text-[11px] mt-0.5">
              ({alertItem.latitude?.toFixed(6)}, {alertItem.longitude?.toFixed(6)})
            </p>
          </div>
        </div>

        {/* Author & Timestamp Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-slate-400" />
            <span>Posted by <strong>{alertItem.createdBy?.name || 'Community Member'}</strong></span>
          </div>

          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{new Date(alertItem.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          
          {/* Flag / Report False Alert */}
          <button
            disabled={flagging}
            onClick={async () => {
              setFlagging(true);
              await onFlagAlert(alertItem);
              setFlagging(false);
            }}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center space-x-1.5 transition-colors"
          >
            <Flag className="w-4 h-4" />
            <span>Report False / Inappropriate Alert ({alertItem.flaggedCount || 0})</span>
          </button>

          {/* Delete Button (If Author or Admin) */}
          {isAuthorOrAdmin && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => {
                onDeleteAlert(alertItem);
                onClose();
              }}
            >
              Delete Alert
            </Button>
          )}

        </div>

      </div>
    </Modal>
  );
}
