import React from 'react';
import { Card, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { BookOpen, Play, Bookmark, Clock, ShieldCheck, HeartPulse, ChevronRight } from 'lucide-react';

export default function GuideCard({ guide, onSelectGuide, onToggleBookmark }) {
  if (!guide) return null;

  const isHealth = guide.categoryGroup === 'HEALTH';
  const isVideo = guide.type === 'VIDEO';

  return (
    <Card hover className="flex flex-col justify-between h-full border-slate-200 overflow-hidden group">
      
      {/* Thumbnail Header */}
      <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
        {guide.thumbnailUrl ? (
          <img
            src={guide.thumbnailUrl}
            alt={guide.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-slate-900 text-white">
            {isHealth ? <HeartPulse className="w-12 h-12 text-rose-400" /> : <ShieldCheck className="w-12 h-12 text-indigo-400" />}
          </div>
        )}

        {/* Video Overlay Badge */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
            <div className="p-3 bg-red-600/90 text-white rounded-full shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </div>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <Badge variant={isHealth ? 'red' : 'indigo'} size="sm">
            {guide.categoryGroup}
          </Badge>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(guide);
            }}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
              guide.isBookmarked
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
            title={guide.isBookmarked ? 'Remove Bookmark' : 'Bookmark Resource'}
          >
            <Bookmark className={`w-4 h-4 ${guide.isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Duration / Read Time Badge */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/75 backdrop-blur-xs text-white rounded-md text-[10px] font-bold flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{isVideo ? guide.videoDuration || guide.readTime : guide.readTime}</span>
        </div>
      </div>

      <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              {guide.category}
            </span>
          </div>

          <h3 className="font-extrabold text-base text-slate-900 tracking-tight leading-snug line-clamp-2">
            {guide.title}
          </h3>

          <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
            {guide.description}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-semibold truncate max-w-[150px]">
            {guide.author || 'SafeSphere Guide'}
          </span>

          <Button
            variant="ghost"
            size="sm"
            icon={isVideo ? Play : ChevronRight}
            iconPosition="right"
            onClick={() => onSelectGuide(guide)}
          >
            {isVideo ? 'Watch Video' : 'Read Guide'}
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}
