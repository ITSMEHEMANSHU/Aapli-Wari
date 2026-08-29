import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiEye, FiVideo, FiImage, FiMusic, FiFile } from 'react-icons/fi';
import { api } from '../../services/api';
import Loader from '../common/Loader';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

const TYPE_ICONS = {
  video: <FiVideo className="text-[#8B3A3A]" />,
  image: <FiImage className="text-[#8B3A3A]" />,
  audio: <FiMusic className="text-[#8B3A3A]" />,
  pdf: <FiFile className="text-[#8B3A3A]" />,
  manuscript: <FiFile className="text-[#8B3A3A]" />,
  story: <FiFile className="text-[#8B3A3A]" />,
};

function getStatusBadge(status, verified) {
  if (status === 'processing') return <Badge variant="warning">⏳ Processing</Badge>;
  if (status === 'pending_review') return <Badge variant="warning">⏳ Review</Badge>;
  if (status === 'rejected') return <Badge variant="danger">Rejected</Badge>;
  if (verified) return <Badge variant="success">✓ Verified</Badge>;
  if (status === 'approved') return <Badge variant="info">Approved</Badge>;
  return <Badge variant="default">{status}</Badge>;
}

function getTypeIcon(type) {
  return TYPE_ICONS[type] || <FiFile className="text-[#8B3A3A]" />;
}

export const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ type: 'all', language: 'all' });

  useEffect(() => {
    if (query) performSearch();
  }, [query, filters]);

  const performSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const params = { q: query };
      if (filters.type !== 'all') params.content_type = filters.type;
      if (filters.language !== 'all') params.language = filters.language;
      
      const data = await api.search(params);
      setResults(data?.results || []);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.message || 'Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="bg-[#FDF8F0] px-3 sm:px-6 py-4 sm:py-6 rounded-[12px] min-h-[60vh]">
      <h1 className="text-xl sm:text-2xl font-bold text-[#2D1B0E]">Search Results</h1>
      {query && (
        <p className="text-[#5A4030] text-sm mt-0.5 mb-4">
          Showing results for: <strong>"{query}"</strong>
        </p>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <FiFilter className="text-[#5A4030]" />
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="px-3 py-1.5 rounded-full border border-[#D4A373]/40 bg-white text-[#2D1B0E] text-sm focus:outline-none focus:border-[#8B3A3A]"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="pdf">Documents</option>
            <option value="story">Stories</option>
          </select>
        </div>
        <select
          value={filters.language}
          onChange={(e) => setFilters({...filters, language: e.target.value})}
          className="px-3 py-1.5 rounded-full border border-[#D4A373]/40 bg-white text-[#2D1B0E] text-sm focus:outline-none focus:border-[#8B3A3A]"
        >
          <option value="all">All Languages</option>
          <option value="mr">Marathi</option>
          <option value="hi">Hindi</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Results */}
      {error ? (
        <Card className="text-center text-[#8B3A3A] py-8">
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-4 rounded-full border-[#8B3A3A] text-[#8B3A3A] hover:bg-[#8B3A3A]/5"
            onClick={performSearch}
          >
            Retry
          </Button>
        </Card>
      ) : results.length === 0 ? (
        <Card className="text-center text-[#5A4030] py-8">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-lg font-medium">No results found for "{query}"</p>
          <p className="text-sm mt-1">Try adjusting your search terms or browse Explore</p>
          <Link to="/explore">
            <Button
              variant="primary"
              className="mt-4 rounded-full bg-[#8B3A3A] hover:bg-[#7a3232] text-[#FDF8F0]"
            >
              Browse Explore
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {results.map(result => (
            <Link key={result.id} to={`/content/${result.id}`} className="block">
              <Card className="hover:shadow-lg transition cursor-pointer bg-white rounded-[12px] border-l-4 border-l-[#D4A373] p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeIcon(result.content_type)}
                      <span className="text-xs text-[#5A4030] capitalize">{result.content_type}</span>
                      <span className="text-xs text-[#5A4030]">•</span>
                      <span className="text-xs text-[#5A4030]">{formatDate(result.created_at)}</span>
                    </div>
                    <h3 className="font-bold text-[#2D1B0E]">{result.title}</h3>
                    {result.description && (
                      <p className="text-[#5A4030] text-sm line-clamp-1">{result.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {getStatusBadge(result.status, result.verified)}
                      {result.match_type && (
                        <Badge 
                          variant="default" 
                          className={`text-xs ${
                            result.match_type === 'both' 
                              ? 'bg-[#2D6A4F]/20 text-[#2D6A4F] border-[#2D6A4F]/30' 
                              : result.match_type === 'semantic'
                              ? 'bg-[#8B3A3A]/20 text-[#8B3A3A] border-[#8B3A3A]/30'
                              : 'bg-[#D4A373]/20 text-[#5A4030] border-[#D4A373]/30'
                          }`}
                        >
                          {result.match_type === 'both' ? '🔍 + 🧠' : 
                           result.match_type === 'semantic' ? '🧠 Semantic' : 
                           '🔍 Keyword'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
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

export default Search;