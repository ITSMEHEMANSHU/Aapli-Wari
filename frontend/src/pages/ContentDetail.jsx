import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiHeart,
  FiBookmark,
  FiShare,
  FiTag,
  FiArrowLeft,
  FiUser,
  FiCalendar,
  FiEye,
  FiDownload,
  FiFile,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';

import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import { Comments } from '../components/community/Comments';
import { useAuth } from '../hooks/useAuth';
import { getContent, likeContent, trackDownload, trackShare } from '../services/content';

export const ContentDetail = ({ isAdminView = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const adminView = isAdminView || location.pathname.startsWith('/admin/');
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [liking, setLiking] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);

  useEffect(() => {
    fetchContent();
  }, [id]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContent(id);
      setContent(data);
      setLiked(data.is_liked || false);
      setLikeCount(data.likes_count || 0);
      setShareCount(data.shares_count || 0);
      setDownloadCount(data.downloads_count || 0);
    } catch (err) {
      setError(err.message || 'Failed to load content');
      console.error('Failed to fetch content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login', { state: { message: 'Please log in to like content.' } });
      return;
    }
    if (liking) return;
    const previousLiked = liked;
    const previousCount = likeCount;
    setLiked(!previousLiked);
    setLikeCount((count) => previousLiked ? Math.max(0, count - 1) : count + 1);
    setLiking(true);
    try {
      const result = await likeContent(id);
      setLiked(result.is_liked);
      setLikeCount(result.likes_count);
    } catch (err) {
      setLiked(previousLiked);
      setLikeCount(previousCount);
      setError(err.message || 'Unable to update like.');
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    let platform = 'copy';
    if (navigator.share) {
      try {
        await navigator.share({ title: content.title, text: `Check out ${content.title}`, url });
        platform = 'web';
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        window.alert('Link copied to clipboard.');
      } catch {
        window.prompt('Copy this link:', url);
      }
    }
    try {
      const result = await trackShare(id, platform);
      setShareCount(result.shares_count);
    } catch (err) {
      setError(err.message || 'Unable to track share.');
    }
  };

  const handleDownload = async () => {
    try {
      const result = await trackDownload(id);
      setDownloadCount(result.downloads_count);
      const link = document.createElement('a');
      link.href = result.file_url;
      link.download = content.title || 'download';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err.message || 'Unable to download file.');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return '🎬';
      case 'image': return '🖼️';
      case 'audio': return '🎵';
      case 'short': return '🎬';
      case 'pdf': return '📄';
      case 'manuscript': return '📜';
      default: return '📝';
    }
  };

  const getStatusBadge = (status, verified) => {
    if (verified) return <Badge variant="success">✓ Verified</Badge>;
    if (status === 'approved') return <Badge variant="info">Approved</Badge>;
    if (status === 'pending_review') return <Badge variant="warning">⏳ Pending Review</Badge>;
    if (status === 'rejected') return <Badge variant="danger">Rejected</Badge>;
    return <Badge variant="default">{status}</Badge>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderMedia = () => {
    if (!content.file_url) {
      return (
        <div className="bg-gray-100 rounded-lg p-12 text-center">
          <p className="text-2xl">{getTypeIcon(content.content_type)}</p>
          <p className="text-gray-500 mt-2">No media attached</p>
        </div>
      );
    }

    const mediaType = content.content_type === 'short'
      ? (() => {
        const url = (content.file_url || '').toLowerCase();
        if (/\.(mp4|webm|mov|m4v|avi)(\?|$)/.test(url) || url.includes('video')) return 'video';
        if (/\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/.test(url) || url.includes('audio')) return 'audio';
        if (/\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/.test(url) || url.includes('image')) return 'image';
        return 'video';
      })()
      : content.content_type;

    switch (mediaType) {
      case 'image':
        return (
          <img
            src={content.file_url}
            alt={content.title}
            className="w-full max-h-[500px] object-contain rounded-lg bg-gray-100"
          />
        );
      case 'video':
        return (
          <video
            src={content.file_url}
            controls
            className="w-full max-h-[500px] rounded-lg bg-gray-100"
          />
        );
      case 'audio':
        return (
          <audio
            src={content.file_url}
            controls
            className="w-full mt-2"
          />
        );
      case 'pdf':
        return (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <FiFile className="text-4xl text-primary mx-auto mb-3" />
            <p className="font-medium">PDF Document</p>
            <a
              href={content.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-2 mt-2"
            >
              <FiDownload /> View Document
            </a>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-500">Content type: {content.content_type}</p>
          </div>
        );
    }
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
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Content not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/explore')}>
          Browse Explore
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(adminView ? '/admin/content' : -1)}
        className="flex items-center gap-2 text-gray-600 hover:text-primary transition mb-4"
      >
        <FiArrowLeft /> {adminView ? 'Back to content list' : 'Back'}
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-2xl">{getTypeIcon(content.content_type)}</span>
              <h1 className="text-2xl font-bold">{content.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <FiUser size={14} /> {content.user?.full_name || content.user?.username || 'Unknown uploader'}
              </span>
              <span className="flex items-center gap-1">
                <FiCalendar size={14} /> {formatDate(content.created_at)}
              </span>
              {getStatusBadge(content.status, content.verified)}
            </div>
            {content.channel && (
              <Link
                to={`/channel/${content.channel_id}`}
                className="inline-block mt-2 text-sm text-primary hover:underline"
              >
                📢 {content.channel?.name || 'Channel'}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Media */}
      <Card className="mb-4 p-4">
        {renderMedia()}
      </Card>

      {/* Description */}
      {content.description && (
        <Card className="mb-4">
          <h3 className="font-semibold text-lg mb-2">About</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{content.description}</p>

          {content.tags && content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {content.tags.map(tag => (
                <Badge key={tag} variant="default" className="flex items-center gap-1">
                  <FiTag size={12} /> {tag}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* AI Processing Results (if available) */}
      {(content.transcription || content.extracted_text || (content.translations && Object.keys(content.translations).length > 0)) && (
        <Card className="mb-4">
          <h3 className="font-semibold text-lg mb-2">🤖 AI Processed Information</h3>
          {content.transcription && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-500">Transcription</p>
              <p className="text-gray-700 text-sm">{content.transcription}</p>
            </div>
          )}
          {content.extracted_text && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-500">Extracted Text</p>
              <p className="text-gray-700 text-sm">{content.extracted_text}</p>
            </div>
          )}
          {content.translations && Object.keys(content.translations).length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500">Translations</p>
              {Object.entries(content.translations).map(([lang, text]) => (
                <p key={lang} className="text-gray-700 text-sm">
                  <span className="font-medium">{lang}:</span> {text}
                </p>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Actions */}
      {adminView ? (
        <div className="mb-6 rounded-xl border border-[#E8D9C3] bg-[#FDF8F0] px-4 py-3 text-sm font-medium text-[#6d2325]">
          Admin read-only view: actions are disabled while reviewing content.
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 mb-6">
          <Button onClick={handleLike} disabled={liking} className="flex items-center gap-2">
            {liked ? <FiHeart className="fill-current" /> : <FiHeart />} Like ({likeCount})
          </Button>
          <Button variant="outline" onClick={() => { if (!user) { navigate('/login', { state: { message: 'Please log in to save content.' } }); } else { setSaved(!saved); } }} className="flex items-center gap-2">
            <FiBookmark className={saved ? 'fill-current' : ''} /> Save
          </Button>
          <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
            <FiShare /> Share{shareCount > 0 ? ` (${shareCount})` : ''}
          </Button>
          {content.file_url && (
            <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
              <FiDownload /> Download{downloadCount > 0 ? ` (${downloadCount})` : ''}
            </Button>
          )}
        </div>
      )}

      {/* Comments */}
      <Comments contentId={content.id} />
    </div>
  );
};

export default ContentDetail;
