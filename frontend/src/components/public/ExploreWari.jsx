import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiVideo, FiImage, FiMusic, FiFile, FiSearch, FiEye } from 'react-icons/fi';

import Button from '../common/Button';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Loader from '../common/Loader';
import { getContentList } from '../../services/content';

export const ExploreWari = () => {
  const [filter, setFilter] = useState('all');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContent();
  }, [filter]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        verified_only: true,
        limit: 50,
      };
      
      if (filter !== 'all') {
        params.content_type = filter;
      }

      console.log('[Explore] Fetching content with params:', params);
      const data = await getContentList(params);
      console.log('[Explore] Content received:', data?.length, 'items', data);
      setContent(data);
    } catch (err) {
      console.error('[Explore] Fetch failed:', err);
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { id: 'all', label: 'All', icon: FiSearch },
    { id: 'image', label: 'Images', icon: FiImage },
    { id: 'video', label: 'Videos', icon: FiVideo },
    { id: 'audio', label: 'Audio', icon: FiMusic },
    { id: 'pdf', label: 'Documents', icon: FiFile },
    { id: 'story', label: 'Stories', icon: FiFile },
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <FiVideo className="text-primary" />;
      case 'image': return <FiImage className="text-primary" />;
      case 'audio': return <FiMusic className="text-primary" />;
      case 'pdf': return <FiFile className="text-primary" />;
      case 'manuscript': return <FiFile className="text-primary" />;
      default: return <FiFile className="text-primary" />;
    }
  };

  const getStatusBadge = (status, verified) => {
    if (verified) return <Badge variant="success">✓ Verified</Badge>;
    if (status === 'approved') return <Badge variant="info">Approved</Badge>;
    if (status === 'pending_review') return <Badge variant="warning">⏳ Review</Badge>;
    if (status === 'rejected') return <Badge variant="danger">Rejected</Badge>;
    return <Badge variant="default">{status}</Badge>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchContent}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Explore Wari Heritage</h1>
      <p className="text-gray-600 mb-6">
        Discover verified knowledge from the Wari community
      </p>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map(f => (
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

      {content.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-700">No content yet</h3>
          <p className="text-gray-500 text-sm">
            {filter !== 'all' 
              ? `No ${filter} content available yet.`
              : 'Be the first to contribute Wari knowledge!'}
          </p>
          <Link to="/contribute">
            <Button variant="primary" className="mt-4">
              Contribute Now
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {content.map(item => (
            <Link key={item.id} to={`/content/${item.id}`}>
              <Card className="hover:shadow-lg transition cursor-pointer h-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(item.content_type)}
                    <Badge variant="default">{item.content_type}</Badge>
                  </div>
                  {getStatusBadge(item.status, item.verified)}
                </div>
                
                {item.file_url && item.content_type === 'image' && (
                  <img 
                    src={item.file_url} 
                    alt={item.title}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}
                
                <h3 className="font-bold text-lg line-clamp-1">{item.title}</h3>
                {item.description && (
                  <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                    {item.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {formatDate(item.created_at)}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <FiEye size={12} /> View
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};