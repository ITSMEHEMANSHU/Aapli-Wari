/**
 * Geocoding Utility — uses OpenStreetMap Nominatim (FREE, no API key needed)
 *
 * Forward geocoding:  address string → { lat, lng }
 * Reverse geocoding:  { lat, lng }   → address string
 */

const NOMINATIM = 'https://nominatim.openstreetmap.org';

/**
 * Forward geocoding — convert address to coordinates
 * @param {string} address - e.g. "Pandharpur, Maharashtra"
 * @returns {Promise<{lat: number, lng: number, displayName: string} | null>}
 */
export async function forwardGeocode(address) {
  try {
    const url = `${NOMINATIM}/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=in`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'AapliWari/1.0' },
    });
    const data = await res.json();
    if (!data.length) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch {
    return null;
  }
}

/**
 * Reverse geocoding — convert coordinates to address
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string>} - readable address
 */
export async function reverseGeocode(lat, lng) {
  try {
    const url = `${NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=json`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'AapliWari/1.0' },
    });
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

/**
 * Get user's current GPS location
 * @returns {Promise<{lat: number, lng: number}>}
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
