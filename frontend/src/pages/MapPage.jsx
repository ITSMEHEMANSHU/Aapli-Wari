import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PANDHARPUR, DEFAULT_ZOOM, AMENITY_TYPES, amenityColor } from '../utils/mapConstants';
import { api } from '../services/api';
import { FiFilter, FiRefreshCw, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

// ── Fix default leaflet marker icons (webpack/vite breaks them) ──────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Custom colored circle marker ─────────────────────────────────────────────
function colorIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:3px solid #fff;
      transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.35)">
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

// Palkhi marker (orange flag style)
const palkhiIcon = L.divIcon({
  className: '',
  html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))">🚩</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
});

// ── Fly-to helper component ───────────────────────────────────────────────────
function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], 15, { duration: 1.2 });
  }, [coords, map]);
  return null;
}

// ── Mock Palkhi live data (replace with real API when backend is ready) ───────
const MOCK_PALKHIS = [
  { id: 1, name: 'Sant Dnyaneshwar Palkhi', lat: 17.7200, lng: 75.2800, status: 'Moving towards Pandharpur', eta: '2 days' },
  { id: 2, name: 'Sant Tukaram Palkhi',     lat: 17.6950, lng: 75.3100, status: 'Resting at Walhe',          eta: '3 days' },
];

// ─────────────────────────────────────────────────────────────────────────────

