import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaPlus,
  FaTag,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaWhatsapp,
  FaTrash,
  FaEdit,
  FaTimes,
  FaStore,
  FaBook,
  FaMusic,
  FaScroll,
  FaHandHoldingHeart,
  FaShoppingBag,
  FaImage,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShareAlt,
  FaChevronRight,
  FaLayerGroup,
  FaSync
} from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import { ROUTES } from '../routes';

const CATEGORIES = [
  { id: 'All', label: 'All Items', icon: FaStore },
  { id: 'Musical Instruments', label: 'Musical Instruments', icon: FaMusic },
  { id: 'Books & Literature', label: 'Books & Literature', icon: FaBook },
  { id: 'Manuscripts & Reproductions', label: 'Manuscripts', icon: FaScroll },
  { id: 'Traditional & Cultural Items', label: 'Traditional Items', icon: FaHandHoldingHeart },
  { id: 'Handcrafted Products', label: 'Handcrafted', icon: FaTag },
  { id: 'Wari Accessories', label: 'Wari Accessories', icon: FaShoppingBag },
  { id: 'Other Wari-related', label: 'Other Items', icon: FaLayerGroup },
];

const API_URL = 'http://localhost:8000';

function getImageUrl(img) {
  if (!img) return null;
  if (typeof img === 'string') {
    if (img.startsWith('appwrite:')) {
      const parts = img.split(':');
      const bucket = parts[1];
      const fid = parts[2];
      return `${API_URL}/store/images/${bucket}/${fid}`;
    }
    if (img.startsWith('/')) {
      return `${API_URL}${img}`;
    }
  }
  return img;
}

