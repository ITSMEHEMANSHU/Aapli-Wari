import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PANDHARPUR, AMENITY_TYPES, amenityColor } from '../../utils/mapConstants';
import { api } from '../../services/api';
import { FiNavigation, FiMapPin, FiWifi, FiWifiOff, FiRefreshCw } from 'react-icons/fi';

// ── Fix leaflet default icons ─────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Palkhi live marker icon ───────────────────────────────────────────────────
const palkhiLiveIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:48px;height:48px">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:rgba(221,107,53,0.25);
        animation:pulse 2s infinite;
      "></div>
      <div style="
        position:absolute;inset:6px;border-radius:50%;
        background:#DD6B35;border:3px solid #fff;
        box-shadow:0 3px 10px rgba(0,0,0,0.4);
        display:flex;align-items:center;justify-content:center;
        font-size:16px;
      ">🚩</div>
    </div>
    <style>
      @keyframes pulse {
        0%   { transform:scale(1);   opacity:.8; }
        50%  { transform:scale(1.6); opacity:.3; }
        100% { transform:scale(1);   opacity:.8; }
      }
    </style>
  `,
  iconSize:    [48, 48],
  iconAnchor:  [24, 24],
  popupAnchor: [0, -28],
});

// ── Amenity colored pin ───────────────────────────────────────────────────────
function amenityIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:26px;height:26px;border-radius:50% 50% 50% 0;
      background:${color};border:3px solid #fff;
      transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.35)
    "></div>`,
    iconSize:    [26, 26],
    iconAnchor:  [13, 26],
    popupAnchor: [0, -28],
  });
}

// ── Auto fly to palkhi when location updates ──────────────────────────────────
function FlyTo({ coords }) {
  const map = useMap();
  const prevRef = useRef(null);
  useEffect(() => {
    if (!coords) return;
    const prev = prevRef.current;
    if (!prev || prev.lat !== coords.lat || prev.lng !== coords.lng) {
      map.flyTo([coords.lat, coords.lng], map.getZoom() < 13 ? 14 : map.getZoom(), { duration: 1 });
      prevRef.current = coords;
    }
  }, [coords, map]);
  return null;
}

// ── Haversine distance in km ──────────────────────────────────────────────────
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const NEARBY_RADIUS_KM = 10;
const WS_BASE = import.meta.env.VITE_WS_URL || (import.meta.env.DEV ? 'ws://localhost:8000' : 'wss://aapli-wari-backend.onrender.com');

// ─────────────────────────────────────────────────────────────────────────────

