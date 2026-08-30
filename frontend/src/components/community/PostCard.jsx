import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiHeart, 
  FiMessageCircle, 
  FiShare2, 
  FiBookmark,
  FiMoreHorizontal,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

export const PostCard = ({ post, user }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getTypeIcon = () => {
    switch (post.content_type) {
      case 'video': return '🎬';
      case 'image': return '🖼️';
      case 'audio': return '🎵';
      case 'pdf': return '📄';
      case 'manuscript': return '📜';
      default: return '📝';
    }
  };

  const getStatusBadge = () => {
    if (post.verified) return <Badge variant="success">✓ Verified</Badge>;
    if (post.status === 'approved') return <Badge variant="info">Approved</Badge>;
    if (post.status === 'pending_review') return <Badge variant="warning">⏳ Review</Badge>;
    if (post.status === 'rejected') return <Badge variant="danger">Rejected</Badge>;
    return <Badge variant="default">{post.status}</Badge>;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar 
            size="md" 
            fallback={post.user?.full_name?.[0] || post.user?.username?.[0] || 'U'}
          />
          <div>
            <Link to={`/profile/${post.user_id}`} className="font-medium hover:text-primary transition">
              {post.user?.full_name || post.user?.username || 'Unknown'}
            </Link>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{timeAgo(post.created_at)}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {getTypeIcon()} {post.content_type}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <button className="p-1 hover:bg-gray-100 rounded-full transition">
            <FiMoreHorizontal size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3">
        <h3 className="font-semibold text-lg">{post.title}</h3>
        {post.description && (
          <p className="text-gray-700 mt-1">{post.description}</p>
        )}
        
        {/* Media */}
        {post.file_url && (
          <div className="mt-3 rounded-lg overflow-hidden bg-gray-100">
            {post.content_type === 'image' && (
              <img loading="lazy" src={post.file_url} alt={post.title} className="w-full max-h-96 object-contain" />
            )}
            {post.content_type === 'video' && (
              <video src={post.file_url} controls className="w-full max-h-96" />
            )}
            {post.content_type === 'audio' && (
              <audio src={post.file_url} controls className="w-full mt-2" />
            )}
            {post.content_type === 'pdf' && (
              <a href={post.file_url} target="_blank" rel="noopener noreferrer" 
                 className="flex items-center gap-2 p-4 text-primary hover:underline">
                <FiFile size={20} /> View Document
              </a>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-100">
        <button 
          onClick={handleLike} 
          className={`flex items-center gap-2 text-sm transition ${liked ? 'text-red-500' : 'text-gray-500 hover:text-primary'}`}
        >
          {liked ? <FiHeart className="fill-current" /> : <FiHeart />} {likeCount}
        </button>
        <button 
          onClick={() => setShowComments(!showComments)} 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition"
        >
          <FiMessageCircle /> {post.comments || 0}
        </button>
        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition">
          <FiShare2 /> Share
        </button>
        <button 
          onClick={() => setSaved(!saved)} 
          className={`flex items-center gap-2 text-sm transition ${saved ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
        >
          {saved ? <FiBookmark className="fill-current" /> : <FiBookmark />}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex gap-3">
            <input 
              placeholder="Write a comment..." 
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:border-primary text-sm"
            />
            <button className="bg-primary text-white px-4 py-2 rounded-full hover:bg-red-800 transition text-sm">
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;