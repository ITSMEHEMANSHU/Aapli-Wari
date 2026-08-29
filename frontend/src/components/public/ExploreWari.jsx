import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiVideo, FiImage, FiSearch, FiEye, FiX, FiHeart } from 'react-icons/fi';

import Button from '../common/Button';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { api } from '../../services/api';

const LIMIT = 20;

// 🎨 Wari Heritage palette — social media focused icons
const TYPE_ICONS = {
  video: <FiVideo className="text-[#8B3A3A]" />,
  image: <FiImage className="text-[#8B3A3A]" />,
};

const FILTERS = [
  { id: 'all', label: 'Discover', icon: FiSearch },
  { id: 'image', label: 'Photos', icon: FiImage },
  { id: 'video', label: 'Reels', icon: FiVideo },
];

function getStatusBadge(status, verified) {
  // Simplified for social media - only show verified or processing
  if (status === 'processing') return <Badge variant="warning" className="bg-[#D4A373]/20 text-[#8B3A3A] border border-[#D4A373]/40 text-xs">⏳</Badge>;
  if (verified) return <Badge variant="success" className="bg-[#2D6A4F]/20 text-[#2D6A4F] border border-[#2D6A4F]/30 text-xs">✓</Badge>;
  return null;
}

function MediaPreview({ item }) {
  const [imgError, setImgError] = useState(false);

  if (item.content_type === 'video' && item.file_url) {
    return (
      <div className="relative w-full aspect-[9/16] bg-black rounded-[12px] overflow-hidden mb-0 group">
        <video
          src={item.file_url}
          className="w-full h-full object-cover"
          preload="metadata"
          muted
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <div className="text-white/0 group-hover:text-white/80 transition-all">▶</div>
        </div>
        {item.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-semibold">
            {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
          </div>
        )}
      </div>
    );
  }

  if (item.content_type === 'image' && item.file_url && !imgError) {
    return (
      <img
        src={item.file_url}
        alt={item.title}
        className="w-full aspect-square object-cover rounded-[12px] mb-0 group-hover:brightness-95 transition-all duration-300"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="w-full aspect-square rounded-[12px] mb-0 bg-[#FDF8F0] flex items-center justify-center text-4xl">
      {item.content_type === 'video' ? '🎬' : '🖼️'}
    </div>
  );
}

export const ExploreWari = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlSearch = searchParams.get('search') || '';
  const [filter, setFilter] = useState('all');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchContent = useCallback(async (reset = true) => {
    const currentOffset = reset ? 0 : offset;
    reset ? setLoading(true) : setLoadingMore(true);
    setError(null);

    const cleanedQuery = urlSearch?.trim() || '';
    const useSemanticSearch = cleanedQuery.length >= 2;

    try {
      const params = {
        verified_only: true,
        limit: LIMIT,
        offset: currentOffset,
        exclude_short: false, // Include reels
      };

      // Only fetch images and short videos
      if (filter === 'video') {
        params.content_type = 'video';
        params.max_duration = 120; // 2 minutes max
      } else if (filter === 'image') {
        params.content_type = 'image';
      } else {
        // For 'all', request both but filter on client
        params.content_type = ['image', 'video'];
      }

      let data;
      let items = [];

      if (useSemanticSearch) {
        data = await api.search({
          ...params,
          q: cleanedQuery,
        });
        items = (data?.results || []).filter(item => {
          // Client-side filter: only images and short videos
          if (item.content_type !== 'image' && item.content_type !== 'video') return false;
          if (item.content_type === 'video' && item.duration && item.duration > 120) return false;
          return true;
        });
      } else {
        if (cleanedQuery) {
          params.search = cleanedQuery;
        }
        data = await api.contentList(params);
        items = (Array.isArray(data) ? data : []).filter(item => {
          // Client-side filter: only images and short videos
          if (item.content_type !== 'image' && item.content_type !== 'video') return false;
          if (item.content_type === 'video' && item.duration && item.duration > 120) return false;
          return true;
        });
      }

      if (reset) {
        setContent(items);
        setOffset(LIMIT);
      } else {
        setContent(prev => [...prev, ...items]);
        setOffset(currentOffset + LIMIT);
      }

      setHasMore(items.length === LIMIT);
    } catch (err) {
      console.error('[Explore] Fetch failed:', err);
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter, urlSearch, offset]);

  // Reset and fetch when filter or search changes
  useEffect(() => {
    setOffset(0);
    setContent([]);
    fetchContent(true);
  }, [filter, urlSearch]);

  const handleClearSearch = () => {
    setSearchParams({});
  };

  if (error && !loading) {
    return (
      <div className="bg-white px-3 sm:px-6 py-4 sm:py-6 rounded-[12px]">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-[#2D1B0E] mb-2">Oops! Something went wrong</h3>
          <p className="text-[#5A4030] mb-6">{error}</p>
          <Button
            variant="primary"
            className="rounded-full bg-[#8B3A3A] hover:bg-[#7a3232] text-white"
            onClick={() => fetchContent(true)}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF] px-3 sm:px-6 py-4 sm:py-6 rounded-[12px]">
      {/* Local keyframes for fade-in / slide-up and shimmer — styling only */}
      <style>{`
        @keyframes wariFadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes wariShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .wari-card-enter {
          animation: wariFadeSlideUp 0.5s ease-out both;
        }
        .wari-load-more:hover {
          background-position: right center;
        }
      `}</style>

      {/* Header - Minimal and Social Media Focused */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2D1B0E]">
            {urlSearch ? `"${urlSearch}"` : 'Discover'}
          </h1>
          <p className="text-[#5A4030] text-xs sm:text-sm mt-1">
            {content.length > 0 && `${content.length}+ posts`}
          </p>
        </div>
        {urlSearch && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSearch}
            className="flex items-center gap-1 rounded-full border-[#D4A373] text-[#8B3A3A] hover:bg-[#D4A373]/10"
          >
            <FiX size={14} /> Clear
          </Button>
        )}
      </div>

      {/* Type filters - Social Media Style Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {FILTERS.map(f => (
          <Button
            key={f.id}
            variant={filter === f.id ? 'primary' : 'ghost'}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${filter === f.id
                ? 'bg-[#8B3A3A] text-[#FDF8F0] shadow-[0_4px_20px_rgba(139,58,58,0.08)]'
                : 'bg-[#FDF8F0] text-[#5A4030] border border-[#D4A373]/40 hover:bg-[#D4A373]/5'
              }`}
            size="sm"
          >
            <f.icon size={16} /> {f.label}
          </Button>
        ))}
      </div>

      {/* Content Grid - Social Media Masonry Style */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="aspect-square bg-[#FDF8F0] rounded-[12px] animate-pulse" />
          ))}
        </div>
      ) : content.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-xl font-bold text-[#2D1B0E] mb-2">
            {urlSearch ? `No posts for "${urlSearch}"` : 'No posts yet'}
          </h3>
          <p className="text-[#5A4030] mb-6">
            {filter === 'video' ? 'Be the first to share a Reel!' : 'Be the first to share a photo!'}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            {urlSearch && (
              <Button
                variant="outline"
                onClick={handleClearSearch}
                className="rounded-full border-[#D4A373] text-[#8B3A3A] hover:bg-[#D4A373]/10"
              >
                Browse All
              </Button>
            )}
            <Link to={filter !== 'all' ? `/contribute?type=${filter}` : '/contribute'}>
              <Button
                variant="primary"
                className="rounded-full bg-[#8B3A3A] hover:bg-[#7a3232] text-[#FDF8F0] shadow-[0_4px_20px_rgba(139,58,58,0.08)]"
              >
                {filter === 'video' ? 'Share Reel' : 'Share Photo'}
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Responsive Grid: 2 cols mobile → 3 cols tablet → 4 cols desktop (Instagram/Pinterest style) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {content.map((item, idx) => (
              <Link key={item.id} to={`/content/${item.id}`} className="block group">
                <div className="wari-card-enter relative w-full aspect-square overflow-hidden rounded-[12px] bg-black" style={{ animationDelay: `${Math.min(idx, 12) * 50}ms` }}>
                  {/* Media Content */}
                  <div className="relative w-full h-full">
                    <MediaPreview item={item} />
                  </div>

                  {/* Overlay on Hover - Social Media Engagement */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-3 sm:p-4">

                    {/* Top: Content Type Badge */}
                    <div className="flex justify-between items-start">
                      <Badge variant="default" className="bg-[#8B3A3A] text-white text-xs rounded-full px-2 py-1">
                        {item.content_type === 'video' ? '🎬 Reel' : '📷 Photo'}
                      </Badge>
                      {getStatusBadge(item.status, item.verified)}
                    </div>

                    {/* Bottom: Engagement & Title */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-sm text-white line-clamp-2">{item.title}</h3>
                      <div className="flex items-center justify-between text-xs text-white/80">
                        <span className="flex items-center gap-1">
                          <FiHeart size={14} /> {item.likes_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiEye size={14} /> {item.views_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Video Duration Badge */}
                  {item.content_type === 'video' && item.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-semibold z-10">
                      {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Load More Button - Social Media Style */}
          {hasMore && (
            <div className="flex justify-center mt-8 sm:mt-12">
              <Button
                onClick={() => fetchContent(false)}
                disabled={loadingMore}
                className="rounded-full px-8 py-3 text-[#FDF8F0] font-semibold border-none shadow-[0_4px_20px_rgba(139,58,58,0.08)] transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #8B3A3A 0%, #D4A373 50%, #8B3A3A 100%)',
                  backgroundSize: '200% auto',
                }}
              >
                {loadingMore ? '⏳ Loading...' : '📱 Load More Posts'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};


export default ExploreWari;