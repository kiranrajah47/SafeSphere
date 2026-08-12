import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RefreshCw, MapPin, AlertTriangle, Shield, HeartPulse, Flame, Radio } from 'lucide-react';
import Button from '../ui/Button';
import AlertBanner from '../ui/AlertBanner';

// Fix Leaflet's default marker icon path issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Colored DivIcons for Emergency Markers
const createCustomIcon = (colorHex, label) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${colorHex};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 11px;
      ">
        ${label || '📍'}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const userLocationIcon = createCustomIcon('#4f46e5', '👤');
const policeIcon = createCustomIcon('#2563eb', '👮');
const hospitalIcon = createCustomIcon('#e11d48', '🏥');
const fireIcon = createCustomIcon('#d97706', '🚒');
const incidentIcon = createCustomIcon('#dc2626', '⚠️');

// Helper component to re-center map view on coordinates update
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 15);
    }
  }, [center, zoom, map]);
  return null;
}

export default function SafetyMap({
  center = [28.6139, 77.2090],
  zoom = 14,
  userLocation,
  markers = [],
  loading = false,
  error = null,
  permissionStatus = 'prompt',
  onRefreshLocation,
  height = 'h-[500px]'
}) {
  const lat = userLocation?.lat || center[0];
  const lng = userLocation?.lng || center[1];
  const mapCenter = [lat, lng];

  return (
    <div className={`relative w-full ${height} rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100`}>
      
      {/* Top Map Toolbar Overlay */}
      <div className="absolute top-4 right-4 z-[400] flex items-center space-x-2">
        {onRefreshLocation && (
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={loading}
            onClick={onRefreshLocation}
            className="shadow-md bg-white/90 backdrop-blur-xs text-slate-800 hover:bg-white"
          >
            Refresh GPS
          </Button>
        )}
      </div>

      {/* Permission / Error State Overlay Banner */}
      {permissionStatus === 'denied' && (
        <div className="absolute top-4 left-4 right-4 sm:right-auto z-[400] max-w-md">
          <AlertBanner type="warning" title="Location Permission Denied">
            Location access is blocked by your browser. Please enable location permissions in browser settings to center map on your position.
          </AlertBanner>
        </div>
      )}

      {error && permissionStatus !== 'denied' && (
        <div className="absolute top-4 left-4 right-4 sm:right-auto z-[400] max-w-md">
          <AlertBanner type="danger" title="Location Error">
            {error.message || 'Unable to resolve GPS position. Displaying default center.'}
          </AlertBanner>
        </div>
      )}

      {/* Leaflet + OpenStreetMap Tile Engine */}
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <ChangeMapView center={mapCenter} zoom={zoom} />

        {/* Free OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Current Position Marker & Precision Circle */}
        {userLocation && (
          <>
            <Marker position={[lat, lng]} icon={userLocationIcon}>
              <Popup>
                <div className="p-1 text-slate-900 font-sans space-y-1">
                  <span className="font-extrabold text-xs text-indigo-600 block">Your Position</span>
                  <p className="text-xs font-bold">{userLocation.address || 'Current Coordinates'}</p>
                  <p className="text-[10px] font-mono text-slate-500">({lat.toFixed(6)}, {lng.toFixed(6)})</p>
                </div>
              </Popup>
            </Marker>

            <Circle
              center={[lat, lng]}
              radius={userLocation.accuracy || 150}
              pathOptions={{
                color: '#4f46e5',
                fillColor: '#6366f1',
                fillOpacity: 0.15,
                weight: 1.5
              }}
            />
          </>
        )}

        {/* Array of Custom Markers (Police, Hospitals, Incidents) */}
        {markers.map((m, idx) => {
          let icon = userLocationIcon;
          if (m.category === 'POLICE') icon = policeIcon;
          else if (m.category === 'HOSPITAL' || m.category === 'AMBULANCE') icon = hospitalIcon;
          else if (m.category === 'FIRE') icon = fireIcon;
          else if (m.category === 'INCIDENT') icon = incidentIcon;

          const mLat = m.latitude || m.coordinates?.[1] || m.location?.coordinates?.[1];
          const mLng = m.longitude || m.coordinates?.[0] || m.location?.coordinates?.[0];

          if (!mLat || !mLng) return null;

          return (
            <Marker key={m._id || idx} position={[mLat, mLng]} icon={icon}>
              <Popup>
                <div className="p-1 text-slate-900 font-sans space-y-1">
                  <span className="font-extrabold text-xs text-slate-900 block">{m.name || m.title}</span>
                  {m.category && <span className="text-[10px] uppercase font-bold text-indigo-600 px-1.5 py-0.5 bg-indigo-50 rounded">{m.category}</span>}
                  {m.address && <p className="text-xs text-slate-600 mt-1">{m.address}</p>}
                  {m.phone && <a href={`tel:${m.phone}`} className="text-xs font-bold text-emerald-600 block mt-1">📞 {m.phone}</a>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

    </div>
  );
}
