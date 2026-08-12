import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useLocation } from '../../context/LocationContext';
import { Shield, AlertTriangle, Hospital, PhoneCall, ShieldAlert, Radio } from 'lucide-react';

// Custom SVG Leaflet Icon Builders
const createCustomIcon = (color, svgPath, size = 36) => {
  const svgHtml = `
    <div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      color: white;
    ">
      ${svgPath}
    </div>
  `;
  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

const userIcon = createCustomIcon(
  '#2563eb', // Blue
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>`,
  38
);

const sosIcon = createCustomIcon(
  '#dc2626', // Red
  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>`,
  44
);

const policeIcon = createCustomIcon(
  '#1e40af', // Dark blue
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  32
);

const hospitalIcon = createCustomIcon(
  '#059669', // Emerald
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6v12M6 12h12"/></svg>`,
  32
);

const incidentIcon = createCustomIcon(
  '#d97706', // Amber
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
  34
);

// Map Center Recenter Helper Component
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 14, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

// Map Click Listener for picking incident location
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

export default function SafeMap({
  activeSOSList = [],
  resourcesList = [],
  incidentsList = [],
  onMapClick = null,
  selectedPin = null
}) {
  const { location } = useLocation();
  const currentCenter = [location.lat, location.lng];

  return (
    <div className="relative w-full h-[550px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <MapContainer
        center={currentCenter}
        zoom={14}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <ChangeView center={currentCenter} />
        <MapClickHandler onMapClick={onMapClick} />

        {/* Dark Modern CartoDB DarkMatter Map Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* User Current Location Marker & Precision Range Circle */}
        <Marker position={currentCenter} icon={userIcon}>
          <Popup>
            <div className="p-1">
              <h4 className="font-bold text-slate-100 flex items-center gap-1.5 text-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                Your Live Position
              </h4>
              <p className="text-xs text-slate-300 mt-1">{location.address}</p>
              <p className="text-[10px] text-slate-400 mt-1">Accuracy: ~{Math.round(location.accuracy || 10)} meters</p>
            </div>
          </Popup>
        </Marker>
        <Circle
          center={currentCenter}
          radius={location.accuracy || 100}
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 1.5 }}
        />

        {/* Selected Pin for Reporting Incidents */}
        {selectedPin && (
          <Marker position={[selectedPin.lat, selectedPin.lng]} icon={incidentIcon}>
            <Popup>
              <div className="p-1 text-xs">
                <strong className="text-amber-400">Selected Reporting Point</strong>
                <p className="text-slate-300 mt-1">Lat: {selectedPin.lat.toFixed(4)}, Lng: {selectedPin.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Active Emergency SOS Markers */}
        {activeSOSList.map((sos) => {
          const coords = sos.location?.coordinates;
          if (!coords || coords.length !== 2) return null;
          const pos = [coords[1], coords[0]];
          return (
            <React.Fragment key={sos._id || sos.id}>
              <Marker position={pos} icon={sosIcon}>
                <Popup>
                  <div className="p-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider">
                      EMERGENCY SOS ACTIVE
                    </span>
                    <h4 className="font-bold text-slate-100 mt-1 text-sm">{sos.userId?.name || 'Unknown User'}</h4>
                    <p className="text-xs text-rose-300 font-semibold">{sos.emergencyType} Alert</p>
                    <p className="text-xs text-slate-300 mt-1">{sos.location?.address}</p>
                    {sos.userId?.phone && (
                      <a
                        href={`tel:${sos.userId.phone}`}
                        className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-semibold"
                      >
                        <PhoneCall className="w-3 h-3" /> Call User ({sos.userId.phone})
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={pos}
                radius={250}
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.25, weight: 2 }}
              />
            </React.Fragment>
          );
        })}

        {/* Emergency Resources Markers (Police, Hospitals, Fire Stations) */}
        {resourcesList.map((res) => {
          const coords = res.location?.coordinates;
          if (!coords || coords.length !== 2) return null;
          const pos = [coords[1], coords[0]];
          const icon = res.category === 'POLICE' ? policeIcon : hospitalIcon;

          return (
            <Marker key={res._id || res.name} position={pos} icon={icon}>
              <Popup>
                <div className="p-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                    {res.category}
                  </span>
                  <h4 className="font-bold text-slate-100 mt-1 text-sm">{res.name}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{res.address}</p>
                  {res.phone && (
                    <a
                      href={`tel:${res.phone}`}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:underline"
                    >
                      <PhoneCall className="w-3 h-3" /> {res.phone}
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Crowd-Sourced Incident Markers */}
        {incidentsList.map((inc) => {
          const coords = inc.location?.coordinates;
          if (!coords || coords.length !== 2) return null;
          const pos = [coords[1], coords[0]];

          return (
            <Marker key={inc._id} position={pos} icon={incidentIcon}>
              <Popup>
                <div className="p-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      {inc.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{inc.severity} SEVERITY</span>
                  </div>
                  <h4 className="font-bold text-slate-100 mt-1 text-sm">{inc.title}</h4>
                  <p className="text-xs text-slate-300 mt-1">{inc.description}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Upvotes: {inc.upvotes?.length || 0} • Status: {inc.status}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Map Controls / Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] glass-panel px-3.5 py-2.5 rounded-xl border border-slate-700/60 shadow-xl flex items-center space-x-4 text-xs font-medium text-slate-300">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 border border-white" />
          <span>You</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-red-600 border border-white" />
          <span>SOS</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-indigo-700 border border-white" />
          <span>Police</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white" />
          <span>Hospital</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-600 border border-white" />
          <span>Incidents</span>
        </div>
      </div>
    </div>
  );
}
