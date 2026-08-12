import React from 'react';
import { Card, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { PhoneCall, Navigation, MapPin, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ResourceCard({ resource }) {
  if (!resource) return null;

  const categoryColor = 
    resource.category === 'POLICE' ? 'indigo' :
    resource.category === 'HOSPITAL' || resource.category === 'AMBULANCE' ? 'red' :
    resource.category === 'FIRE' || resource.category === 'FIRE_STATION' ? 'amber' :
    resource.category === 'PHARMACY' ? 'emerald' : 'purple';

  return (
    <Card hover className="flex flex-col justify-between h-full border-slate-200">
      <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        
        <div className="space-y-2">
          {/* Header Row: Category Badge & Distance */}
          <div className="flex items-center justify-between gap-2">
            <Badge variant={categoryColor} size="sm">
              {resource.category}
            </Badge>

            <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-indigo-600" />
              {resource.distanceText || 'Nearby'}
            </span>
          </div>

          {/* Place Name */}
          <h3 className="font-extrabold text-base text-slate-900 tracking-tight leading-snug">
            {resource.name}
          </h3>

          {/* Address Readout */}
          <p className="text-xs text-slate-500 font-medium flex items-start gap-1.5 leading-relaxed">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>{resource.address}</span>
          </p>
        </div>

        <div className="space-y-3 pt-3 border-t border-slate-100">
          
          {/* Operating Hours & Verification Badge */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              {resource.operatingHours || '24/7'}
            </span>

            <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {resource.isVerified ? 'Verified Station' : 'Directory Data'}
            </span>
          </div>

          {/* Action Buttons: Directions (OpenStreetMap) & Call */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Directions Button */}
            <a
              href={resource.directionsUrl || `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${resource.latitude},${resource.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl font-bold text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-colors flex items-center justify-center space-x-1.5"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Directions</span>
            </a>

            {/* Call Button (if phone exists) */}
            {resource.phone ? (
              <a
                href={`tel:${resource.phone}`}
                className="w-full py-2 px-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            ) : (
              <button
                disabled
                className="w-full py-2 px-3 rounded-xl font-semibold text-xs text-slate-400 bg-slate-100 cursor-not-allowed flex items-center justify-center space-x-1"
              >
                <span>No Phone</span>
              </button>
            )}
          </div>

        </div>

      </CardContent>
    </Card>
  );
}