const MapPage = () => {
  const { user } = useAuth();
  const [amenities, setAmenities]       = useState([]);
  const [palkhis, setPalkhis]           = useState(MOCK_PALKHIS);
  const [activeFilters, setActiveFilters] = useState(AMENITY_TYPES.map((t) => t.value));
  const [loading, setLoading]           = useState(true);
  const [flyTo, setFlyTo]               = useState(null);
  const [showFilters, setShowFilters]   = useState(false);

  // Load amenities from backend
  const loadAmenities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAmenities();
      setAmenities(Array.isArray(data) ? data : []);
    } catch {
      // Backend not ready yet — use empty array silently
      setAmenities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAmenities(); }, [loadAmenities]);

  const toggleFilter = (type) => {
    setActiveFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const visibleAmenities = amenities.filter((a) => activeFilters.includes(a.service_type));
  const canAddAmenity = ['contributor', 'palkhi_pramukh', 'admin'].includes(
    user?.role?.toLowerCase()
  );

  return (
    <div className="w-full h-[calc(100vh-64px)] flex flex-col">

      {/* ── Top bar ── */}
      <div className="bg-[#FBF5EC] border-b border-[#E8D9C3] px-4 sm:px-6 py-3 flex items-center justify-between gap-4 z-10">
        <div>
          <h1 className="font-serif font-bold text-[#2B1B12] text-lg leading-none">Wari Live Map</h1>
          <p className="text-xs text-[#4A392E]/60 mt-0.5">Palkhi locations & Varkari amenities</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-1.5 border border-[#E8D9C3] bg-white text-[#4A392E] px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#F5EADA] transition"
          >
            <FiFilter size={13} /> Filters
            <span className="bg-[#DD6B35] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              {activeFilters.length}
            </span>
          </button>

          {/* Refresh */}
          <button
            onClick={loadAmenities}
            className="p-2 border border-[#E8D9C3] bg-white rounded-lg hover:bg-[#F5EADA] transition text-[#4A392E]"
            title="Refresh"
          >
            <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Go to Pandharpur */}
          <button
            onClick={() => setFlyTo(PANDHARPUR)}
            className="inline-flex items-center gap-1.5 bg-[#DD6B35] hover:bg-[#C85A28] text-white px-3 py-2 rounded-lg text-xs font-medium transition"
          >
            <FiMapPin size={13} /> Pandharpur
          </button>
        </div>
      </div>

      {/* ── Filter chips ── */}
      {showFilters && (
        <div className="bg-white border-b border-[#E8D9C3] px-4 sm:px-6 py-2.5 flex flex-wrap gap-2 z-10">
          {/* Palkhi toggle */}
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition bg-[#DD6B35]/10 border-[#DD6B35] text-[#DD6B35]"
          >
            🚩 Palkhis
          </button>
          {AMENITY_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => toggleFilter(t.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                activeFilters.includes(t.value)
                  ? 'text-white border-transparent'
                  : 'bg-white text-[#4A392E]/50 border-[#E8D9C3]'
              }`}
              style={activeFilters.includes(t.value) ? { backgroundColor: t.color, borderColor: t.color } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Map ── */}
      <div className="flex-1 relative">
        <MapContainer
          center={[PANDHARPUR.lat, PANDHARPUR.lng]}
          zoom={DEFAULT_ZOOM}
          className="w-full h-full"
          zoomControl={true}
        >
          {/* OpenStreetMap tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Fly-to handler */}
          {flyTo && <FlyTo coords={flyTo} />}

          {/* ── Palkhi markers ── */}
          {palkhis.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={palkhiIcon}>
              <Popup>
                <div className="min-w-45">
                  <p className="font-bold text-[#2B1B12] text-sm mb-1">🚩 {p.name}</p>
                  <p className="text-xs text-[#4A392E]/70 mb-1">{p.status}</p>
                  <p className="text-xs font-medium text-[#DD6B35]">ETA Pandharpur: {p.eta}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* ── Amenity markers ── */}
          {visibleAmenities.map((a) => (
            <Marker
              key={a.id}
              position={[a.lat, a.lng]}
              icon={colorIcon(amenityColor(a.service_type))}
            >
              <Popup>
                <div className="min-w-50">
                  <p className="font-bold text-[#2B1B12] text-sm mb-1">{a.name}</p>
                  <span
                    className="inline-block text-white text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2"
                    style={{ backgroundColor: amenityColor(a.service_type) }}
                  >
                    {AMENITY_TYPES.find((t) => t.value === a.service_type)?.label || a.service_type}
                  </span>
                  {a.description && <p className="text-xs text-[#4A392E]/70 mb-1">{a.description}</p>}
                  {a.address && <p className="text-xs text-[#4A392E]/50 mb-1">📍 {a.address}</p>}
                  {a.contact && <p className="text-xs text-[#4A392E]/50 mb-1">📞 {a.contact}</p>}
                  <p className="text-xs mb-2">
                    {a.is_free
                      ? <span className="text-green-600 font-semibold">✅ Free</span>
                      : <span className="text-orange-500 font-semibold">💰 Paid</span>}
                  </p>
                  {a.contributor_name && (
                    <p className="text-xs text-[#4A392E]/50 mb-2">Added by: {a.contributor_name}</p>
                  )}
                  {/* Get Directions button */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${a.lat},${a.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#DD6B35',
                      color: 'white',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textDecoration: 'none',
                      marginTop: '4px',
                    }}
                  >
                    🗺️ Get Directions
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* ── Legend ── */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-[#E8D9C3] rounded-xl p-3 shadow-lg z-1000 max-w-40">
          <p className="text-[10px] font-bold text-[#2B1B12] mb-2 uppercase tracking-wider">Legend</p>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base">🚩</span>
            <span className="text-xs text-[#4A392E]">Palkhi</span>
          </div>
          {AMENITY_TYPES.slice(0, 4).map((t) => (
            <div key={t.value} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
              <span className="text-xs text-[#4A392E]">{t.label.split(' ').slice(1).join(' ')}</span>
            </div>
          ))}
        </div>

        {/* ── Add amenity CTA ── */}
        {canAddAmenity && (
          <div className="absolute bottom-4 right-4 z-1000">
            <a
              href="/contribute?tab=amenity"
              className="inline-flex items-center gap-2 bg-[#DD6B35] hover:bg-[#C85A28] text-white font-semibold px-4 py-2.5 rounded-full shadow-lg transition text-sm"
            >
              + Add Amenity
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
