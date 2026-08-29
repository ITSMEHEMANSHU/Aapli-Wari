import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiRefreshCw, FiEye, FiTrash2, FiImage, FiVideo, FiMusic, FiFile, FiFileText } from 'react-icons/fi';
import { api } from '../../services/api';

export const ContentManagement = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        console.log('📡 Fetching content from API...');
        const data = await api.contentList({ limit: 50 });
        console.log('✅ API Response:', data);
        
        let contentData = [];
        if (data?.items) {
          contentData = data.items;
        } else if (data?.data) {
          contentData = data.data;
        } else if (Array.isArray(data)) {
          contentData = data;
        }
        
        console.log('📦 Content data to set:', contentData);
        setContent(contentData);
      } catch (error) {
        console.error('❌ Failed to fetch content:', error);
        setContent([]);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const contentTypes = ['All', 'Images', 'Videos', 'Audio', 'Stories', 'Text', 'Shorts'];
  
  const typeIcons = {
    image: <FiImage className="text-[#8b3a3a]" size={16} />,
    video: <FiVideo className="text-[#8b3a3a]" size={16} />,
    audio: <FiMusic className="text-[#8b3a3a]" size={16} />,
    story: <FiFileText className="text-[#8b3a3a]" size={16} />,
    text: <FiFileText className="text-[#8b3a3a]" size={16} />,
    short: <FiVideo className="text-[#8b3a3a]" size={16} />,
  };

  const getContentType = (item) => {
    return item.content_type || item.type || 'unknown';
  };

  const getFileUrl = (item) => {
    return item.file_url || item.thumbnail_url || null;
  };

  const filteredContent = useMemo(() => {
    return content.filter((item) => {
      const contentType = getContentType(item);
      
      const matchesType = selectedType === 'All' ||
        selectedType.toLowerCase() === contentType?.toLowerCase() ||
        (selectedType === 'Images' && contentType?.toLowerCase() === 'image') ||
        (selectedType === 'Videos' && contentType?.toLowerCase() === 'video') ||
        (selectedType === 'Audio' && contentType?.toLowerCase() === 'audio') ||
        (selectedType === 'Stories' && contentType?.toLowerCase() === 'story') ||
        (selectedType === 'Text' && contentType?.toLowerCase() === 'text') ||
        (selectedType === 'Shorts' && contentType?.toLowerCase() === 'short');

      const query = search.toLowerCase().trim();
      const matchesSearch = !query ||
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.vernacular_title?.toLowerCase().includes(query);

      return matchesType && matchesSearch;
    });
  }, [content, selectedType, search]);

  const getStatusColor = (status, verified) => {
    if (verified === true) return 'bg-green-100 text-green-800 border-green-200';
    const statusMap = {
      'published': 'bg-green-100 text-green-800 border-green-200',
      'approved': 'bg-green-100 text-green-800 border-green-200',
      'pending_review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'processing': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'uploaded': 'bg-blue-100 text-blue-800 border-blue-200',
      'processed': 'bg-blue-100 text-blue-800 border-blue-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200',
      'needs_revision': 'bg-red-100 text-red-800 border-red-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleDelete = async () => {
    if (!selectedContent) return;
    try {
      await api.deleteContent(selectedContent.id);
      setContent(content.filter(c => c.id !== selectedContent.id));
      setShowDeleteModal(false);
      setSelectedContent(null);
    } catch (error) {
      console.error('Failed to delete content:', error);
      alert('Failed to delete content. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8b3a3a] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2D1B0E] tracking-tight">
            Content Management
          </h2>
          <p className="text-[#5A4030] text-sm sm:text-base mt-1">
            Review, moderate, and manage all content ({content.length} items)
          </p>
        </div>
        <button
          className="px-4 py-2 border border-[#8b3a3a] text-[#8b3a3a] rounded-lg hover:bg-[#8b3a3a] hover:text-white transition-colors flex items-center gap-2 text-sm"
          onClick={() => window.location.reload()}
        >
          <FiRefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex overflow-x-auto gap-2 w-full sm:w-auto pb-1">
          {contentTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${
                selectedType === type
                  ? 'bg-[#efdfdd] text-[#2D1B0E] border-[#E8D9C3] shadow-sm'
                  : 'bg-white text-[#5A4030] border-[#E8D9C3] hover:bg-[#efdfdd]/60'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A4030]" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search content..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8D9C3] rounded-lg text-sm text-[#2D1B0E] focus:outline-none focus:border-[#8b3a3a]"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredContent.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl p-12 text-center border border-[#E8D9C3] text-[#5A4030]">
            <p className="text-lg font-semibold">No content found</p>
            <p className="text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredContent.map((item) => {
            const contentType = getContentType(item);
            const fileUrl = getFileUrl(item);
            const isVerified = item.verified === true;
            const status = item.status || 'pending_review';
            const statusColor = getStatusColor(status, isVerified);
            const statusLabel = isVerified ? 'Verified' : status?.replace(/_/g, ' ') || 'Unknown';
            
            return (
              <div key={item.id} className="bg-white rounded-xl overflow-hidden border border-[#E8D9C3] hover:shadow-lg transition-all group">
                <div className="relative h-48 bg-[#FDF8F0] overflow-hidden">
                  {fileUrl && (contentType === 'image' || contentType === 'video') ? (
                    contentType === 'image' ? (
                      <img 
                        loading="lazy" 
                        src={fileUrl} 
                        alt={item.title || 'Content'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <video 
                        src={fileUrl} 
                        className="w-full h-full object-cover" 
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#FDF8F0]">
                      {typeIcons[contentType] || <FiFile className="text-[#8b3a3a] text-4xl" />}
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#8b3a3a] text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                      {typeIcons[contentType] || <FiFile size={12} />}
                      {contentType || 'Unknown'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-base text-[#2D1B0E] line-clamp-2">
                    {item.title || item.vernacular_title || 'Untitled'}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-[#5A4030] mt-1 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E8D9C3]/50">
                    <span className="text-xs text-[#5A4030]">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Unknown date'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/content/${item.id}`)}
                        className="p-1.5 text-[#5A4030] hover:text-[#8b3a3a] rounded hover:bg-[#FDF8F0] transition-colors"
                        title="View Content"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedContent(item);
                          setShowDeleteModal(true);
                        }}
                        className="p-1.5 text-[#5A4030] hover:text-[#ba1a1a] rounded hover:bg-[#ffdad6] transition-colors"
                        title="Delete Content"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-[#E8D9C3] shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E8D9C3] bg-[#F9F1E5]">
              <h3 className="font-bold text-base text-[#3D2518]">Delete Content</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-[#5A4030] mb-6">
                Are you sure you want to delete "{selectedContent?.title || selectedContent?.vernacular_title || 'Untitled'}"? 
                This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => { setShowDeleteModal(false); setSelectedContent(null); }}
                  className="px-4 py-2 text-sm font-semibold text-[#5A4030] hover:bg-[#F9F1E5] rounded-xl transition-colors border border-[#E8D9C3]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-semibold bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-xl transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;