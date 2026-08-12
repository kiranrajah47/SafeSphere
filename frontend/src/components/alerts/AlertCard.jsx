import React from 'react';
import { Card, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Flag, 
  User, 
  Flame, 
  Shield, 
  HeartPulse, 
  AlertOctagon, 
  HelpCircle, 
  CloudLightning,
  ChevronRight
} from 'lucide-react';

export default function AlertCard({ alertItem, onViewDetails, onFlagAlert }) {
  if (!alertItem) return null;

  // Category Icon & Colors
  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Fire': return Flame;
      case 'Crime': return Shield;
      case 'Medical emergency': return HeartPulse;
      case 'Accident': return AlertOctagon;
      case 'Natural disaster': return CloudLightning;
      default: return AlertTriangle;
    }
  };

  const getSeverityBadgeVariant = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical': return 'red';
      case 'high': return 'amber';
      case 'medium': return 'purple';
      case 'low': default: return 'slate';
    }
  };

  const Icon = getCategoryIcon(alertItem.category);

  return (
    <Card hover className="flex flex-col justify-between border-slate-200">
      <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        
        <div className="space-y-3">
          
          {/* Header Row: Category Badge & Severity Badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Badge variant="indigo" size="sm" icon={Icon}>
                {alertItem.category}
              </Badge>
              <Badge variant={getSeverityBadgeVariant(alertItem.severity)} size="sm">
                {alertItem.severity?.toUpperCase()}
              </Badge>
            </div>

            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
              {alertItem.distanceText || 'Nearby'}
            </span>
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight leading-snug">
              {alertItem.title}
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-1 line-clamp-2 leading-relaxed">
              {alertItem.description}
            </p>
          </div>

          {/* Location & Address */}
          <div className="flex items-start space-x-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <span className="truncate">{alertItem.location?.address || 'Location details'}</span>
          </div>

        </div>

        {/* Footer Meta Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          
          <div className="flex items-center space-x-2 text-slate-500">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">{alertItem.createdBy?.name || 'Community Member'}</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3" />
              {new Date(alertItem.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {/* Flag / Report False Alert */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFlagAlert(alertItem);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Report Inappropriate or False Alert"
            >
              <Flag className="w-4 h-4" />
            </button>

            {/* View Details Button */}
            <Button
              variant="ghost"
              size="sm"
              icon={ChevronRight}
              iconPosition="right"
              onClick={() => onViewDetails(alertItem)}
            >
              Details
            </Button>
          </div>

        </div>

      </CardContent>
    </Card>
  );
}