const ChannelRouteMap = ({ channelId, channelName, isOwner, userToken }) => {
  const [liveLocation, setLiveLocation]   = useState(null);
  const [trail, setTrail]                 = useState([]);
  const [amenities, setAmenities]         = useState([]);
  const [activeFilters, setActiveFilters] = useState(AMENITY_TYPES.map((t) => t.value));
  const [wsStatus, setWsStatus]           = useState('disconnected'); // connected | disconnected | error
  const [sharing, setSharing]             = useState(false);
  const [gpsError, setGpsError]           = useState('');
  const [lastUpdate, setLastUpdate]       = useState(null);

  const wsRef         = useRef(null);
  const gpsIntervalRef = useRef(null);
  const senderWsRef   = useRef(null);

  // ── Load nearby amenities ───────────────────────────────────────────────────
  const loadAmenities = useCallback(async () => {
    try {
      const data = await api.getAmenities();
      setAmenities(Array.isArray(data) ? data : []);
    } catch {
      setAmenities([]);
    }
  }, []);

  useEffect(() => { loadAmenities(); }, [loadAmenities]);

  // ── Connect subscriber WebSocket ────────────────────────────────────────────
  const connectSubscriber = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const url = `${WS_BASE}/ws/track/${channelId}/subscribe`;
    const ws  = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'location_update') {
          setLiveLocation({ lat: msg.lat, lng: msg.lng });
          setLastUpdate(msg.timestamp);
          if (Array.isArray(msg.trail)) {
            setTrail(msg.trail.map((p) => [p.lat, p.lng]));
          }
        }
        // ping / no_location — ignore silently
      } catch {
        // malformed message
      }
    };

    ws.onerror = () => setWsStatus('error');

    ws.onclose = () => {
      setWsStatus('disconnected');
      // Auto-reconnect after 5s
      setTimeout(() => {
        if (wsRef.current === ws) connectSubscriber();
      }, 5000);
    };
  }, [channelId]);

  useEffect(() => {
    connectSubscriber();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connectSubscriber]);

  // ── Start sharing location (Palkhi Pramukh only) ───────────────────────────
  const startSharing = useCallback(() => {
    if (!userToken) return;

    const url = `${WS_BASE}/ws/track/${channelId}/send?token=${userToken}`;
    const ws  = new WebSocket(url);
    senderWsRef.current = ws;

    ws.onopen = () => {
      setSharing(true);
      setGpsError('');

      // Send GPS every 60 seconds
      const sendGPS = () => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              }));
            }
          },
          (err) => setGpsError(err.message),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      };

      sendGPS(); // Send immediately on connect
      gpsIntervalRef.current = setInterval(sendGPS, 60_000);
    };

    ws.onclose = () => {
      setSharing(false);
      clearInterval(gpsIntervalRef.current);
    };

    ws.onerror = () => {
      setSharing(false);
      setGpsError('Failed to connect location sharing. Please retry.');
    };
  }, [channelId, userToken]);

  const stopSharing = useCallback(() => {
    senderWsRef.current?.close();
    clearInterval(gpsIntervalRef.current);
    setSharing(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      senderWsRef.current?.close();
      clearInterval(gpsIntervalRef.current);
    };
  }, []);

  // ── Filter amenities near palkhi ────────────────────────────────────────────
  const nearbyAmenities = React.useMemo(() => {
    if (!liveLocation) return amenities; // show all when no live location
    return amenities.filter((a) =>
      distanceKm(liveLocation.lat, liveLocation.lng, a.lat, a.lng) <= NEARBY_RADIUS_KM
    );
  }, [amenities, liveLocation]);

  const visibleAmenities = nearbyAmenities.filter((a) =>
    activeFilters.includes(a.service_type)
  );

  const mapCenter = liveLocation
    ? [liveLocation.lat, liveLocation.lng]
    : [PANDHARPUR.lat, PANDHARPUR.lng];

  return (
    <div className="flex flex-col h-full w-full bg-[#FBF5EC]">

      {/* ── Top status bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-[#E8D9C3] gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {wsStatus === 'connected' ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
              <FiWifi size={11} /> Live
            </span>
          ) : wsStatus === 'error' ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
              <FiWifiOff size={11} /> Error
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#4A392E]/60 bg-[#F5EADA] border border-[#E8D9C3] px-2.5 py-1 rounded-full">
              <FiWifiOff size={11} /> Connecting...
            </span>
          )}

          {liveLocation && (
            <span className="text-xs text-[#4A392E]/60">
              Last update: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : '--'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Reconnect button */}
          <button
            onClick={connectSubscriber}
            className="p-1.5 rounded-lg border border-[#E8D9C3] hover:bg-[#F5EADA] transition text-[#4A392E]"
            title="Reconnect"
          >
            <FiRefreshCw size={13} />
          </button>

          {/* Pramukh sharing toggle */}
          {isOwner && (
            <button
              onClick={sharing ? stopSharing : startSharing}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                sharing
                  ? 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
                  : 'bg-[#DD6B35] text-white hover:bg-[#C85A28]'
              }`}
            >
              <FiNavigation size={11} />
              {sharing ? 'Stop Sharing' : 'Share My Location'}
            </button>
          )}
        </div>
      </div>

      {/* ── GPS error ── */}
      {gpsError && (
        <div className="bg-red-50 border-b border-red-200 text-red-700 text-xs px-4 py-2">
          GPS error: {gpsError}
        </div>
      )}

      {/* ── Filter chips ── */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#F9F4EC] border-b border-[#E8D9C3] overflow-x-auto">
        <span className="text-[10px] font-bold text-[#4A392E]/50 uppercase tracking-wider shrink-0">Amenities</span>
        {AMENITY_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() =>
              setActiveFilters((prev) =>
                prev.includes(t.value)
                  ? prev.filter((x) => x !== t.value)
                  : [...prev, t.value]
              )
            }
            className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
              activeFilters.includes(t.value)
                ? 'text-white border-transparent'
                : 'bg-white text-[#4A392E]/50 border-[#E8D9C3]'
            }`}
            style={activeFilters.includes(t.value) ? { backgroundColor: t.color, borderColor: t.color } : {}}
          >
            {t.label.split(' ')[0]} {t.label.split(' ').slice(1).join(' ')}
          </button>
        ))}
      </div>

      {/* ── Map ── */}
      <div className="flex-1 relative min-h-[400px]">
        <MapContainer
          center={mapCenter}
          zoom={13}
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Auto fly to live location */}
          {liveLocation && <FlyTo coords={liveLocation} />}

          {/* Trail polyline */}
          {trail.length > 1 && (
            <Polyline
              positions={trail}
              pathOptions={{ color: '#DD6B35', weight: 3, opacity: 0.7, dashArray: '6 4' }}
            />
          )}

          {/* Live palkhi marker */}
          {liveLocation && (
            <Marker position={[liveLocation.lat, liveLocation.lng]} icon={palkhiLiveIcon}>
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <p style={{ fontWeight: 700, color: '#2B1B12', marginBottom: 4 }}>
                    🚩 {channelName}
                  </p>
                  <p style={{ fontSize: 11, color: '#4A392E', marginBottom: 4 }}>
                    Live Palkhi Location
                  </p>
                  {lastUpdate && (
                    <p style={{ fontSize: 10, color: '#4A392E', opacity: 0.6 }}>
                      Updated: {new Date(lastUpdate).toLocaleTimeString()}
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${liveLocation.lat},${liveLocation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: 8,
                      backgroundColor: '#DD6B35',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Get Directions
                  </a>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Amenity markers */}
          {visibleAmenities.map((a) => (
            <Marker
              key={a.id}
              position={[a.lat, a.lng]}
              icon={amenityIcon(amenityColor(a.service_type))}
            >
              <Popup>
                <div style={{ minWidth: 190 }}>
                  <p style={{ fontWeight: 700, color: '#2B1B12', fontSize: 13, marginBottom: 4 }}>
                    {a.name}
                  </p>
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: amenityColor(a.service_type),
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 999,
                      marginBottom: 6,
                    }}
                  >
                    {AMENITY_TYPES.find((t) => t.value === a.service_type)?.label || a.service_type}
                  </span>
                  {a.description && (
                    <p style={{ fontSize: 11, color: '#4A392E', marginBottom: 4 }}>{a.description}</p>
                  )}
                  {a.contact && (
                    <p style={{ fontSize: 11, color: '#4A392E', marginBottom: 4 }}>
                      Contact: {a.contact}
                    </p>
                  )}
                  <p style={{ fontSize: 11, marginBottom: 6 }}>
                    {a.is_free ? (
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>Free</span>
                    ) : (
                      <span style={{ color: '#d97706', fontWeight: 700 }}>Paid</span>
                    )}
                  </p>
                  {liveLocation && (
                    <p style={{ fontSize: 10, color: '#4A392E', opacity: 0.6, marginBottom: 6 }}>
                      {distanceKm(liveLocation.lat, liveLocation.lng, a.lat, a.lng).toFixed(1)} km from palkhi
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${a.lat},${a.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#DD6B35',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Get Directions
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* ── No location overlay ── */}
        {!liveLocation && (
          <div className="absolute inset-0 flex items-center justify-center z-[999] pointer-events-none">
            <div className="bg-white/95 backdrop-blur-sm border border-[#E8D9C3] rounded-2xl px-6 py-5 text-center shadow-xl max-w-xs mx-4 pointer-events-auto">
              <div className="w-12 h-12 rounded-full bg-[#F5EADA] flex items-center justify-center mx-auto mb-3">
                <FiMapPin className="text-[#DD6B35] text-xl" />
              </div>
              <h3 className="font-serif font-bold text-[#2B1B12] text-base mb-1">
                Location Not Shared Yet
              </h3>
              <p className="text-xs text-[#4A392E]/70 leading-relaxed">
                The Palkhi Pramukh has not started sharing their live location. Check back soon.
              </p>
              {isOwner && (
                <button
                  onClick={startSharing}
                  className="mt-3 inline-flex items-center gap-1.5 bg-[#DD6B35] hover:bg-[#C85A28] text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                >
                  <FiNavigation size={11} /> Start Sharing Now
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Legend ── */}
        <div className="absolute bottom-4 left-4 bg-white/95 border border-[#E8D9C3] rounded-xl p-3 shadow-lg z-[1000]">
          <p className="text-[9px] font-bold text-[#2B1B12] mb-2 uppercase tracking-wider">Legend</p>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-sm">🚩</span>
            <span className="text-[10px] text-[#4A392E]">Live Palkhi</span>
          </div>
          {AMENITY_TYPES.slice(0, 4).map((t) => (
            <div key={t.value} className="flex items-center gap-1.5 mb-1">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
              <span className="text-[10px] text-[#4A392E]">{t.label.split(' ').slice(1).join(' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChannelRouteMap;