function ProductCard({ p, onView, isOwn, onEdit, onDelete, onToggleSold }) {
  const mainImgUrl = getImageUrl(p.main_image);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-[#E8D9C3] shadow-warm hover:shadow-warm-hover transition-all duration-300 overflow-hidden group flex flex-col h-full relative">
      {/* Top Image Container */}
      <div className="h-52 w-full bg-[#FBF5EC] relative overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => onView(p)}>
        {mainImgUrl && !imgError ? (
          <img
            src={mainImgUrl}
            alt={p.name}
            className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[#5A4030]/60 gap-2">
            <FaImage size={32} />
            <span className="text-xs font-medium">No Image</span>
          </div>
        )}

        {/* Status Pill Badge */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {p.status === 'sold' ? (
            <span className="px-2.5 py-1 bg-rose-100/90 backdrop-blur-xs text-rose-800 text-xs font-bold rounded-full border border-rose-200 shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" /> Sold
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-emerald-100/90 backdrop-blur-xs text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Available
            </span>
          )}

          {p.condition && (
            <span className="px-2.5 py-1 bg-[#FDF8F0]/90 backdrop-blur-xs text-[#2D1B0E] text-xs font-semibold rounded-full border border-[#D4A373]/40 shadow-xs">
              {p.condition}
            </span>
          )}
        </div>

        {/* Owner Indicator */}
        {isOwn && (
          <span className="absolute top-3 right-3 px-2.5 py-1 bg-[#8B3A3A] text-white text-[10px] font-bold tracking-wider uppercase rounded-full shadow-md">
            My Listing
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-center justify-between text-xs text-[#E87A1E] font-semibold mb-1">
            <span className="truncate max-w-[70%]">{p.category || 'General'}</span>
            {p.city && (
              <span className="text-[#5A4030] flex items-center gap-1 shrink-0">
                <FaMapMarkerAlt size={10} className="text-[#E87A1E]" /> {p.city}
              </span>
            )}
          </div>

          <h3
            className="font-bold text-lg text-[#2D1B0E] group-hover:text-[#E87A1E] transition-colors line-clamp-1 cursor-pointer"
            onClick={() => onView(p)}
          >
            {p.name}
          </h3>

          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#8B3A3A]">₹{p.price}</span>
          </div>

          {p.description && (
            <p className="mt-1 text-xs text-[#5A4030] line-clamp-2 leading-relaxed">
              {p.description}
            </p>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-3 border-t border-[#E8D9C3]/60 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onView(p)}
              className="flex-1 py-2 px-3 bg-[#F9F1E5] hover:bg-[#E87A1E] text-[#2D1B0E] hover:text-white rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              View & Contact <FaChevronRight size={10} />
            </button>

            {p.contact_number && p.status !== 'sold' && (
              <a
                href={`https://wa.me/${p.contact_number.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Chat on WhatsApp"
                className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 rounded-xl text-xs transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
              >
                <FaWhatsapp size={16} />
              </a>
            )}
          </div>

          {/* Owner Quick Controls */}
          {isOwn && (
            <div className="flex items-center justify-between gap-1 mt-1 pt-2 border-t border-dashed border-[#D4A373]/30">
              <button
                onClick={() => onToggleSold(p)}
                className="px-2.5 py-1 text-[11px] font-semibold text-[#5A4030] hover:text-[#8B3A3A] bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition cursor-pointer"
              >
                {p.status === 'sold' ? 'Mark Available' : 'Mark Sold'}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(p)}
                  className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                  title="Edit product"
                >
                  <FaEdit size={13} />
                </button>
                <button
                  onClick={() => onDelete(p)}
                  className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Delete product"
                >
                  <FaTrash size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Store() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cityFilter, setCityFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'my'

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [reportProduct, setReportProduct] = useState(null);
  const [reportReason, setReportReason] = useState('inappropriate');
  const [reportDetails, setReportDetails] = useState('');

  // Form State
  const [formState, setFormState] = useState({
    name: '',
    category: 'Musical Instruments',
    price: '',
    city: '',
    state: '',
    condition: 'New',
    description: '',
    contact_number: '',
    main_image: null,
    additional_images: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Gallery preview index for detail modal
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [detailImgError, setDetailImgError] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (q) params.search = q;
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (cityFilter) params.city = cityFilter;
      const items = await api.storeList(params);
      setProducts(items || []);
    } catch (e) {
      console.error('Failed to fetch store products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const myListings = useMemo(() => {
    if (!user) return [];
    return products.filter((p) => String(p.seller_id) === String(user.id));
  }, [products, user]);

  const displayedProducts = useMemo(() => {
    let list = activeTab === 'my' ? myListings : products;
    if (q) {
      const query = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.city?.toLowerCase().includes(query)
      );
    }
    if (cityFilter) {
      const cityQ = cityFilter.toLowerCase();
      list = list.filter((p) => p.city?.toLowerCase().includes(cityQ));
    }
    return list;
  }, [products, myListings, activeTab, q, cityFilter]);

  const [showContributorNotice, setShowContributorNotice] = useState(false);

  const isContributorUser = useMemo(() => {
    if (!user) return false;
    return (
      user.role === 'admin' ||
      user.role === 'contributor' ||
      user.role === 'palkhi_pramukh' ||
      Boolean(user.is_contributor)
    );
  }, [user]);

  const handleOpenCreateModal = () => {
    if (!user) {
      showToast('Please log in to list an item for sale.');
      navigate(ROUTES.LOGIN, { state: { from: ROUTES.STORE } });
      return;
    }
    if (!isContributorUser) {
      setShowContributorNotice(true);
      return;
    }
    setEditingProduct(null);
    setFormState({
      name: '',
      category: 'Musical Instruments',
      price: '',
      city: user.city || '',
      state: user.state || 'Maharashtra',
      condition: 'New',
      description: '',
      contact_number: user.phone_number || '',
      main_image: null,
      additional_images: null,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setFormState({
      name: p.name || '',
      category: p.category || 'Musical Instruments',
      price: p.price || '',
      city: p.city || '',
      state: p.state || '',
      condition: p.condition || 'Used',
      description: p.description || '',
      contact_number: p.contact_number || '',
      main_image: null,
      additional_images: null,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('name', formState.name || '');
      fd.append('description', formState.description || '');
      fd.append('category', formState.category || 'Other Wari-related');
      fd.append('price', formState.price || 0);
      fd.append('city', formState.city || '');
      if (formState.state) fd.append('state', formState.state);
      if (formState.condition) fd.append('condition', formState.condition);
      if (formState.contact_number) fd.append('contact_number', formState.contact_number);
      if (formState.main_image) fd.append('main_image', formState.main_image);

      if (formState.additional_images) {
        for (let i = 0; i < formState.additional_images.length; i++) {
          fd.append('additional_images', formState.additional_images[i]);
        }
      }

      if (editingProduct) {
        await api.storeUpdate(editingProduct.id, fd);
        showToast('Listing updated successfully!');
      } else {
        await api.storeCreate(fd);
        showToast('Item listed successfully!');
      }

      setShowModal(false);
      setFormState({});
      setEditingProduct(null);
      await fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to save listing: ' + (err.message || 'Error occurred'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Are you sure you want to delete "${p.name}"?`)) return;
    try {
      await api.storeDelete(p.id);
      showToast('Listing removed.');
      if (detailProduct?.id === p.id) setDetailProduct(null);
      await fetchProducts();
    } catch (e) {
      console.error(e);
      alert('Failed to delete listing');
    }
  };

  const handleToggleSold = async (p) => {
    try {
      await api.storeMarkSold(p.id);
      showToast(p.status === 'sold' ? 'Marked as Available' : 'Marked as Sold');
      if (detailProduct?.id === p.id) {
        setDetailProduct((prev) => ({
          ...prev,
          status: prev.status === 'sold' ? 'available' : 'sold',
        }));
      }
      await fetchProducts();
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportProduct) return;
    try {
      await api.storeReport(reportProduct.id, {
        reason: reportReason,
        details: reportDetails,
      });
      showToast('Report submitted. Thank you for keeping the community safe!');
      setReportProduct(null);
      setReportDetails('');
    } catch (err) {
      console.error(err);
      alert('Failed to submit report');
    }
  };

  const handleOpenDetail = (p) => {
    setDetailProduct(p);
    setSelectedImageIndex(0);
    setDetailImgError(false);
  };

  const detailImages = useMemo(() => {
    if (!detailProduct) return [];
    const imgs = [];
    if (detailProduct.main_image) imgs.push(getImageUrl(detailProduct.main_image));
    if (Array.isArray(detailProduct.additional_images)) {
      detailProduct.additional_images.forEach((img) => {
        const url = getImageUrl(img);
        if (url) imgs.push(url);
      });
    }
    return imgs;
  }, [detailProduct]);

  return (
    <div className="min-h-screen bg-[#FDF8F0] pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2D1B0E] text-white px-5 py-3 rounded-2xl shadow-xl border border-[#D4A373]/40 flex items-center gap-3 animate-slide-up">
          <FaCheckCircle className="text-[#E87A1E]" size={18} />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner Header */}
      <section className="bg-gradient-to-b from-[#F9F1E5] via-[#FDF8F0] to-[#FDF8F0] border-b border-[#E8D9C3] pt-8 pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E87A1E]/10 border border-[#E87A1E]/30 rounded-full text-xs font-bold text-[#8B3A3A] uppercase tracking-wider mb-3">
              <FaStore size={12} /> Authentic Cultural Bazaar
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2D1B0E] tracking-tight">
              Wari Community Store
            </h1>
            <p className="mt-2 text-base text-[#5A4030] leading-relaxed">
              Discover, buy, and list traditional musical instruments (Pakhawaj, Taal, Veena), sacred books, handwritten manuscripts, and cultural attire directly from fellow Warkaris.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* Primary Action Button: List an Item */}
            <button
              onClick={handleOpenCreateModal}
              className="bg-[#E87A1E] hover:bg-[#C8521A] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <FaPlus size={14} /> + List an Item
            </button>

            {user && (
              <button
                onClick={() => setActiveTab(activeTab === 'my' ? 'all' : 'my')}
                className={`px-5 py-3 rounded-2xl font-semibold text-sm border transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'my'
                    ? 'bg-[#8B3A3A] text-white border-[#8B3A3A] shadow-xs'
                    : 'bg-white text-[#2D1B0E] border-[#E8D9C3] hover:border-[#E87A1E]'
                }`}
              >
                <FaTag size={13} /> {activeTab === 'my' ? 'Show All Products' : `My Listings (${myListings.length})`}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        {/* Search & Location Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8D9C3] shadow-warm flex flex-col md:flex-row gap-3 items-center">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A4030]/60" size={15} />
            <input
              type="text"
              placeholder="Search instruments, books, dresses, manuscripts..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-[#FBF5EC] border border-[#E8D9C3] rounded-xl text-sm font-medium text-[#2D1B0E] focus:outline-none focus:border-[#E87A1E] focus:bg-white transition"
            />
            {q && (
              <button
                onClick={() => setQ('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <FaTimes size={13} />
              </button>
            )}
          </div>

          {/* City Filter */}
          <div className="relative w-full md:w-56">
            <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E87A1E]" size={14} />
            <input
              type="text"
              placeholder="Filter by city (e.g. Pune)"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-3 bg-[#FBF5EC] border border-[#E8D9C3] rounded-xl text-sm font-medium text-[#2D1B0E] focus:outline-none focus:border-[#E87A1E] focus:bg-white transition"
            />
            {cityFilter && (
              <button
                onClick={() => setCityFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <FaTimes size={13} />
              </button>
            )}
          </div>

          {/* Search Refresh Action */}
          <button
            onClick={() => fetchProducts()}
            className="w-full md:w-auto px-5 py-3 bg-[#F9F1E5] hover:bg-[#E87A1E] text-[#2D1B0E] hover:text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-[#E8D9C3]"
          >
            <FaSync size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Category Pills */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#E87A1E] text-white shadow-md scale-102'
                    : 'bg-white text-[#2D1B0E] border border-[#E8D9C3] hover:border-[#E87A1E] hover:bg-orange-50/50'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-white' : 'text-[#E87A1E]'} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Active Tab Notice / Filter Counter */}
        <div className="mt-6 flex items-center justify-between border-b border-[#E8D9C3] pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#2D1B0E]">
              {activeTab === 'my' ? 'My Listed Items' : selectedCategory === 'All' ? 'All Community Listings' : selectedCategory}
            </h2>
            <span className="px-2.5 py-0.5 bg-[#E87A1E]/10 text-[#8B3A3A] font-bold text-xs rounded-full">
              {displayedProducts.length} {displayedProducts.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {(q || cityFilter || selectedCategory !== 'All' || activeTab === 'my') && (
            <button
              onClick={() => {
                setQ('');
                setCityFilter('');
                setSelectedCategory('All');
                setActiveTab('all');
              }}
              className="text-xs font-bold text-[#8B3A3A] hover:underline flex items-center gap-1"
            >
              Clear all filters <FaTimes size={10} />
            </button>
          )}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E8D9C3] p-4 h-80 animate-pulse flex flex-col justify-between">
                <div className="w-full h-44 bg-gray-200 rounded-xl" />
                <div className="space-y-2 mt-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E8D9C3] p-12 text-center mt-6 shadow-warm">
            <div className="w-16 h-16 bg-[#F9F1E5] rounded-full flex items-center justify-center mx-auto text-[#E87A1E] mb-4">
              <FaShoppingBag size={28} />
            </div>
            <h3 className="text-xl font-bold text-[#2D1B0E]">No products found</h3>
            <p className="mt-2 text-sm text-[#5A4030] max-w-md mx-auto">
              We couldn't find any items matching your criteria. Try adjusting your search query, location, or selected category.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setQ('');
                  setCityFilter('');
                  setSelectedCategory('All');
                  setActiveTab('all');
                }}
                className="px-5 py-2.5 bg-[#F9F1E5] text-[#2D1B0E] font-bold text-xs rounded-xl hover:bg-[#E87A1E] hover:text-white transition"
              >
                Reset Filters
              </button>
              <button
                onClick={handleOpenCreateModal}
                className="px-5 py-2.5 bg-[#E87A1E] text-white font-bold text-xs rounded-xl hover:bg-[#C8521A] transition flex items-center gap-1.5"
              >
                <FaPlus size={11} /> List the first item
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {displayedProducts.map((p) => (
              <ProductCard
                key={p.id}
                p={p}
                isOwn={user && String(p.seller_id) === String(user.id)}
                onView={handleOpenDetail}
                onEdit={handleOpenEditModal}
                onDelete={handleDelete}
                onToggleSold={handleToggleSold}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {detailProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-[#FDF8F0] rounded-3xl max-w-3xl w-full border border-[#E8D9C3] shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-white border-b border-[#E8D9C3] flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#E87A1E]/10 text-[#8B3A3A] text-xs font-bold rounded-full uppercase">
                  {detailProduct.category}
                </span>
                {detailProduct.status === 'sold' && (
                  <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full">
                    SOLD
                  </span>
                )}
              </div>
              <button
                onClick={() => setDetailProduct(null)}
                className="p-2 text-gray-400 hover:text-[#2D1B0E] rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Image Preview & Thumbnails */}
              {detailImages.length > 0 && !detailImgError ? (
                <div className="space-y-3">
                  <div className="h-72 w-full bg-[#FBF5EC] rounded-2xl overflow-hidden border border-[#E8D9C3] flex items-center justify-center relative">
                    <img
                      src={detailImages[selectedImageIndex] || detailImages[0]}
                      alt={detailProduct.name}
                      className="object-contain h-full w-full"
                      onError={() => setDetailImgError(true)}
                    />
                  </div>
                  {detailImages.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {detailImages.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                            selectedImageIndex === idx ? 'border-[#E87A1E] ring-2 ring-[#E87A1E]/30' : 'border-[#E8D9C3] opacity-70'
                          }`}
                        >
                          <img src={imgUrl} alt="Thumbnail" className="object-cover w-full h-full" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-48 w-full bg-[#FBF5EC] rounded-2xl border border-[#E8D9C3] flex items-center justify-center text-gray-400">
                  <FaImage size={40} />
                </div>
              )}

              {/* Title & Price Header */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#E8D9C3]/60 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#2D1B0E]">{detailProduct.name}</h2>
                  <div className="mt-1 flex items-center gap-3 text-xs text-[#5A4030]">
                    {detailProduct.city && (
                      <span className="flex items-center gap-1 font-semibold">
                        <FaMapMarkerAlt className="text-[#E87A1E]" /> {detailProduct.city}
                        {detailProduct.state ? `, ${detailProduct.state}` : ''}
                      </span>
                    )}
                    {detailProduct.condition && (
                      <span className="px-2 py-0.5 bg-white border border-[#D4A373]/40 rounded-md font-semibold">
                        Condition: {detailProduct.condition}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-[#8B3A3A] shrink-0">
                  ₹{detailProduct.price}
                </div>
              </div>

              {/* Product Description */}
              <div>
                <h4 className="text-xs font-bold text-[#5A4030] uppercase tracking-wider mb-2">Description</h4>
                <div className="bg-white p-4 rounded-2xl border border-[#E8D9C3]/70 text-sm text-[#2D1B0E] leading-relaxed whitespace-pre-line">
                  {detailProduct.description || 'No additional description provided by the seller.'}
                </div>
              </div>

              {/* Seller Contact Box */}
              <div className="bg-[#F9F1E5] p-5 rounded-2xl border border-[#E8D9C3] space-y-3">
                <h4 className="text-sm font-bold text-[#8B3A3A] flex items-center gap-2">
                  <FaPhoneAlt size={13} /> Seller Contact Details
                </h4>

                <div className="flex flex-wrap items-center gap-3">
                  {detailProduct.contact_number ? (
                    <>
                      <a
                        href={`tel:${detailProduct.contact_number}`}
                        className="px-4 py-2.5 bg-[#8B3A3A] text-white rounded-xl text-xs font-bold hover:bg-[#6b2c2c] transition flex items-center gap-2"
                      >
                        <FaPhoneAlt size={12} /> Call: {detailProduct.contact_number}
                      </a>
                      <a
                        href={`https://wa.me/${detailProduct.contact_number.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-2"
                      >
                        <FaWhatsapp size={15} /> WhatsApp Seller
                      </a>
                    </>
                  ) : (
                    <span className="text-xs text-[#5A4030] italic">
                      Contact number not explicitly listed. Please connect through Wari community channels.
                    </span>
                  )}

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('Listing link copied to clipboard!');
                    }}
                    className="px-3 py-2.5 bg-white border border-[#D4A373]/50 text-[#2D1B0E] rounded-xl text-xs font-semibold hover:border-[#E87A1E] transition flex items-center gap-1.5 ml-auto"
                  >
                    <FaShareAlt size={12} /> Share
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 bg-white border-t border-[#E8D9C3] flex items-center justify-between">
              <button
                onClick={() => setReportProduct(detailProduct)}
                className="text-xs font-semibold text-gray-500 hover:text-rose-700 transition flex items-center gap-1"
              >
                <FaExclamationTriangle size={12} /> Report Listing
              </button>

              <div className="flex items-center gap-2">
                {user && String(detailProduct.seller_id) === String(user.id) && (
                  <>
                    <button
                      onClick={() => {
                        const p = detailProduct;
                        setDetailProduct(null);
                        handleOpenEditModal(p);
                      }}
                      className="px-4 py-2 bg-amber-100 text-amber-900 rounded-xl text-xs font-bold hover:bg-amber-200 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(detailProduct)}
                      className="px-4 py-2 bg-rose-100 text-rose-800 rounded-xl text-xs font-bold hover:bg-rose-200 transition"
                    >
                      Delete
                    </button>
                  </>
                )}
                <button
                  onClick={() => setDetailProduct(null)}
                  className="px-5 py-2 bg-[#2D1B0E] text-white rounded-xl text-xs font-bold hover:bg-[#8B3A3A] transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List / Edit Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-[#FDF8F0] rounded-3xl max-w-xl w-full border border-[#E8D9C3] shadow-2xl overflow-hidden flex flex-col my-8"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-white border-b border-[#E8D9C3] flex items-center justify-between sticky top-0 z-10">
              <h3 className="font-extrabold text-lg text-[#2D1B0E]">
                {editingProduct ? 'Edit Product Listing' : 'List an Item for Sale'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-[#2D1B0E] rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Modal Inputs */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-[#5A4030] uppercase mb-1">
                  Product Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Wooden Pakhawaj, Sant Tukaram Gatha, Taal"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full p-3 bg-white border border-[#E8D9C3] rounded-xl text-sm font-medium focus:outline-none focus:border-[#E87A1E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5A4030] uppercase mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    className="w-full p-3 bg-white border border-[#E8D9C3] rounded-xl text-sm font-medium focus:outline-none focus:border-[#E87A1E]"
                  >
                    <option value="Musical Instruments">Musical Instruments</option>
                    <option value="Books & Literature">Books & Literature</option>
                    <option value="Manuscripts & Reproductions">Manuscripts & Reproductions</option>
                    <option value="Traditional & Cultural Items">Traditional & Cultural Items</option>
                    <option value="Handcrafted Products">Handcrafted Products</option>
                    <option value="Wari Accessories">Wari Accessories</option>
                    <option value="Other Wari-related">Other Wari-related</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5A4030] uppercase mb-1">
                    Price (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formState.price}
                    onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                    className="w-full p-3 bg-white border border-[#E8D9C3] rounded-xl text-sm font-medium focus:outline-none focus:border-[#E87A1E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5A4030] uppercase mb-1">
                    City *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Pune"
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    className="w-full p-3 bg-white border border-[#E8D9C3] rounded-xl text-sm font-medium focus:outline-none focus:border-[#E87A1E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5A4030] uppercase mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="Maharashtra"
                    value={formState.state}
                    onChange={(e) => setFormState({ ...formState, state: e.target.value })}
                    className="w-full p-3 bg-white border border-[#E8D9C3] rounded-xl text-sm font-medium focus:outline-none focus:border-[#E87A1E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5A4030] uppercase mb-1">
                    Condition
                  </label>
                  <select
                    value={formState.condition}
                    onChange={(e) => setFormState({ ...formState, condition: e.target.value })}
                    className="w-full p-3 bg-white border border-[#E8D9C3] rounded-xl text-sm font-medium focus:outline-none focus:border-[#E87A1E]"
                  >
                    <option value="New">New</option>
                    <option value="Used - Like New">Used - Like New</option>
                    <option value="Used - Good">Used - Good</option>
                    <option value="Handmade">Handmade</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A4030] uppercase mb-1">
                  Contact Number (WhatsApp/Phone)
                </label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={formState.contact_number}
                  onChange={(e) => setFormState({ ...formState, contact_number: e.target.value })}
                  className="w-full p-3 bg-white border border-[#E8D9C3] rounded-xl text-sm font-medium focus:outline-none focus:border-[#E87A1E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A4030] uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide details about condition, origin, specifications, or pickup arrangements..."
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full p-3 bg-white border border-[#E8D9C3] rounded-xl text-sm font-medium focus:outline-none focus:border-[#E87A1E]"
                />
              </div>

              {/* Image Upload Inputs */}
              <div className="space-y-3 pt-2 border-t border-[#E8D9C3]">
                <div>
                  <label className="block text-xs font-bold text-[#5A4030] uppercase mb-1">
                    Main Cover Image {!editingProduct && '*'}
                  </label>
                  <input
                    required={!editingProduct}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormState({ ...formState, main_image: e.target.files[0] })}
                    className="w-full text-xs text-[#5A4030] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#F9F1E5] file:text-[#8B3A3A] hover:file:bg-[#E87A1E] hover:file:text-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5A4030] uppercase mb-1">
                    Additional Gallery Images (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setFormState({ ...formState, additional_images: e.target.files })}
                    className="w-full text-xs text-[#5A4030] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#F9F1E5] file:text-[#2D1B0E] hover:file:bg-[#E87A1E] hover:file:text-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-white border-t border-[#E8D9C3] flex items-center justify-end gap-3 sticky bottom-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#E87A1E] hover:bg-[#C8521A] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <FaSync className="animate-spin" size={12} /> Saving...
                  </>
                ) : editingProduct ? (
                  'Save Changes'
                ) : (
                  'Publish Item'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Report Modal */}
      {reportProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form
            onSubmit={handleReportSubmit}
            className="bg-white rounded-3xl max-w-md w-full border border-[#E8D9C3] shadow-2xl p-6 space-y-4"
          >
            <h3 className="text-lg font-bold text-[#2D1B0E] flex items-center gap-2">
              <FaExclamationTriangle className="text-rose-600" /> Report Product Listing
            </h3>
            <p className="text-xs text-[#5A4030]">
              Reporting "{reportProduct.name}". Please select the reason for reporting this item.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#5A4030] uppercase mb-1">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-2.5 bg-[#FBF5EC] border border-[#E8D9C3] rounded-xl text-xs font-semibold"
              >
                <option value="inappropriate">Inappropriate or prohibited content</option>
                <option value="scam">Suspected scam or fake listing</option>
                <option value="misleading">Misleading information or images</option>
                <option value="duplicate">Duplicate listing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A4030] uppercase mb-1">Details (Optional)</label>
              <textarea
                rows={3}
                placeholder="Explain why this listing is being reported..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                className="w-full p-2.5 bg-[#FBF5EC] border border-[#E8D9C3] rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReportProduct(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contributor Access Notice Modal */}
      {showContributorNotice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#E8D9C3] shadow-2xl p-6 space-y-4 text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-800">
              <FaExclamationTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#2D1B0E]">Contributor Access Required</h3>
            <p className="text-sm text-[#5A4030] leading-relaxed">
              Only verified <strong>Contributors</strong>, <strong>Palkhi Pramukhs</strong>, or <strong>Admins</strong> are authorized to list products for sale in the Wari Store. Regular users can browse items and contact sellers.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowContributorNotice(false);
                  navigate(ROUTES.APPLY_CONTRIBUTOR);
                }}
                className="w-full py-3 bg-[#E87A1E] hover:bg-[#C8521A] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Apply to Become a Contributor
              </button>
              <button
                onClick={() => setShowContributorNotice(false)}
                className="w-full py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
