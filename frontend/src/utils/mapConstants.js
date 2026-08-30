// Pandharpur center coordinates
export const PANDHARPUR = { lat: 17.6805, lng: 75.3296 };

// Default map zoom
export const DEFAULT_ZOOM = 13;

// Amenity service types
export const AMENITY_TYPES = [
  { value: 'food',      label: '🍱 Food',         color: '#E67E22' },
  { value: 'stay',      label: '🏠 Stay',          color: '#8E44AD' },
  { value: 'toilet',    label: '🚻 Toilet',        color: '#2980B9' },
  { value: 'medical',   label: '🏥 Medical',       color: '#E74C3C' },
  { value: 'water',     label: '💧 Water Point',   color: '#1ABC9C' },
  { value: 'rest',      label: '🛖 Rest Area',     color: '#27AE60' },
  { value: 'transport', label: '🚌 Transport',     color: '#F39C12' },
];

// Palkhi routes (major ones)
export const PALKHI_ROUTES = [
  { name: 'Sant Dnyaneshwar Palkhi', start: 'Alandi', color: '#DD6B35' },
  { name: 'Sant Tukaram Palkhi',     start: 'Dehu',   color: '#8B1E1E' },
];

// Amenity color by type
export const amenityColor = (type) =>
  AMENITY_TYPES.find((a) => a.value === type)?.color || '#555';
