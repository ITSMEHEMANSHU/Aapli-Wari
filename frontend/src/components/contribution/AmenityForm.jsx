import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PANDHARPUR, AMENITY_TYPES } from '../../utils/mapConstants';
import { forwardGeocode, reverseGeocode, getCurrentLocation } from '../../utils/geocoding';
import { api } from '../../services/api';
import { FiMapPin, FiSearch, FiNavigation, FiCheck } from 'react-icons/fi';

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Click handler inside map
function LocationPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const INITIAL = {
  name: '',
  service_type: '',
  description: '',
  address: '',
  lat: null,
  lng: null,
  contact: '',
  is_free: true,
};

const AmenityForm = ({ onSuccess }) => {
  const [form, setForm]           = useState(INITIAL);
  const [addressSearch, setAddressSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const mapRef                    = useRef(null);

  // When lat/lng changes fly map there
  useEffect(() => {
    if (form.lat && mapRef.current) {
      mapRef.current.flyTo([form.lat, form.lng], 16);
    }
  }, [form.lat, form.lng]);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  // ── Forward geocode — search address ──────────────────────────────────────
  const handleAddressSearch = async () => {
    if (!addressSearch.trim()) return;
    setSearching(true);
    setError('');
    const result = await forwardGeocode(addressSearch);
    if (result) {
      set('lat', result.lat);
      set('lng', result.lng);
      set('address', result.displayName);
    } else {
      setError('Address not found. Try a more specific location.');
    }
    setSearching(false);
  };

  // ── GPS current location ──────────────────────────────────────────────────
  const handleGPS = async () => {
    setGpsLoading(true);
    setError('');
    try {
      const { lat, lng } = await getCurrentLocation();
      const addr = await reverseGeocode(lat, lng);
      set('lat', lat);
      set('lng', lng);
      set('address', addr);
      setAddressSearch(addr);
    } catch {
      setError('Could not get your location. Please allow location access.');
    }
    setGpsLoading(false);
  };

  // ── Map click pick ────────────────────────────────────────────────────────
  const handleMapPick = async (lat, lng) => {
    set('lat', lat);
    set('lng', lng);
    const addr = await reverseGeocode(lat, lng);
    set('address', addr);
    setAddressSearch(addr);
  };

  // Types that require contact
  const CONTACT_REQUIRED_TYPES = ['stay', 'medical', 'rest', 'transport'];
  const contactRequired = CONTACT_REQUIRED_TYPES.includes(form.service_type);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.service_type) { setError('Please select a service type.'); return; }
    if (!form.lat || !form.lng) { setError('Please pick a location on the map.'); return; }
    if (!form.name.trim()) { setError('Please enter a name for this amenity.'); return; }
    if (contactRequired && !form.contact.trim()) {
      setError('Contact number is required for Stay, Medical, Rest Area and Transport services.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.addAmenity({
        name:         form.name,
        service_type: form.service_type,
        description:  form.description,
        address:      form.address,
        lat:          form.lat,
        lng:          form.lng,
        contact:      form.contact,
        is_free:      form.is_free,
      });
      setSuccess(true);
      setForm(INITIAL);
      setAddressSearch('');
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Failed to submit. Please try again.');
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheck className="text-green-600 text-2xl" />
        </div>
        <h3 className="font-serif font-bold text-[#2B1B12] text-xl mb-2">Amenity Added!</h3>
        <p className="text-sm text-[#4A392E]/70 mb-6">
          Your amenity has been submitted and will appear on the map shortly.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="bg-[#DD6B35] hover:bg-[#C85A28] text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm"
        >
          Add Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-serif font-bold text-[#2B1B12] text-xl mb-1">Add Amenity for Varkaris</h2>
        <p className="text-sm text-[#4A392E]/70">
          Help fellow Varkaris by marking food, stay, water, and other services on the map.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* ── Service type ── */}
      <div>
        <label className="block text-sm font-semibold text-[#2B1B12] mb-2">
          Service Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AMENITY_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => set('service_type', t.value)}
              className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 text-xs font-medium transition ${
                form.service_type === t.value
                  ? 'text-white border-transparent'
                  : 'bg-white border-[#E8D9C3] text-[#4A392E] hover:border-[#DD6B35]'
              }`}
              style={form.service_type === t.value ? { backgroundColor: t.color, borderColor: t.color } : {}}
            >
              <span className="text-xl">{t.label.split(' ')[0]}</span>
              <span>{t.label.split(' ').slice(1).join(' ')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Name ── */}
      <div>
        <label className="block text-sm font-semibold text-[#2B1B12] mb-1.5">
          Name / Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Free Meals by Sharma Seva Trust"
          className="w-full px-4 py-2.5 border border-[#E8D9C3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 bg-white"
        />
      </div>

      {/* ── Description ── */}
      <div>
        <label className="block text-sm font-semibold text-[#2B1B12] mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="What services do you provide? Timings, capacity, etc."
          rows={3}
          className="w-full px-4 py-2.5 border border-[#E8D9C3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 bg-white resize-none"
        />
      </div>

      {/* ── Contact + Free toggle ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#2B1B12] mb-1.5">
            Contact {contactRequired && <span className="text-red-500">*</span>}
            {contactRequired && (
              <span className="ml-1 text-xs font-normal text-[#DD6B35]">(required for this type)</span>
            )}
          </label>
          <input
            type="text"
            value={form.contact}
            onChange={(e) => set('contact', e.target.value)}
            placeholder="Phone number or email"
            required={contactRequired}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 bg-white ${
              contactRequired && !form.contact.trim()
                ? 'border-red-300'
                : 'border-[#E8D9C3]'
            }`}
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set('is_free', !form.is_free)}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.is_free ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${form.is_free ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className="text-sm font-medium text-[#2B1B12]">
              {form.is_free ? '✅ Free service' : 'Paid service'}
            </span>
          </label>
        </div>
      </div>

      {/* ── Location picker ── */}
      <div>
        <label className="block text-sm font-semibold text-[#2B1B12] mb-2">
          Location <span className="text-red-500">*</span>
        </label>

        {/* Search + GPS row */}
        <div className="flex gap-2 mb-3">
          <div className="flex flex-1 gap-0">
            <input
              type="text"
              value={addressSearch}
              onChange={(e) => setAddressSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddressSearch())}
              placeholder="Search address or village name..."
              className="flex-1 px-4 py-2.5 border border-r-0 border-[#E8D9C3] rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 bg-white"
            />
            <button
              type="button"
              onClick={handleAddressSearch}
              disabled={searching}
              className="px-4 py-2.5 bg-[#F5EADA] border border-[#E8D9C3] rounded-r-lg hover:bg-[#EDE0CB] transition text-[#DD6B35]"
            >
              {searching ? <span className="text-xs">...</span> : <FiSearch size={15} />}
            </button>
          </div>
          <button
            type="button"
            onClick={handleGPS}
            disabled={gpsLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-[#DD6B35] hover:bg-[#C85A28] text-white rounded-lg text-xs font-medium transition whitespace-nowrap"
          >
            <FiNavigation size={13} />
            {gpsLoading ? 'Getting...' : 'Use GPS'}
          </button>
        </div>

        {/* Map */}
        <div className="rounded-xl overflow-hidden border border-[#E8D9C3] shadow-sm">
          <p className="text-xs text-[#4A392E]/60 bg-[#F5EADA] px-3 py-1.5 border-b border-[#E8D9C3]">
            <FiMapPin className="inline mr-1" size={11} />
            Click on the map to place your pin
          </p>
          <MapContainer
            center={[form.lat ?? PANDHARPUR.lat, form.lng ?? PANDHARPUR.lng]}
            zoom={13}
            style={{ height: '280px', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationPicker onPick={handleMapPick} />
            {form.lat && form.lng && (
              <Marker position={[form.lat, form.lng]} />
            )}
          </MapContainer>
        </div>

        {/* Coordinates display */}
        {form.lat && form.lng && (
          <p className="text-xs text-[#4A392E]/60 mt-1.5 flex items-center gap-1">
            <FiMapPin size={11} />
            {form.lat.toFixed(6)}, {form.lng.toFixed(6)}
            {form.address && ` — ${form.address.split(',').slice(0, 3).join(',')}`}
          </p>
        )}
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#DD6B35] hover:bg-[#C85A28] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition text-sm shadow-md"
      >
        {submitting ? 'Submitting...' : 'Submit Amenity to Map'}
      </button>
    </form>
  );
};

export default AmenityForm;
