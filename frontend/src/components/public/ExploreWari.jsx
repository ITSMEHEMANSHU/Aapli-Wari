import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiVideo, FiImage, FiMusic, FiFile, FiSearch, FiEye, FiX } from 'react-icons/fi';

import Button from '../common/Button';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { api } from '../../services/api';

const LIMIT = 20;

// 🎨 Wari Heritage palette — deep terracotta icons instead of generic orange
const TYPE_ICONS = {
  video: <FiVideo className="text-[#8B3A3A]" />,
  image: <FiImage className="text-[#8B3A3A]" />,
  audio: <FiMusic className="text-[#8B3A3A]" />,
  pdf: <FiFile className="text-[#8B3A3A]" />,
  manuscript: <FiFile className="text-[#8B3A3A]" />,
  story: <FiFile className="text-[#8B3A3A]" />,
};

const FILTERS = [
  { id: 'all', label: 'All', icon: FiSearch },
  { id: 'image', label: 'Images', icon: FiImage },
  { id: 'video', label: 'Videos', icon: FiVideo },
  { id: 'audio', label: 'Audio', icon: FiMusic },
  { id: 'pdf', label: 'Documents', icon: FiFile },
  { id: 'story', label: 'Stories', icon: FiFile },
];

function getStatusBadge(status, verified) {
  // Logic unchanged — only the visual variant/classNames are themed
  if (status === 'processing') return <Badge variant="warning" className="bg-[#D4A373]/20 text-[#8B3A3A] border border-[#D4A373]/40">⏳ Processing</Badge>;
  if (status === 'pending_review') return <Badge variant="warning" className="bg-[#D4A373]/20 text-[#8B3A3A] border border-[#D4A373]/40">⏳ Review</Badge>;
  if (status === 'rejected') return <Badge variant="danger" className="bg-[#8B3A3A]/10 text-[#8B3A3A] border border-[#8B3A3A]/30">Rejected</Badge>;
  if (verified) return <Badge variant="success" className="bg-[#2D6A4F]/10 text-[#2D6A4F] border border-[#2D6A4F]/30">✓ Verified</Badge>;
  if (status === 'approved') return <Badge variant="info" className="bg-[#2D6A4F]/10 text-[#2D6A4F] border border-[#2D6A4F]/30">Approved</Badge>;
  return <Badge variant="default" className="bg-[#5A4030]/10 text-[#5A4030] border border-[#5A4030]/20">{status}</Badge>;
}

