import React, { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiRefreshCw, FiEye, FiTrash2, FiImage, FiVideo, FiMusic, FiFile } from 'react-icons/fi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { api } from '../../services/api';

export const ContentManagement = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await api.contentList({ limit: 50 });
        setContent(data || []);
      } catch (error) {
        console.error('Failed to fetch content:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const contentTypes = ['All', 'Images', 'Videos', 'Audio', 'Stories', 'Shorts'];
  const typeIcons = {
    image: <FiImage className="text-[#8b3a3a]" size={16} />,
    video: <FiVideo className="text-[#8b3a3a]" size={16} />,
    audio: <FiMusic className="text-[#8b3a3a]" size={16} />,
    short: <FiVideo className="text-[#8b3a3a]" size={16} />,
  };

  const filteredContent = useMemo(() => {
    return content.filter((item) => {
      const matchesType = selectedType === 'All' ||
        selectedType.toLowerCase() === item.content_type?.toLowerCase() ||
        (selectedType === 'Images' && item.content_type?.toLowerCase() === 'image');

      const query = search.toLowerCase().trim();
      const matchesSearch = !query ||
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query);

      return matchesType && matchesSearch;
    });
  }, [content, selectedType, search]);

  const getStatusBadge = (status, verified) => {
    if (verified) return <Badge variant="success">✓ Verified</Badge>;
    if (status === 'published') return <Badge variant="success">Published</Badge>;
    if (status === 'pending_review') return <Badge variant="warning">⏳ Pending</Badge>;
    if (status === 'rejected') return <Badge variant="danger">Rejected</Badge>;
    return <Badge variant="default">{status}</Badge>;
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
            Review, moderate, and manage all content
          </p>
        </div>
        <Button
          variant="outline"
          className="border-[#8b3a3a] text-[#8b3a3a] flex items-center gap-2"
          onClick={() => window.location.reload()}
        >
          <FiRefreshCw size={16} /> Refresh
        </Button>
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
            No content found
          </div>
        ) : (
          filteredContent.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all group">
              <div className="relative h-48 bg-[#FDF8F0] overflow-hidden">
                {item.file_url && item.content_type === 'image' ? (
                  <img loading="lazy" src={item.file_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {typeIcons[item.content_type] || <FiFile className="text-[#8b3a3a] text-4xl" />}
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="bg-[#8b3a3a] text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                    {typeIcons[item.content_type] || <FiFile size={12} />}
                    {item.content_type}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  {getStatusBadge(item.status, item.verified)}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-base text-[#2D1B0E] line-clamp-2">{item.title}</h3>
                {item.description && (
                  <p className="text-xs text-[#5A4030] mt-1 line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E8D9C3]/50">
                  <span className="text-xs text-[#5A4030]">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(`/content/${item.id}`, '_blank')}
                      className="p-1.5 text-[#5A4030] hover:text-[#8b3a3a] rounded hover:bg-[#FDF8F0] transition-colors"
                    >
                      <FiEye size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedContent(item);
                        setShowDeleteModal(true);
                      }}
                      className="p-1.5 text-[#5A4030] hover:text-[#ba1a1a] rounded hover:bg-[#ffdad6] transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedContent(null); }}
        title="Delete Content"
      >
        <div className="text-center">
          <p className="text-[#5A4030] mb-4">
            Are you sure you want to delete "{selectedContent?.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="ghost" onClick={() => { setShowDeleteModal(false); setSelectedContent(null); }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} className="bg-[#ba1a1a] hover:bg-[#93000a] text-white">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ContentManagement;