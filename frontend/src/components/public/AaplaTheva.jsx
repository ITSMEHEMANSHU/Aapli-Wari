import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlay, FiEye, FiClock, FiHeart, FiShare2 } from 'react-icons/fi';
import { api } from '../../services/api';
import Button from '../common/Button';
import Card from '../common/Card';
import Loader from '../common/Loader';
import Badge from '../common/Badge';

export const AaplaTheva = () => {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchShorts();
  }, [filter]);

  const fetchShorts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { limit: 50 };
      if (filter !== 'all') params.content_type = filter;
      const data = await api.shorts(params);
      setShorts(data.results || []);
    } catch (err) {
      console.error('Failed to fetch shorts:', err);
      setError('Failed to load shorts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return '🎬';
      case 'image': return '🖼️';
      case 'audio': return '🎵';
      case 'short': return '🎬';
      case 'story': return '📝';
      default: return '📄';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'image', label: 'Images' },
    { id: 'video', label: 'Videos' },
    { id: 'audio', label: 'Audio' },
    { id: 'short', label: 'Shorts' },
    { id: 'story', label: 'Stories' },
  ];

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
        <Button variant="outline" className="mt-4" onClick={fetchShorts}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2D1B0E]">Aapla Theva</h1>
          <p className="text-gray-600">Quick knowledge bites from Wari heritage</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map(f => (
          <Button
            key={f.id}
            variant={filter === f.id ? 'primary' : 'ghost'}
            onClick={() => setFilter(f.id)}
            size="sm"
            className="rounded-full"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {shorts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-700">No shorts available</h3>
          <p className="text-gray-500 text-sm">Check back later for new content</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shorts.map(short => (
            <Link key={short.id} to={`/content/${short.id}`} className="block">
              <Card className="hover:shadow-lg transition overflow-hidden p-0 h-full group">
                {/* Media Preview */}
                <div className="relative bg-[#FDF8F0] aspect-video overflow-hidden">
                  {short.content_type === 'image' && short.file_url && (
                    <img 
                      src={short.file_url} 
                      alt={short.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {short.content_type === 'video' && short.file_url && (
                    <video 
                      src={short.file_url}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      preload="metadata"
                      muted
                    />
                  )}
                  {short.content_type === 'audio' && (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#D4A373]/20 to-[#8B3A3A]/20">
                      <span className="text-5xl">🎵</span>
                    </div>
                  )}
                  {!short.file_url && (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#D4A373]/20 to-[#8B3A3A]/20">
                      <span className="text-5xl">{getTypeIcon(short.content_type)}</span>
                    </div>
                  )}
                  {/* Overlay badge */}
                  <div className="absolute top-2 left-2">
                    <Badge variant="default" className="bg-black/60 text-white border-none">
                      {getTypeIcon(short.content_type)} {short.content_type}
                    </Badge>
                  </div>
                  {short.verified && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="success" className="bg-green-600/90 text-white border-none">
                        ✓ Verified
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-[#2D1B0E] line-clamp-1">{short.title}</h3>
                  {short.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mt-1">{short.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {formatDate(short.created_at)}
                    </span>
                    <span className="text-xs text-[#8B3A3A] font-medium flex items-center gap-1">
                      <FiEye size={12} /> View
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AaplaTheva;