function MediaPreview({ item }) {
  const [imgError, setImgError] = useState(false);

  if (item.content_type === 'video') {
    return item.file_url ? (
      <video
        src={item.file_url}
        className="w-full h-36 sm:h-40 object-cover rounded-[12px] mb-3 bg-black"
        preload="metadata"
        muted
      />
    ) : (
      <div className="w-full h-36 sm:h-40 rounded-[12px] mb-3 bg-[#FDF8F0] flex items-center justify-center text-4xl">🎬</div>
    );
  }

  if (item.content_type === 'audio') {
    return (
      <div className="w-full mb-3">
        <div className="w-full h-20 rounded-[12px] bg-[#FDF8F0] flex items-center justify-center text-3xl mb-2">🎵</div>
        <audio src={item.file_url} controls className="w-full" preload="none" />
      </div>
    );
  }

  if (item.content_type === 'image' && item.file_url && !imgError) {
    return (
      <img
        src={item.file_url}
        alt={item.title}
        className="w-full h-36 sm:h-40 object-cover rounded-[12px] mb-3"
        onError={() => setImgError(true)}
      />
    );
  }

  return null;
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
        exclude_short: true, // ✅ Exclude shorts from Explore
      };

      if (filter !== 'all') params.content_type = filter;

      let data;
      let items = [];

      if (useSemanticSearch) {
        data = await api.search({
          ...params,
          q: cleanedQuery,
        });
        items = data?.results || [];
        const totalCount = data?.count || 0;
        setHasMore(items.length === LIMIT && (reset ? items.length < totalCount : true));
      } else {
        if (cleanedQuery) {
          params.search = cleanedQuery;
        }
        data = await api.contentList(params);
        items = Array.isArray(data) ? data : [];
        setHasMore(items.length === LIMIT);
      }

      if (reset) {
        setContent(items);
        setOffset(LIMIT);
      } else {
        setContent(prev => [...prev, ...items]);
        setOffset(currentOffset + LIMIT);
      }
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

  // ✅ Helper to capitalize filter name
  const getFilterLabel = () => {
    const found = FILTERS.find(f => f.id === filter);
    return found ? found.label : filter;
  };

  if (error && !loading) {
    return (
      <div className="bg-[#FDF8F0] px-3 sm:px-6 py-4 sm:py-6 rounded-[12px]">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#2D1B0E]">
              {urlSearch ? `Results for "${urlSearch}"` : 'Explore Wari Heritage'}
            </h1>
            <p className="text-[#5A4030] text-sm mt-0.5">
              {urlSearch
                ? `${content.length} item${content.length !== 1 ? 's' : ''} found`
                : 'Discover verified knowledge from the Wari community'}
            </p>
          </div>
          {urlSearch && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSearch}
              className="flex items-center gap-1 rounded-full border-[#D4A373] text-[#8B3A3A] hover:bg-[#D4A373]/10"
            >
              <FiX size={14} /> Clear search
            </Button>
          )}
        </div>
        <div className="text-center py-12 bg-white rounded-[12px]">
          <p className="text-[#8B3A3A] font-medium">{error}</p>
          <Button
            variant="outline"
            className="mt-4 rounded-full border-[#8B3A3A] text-[#8B3A3A] hover:bg-[#8B3A3A]/5"
            onClick={() => fetchContent(true)}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDF8F0] px-3 sm:px-6 py-4 sm:py-6 rounded-[12px]">
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

      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2D1B0E]">
            {urlSearch ? `Results for "${urlSearch}"` : 'Explore Wari Heritage'}
          </h1>
          <p className="text-[#5A4030] text-sm mt-0.5">
            {urlSearch
              ? `${content.length} item${content.length !== 1 ? 's' : ''} found`
              : 'Discover verified knowledge from the Wari community'}
          </p>
        </div>
        {urlSearch && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSearch}
            className="flex items-center gap-1 rounded-full border-[#D4A373] text-[#8B3A3A] hover:bg-[#D4A373]/10"
          >
            <FiX size={14} /> Clear search
          </Button>
        )}
      </div>

      {/* Type filters — pill-shaped, wrap on mobile, active state = primary color */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(f => (
          <Button
            key={f.id}
            variant={filter === f.id ? 'primary' : 'ghost'}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition-all duration-200 ${
              filter === f.id
                ? 'bg-[#8B3A3A] text-[#FDF8F0] shadow-[0_4px_20px_rgba(139,58,58,0.08)] hover:bg-[#7a3232]'
                : 'bg-white text-[#5A4030] border border-[#D4A373]/40 hover:bg-[#D4A373]/10'
            }`}
            size="sm"
          >
            <f.icon size={14} /> {f.label}
          </Button>
        ))}
      </div>

      {/* Content grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[12px] border-l-4 border-l-[#D4A373] shadow-[0_4px_20px_rgba(139,58,58,0.08)] p-3 sm:p-4 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FDF8F0] animate-pulse" />
                  <div className="h-5 w-16 rounded-full bg-[#FDF8F0] animate-pulse" />
                </div>
                <div className="h-5 w-16 rounded-full bg-[#FDF8F0] animate-pulse" />
              </div>
              <div className="w-full h-36 sm:h-40 rounded-[12px] bg-[#FDF8F0] animate-pulse mb-3" />
              <div className="h-5 w-3/4 rounded bg-[#FDF8F0] animate-pulse mb-2" />
              <div className="h-4 w-full rounded bg-[#FDF8F0] animate-pulse mb-1" />
              <div className="h-4 w-2/3 rounded bg-[#FDF8F0] animate-pulse mb-3" />
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#D4A373]/20">
                <div className="h-3 w-24 rounded bg-[#FDF8F0] animate-pulse" />
                <div className="h-3 w-10 rounded bg-[#FDF8F0] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : content.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-[#2D1B0E]">
            {urlSearch ? `No results for "${urlSearch}"` : 'No content yet'}
          </h3>
          <p className="text-[#5A4030] text-sm">
            {!urlSearch && (filter !== 'all'
              ? `No ${filter} content available yet.`
              : 'Be the first to contribute Wari knowledge!')}
          </p>
          <div className="flex gap-3 justify-center mt-4">
            {urlSearch && (
              <Button
                variant="outline"
                onClick={handleClearSearch}
                className="rounded-full border-[#D4A373] text-[#8B3A3A] hover:bg-[#D4A373]/10"
              >
                Browse All
              </Button>
            )}
            {/* ✅ Category-specific contribute button */}
            {filter !== 'all' ? (
              <Link to={`/contribute?type=${filter}`}>
                <Button
                  variant="primary"
                  className="rounded-full bg-[#8B3A3A] hover:bg-[#7a3232] text-[#FDF8F0] shadow-[0_4px_20px_rgba(139,58,58,0.08)]"
                >
                  Contribute {getFilterLabel()} Now
                </Button>
              </Link>
            ) : (
              <Link to="/contribute">
                <Button
                  variant="primary"
                  className="rounded-full bg-[#8B3A3A] hover:bg-[#7a3232] text-[#FDF8F0] shadow-[0_4px_20px_rgba(139,58,58,0.08)]"
                >
                  Contribute Now
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Responsive grid: 1 col mobile → 2 cols tablet → 3-4 cols desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {content.map((item, idx) => (
              <Link key={item.id} to={`/content/${item.id}`} className="block">
                <Card
                  className="wari-card-enter group relative h-full bg-white rounded-[12px] border-l-4 border-l-[#D4A373] shadow-[0_4px_20px_rgba(139,58,58,0.08)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(139,58,58,0.16)] cursor-pointer overflow-hidden p-3 sm:p-4"
                  style={{ animationDelay: `${Math.min(idx, 8) * 60}ms` }}
                >
                  {/* Processing overlay — warm, not harsh black */}
                  {item.status === 'processing' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FDF8F0]/95 to-[#D4A373]/30 backdrop-blur-[2px] rounded-[12px] flex flex-col items-center justify-center z-10">
                      <div className="animate-spin text-2xl mb-2 text-[#8B3A3A]">⏳</div>
                      <p className="text-xs text-[#5A4030] font-medium">Processing OCR...</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {TYPE_ICONS[item.content_type] || <FiFile className="text-[#8B3A3A]" />}
                      <Badge variant="default" className="bg-[#5A4030]/10 text-[#5A4030] border border-[#5A4030]/20 rounded-full">
                        {item.content_type}
                      </Badge>
                    </div>
                    {getStatusBadge(item.status, item.verified)}
                  </div>

                  <MediaPreview item={item} />

                  <h3 className="font-bold text-lg line-clamp-1 text-[#2D1B0E]">{item.title}</h3>
                  {item.description && (
                    <p className="text-[#5A4030] text-sm line-clamp-2 mt-1">{item.description}</p>
                  )}
                  
                  {/* Show match type for semantic search results */}
                  {item.match_type && (
                    <div className="mt-1.5">
                      <Badge 
                        variant="default" 
                        className={`text-xs rounded-full ${
                          item.match_type === 'both' 
                            ? 'bg-[#2D6A4F]/20 text-[#2D6A4F] border-[#2D6A4F]/30' 
                            : item.match_type === 'semantic'
                            ? 'bg-[#8B3A3A]/20 text-[#8B3A3A] border-[#8B3A3A]/30'
                            : 'bg-[#D4A373]/20 text-[#5A4030] border-[#D4A373]/30'
                        }`}
                      >
                        {item.match_type === 'both' ? '🔍 + 🧠' : 
                         item.match_type === 'semantic' ? '🧠 Semantic' : 
                         '🔍 Keyword'}
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#D4A373]/20">
                    <span className="text-xs text-[#5A4030]">
                      {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-xs text-[#8B3A3A] font-medium flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <FiEye size={12} /> View
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Load More — pill shape, warm gradient, shimmer on hover */}
          {hasMore && (
            <div className="flex justify-center mt-8 sm:mt-10">
              <Button
                variant="outline"
                onClick={() => fetchContent(false)}
                disabled={loadingMore}
                className="wari-load-more rounded-full px-8 py-2.5 text-[#FDF8F0] font-medium border-none shadow-[0_4px_20px_rgba(139,58,58,0.08)] transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #8B3A3A 0%, #D4A373 50%, #8B3A3A 100%)',
                  backgroundSize: '200% auto',
                }}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExploreWari;