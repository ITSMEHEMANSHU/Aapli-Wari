import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiVideo, FiImage, FiMusic, FiFile, FiSearch, FiEye, FiX, FiLoader } from 'react-icons/fi';

import Button from '../common/Button';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Loader from '../common/Loader';
import { getContentList } from '../../services/content';

const LIMIT = 20;

const TYPE_ICONS = {
  video: <FiVideo className="text-[#DD6B35]" />,
  image: <FiImage className="text-[#DD6B35]" />,
  audio: <FiMusic className="text-[#DD6B35]" />,
  pdf: <FiFile className="text-[#DD6B35]" />,
  manuscript: <FiFile className="text-[#DD6B35]" />,
  story: <FiFile className="text-[#DD6B35]" />,
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
  // Check status FIRST — don't show verified badge if still processing
  if (status === 'processing') return <Badge variant="warning">⏳ Processing</Badge>;
  if (status === 'pending_review') return <Badge variant="warning">⏳ Review</Badge>;
  if (status === 'rejected') return <Badge variant="danger">Rejected</Badge>;
  if (verified) return <Badge variant="success">✓ Verified</Badge>;
  if (status === 'approved') return <Badge variant="info">Approved</Badge>;
  return <Badge variant="default">{status}</Badge>;
}

function MediaPreview({ item }) {
  const [imgError, setImgError] = useState(false);

  if (item.content_type === 'video') {
    return item.file_url ? (
      <video
        src={item.file_url}
        className="w-full h-40 object-cover rounded-lg mb-3 bg-black"
        preload="metadata"
        muted
      />
    ) : (
      <div className="w-full h-40 rounded-lg mb-3 bg-gray-100 flex items-center justify-center text-4xl">🎬</div>
    );
  }

  if (item.content_type === 'audio') {
    return (
      <div className="w-full mb-3">
        <div className="w-full h-20 rounded-lg bg-[#FBF5EC] flex items-center justify-center text-3xl mb-2">🎵</div>
        <audio src={item.file_url} controls className="w-full" preload="none" />
      </div>
    );
  }

  if (item.content_type === 'image' && item.file_url && !imgError) {
    return (
      <img
        src={item.file_url}
        alt={item.title}
        className="w-full h-40 object-cover rounded-lg mb-3"
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

    try {
      const params = { verified_only: true, limit: LIMIT, offset: currentOffset };
      if (filter !== 'all') params.content_type = filter;
      if (urlSearch) params.search = urlSearch;

      const data = await getContentList(params);
      const items = data || [];

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

  if (loading) {
    return <div className="flex justify-center py-12"><Loader size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => fetchContent(true)}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">
            {urlSearch ? `Results for "${urlSearch}"` : 'Explore Wari Heritage'}
          </h1>
          <p className="text-gray-600 text-sm mt-0.5">
            {urlSearch
              ? `${content.length} item${content.length !== 1 ? 's' : ''} found`
              : 'Discover verified knowledge from the Wari community'}
          </p>
        </div>
        {urlSearch && (
          <Button variant="outline" size="sm" onClick={handleClearSearch} className="flex items-center gap-1">
            <FiX size={14} /> Clear search
          </Button>
        )}
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(f => (
          <Button
            key={f.id}
            variant={filter === f.id ? 'primary' : 'ghost'}
            onClick={() => setFilter(f.id)}
            className="flex items-center gap-2"
            size="sm"
          >
            <f.icon size={14} /> {f.label}
          </Button>
        ))}
      </div>

      {/* Content grid */}
      {content.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-700">
            {urlSearch ? `No results for "${urlSearch}"` : 'No content yet'}
          </h3>
          <p className="text-gray-500 text-sm">
            {!urlSearch && (filter !== 'all'
              ? `No ${filter} content available yet.`
              : 'Be the first to contribute Wari knowledge!')}
          </p>
          <div className="flex gap-3 justify-center mt-4">
            {urlSearch && (
              <Button variant="outline" onClick={handleClearSearch}>Browse All</Button>
            )}
            <Link to="/contribute">
              <Button variant="primary">Contribute Now</Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {content.map(item => (
              <Link key={item.id} to={`/content/${item.id}`}>
                <Card className="hover:shadow-lg transition cursor-pointer h-full relative">
                  {/* Processing overlay */}
                  {item.status === 'processing' && (
                    <div className="absolute inset-0 bg-white/80 rounded-xl flex flex-col items-center justify-center z-10">
                      <div className="animate-spin text-2xl mb-2">⏳</div>
                      <p className="text-xs text-gray-500 font-medium">Processing OCR...</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {TYPE_ICONS[item.content_type] || <FiFile className="text-[#DD6B35]" />}
                      <Badge variant="default">{item.content_type}</Badge>
                    </div>
                    {getStatusBadge(item.status, item.verified)}
                  </div>

                  <MediaPreview item={item} />

                  <h3 className="font-bold text-lg line-clamp-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mt-1">{item.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <FiEye size={12} /> View
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                onClick={() => fetchContent(false)}
                disabled={loadingMore}
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
