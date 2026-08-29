import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  FiVideo, FiImage, FiSearch, FiEye, FiX, 
  FiPlay, FiHeart, FiMessageCircle, FiShare2, 
  FiBookmark, FiVolume2, FiVolumeX, FiArrowLeft,
  FiChevronUp, FiChevronDown
} from 'react-icons/fi';

import Button from '../common/Button';
import { api } from '../../services/api';

const LIMIT = 20;
const MAX_VIDEO_DURATION_SECONDS = 120; // Strictly less than 2 mins

const MEDIA_FILTERS = [
  { id: 'all', label: 'All Visuals', icon: FiSearch },
  { id: 'reels', label: 'Short Videos', icon: FiVideo },
  { id: 'posts', label: 'Photos & Posts', icon: FiImage },
];

function ReelCard({ item, onOpenMedia, index }) {
  const [imgError, setImgError] = useState(false);
  const isVideo = item.content_type === 'video';

  return (
    <div 
      onClick={() => onOpenMedia(index)}
      className="wari-card-enter group relative aspect-[9/16] w-full rounded-2xl overflow-hidden bg-[#1A0E07] border border-[#4A3222]/40 shadow-lg cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-[#DD6B35]/60"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      {/* Media Content */}
      {isVideo && item.file_url ? (
        <video
          src={item.file_url}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          preload="metadata"
          muted
        />
      ) : item.file_url && !imgError ? (
        <img
          loading="lazy"
          src={item.file_url}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full bg-[#2D1B0E] flex flex-col items-center justify-center p-4 text-center">
          <FiImage className="text-4xl text-[#E8D9C3]/40 mb-2" />
          <p className="text-xs text-[#E8D9C3]/80 font-medium line-clamp-2">{item.title}</p>
        </div>
      )}

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85 pointer-events-none" />

      {/* Top Overlay Badge */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
          {isVideo ? <FiVideo size={12} className="text-[#DD6B35]" /> : <FiImage size={12} className="text-[#DD6B35]" />}
          <span>{isVideo ? 'Short' : 'Photo'}</span>
        </span>
        
        {item.duration && isVideo && (
          <span className="px-2 py-0.5 rounded-full bg-black/50 text-white/90 text-[10px] font-semibold backdrop-blur-md">
            {Math.floor(item.duration / 60)}:{String(Math.floor(item.duration % 60)).padStart(2, '0')}
          </span>
        )}
      </div>

      {/* Play Hover Overlay */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="w-12 h-12 rounded-full bg-[#DD6B35]/90 text-white flex items-center justify-center shadow-lg backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-transform">
            <FiPlay size={22} className="ml-1" />
          </div>
        </div>
      )}

      {/* Bottom Info Overlay */}
      <div className="absolute bottom-0 inset-x-0 p-3.5 z-10 flex flex-col justify-end">
        <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 drop-shadow-md mb-1.5">
          {item.title}
        </h3>
        
        <div className="flex items-center justify-between text-[11px] text-[#E8D9C3]/80 font-medium">
          <span className="flex items-center gap-1 font-semibold text-white/90">
            <FiEye size={13} className="text-[#DD6B35]" /> 
            {item.views_count ?? item.views ?? 0}
          </span>
          <span>
            {new Date(item.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
}

// 📱 Fullscreen Swipeable Reels Modal (Instagram / YT Shorts Style)
function MediaModal({ items, activeIndex, onClose, onNavigate, onIncrementView }) {
  const currentItem = items[activeIndex];
  const videoRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [slideDirection, setSlideDirection] = useState('');

  // Swipe & Scroll Tracking Refs
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const isTransitioning = useRef(false);

  // View counter tracking trigger
  useEffect(() => {
    if (currentItem?.id) {
      onIncrementView(currentItem.id);
    }
    setIsPlaying(true);
    setLiked(false);
    setSaved(false);
  }, [activeIndex, currentItem?.id]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const goToNext = useCallback(() => {
    if (activeIndex < items.length - 1 && !isTransitioning.current) {
      isTransitioning.current = true;
      setSlideDirection('up');
      onNavigate(activeIndex + 1);
      setTimeout(() => { isTransitioning.current = false; }, 400);
    }
  }, [activeIndex, items.length, onNavigate]);

  const goToPrev = useCallback(() => {
    if (activeIndex > 0 && !isTransitioning.current) {
      isTransitioning.current = true;
      setSlideDirection('down');
      onNavigate(activeIndex - 1);
      setTimeout(() => { isTransitioning.current = false; }, 400);
    }
  }, [activeIndex, onNavigate]);

  // Keyboard Event Listeners (Arrow Keys, Spacebar, Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, onClose, isPlaying]);

  // Touch Swipe Handlers (Mobile Touchscreens)
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartY.current - touchEndY.current;
    const minSwipeThreshold = 40;

    if (swipeDistance > minSwipeThreshold) {
      goToNext();
    } else if (swipeDistance < -minSwipeThreshold) {
      goToPrev();
    }
    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  // Mouse Wheel & Laptop Touchpad Scroll Handler
  const handleWheel = (e) => {
    if (isTransitioning.current) return;

    if (e.deltaY > 25) {
      goToNext();
    } else if (e.deltaY < -25) {
      goToPrev();
    }
  };

  if (!currentItem) return null;
  const isVideo = currentItem.content_type === 'video';

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center select-none"
      onWheel={handleWheel}
    >
      {/* Top Header */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors"
        >
          <FiArrowLeft size={20} />
        </button>
        <span className="text-white font-bold text-sm tracking-wide">
          {isVideo ? 'Reel' : 'Post'} {activeIndex + 1} of {items.length}
        </span>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Main Viewport */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full max-w-sm h-full max-h-[92vh] aspect-[9/16] bg-black sm:rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl border border-white/10 touch-pan-y"
      >
        <div 
          key={currentItem.id}
          className={`w-full h-full relative ${
            slideDirection === 'up' ? 'animate-slide-up' : slideDirection === 'down' ? 'animate-slide-down' : ''
          }`}
        >
          {isVideo && currentItem.file_url ? (
            <video
              ref={videoRef}
              src={currentItem.file_url}
              className="w-full h-full object-cover cursor-pointer"
              autoPlay
              loop
              muted={isMuted}
              onClick={togglePlay}
            />
          ) : (
            <img
              src={currentItem.file_url}
              alt={currentItem.title}
              className="w-full h-full object-cover"
            />
          )}

          {/* Pause Indicator */}
          {isVideo && !isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm">
                <FiPlay size={32} className="ml-1" />
              </div>
            </div>
          )}

          {/* Dark Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />

          {/* Right Action Bar */}
          <div className="absolute right-3 bottom-20 z-30 flex flex-col items-center gap-5 text-white">
            <button 
              onClick={() => setLiked(!liked)} 
              className="flex flex-col items-center gap-1 group"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${liked ? 'bg-red-500/20 text-red-500 scale-110' : 'bg-black/40 text-white hover:bg-black/60'}`}>
                <FiHeart size={22} className={liked ? 'fill-red-500' : ''} />
              </div>
              <span className="text-[11px] font-semibold">{currentItem.likes_count ?? 0}</span>
            </button>

            <button className="flex flex-col items-center gap-1 group">
              <div className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all">
                <FiMessageCircle size={22} />
              </div>
              <span className="text-[11px] font-semibold">{currentItem.comments_count ?? 0}</span>
            </button>

            <button className="flex flex-col items-center gap-1 group">
              <div className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all">
                <FiShare2 size={20} />
              </div>
              <span className="text-[11px] font-semibold">Share</span>
            </button>

            <button 
              onClick={() => setSaved(!saved)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${saved ? 'bg-[#DD6B35]/20 text-[#DD6B35]' : 'bg-black/40 text-white hover:bg-black/60'}`}>
                <FiBookmark size={20} className={saved ? 'fill-[#DD6B35]' : ''} />
              </div>
            </button>

            {isVideo && (
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all"
              >
                {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
              </button>
            )}
          </div>

          {/* Bottom Info */}
          <div className="absolute left-4 right-16 bottom-6 z-30 text-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#DD6B35] text-white flex items-center justify-center font-bold text-xs border border-white/20">
                W
              </div>
              <span className="font-bold text-sm tracking-wide text-white">Aapli Wari</span>
              <span className="text-[11px] font-medium text-white/80 flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full">
                <FiEye size={12} className="text-[#DD6B35]" /> {currentItem.views_count ?? currentItem.views ?? 0} views
              </span>
            </div>

            <p className="text-sm text-white/95 line-clamp-2 leading-snug mb-1 font-normal">
              {currentItem.title}
            </p>
          </div>
        </div>

        {/* Desktop Controls */}
        {activeIndex > 0 && (
          <button
            onClick={goToPrev}
            className="hidden sm:flex absolute right-4 top-4 z-40 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white items-center justify-center backdrop-blur-md transition-all"
          >
            <FiChevronUp size={24} />
          </button>
        )}
        {activeIndex < items.length - 1 && (
          <button
            onClick={goToNext}
            className="hidden sm:flex absolute right-4 bottom-4 z-40 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white items-center justify-center backdrop-blur-md transition-all animate-bounce"
          >
            <FiChevronDown size={24} />
          </button>
        )}
      </div>
    </div>
  );
}

export const ExploreWari = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [filter, setFilter] = useState('all');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeMediaIndex, setActiveMediaIndex] = useState(null);

  const fetchContent = useCallback(async (reset = true) => {
    const currentOffset = reset ? 0 : offset;
    reset ? setLoading(true) : setLoadingMore(true);

    try {
      const params = {
        verified_only: true,
        limit: LIMIT,
        offset: currentOffset,
        max_duration: MAX_VIDEO_DURATION_SECONDS,
      };

      // Map tab IDs ('reels', 'posts') to backend values ('video', 'image')
      if (filter === 'all') {
        params.allowed_types = ['video', 'image'];
      } else if (filter === 'reels') {
        params.content_type = 'video';
      } else if (filter === 'posts') {
        params.content_type = 'image';
      }

      if (urlSearch?.trim()) {
        params.search = urlSearch.trim();
      }

      const response = await api.contentList(params);
      let items = Array.isArray(response) ? response : response?.results || [];

      // Fallback filtering to verify exact types
      items = items.filter(item => {
        if (filter === 'posts' || filter === 'all') {
          if (item.content_type === 'image') return true;
        }
        if (filter === 'reels' || filter === 'all') {
          if (item.content_type === 'video') {
            return !item.duration || item.duration <= MAX_VIDEO_DURATION_SECONDS;
          }
        }
        return false;
      });

      setHasMore(items.length === LIMIT);

      if (reset) {
        setContent(items);
        setOffset(LIMIT);
      } else {
        setContent(prev => [...prev, ...items]);
        setOffset(currentOffset + LIMIT);
      }
    } catch (err) {
      console.error('[Explore] Fetch error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter, urlSearch, offset]);

  useEffect(() => {
    setOffset(0);
    setContent([]);
    fetchContent(true);
  }, [filter, urlSearch]);

  const handleIncrementView = async (id) => {
    try {
      if (api.trackView) {
        await api.trackView(id);
      } else if (api.recordView) {
        await api.recordView(id);
      }
      
      setContent(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, views_count: (item.views_count ?? item.views ?? 0) + 1 }
            : item
        )
      );
    } catch (err) {
      console.error('Failed to update view count:', err);
    }
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen px-3 sm:px-6 py-4 sm:py-6 rounded-2xl">
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0.5; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0.5; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.35s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .animate-slide-down {
          animation: slideDown 0.35s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2 border-b border-[#E8D9C3]/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2D1B0E]">
            {urlSearch ? `Visuals for "${urlSearch}"` : 'Wari Visual Feed'}
          </h1>
        </div>
        {urlSearch && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchParams({})}
            className="flex items-center gap-1 rounded-full border-[#DD6B35] text-[#DD6B35]"
          >
            <FiX size={14} /> Clear search
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
        {MEDIA_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shrink-0 select-none ${
              filter === f.id
                ? 'bg-[#DD6B35] text-[#FFFFFF] shadow-md'
                : 'bg-[#FFFFFF] text-[#5A4030] border border-[#E8D9C3] hover:border-[#DD6B35]/40 hover:bg-[#FBF5EC]'
            }`}
          >
            <f.icon size={14} /> {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="aspect-[9/16] w-full bg-[#E8D9C3]/30 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : content.length === 0 ? (
        <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#E8D9C3]/60">
          <div className="text-5xl mb-3">🎥</div>
          <h3 className="text-base font-bold text-[#2D1B0E]">No videos or photos found</h3>
          <p className="text-[#5A4030]/80 text-xs mt-1">Be the first to share a short video or photo post!</p>
          <div className="mt-5">
            <Link to="/contribute">
              <Button variant="primary" className="rounded-full bg-[#DD6B35] text-[#FFFFFF] font-bold text-xs px-6 py-2.5">
                Upload Post / Video
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {content.map((item, idx) => (
              <ReelCard
                key={item.id}
                item={item}
                index={idx}
                onOpenMedia={(index) => setActiveMediaIndex(index)}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => fetchContent(false)}
                disabled={loadingMore}
                className="px-8 py-3 rounded-full bg-[#DD6B35] text-[#FFFFFF] text-xs font-extrabold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-60"
              >
                {loadingMore ? 'Loading More...' : 'Load More Visuals'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Fullscreen Media Modal */}
      {activeMediaIndex !== null && (
        <MediaModal
          items={content}
          activeIndex={activeMediaIndex}
          onClose={() => setActiveMediaIndex(null)}
          onNavigate={(newIndex) => setActiveMediaIndex(newIndex)}
          onIncrementView={handleIncrementView}
        />
      )}
    </div>
  );
};

export default ExploreWari;