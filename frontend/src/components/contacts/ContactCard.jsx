import React from 'react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { PhoneCall, MessageSquare, Star, Edit3, Trash2, Mail, ShieldAlert } from 'lucide-react';

export default function ContactCard({
  contact,
  onEdit,
  onDelete,
  onTogglePrimary
}) {
  if (!contact) return null;

  return (
    <Card hover className={`relative overflow-hidden ${contact.isPrimary ? 'border-indigo-300 ring-1 ring-indigo-500/20 bg-gradient-to-br from-white via-indigo-50/10 to-white' : ''}`}>
      
      {/* Primary Indicator Tag */}
      {contact.isPrimary && (
        <div className="absolute top-0 right-0">
          <span className="px-3 py-1 bg-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-bl-xl shadow-xs flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" /> Primary Contact
          </span>
        </div>
      )}

      <CardContent className="p-5 sm:p-6 space-y-4">
        
        {/* Contact Info Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base sm:text-lg text-slate-900">{contact.name}</span>
              <Badge variant="purple" size="sm">{contact.relationship}</Badge>
            </div>
            {contact.email && (
              <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {contact.email}
              </p>
            )}
          </div>
        </div>

        {/* Phone Readout */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</p>
            <p className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">{contact.phone}</p>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Call using tel: */}
            <a
              href={`tel:${contact.phone}`}
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
              title={`Call ${contact.name}`}
            >
              <PhoneCall className="w-3.5 h-3.5" /> Call
            </a>

            {/* Send SMS using sms: */}
            <a
              href={`sms:${contact.phone}`}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
              title={`SMS ${contact.name}`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> SMS
            </a>
          </div>
        </div>

        {/* Card Action Controls */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {/* Toggle Primary */}
          <button
            onClick={() => onTogglePrimary(contact)}
            className={`font-semibold flex items-center gap-1 transition-colors ${
              contact.isPrimary ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-indigo-600'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${contact.isPrimary ? 'fill-indigo-600 text-indigo-600' : ''}`} />
            <span>{contact.isPrimary ? 'Primary Emergency Contact' : 'Mark as Primary'}</span>
          </button>

          <div className="flex items-center space-x-1">
            {/* Edit */}
            <button
              onClick={() => onEdit(contact)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Edit Contact"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(contact)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete Contact"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
