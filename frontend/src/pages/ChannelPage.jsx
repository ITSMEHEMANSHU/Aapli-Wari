import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { 
  FiArrowLeft, 
  FiUsers, 
  FiCalendar, 
  FiSend, 
  FiImage, 
  FiVideo, 
  FiMusic, 
  FiFile,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiBookmark,
  FiMoreHorizontal,
  FiCheckCircle,
  FiUserPlus,
  FiUserCheck,
  FiEdit2,
  FiInfo,
  FiGrid,
  FiList,
  FiPaperclip,
  FiCamera,
  FiMic,
  FiSmile,
  FiClock
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';


export const ChannelPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, canContribute, canManageChannel } = useAuth();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [channel, setChannel] = useState(null);
  const [posts, setPosts] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [postMedia, setPostMedia] = useState(null);
  const [posting, setPosting] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [showContributors, setShowContributors] = useState(false);
  const [activeView, setActiveView] = useState('posts'); // 'posts' | 'media' | 'about'
  const [joinRequestPending, setJoinRequestPending] = useState(false);

  // Scroll to bottom when new posts arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [posts]);

  // Fetch channel data
  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        const channelData = await api.channel(id);
        setChannel(channelData);

        if (user) {
          setIsOwner(channelData.created_by_user_id === user.id);
          
          // Check if user is member
          const memberships = await api.myChannelMemberships();
          const memberIds = new Set(memberships.map(c => c.id));
          setIsMember(memberIds.has(channelData.id));
          
          // Only contributors can create or view join requests.
          if (user.role === 'contributor') {
            try {
              const myRequest = await api.myJoinRequest(id);
              if (myRequest && myRequest.status === 'pending') {
                setJoinRequestPending(true);
              }
            } catch {
              setJoinRequestPending(false);
            }
          }
        }

        const contribs = await api.channelContributors(id);
        setContributors(contribs);

        await fetchPosts();

      } catch (error) {
        console.error('Failed to load channel:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [id, user]);

const fetchPosts = async () => {
  try {
    setLoadingPosts(true);
    const channelPosts = await api.channelPosts(id);
    setPosts(channelPosts);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  } finally {
    setLoadingPosts(false);
  }
};

  // Handle follow/join channel
  const handleJoinChannel = async () => {
    try {
      if (!user) {
        navigate('/login', { state: { message: 'Please log in to follow channels.' } });
        return;
      }
      
      if (isMember) {
        return;
      }
      
      await api.joinChannel(id);
      setJoinRequestPending(true);
      
    } catch (error) {
      console.error('Failed to join channel:', error);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !postMedia) return;
    
    if (!user) {
      navigate('/login', { state: { message: 'Please log in to post in channels.' } });
      return;
    }
    
    try {
      setPosting(true);
    
    if (!postMedia) {
      await api.createChannelPost(id, newPost);
    } else {
      const formData = new FormData();
      const title = newPost.trim() || 'Channel Post';
      formData.append('title', title.substring(0, 100));
      formData.append('description', newPost);
      formData.append('content_type', postMedia.type.startsWith('image/') ? 'image' :
        postMedia.type.startsWith('video/') ? 'video' :
        postMedia.type.startsWith('audio/') ? 'audio' : 'pdf');
      formData.append('channel_id', id);
      formData.append('language', 'en');
      formData.append('tags', '');
      formData.append('file', postMedia);
      await api.uploadContent(formData);
    }
    
    // Refresh posts
    await fetchPosts();
    setNewPost('');
    setPostMedia(null);
    
  } catch (error) {
    console.error('Failed to post:', error);
  } finally {
    setPosting(false);
  }
};

  // Handle file attachment click
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostMedia(file);
    }
    e.target.value = ''; // Reset input
  };

  // Render time ago
  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return new Date(date).toLocaleDateString();
  };

  // Render a single post (like WhatsApp message)
  const renderPost = (post) => {
    const isOwnerPost = post.user_id === user?.id;
    
    return (
      <div key={post.id} className={`flex gap-3 mb-4 ${isOwnerPost ? 'justify-end' : ''}`}>
        {!isOwnerPost && (
          <Avatar 
            size="sm" 
            fallback={post.user?.full_name?.[0] || post.user?.username?.[0] || 'U'}
          />
        )}
        <div className={`max-w-[85%] ${isOwnerPost ? 'order-1' : ''}`}>
          <div className={`rounded-2xl px-4 py-3 ${
            isOwnerPost 
              ? 'bg-primary text-white' 
              : 'bg-white shadow-sm border border-gray-100'
          }`}>
            {/* Sender name (only for non-owner) */}
            {!isOwnerPost && (
              <p className="text-xs font-semibold text-primary mb-1">
                {post.user?.full_name || post.user?.username || 'Unknown'}
              </p>
            )}
            
            {/* Title */}
            {post.title && post.title !== 'Channel Post' && (
              <p className={`font-medium ${isOwnerPost ? 'text-white' : 'text-gray-800'}`}>
                {post.title}
              </p>
            )}
            
            {/* Description/Content */}
            {post.description && (
              <p className={`${isOwnerPost ? 'text-white/90' : 'text-gray-700'}`}>
                {post.description}
              </p>
            )}
            
            {/* Media */}
            {post.file_url && (
              <div className={`mt-2 rounded-lg overflow-hidden ${
                post.content_type === 'image' ? 'bg-gray-100' : ''
              }`}>
                {post.content_type === 'image' && (
                  <img 
                    src={post.file_url} 
                    alt={post.title} 
                    className="w-full max-h-80 object-contain rounded-lg"
                  />
                )}
                {post.content_type === 'video' && (
                  <video 
                    src={post.file_url} 
                    controls 
                    className="w-full max-h-80 rounded-lg"
                  />
                )}
                {post.content_type === 'audio' && (
                  <audio 
                    src={post.file_url} 
                    controls 
                    className="w-full mt-2"
                  />
                )}
                {post.content_type === 'pdf' && (
                  <a 
                    href={post.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      isOwnerPost ? 'bg-white/10 text-white' : 'bg-gray-100 text-primary'
                    } hover:underline`}
                  >
                    <FiFile /> View Document
                  </a>
                )}
              </div>
            )}
            
            {/* Verified badge */}
            {post.verified && (
              <div className="flex items-center gap-1 mt-1">
                <FiCheckCircle size={12} className="text-green-500" />
                <span className="text-xs text-green-600">Verified</span>
              </div>
            )}
            
            {/* Timestamp */}
            <p className={`text-xs mt-2 ${isOwnerPost ? 'text-white/60' : 'text-gray-400'}`}>
              {timeAgo(post.created_at)}
            </p>
          </div>
          
          {/* Action buttons (like, comment, share) - only for non-owner posts or show always */}
          <div className={`flex items-center gap-4 mt-1 px-2 ${isOwnerPost ? 'justify-end' : ''}`}>
            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition">
              <FiHeart size={14} /> {post.likes || 0}
            </button>
            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition">
              <FiMessageCircle size={14} /> {post.comments || 0}
            </button>
            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition">
              <FiShare2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Channel not found</h2>
        <Link to="/channels" className="text-primary hover:underline mt-2 inline-block">
          ← Back to channels
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* ============================================================
          HEADER - Like WhatsApp Channel Header
          ============================================================ */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="hover:text-primary transition">
              <FiArrowLeft size={24} />
            </button>
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setShowInfo(true)}
            >
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {channel.name?.[0]?.toUpperCase() || 'C'}
              </div>
              <div>
                <h1 className="text-lg font-bold flex items-center gap-2">
                  {channel.name}
                  {channel.status === 'active' && (
                    <FiCheckCircle className="text-green-500" size={14} />
                  )}
                </h1>
                <p className="text-xs text-gray-500">
                  {contributors.length} contributors • {posts.length} posts
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Info button */}
            <button 
              onClick={() => setShowInfo(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <FiInfo size={20} className="text-gray-600" />
            </button>
            
            {/* Contributors button */}
            <button 
              onClick={() => setShowContributors(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <FiUsers size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          CHAT/POSTS AREA - Like WhatsApp Chat
          ============================================================ */}
      <div className="px-4 py-4 bg-gray-50 min-h-[60vh]">
        {/* Welcome/Empty state */}
        {posts.length === 0 && !loadingPosts && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📢</div>
            <h3 className="text-lg font-medium text-gray-700">No posts yet</h3>
            <p className="text-gray-500 text-sm">
              {isMember || isOwner 
                ? 'Be the first to post in this channel!'
                : 'Follow this channel to see posts'}
            </p>
          </div>
        )}

        {/* Loading posts */}
        {loadingPosts && (
          <div className="flex justify-center py-8">
            <Loader size="sm" />
          </div>
        )}

        {/* Render posts as chat messages */}
        <div className="space-y-1">
          {posts.map(post => renderPost(post))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ============================================================
          INPUT AREA - Like WhatsApp Input Bar
          ============================================================ */}
      {(isMember || isOwner) ? (
        <div className="bg-white border-t border-gray-200 px-4 py-3 sticky bottom-0">
          <form onSubmit={handlePost} className="flex items-end gap-2">
            {/* Attachment button */}
            <button
              type="button"
              onClick={handleAttachClick}
              className="p-2 text-gray-500 hover:text-primary transition flex-shrink-0"
            >
              <FiPaperclip size={22} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,video/*,audio/*,application/pdf"
              onChange={handleFileChange}
            />

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                placeholder={postMedia ? `Posting: ${postMedia.name}` : "Type a message..."}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePost(e);
                  }
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:border-primary resize-none max-h-32 text-sm"
                rows="1"
                style={{ minHeight: '44px' }}
              />
              
              {/* Media preview */}
              {postMedia && (
                <div className="absolute -top-10 left-2 bg-gray-800 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2">
                  <span>📎 {postMedia.name}</span>
                  <button 
                    type="button"
                    onClick={() => setPostMedia(null)}
                    className="hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={posting || (!newPost.trim() && !postMedia)}
              className={`p-2.5 rounded-full flex-shrink-0 transition ${
                (newPost.trim() || postMedia) && !posting
                  ? 'bg-primary text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {posting ? (
                <Loader size="sm" />
              ) : (
                <FiSend size={20} />
              )}
            </button>
          </form>
        </div>
      ) : (
        // ============================================================
        // JOIN CHANNEL BANNER - For non-members
        // ============================================================
        <div className="bg-white border-t border-gray-200 px-6 py-4 sticky bottom-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Join this channel</p>
              <p className="text-xs text-gray-500">Follow to see posts and contribute</p>
            </div>
            {canContribute && canContribute() ? (
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleJoinChannel}
                disabled={joinRequestPending}
                className="flex items-center gap-2"
              >
                {joinRequestPending ? (
                  <>
                    <FiClock size={14} /> Request Pending
                  </>
                ) : (
                  <>
                    <FiUserPlus size={14} /> Request to Join
                  </>
                )}
              </Button>
            ) : (
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => {
                  if (!user) {
                    navigate('/login', { state: { from: `/channel/${id}` } });
                  } else {
                    navigate('/apply-contributor', { state: { from: `/channel/${id}` } });
                  }
                }}
                className="flex items-center gap-2 bg-[#DD6B35] text-white"
              >
                <FiUserPlus size={14} /> Become a Contributor to join
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          INFO MODAL - Like WhatsApp Group Info
          ============================================================ */}
      <Modal 
        isOpen={showInfo} 
        onClose={() => setShowInfo(false)} 
        title="Channel Info"
        size="lg"
      >
        <div className="space-y-4">
          {/* Channel Avatar & Name */}
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {channel.name?.[0]?.toUpperCase() || 'C'}
            </div>
            <div>
              <h2 className="text-xl font-bold">{channel.name}</h2>
              <p className="text-sm text-gray-500">
                Created {new Date(channel.created_at).toLocaleDateString()}
              </p>
              {isOwner && <Badge variant="primary" className="mt-1">Channel Owner</Badge>}
              {isMember && <Badge variant="success" className="mt-1">Contributor</Badge>}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">About</h4>
            <p className="text-gray-700">{channel.description || 'No description provided'}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary">{contributors.length}</p>
              <p className="text-xs text-gray-500">Contributors</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary">{posts.length}</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary">{channel.status === 'active' ? '✅' : '⛔'}</p>
              <p className="text-xs text-gray-500">{channel.status}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-100">
            {canManageChannel && canManageChannel() && (isOwner || user?.role === 'admin') && (
              <Link to={`/channel/${id}/manage`} className="flex-1">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <FiEdit2 size={16} /> Manage Channel
                </Button>
              </Link>
            )}
            <button 
              onClick={() => setShowContributors(true)}
              className="flex-1"
            >
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <FiUsers size={16} /> View All Contributors
              </Button>
            </button>
          </div>
        </div>
      </Modal>

      {/* ============================================================
          CONTRIBUTORS MODAL
          ============================================================ */}
      <Modal 
        isOpen={showContributors} 
        onClose={() => setShowContributors(false)} 
        title={`Contributors (${contributors.length})`}
        size="lg"
      >
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {contributors.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No contributors yet</p>
          ) : (
            contributors.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                <Avatar size="md" fallback={c.full_name?.[0] || c.username?.[0] || 'U'} />
                <div className="flex-1">
                  <p className="font-medium">{c.full_name || c.username || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{c.email}</p>
                </div>
                {isOwner && c.id === channel?.created_by_user_id && (
                  <Badge variant="primary">Owner</Badge>
                )}
                {isOwner && c.id !== channel?.created_by_user_id && (
                  <Badge variant="default">Contributor</Badge>
                )}
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ChannelPage;