import React from 'react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import AlertBanner from '../ui/AlertBanner';
import { BookOpen, Bookmark, Clock, User, ShieldCheck, HeartPulse } from 'lucide-react';

export default function ResourceDetailModal({ guide, isOpen, onClose, onToggleBookmark }) {
  if (!guide || !isOpen) return null;

  const isHealth = guide.categoryGroup === 'HEALTH';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={guide.title}
      subtitle={`Category: ${guide.category} • Author: ${guide.author || 'SafeSphere Team'}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        
        {/* Badges Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant={isHealth ? 'red' : 'indigo'} size="sm">
              {guide.categoryGroup}
            </Badge>
            <Badge variant="purple" size="sm">
              {guide.category}
            </Badge>
          </div>

          <button
            onClick={() => onToggleBookmark(guide)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors ${
              guide.isBookmarked
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${guide.isBookmarked ? 'fill-current' : ''}`} />
            <span>{guide.isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
        </div>

        {/* Medical Disclaimer Banner for Health Category */}
        {isHealth && (
          <AlertBanner type="warning" title="Medical Disclaimer">
            The health and emergency response information provided in this guide is for educational awareness purposes only. It is not professional medical advice. In the event of a medical emergency, call 112 or contact qualified emergency personnel immediately.
          </AlertBanner>
        )}

        {/* Article Summary Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Overview</h4>
          <p className="text-sm font-medium text-slate-900 leading-relaxed">
            {guide.description}
          </p>
        </div>

        {/* Main Article Content */}
        <div className="space-y-3 text-sm text-slate-800 leading-relaxed font-sans border-t border-slate-100 pt-4">
          {guide.content ? (
            guide.content.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h4 key={idx} className="font-extrabold text-base text-slate-900 mt-4 mb-2">
                    {paragraph.replace('### ', '')}
                  </h4>
                );
              }
              return (
                <p key={idx} className="text-slate-700 font-medium">
                  {paragraph}
                </p>
              );
            })
          ) : (
            <p className="text-slate-500 italic">No additional article text available.</p>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 font-semibold">
            <User className="w-3.5 h-3.5 text-slate-400" /> {guide.author || 'SafeSphere Advisory Board'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> {guide.readTime}
          </span>
        </div>

      </div>
    </Modal>
  );
}
