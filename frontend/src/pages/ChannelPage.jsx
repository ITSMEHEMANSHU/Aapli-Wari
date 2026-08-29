import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
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
  FiClock,
  FiPhone,
  FiMapPin,
  FiAlertTriangle,
  FiShield,
  FiX
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';

export const ChannelPage = ({ isAdminView = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, canContribute, canManageChannel, isPalkhiPramukhApplied } = useAuth();
  const adminView = isAdminView || location.pathname.startsWith('/admin/');
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Core Data States
  const [channel, setChannel] = useState(null);
  const [posts, setPosts] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);

  // Status & Permission States
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [joinRequestPending, setJoinRequestPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Tab & View States
  const [activeTab, setActiveTab] = useState('announcements'); // 'announcements' | 'chat' | 'map' | 'info'

  // Input & Post States
  const [newPost, setNewPost] = useState('');
  const [postMedia, setPostMedia] = useState(null);
  const [posting, setPosting] = useState(false);

  // Announcement Form States
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [announcementPinned, setAnnouncementPinned] = useState(false);
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);

  // Emergency Contact States
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState({ name: '', phone: '', role: '' });
  const [savingEmergency, setSavingEmergency] = useState(false);

  // Modal States
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showContributorsModal, setShowContributorsModal] = useState(false);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'chat' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [posts, activeTab]);

  // Fetch Channel & Contributors Data
  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        const channelData = await api.channel(id);
        setChannel(channelData);
        setFollowersCount(channelData.followers_count || 0);

        if (user && channelData) {
          const userIsOwner = channelData.created_by_user_id === user.id;
          setIsOwner(userIsOwner);

          // Check membership
          try {
            const memberships = await api.myChannelMemberships();
            const memberIds = new Set((memberships || []).map((c) => c.id));
            setIsMember(memberIds.has(channelData.id));
          } catch (memErr) {
            console.warn('Could not fetch user memberships:', memErr);
          }

          // Check pending join request
          if (canContribute && canContribute() && !userIsOwner) {
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

        // Fetch Contributors
        try {
          const contribs = await api.channelContributors(id);
          setContributors(contribs || []);
        } catch (contribErr) {
          console.warn('Could not fetch channel contributors:', contribErr);
        }

        await fetchPosts();
      } catch (error) {
        console.error('Failed to load channel:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [id, user]);

  // Check Follow Status
  useEffect(() => {
    if (user && channel && !isOwner && !adminView) {
      api.getFollowStatus(id)
        .then((data) => setIsFollowing(Boolean(data?.is_following)))
        .catch(() => {});
    }
  }, [user, channel, isOwner, id]);

  // Pre-fill emergency contact state
  useEffect(() => {
    if (channel) {
      setEmergencyContact({
        name: channel.emergency_contact_name || '',
        phone: channel.emergency_contact_phone || '',
        role: channel.emergency_contact_role || '',
      });
    }
  }, [channel]);

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const channelPosts = await api.channelPosts(id);
      setPosts(channelPosts || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleFollowToggle = async () => {
    if (adminView) return;
    if (!user) {
      navigate('/login', { state: { from: `/channel/${id}` } });
      return;
    }
    try {
      setFollowLoading(true);
      if (isFollowing) {
        await api.unfollowChannel(id);
        setIsFollowing(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
      } else {
        await api.followChannel(id);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Follow toggle failed:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleJoinChannel = async () => {
    if (adminView) return;
    if (!user) {
      navigate('/login', { state: { message: 'Please log in to join channels.' } });
      return;
    }
    if (isMember) return;
    try {
      await api.joinChannel(id);
      setJoinRequestPending(true);
    } catch (error) {
      console.error('Failed to join channel:', error);
    }
  };

  const handleSaveEmergencyContact = async (e) => {
    if (e) e.preventDefault();
    try {
      setSavingEmergency(true);
      await api.updateEmergencyContact(id, {
        emergency_contact_name: emergencyContact.name || null,
        emergency_contact_phone: emergencyContact.phone || null,
        emergency_contact_role: emergencyContact.role || null,
      });
      setChannel((prev) => ({
        ...prev,
        emergency_contact_name: emergencyContact.name,
        emergency_contact_phone: emergencyContact.phone,
        emergency_contact_role: emergencyContact.role,
      }));
      setShowEmergencyModal(false);
    } catch (err) {
      console.error('Failed to save emergency contact:', err);
    } finally {
      setSavingEmergency(false);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;
    try {
      setPostingAnnouncement(true);
      await api.createAnnouncement(id, {
        message: newAnnouncement.trim(),
        is_pinned: announcementPinned,
      });
      setNewAnnouncement('');
      setAnnouncementPinned(false);
      await fetchPosts();
    } catch (err) {
      console.error('Failed to post announcement:', err);
    } finally {
      setPostingAnnouncement(false);
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
        formData.append('content_type', 
          postMedia.type.startsWith('image/') ? 'image' :
          postMedia.type.startsWith('video/') ? 'video' :
          postMedia.type.startsWith('audio/') ? 'audio' : 'pdf'
        );
        formData.append('channel_id', id);
        formData.append('language', 'en');
        formData.append('tags', '');
        formData.append('file', postMedia);
        await api.uploadContent(formData);
      }

      await fetchPosts();
      setNewPost('');
      setPostMedia(null);
    } catch (error) {
      console.error('Failed to post message:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setPostMedia(file);
    e.target.value = '';
  };

  const timeAgo = (date) => {
    if (!date) return '';
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  // Filter and sort items
  const announcementPosts = [...posts.filter((p) => p.is_announcement)].sort((a, b) => {
    if (Number(Boolean(b.is_pinned)) !== Number(Boolean(a.is_pinned))) {
      return Number(Boolean(b.is_pinned)) - Number(Boolean(a.is_pinned));
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const chatPosts = [...posts.filter((p) => !p.is_announcement)].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  const canPostChat = !adminView && Boolean(user) && (canContribute?.() || canManageChannel?.() || isOwner || isMember);
  const canCreateAnnouncement = Boolean(user) && (canManageChannel?.() || isOwner || user?.role === 'admin');
  const hasEmergencyContact = Boolean(channel?.emergency_contact_name || channel?.emergency_contact_phone);

  const TABS = [
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'map', label: 'Route Map', icon: '📍' },
    { id: 'info', label: 'About & Info', icon: 'ℹ️' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] gap-3">
        <Loader size="lg" />
        <p className="text-sm font-medium text-[#8B1E1E] animate-pulse">Loading Wari Channel...</p>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="text-center py-20 px-4 max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center text-2xl text-[#DD6B35]">
          🔍
        </div>
        <h2 className="text-2xl font-bold text-[#2B1B12]">Channel Not Found</h2>
        <p className="text-sm text-gray-600 mt-2 mb-6">
          The palkhi channel you are looking for might have been moved or removed.
        </p>
        <Link
          to="/channels"
          className="inline-flex items-center px-4 py-2 bg-[#8B1E1E] text-white rounded-xl font-medium shadow-sm hover:bg-[#701616] transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to all channels
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F4EE] min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden">
      <div className="max-w-[1600px] w-full mx-auto flex-1 flex flex-col lg:flex-row h-full lg:h-[calc(100vh-4rem)]">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN (30%) - Fixed / Scrollable Channel Summary Sidebar            */}
        {/* ========================================================================= */}
        <aside className="w-full lg:w-[32%] xl:w-[30%] bg-white border-b lg:border-b-0 lg:border-r border-[#E8DFC8] flex flex-col overflow-y-auto shrink-0 shadow-sm">
          
          {/* Top back button & Mobile Breadcrumb */}
          <div className="px-5 py-4 border-b border-[#F0E6D8] flex items-center justify-between">
            <button
              onClick={() => navigate(adminView ? '/admin/channels' : -1)}
              className="inline-flex items-center text-xs font-semibold text-[#8B1E1E] hover:text-[#DD6B35] transition-colors"
            >
              <FiArrowLeft className="mr-1.5" size={15} /> {adminView ? 'Admin Channels' : 'All Channels'}
            </button>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FBF5EC] text-[#8B1E1E] border border-[#E8D9C3]">
              {channel.type || 'Palkhi Channel'}
            </span>
          </div>

          <div className="p-5 space-y-6 flex-1">
            {/* Channel Avatar & Primary Details */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#8B1E1E] to-[#DD6B35] flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-md border-4 border-white ring-2 ring-[#E8D9C3]">
                  {channel.name?.[0]?.toUpperCase() || 'W'}
                </div>
                {channel.status === 'active' && (
                  <span className="absolute bottom-1 right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Active Verified Channel">
                    <FiCheckCircle size={14} />
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-[#2B1B12] mt-3 tracking-tight">
                {channel.name}
              </h1>

              {/* Owner / Palkhi Pramukh subtitle */}
              <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                <FiShield className="text-[#DD6B35]" />
                <span>Pramukh:</span>
                <span className="text-[#2B1B12] font-semibold">
                  {channel.owner_name || channel.created_by_name || 'Sant Palkhi Mandal'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="w-full mt-4 flex items-center gap-2">
                {adminView ? (
                  <div className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#FDF8F0] text-[#6d2325] border border-[#E8D9C3] text-center shadow-sm">
                    Admin Read-Only View
                  </div>
                ) : user && !isOwner ? (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                      isFollowing
                        ? 'bg-[#FBF5EC] text-[#8B1E1E] border border-[#DD6B35]/40 hover:bg-red-50'
                        : 'bg-[#DD6B35] text-white hover:bg-[#C85A28] active:scale-[0.98]'
                    }`}
                  >
                    {followLoading ? (
                      <Loader size="xs" />
                    ) : isFollowing ? (
                      <>
                        <FiUserCheck size={16} /> Following
                      </>
                    ) : (
                      <>
                        <FiUserPlus size={16} /> + Follow Channel
                      </>
                    )}
                  </button>
                ) : isOwner ? (
                  <Link
                    to={`/channel/${id}/manage`}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#8B1E1E] text-white hover:bg-[#701616] transition-all text-center flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FiEdit2 size={14} /> Manage Channel
                  </Link>
                ) : (
                  <button
                    onClick={() => navigate('/login', { state: { from: `/channel/${id}` } })}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#DD6B35] text-white hover:bg-[#C85A28] transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FiUserPlus size={16} /> Follow Channel
                  </button>
                )}

                <button
                  onClick={() => setShowInfoModal(true)}
                  className="p-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-600 transition-colors"
                  title="More Details"
                >
                  <FiInfo size={16} />
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-2 bg-[#FBF5EC] p-3 rounded-2xl border border-[#E8D9C3]">
              <div className="bg-white rounded-xl p-2.5 text-center shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Followers</span>
                <span className="text-lg font-black text-[#8B1E1E]">{followersCount}</span>
              </div>
              <div className="bg-white rounded-xl p-2.5 text-center shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Updates</span>
                <span className="text-lg font-black text-[#8B1E1E]">{posts.length}</span>
              </div>
            </div>

            {/* Emergency Contact Card (Highlighted Red Card) */}
            <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50/50 p-4 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs shadow-xs">
                    <FiAlertTriangle size={13} />
                  </span>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-red-900">
                    Emergency Helpline
                  </h3>
                </div>
                {isOwner && (
                  <button
                    onClick={() => setShowEmergencyModal(true)}
                    className="text-[11px] font-bold text-red-700 hover:underline flex items-center gap-1"
                  >
                    <FiEdit2 size={11} /> Edit
                  </button>
                )}
              </div>

              {hasEmergencyContact ? (
                <div className="space-y-1.5 mt-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-gray-800">
                      {channel.emergency_contact_name || 'Emergency Coordinator'}
                    </span>
                    {channel.emergency_contact_role && (
                      <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded">
                        {channel.emergency_contact_role}
                      </span>
                    )}
                  </div>
                  {channel.emergency_contact_phone && (
                    <a
                      href={`tel:${channel.emergency_contact_phone}`}
                      className="inline-flex items-center justify-center gap-2 w-full mt-2 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold tracking-wide shadow-sm transition-all active:scale-[0.98]"
                    >
                      <FiPhone size={14} className="animate-bounce" /> Call {channel.emergency_contact_phone}
                    </a>
                  )}
                </div>
              ) : (
                <div className="py-2 text-center">
                  <p className="text-xs text-gray-500 italic">No emergency helpline configured yet.</p>
                  {isOwner && (
                    <button
                      onClick={() => setShowEmergencyModal(true)}
                      className="mt-2 text-xs font-bold text-red-700 bg-white border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      + Add Emergency Contact
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Mini Map Placeholder Card */}
            <div className="bg-white border border-[#E8D9C3] rounded-2xl p-4 shadow-2xs relative group">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <FiMapPin className="text-[#DD6B35]" /> Live Route & Tents
                </h4>
                <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  Live Track
                </span>
              </div>
              <div className="h-28 rounded-xl bg-[#FBF5EC] border border-dashed border-[#DD6B35]/40 flex flex-col items-center justify-center p-3 text-center">
                <span className="text-2xl mb-1">🗺️</span>
                <p className="text-xs font-medium text-[#2B1B12]">Palkhi Route Map</p>
                <p className="text-[10px] text-gray-500">Live halts, water & medical points</p>
              </div>
              <button
                onClick={() => setActiveTab('map')}
                className="w-full mt-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#8B1E1E] bg-[#FBF5EC] hover:bg-[#F3E7D3] border border-[#E8D9C3] transition-colors"
              >
                Open Route Map →
              </button>
            </div>

            {/* Contributors Preview Card */}
            <div className="bg-white border border-[#E8D9C3] rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <FiUsers className="text-[#8B1E1E]" /> Contributors ({contributors.length})
                </h4>
                <button
                  onClick={() => setShowContributorsModal(true)}
                  className="text-[11px] font-bold text-[#8B1E1E] hover:underline"
                >
                  View All
                </button>
              </div>

              {contributors.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No assigned contributors yet.</p>
              ) : (
                <div className="flex items-center -space-x-2 overflow-hidden py-1">
                  {contributors.slice(0, 5).map((c, i) => (
                    <div
                      key={c.id || i}
                      className="inline-block ring-2 ring-white rounded-full"
                      title={c.full_name || c.username}
                    >
                      <Avatar
                        size="sm"
                        fallback={c.full_name?.[0] || c.username?.[0] || 'V'}
                      />
                    </div>
                  ))}
                  {contributors.length > 5 && (
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#8B1E1E] text-white text-[10px] font-bold ring-2 ring-white">
                      +{contributors.length - 5}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN (70%) - Main Tab Navigation & WhatsApp-style Interactive Area */}
        {/* ========================================================================= */}
        <main className="w-full lg:w-[68%] xl:w-[70%] flex flex-col bg-[#FDFBF7] h-full overflow-hidden">
          
          {/* Top Sticky Bar */}
          <header className="bg-white/95 backdrop-blur-md border-b border-[#E8D9C3] px-4 py-3 sticky top-0 z-10 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="lg:hidden w-10 h-10 rounded-full bg-[#8B1E1E] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {channel.name?.[0]?.toUpperCase() || 'W'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base sm:text-lg font-bold text-[#2B1B12] truncate">
                      {channel.name}
                    </h2>
                    {channel.status === 'active' && (
                      <FiCheckCircle className="text-green-500 shrink-0" size={15} />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">
                    {contributors.length} Sevaks • {followersCount} Warkari Followers
                  </p>
                </div>
              </div>

              {/* Action shortcuts */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {hasEmergencyContact && (
                  <a
                    href={`tel:${channel.emergency_contact_phone}`}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-colors shrink-0"
                  >
                    <FiPhone size={13} /> Call Helpline
                  </a>
                )}
                <button
                  onClick={() => setShowContributorsModal(true)}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
                  title="Channel Contributors"
                >
                  <FiUsers size={18} />
                </button>
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
                  title="Channel Information"
                >
                  <FiInfo size={18} />
                </button>
              </div>
            </div>

            {/* Emergency Ribbon if set (Sticky alert bar) */}
            {hasEmergencyContact && (
              <div className="mt-2.5 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-red-800">
                <div className="flex items-center gap-2 truncate">
                  <FiAlertTriangle className="text-red-600 shrink-0" />
                  <span className="font-semibold truncate">
                    Helpline: {channel.emergency_contact_name} ({channel.emergency_contact_phone})
                  </span>
                </div>
                <a
                  href={`tel:${channel.emergency_contact_phone}`}
                  className="font-bold underline text-red-700 shrink-0 hover:text-red-900 ml-2"
                >
                  Call Now
                </a>
              </div>
            )}

            {/* Tab Navigation Pill Bar */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar pt-3 mt-1 border-t border-gray-100">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#8B1E1E] text-white shadow-xs'
                        : 'bg-[#FBF5EC] text-gray-700 hover:bg-[#F3E7D3] hover:text-[#2B1B12]'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.id === 'announcements' && announcementPosts.length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive ? 'bg-white text-[#8B1E1E]' : 'bg-[#DD6B35] text-white'
                      }`}>
                        {announcementPosts.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </header>

          {/* Tab Content Display Area (Scrollable independently) */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
            
            {/* -------------------- TAB 1: ANNOUNCEMENTS -------------------- */}
            {activeTab === 'announcements' && (
              <div className="space-y-4 max-w-2xl mx-auto">
                {/* Post Announcement Form for Pramukh / Owner / Admins */}
                {canCreateAnnouncement && (
                  <div className="bg-white border-2 border-[#DD6B35]/30 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">📢</span>
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#8B1E1E]">
                        Post Official Palkhi Announcement
                      </h3>
                    </div>
                    <form onSubmit={handlePostAnnouncement} className="space-y-3">
                      <textarea
                        rows={3}
                        placeholder="Broadcast route changes, meal timings, water points, or important alerts to all warkaris..."
                        value={newAnnouncement}
                        onChange={(e) => setNewAnnouncement(e.target.value)}
                        className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#8B1E1E] focus:ring-1 focus:ring-[#8B1E1E]/20 resize-none bg-[#FDFBF7]"
                      />
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={announcementPinned}
                            onChange={(e) => setAnnouncementPinned(e.target.checked)}
                            className="w-4 h-4 rounded text-[#8B1E1E] focus:ring-[#8B1E1E] accent-[#8B1E1E]"
                          />
                          📌 Pin this update to top
                        </label>
                        <Button
                          type="submit"
                          disabled={postingAnnouncement || !newAnnouncement.trim()}
                          className="!px-4 !py-1.5 !bg-[#8B1E1E] hover:!bg-[#701616] text-white text-xs font-bold rounded-xl shadow-xs"
                        >
                          {postingAnnouncement ? 'Broadcasting...' : 'Broadcast Announcement'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Announcements List */}
                {announcementPosts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#E8D9C3] bg-white p-10 text-center">
                    <div className="text-5xl mb-3">🪧</div>
                    <h3 className="text-base font-bold text-[#2B1B12]">No Announcements Yet</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      Official notifications regarding schedule, prasad halts, and Aarti will appear here.
                    </p>
                  </div>
                ) : (
                  announcementPosts.map((post) => (
                    <article
                      key={`ann-${post.id}`}
                      className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-xs ${
                        post.is_pinned
                          ? 'bg-[#FFFBF2] border-amber-300 ring-1 ring-amber-200'
                          : 'bg-white border-[#E8DFC8]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#8B1E1E] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                            📢 Official Announcement
                          </span>
                          {post.is_pinned && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900">
                              📌 Pinned
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-gray-400">{timeAgo(post.created_at)}</span>
                      </div>

                      {post.title && post.title !== 'Channel Post' && (
                        <h4 className="text-base font-bold text-[#2B1B12] mb-1.5">{post.title}</h4>
                      )}

                      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {post.message || post.description}
                      </p>

                      {post.file_url && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                          {post.content_type === 'image' ? (
                            <img src={post.file_url} alt={post.title || 'Announcement'} className="w-full max-h-80 object-cover" />
                          ) : (
                            <a href={post.file_url} target="_blank" rel="noopener noreferrer" className="p-3 flex items-center gap-2 text-xs font-bold text-[#8B1E1E]">
                              <FiFile size={16} /> View Attached Document
                            </a>
                          )}
                        </div>
                      )}

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Avatar size="xs" fallback={post.user?.full_name?.[0] || 'P'} />
                          <span className="font-bold text-[#2B1B12] text-xs">
                            {post.user?.full_name || 'Palkhi Pramukh'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button className="flex items-center gap-1 hover:text-[#8B1E1E]">
                            <FiHeart size={13} /> {post.likes || 0}
                          </button>
                          <button className="flex items-center gap-1 hover:text-[#8B1E1E]">
                            <FiShare2 size={13} /> Share
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}

            {/* -------------------- TAB 2: WHATSAPP-STYLE CHAT -------------------- */}
            {activeTab === 'chat' && (
              <div className="space-y-3 pb-2 max-w-3xl mx-auto">
                {loadingPosts ? (
                  <div className="flex justify-center py-10"><Loader size="md" /></div>
                ) : chatPosts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#E8D9C3] bg-white p-10 text-center">
                    <div className="text-5xl mb-3">💬</div>
                    <h3 className="text-base font-bold text-[#2B1B12]">Start the Conversation</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      Channel members and authorized sevaks can coordinate updates in real-time here.
                    </p>
                  </div>
                ) : (
                  chatPosts.map((post) => {
                    const isMyPost = post.user_id === user?.id || (isOwner && post.user?.role === 'admin');
                    return (
                      <div
                        key={post.id}
                        className={`flex gap-2 sm:gap-3 items-end ${isMyPost ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMyPost && (
                          <Avatar
                            size="sm"
                            fallback={post.user?.full_name?.[0] || post.user?.username?.[0] || 'W'}
                            className="shrink-0 mb-1"
                          />
                        )}

                        <div className={`max-w-[85%] sm:max-w-[75%] min-w-[140px]`}>
                          {/* Bubble Container */}
                          <div
                            className={`px-3.5 py-2.5 rounded-2xl shadow-xs text-sm relative ${
                              isMyPost
                                ? 'bg-gradient-to-br from-[#8B1E1E] to-[#A42525] text-white rounded-br-xs'
                                : 'bg-white text-gray-900 border border-[#E8D9C3] rounded-bl-xs'
                            }`}
                          >
                            {!isMyPost && (
                              <p className="text-[11px] font-bold text-[#DD6B35] mb-1 truncate">
                                {post.user?.full_name || post.user?.username || 'Sevak'}
                              </p>
                            )}

                            {post.title && post.title !== 'Channel Post' && (
                              <p className={`font-bold mb-1 ${isMyPost ? 'text-white' : 'text-[#2B1B12]'}`}>
                                {post.title}
                              </p>
                            )}

                            {post.description && (
                              <p className={`whitespace-pre-wrap leading-relaxed ${isMyPost ? 'text-white/95' : 'text-gray-800'}`}>
                                {post.description}
                              </p>
                            )}

                            {/* Media Attachment Rendering */}
                            {post.file_url && (
                              <div className="mt-2 rounded-xl overflow-hidden bg-black/5">
                                {post.content_type === 'image' && (
                                  <img
                                    src={post.file_url}
                                    alt="Shared attachment"
                                    className="w-full max-h-72 object-cover rounded-lg cursor-pointer hover:opacity-95"
                                    onClick={() => window.open(post.file_url, '_blank')}
                                  />
                                )}
                                {post.content_type === 'video' && (
                                  <video src={post.file_url} controls className="w-full max-h-72 rounded-lg" />
                                )}
                                {post.content_type === 'audio' && (
                                  <audio src={post.file_url} controls className="w-full mt-1" />
                                )}
                                {post.content_type === 'pdf' && (
                                  <a
                                    href={post.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold ${
                                      isMyPost ? 'bg-white/20 text-white' : 'bg-[#FBF5EC] text-[#8B1E1E]'
                                    }`}
                                  >
                                    <FiFile size={16} /> Attached Document (PDF)
                                  </a>
                                )}
                              </div>
                            )}

                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                                isMyPost ? 'text-white/70' : 'text-gray-400'
                              }`}
                            >
                              <span>{timeAgo(post.created_at)}</span>
                              {isMyPost && <FiCheckCircle size={10} className="text-white/80" />}
                            </div>
                          </div>

                          {/* Quick Message Actions */}
                          <div className={`flex items-center gap-3 mt-1 px-1.5 text-[11px] text-gray-500 ${isMyPost ? 'justify-end' : ''}`}>
                            <button className="flex items-center gap-1 hover:text-[#8B1E1E]">
                              <FiHeart size={12} /> {post.likes || 0}
                            </button>
                            <button className="flex items-center gap-1 hover:text-[#8B1E1E]">
                              <FiMessageCircle size={12} />
                            </button>
                            <button className="hover:text-[#8B1E1E]">
                              <FiShare2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* -------------------- TAB 3: ROUTE MAP -------------------- */}
            {activeTab === 'map' && (
              <div className="bg-white border border-[#E8D9C3] rounded-3xl p-6 sm:p-10 text-center max-w-2xl mx-auto shadow-sm">
                <div className="w-20 h-20 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center text-4xl text-[#DD6B35] shadow-inner">
                  📍
                </div>
                <h3 className="text-xl font-black text-[#2B1B12]">Palkhi Route Map & Halts</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
                  Interactive real-time map integration showing GPS live location of Palkhi, Annachhatra (Food) tents, Drinking Water, Medical Vans, and Police checkpoints.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 max-w-lg mx-auto">
                  <div className="p-3 bg-[#FBF5EC] rounded-xl text-center border border-[#E8D9C3]">
                    <span className="text-lg">🏕️</span>
                    <p className="text-[11px] font-bold text-gray-700 mt-1">Night Halts</p>
                  </div>
                  <div className="p-3 bg-[#FBF5EC] rounded-xl text-center border border-[#E8D9C3]">
                    <span className="text-lg">🍲</span>
                    <p className="text-[11px] font-bold text-gray-700 mt-1">Annachhatra</p>
                  </div>
                  <div className="p-3 bg-[#FBF5EC] rounded-xl text-center border border-[#E8D9C3]">
                    <span className="text-lg">🚑</span>
                    <p className="text-[11px] font-bold text-gray-700 mt-1">Medical</p>
                  </div>
                  <div className="p-3 bg-[#FBF5EC] rounded-xl text-center border border-[#E8D9C3]">
                    <span className="text-lg">💧</span>
                    <p className="text-[11px] font-bold text-gray-700 mt-1">Water Tanks</p>
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/map')}
                  className="!bg-[#8B1E1E] hover:!bg-[#701616] text-white text-xs font-bold !px-6 !py-2.5 rounded-xl shadow-sm inline-flex items-center gap-2"
                >
                  <FiMapPin /> Open Interactive Live Map
                </Button>
              </div>
            )}

            {/* -------------------- TAB 4: ABOUT & INFO -------------------- */}
            {activeTab === 'info' && (
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="bg-white border border-[#E8D9C3] rounded-2xl p-5 shadow-2xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    About This Channel
                  </h3>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {channel.description || 'Dedicated channel for Palkhi updates, Aarti schedules, seva details, and warkari pilgrim coordination.'}
                  </p>
                </div>

                {/* Emergency Contact detail card */}
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-red-800 flex items-center gap-1.5">
                      <FiAlertTriangle /> Palkhi Helpline & Medical Emergency
                    </h3>
                    {isOwner && (
                      <button
                        onClick={() => setShowEmergencyModal(true)}
                        className="text-xs font-bold text-red-700 underline"
                      >
                        Edit Helpline
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 text-sm text-gray-800">
                    <p><span className="font-semibold text-gray-600">Contact Person:</span> {channel.emergency_contact_name || 'Not specified'}</p>
                    <p>
                      <span className="font-semibold text-gray-600">Helpline Phone:</span>{' '}
                      {channel.emergency_contact_phone ? (
                        <a href={`tel:${channel.emergency_contact_phone}`} className="text-red-700 font-bold underline">
                          {channel.emergency_contact_phone}
                        </a>
                      ) : 'Not specified'}
                    </p>
                    <p><span className="font-semibold text-gray-600">Designation / Role:</span> {channel.emergency_contact_role || 'Pramukh / Seva Head'}</p>
                  </div>
                </div>

                {/* Contributors List card */}
                <div className="bg-white border border-[#E8D9C3] rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Authorized Sevaks ({contributors.length})
                    </h3>
                    <button
                      onClick={() => setShowContributorsModal(true)}
                      className="text-xs font-bold text-[#8B1E1E] hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {contributors.slice(0, 6).map((c) => (
                      <div key={c.id} className="flex items-center gap-2.5 p-2 bg-[#FBF5EC] rounded-xl border border-[#E8D9C3]/60">
                        <Avatar size="xs" fallback={c.full_name?.[0] || 'S'} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#2B1B12] truncate">{c.full_name || c.username}</p>
                          <p className="text-[10px] text-gray-500 truncate">{c.email || 'Verified Sevak'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Input Bar for Chat Tab */}
          {activeTab === 'chat' && (
            <footer className="bg-white border-t border-[#E8D9C3] px-3 sm:px-5 py-3 shrink-0">
              {canPostChat ? (
                <form onSubmit={handlePost} className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 text-gray-500 hover:text-[#8B1E1E] hover:bg-[#FBF5EC] rounded-full transition-colors shrink-0"
                    title="Attach Media / Document"
                  >
                    <FiPaperclip size={20} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,video/*,audio/*,application/pdf"
                    onChange={handleFileChange}
                  />

                  <div className="flex-1 relative min-w-0">
                    {postMedia && (
                      <div className="absolute -top-10 left-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 shadow-md max-w-full">
                        <span className="truncate">📎 {postMedia.name}</span>
                        <button
                          type="button"
                          onClick={() => setPostMedia(null)}
                          className="text-red-400 hover:text-white"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    )}
                    <textarea
                      rows={1}
                      placeholder={postMedia ? `File attached: ${postMedia.name}` : 'Write a message to channel...'}
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handlePost(e);
                        }
                      }}
                      className="w-full px-4 py-2.5 text-sm bg-[#FDFBF7] border border-[#E8D9C3] rounded-2xl focus:outline-none focus:border-[#8B1E1E] focus:ring-1 focus:ring-[#8B1E1E]/30 resize-none max-h-28"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={posting || (!newPost.trim() && !postMedia)}
                    className={`p-3 rounded-full shrink-0 transition-all shadow-sm ${
                      newPost.trim() || postMedia
                        ? 'bg-[#8B1E1E] text-white hover:bg-[#701616] scale-100'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {posting ? <Loader size="xs" /> : <FiSend size={16} />}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-3 py-1">
                  <div>
                    <p className="text-xs font-bold text-[#2B1B12]">Contribute to this Channel</p>
                    <p className="text-[11px] text-gray-500">Become an authorized sevak or request membership to post.</p>
                  </div>
                  {canContribute && canContribute() ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleJoinChannel}
                      disabled={joinRequestPending}
                      className="!bg-[#8B1E1E] hover:!bg-[#701616] text-white text-xs font-bold shrink-0"
                    >
                      {joinRequestPending ? 'Request Pending' : 'Request to Post'}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/apply-contributor', { state: { from: `/channel/${id}` } })}
                      className="!bg-[#DD6B35] hover:!bg-[#C85A28] text-white text-xs font-bold shrink-0"
                    >
                      Apply as Sevak
                    </Button>
                  )}
                </div>
              )}
            </footer>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODALS: Emergency Contact Editor, Info & Contributors List                 */}
      {/* ========================================================================= */}

      {/* 1. Emergency Contact Edit Modal */}
      <Modal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        title="🚨 Update Emergency Helpline"
        size="md"
      >
        <form onSubmit={handleSaveEmergencyContact} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Contact Person / Center Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Patil / Palkhi Seva Kendra"
              value={emergencyContact.name}
              onChange={(e) => setEmergencyContact((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#8B1E1E] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Emergency Phone Number
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={emergencyContact.phone}
              onChange={(e) => setEmergencyContact((p) => ({ ...p, phone: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#8B1E1E] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Designation / Role Description
            </label>
            <input
              type="text"
              placeholder="e.g. Medical Van Coordinator, Local Pramukh"
              value={emergencyContact.role}
              onChange={(e) => setEmergencyContact((p) => ({ ...p, role: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#8B1E1E] focus:outline-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEmergencyModal(false)}
              className="flex-1 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={savingEmergency}
              className="flex-1 !bg-red-600 hover:!bg-red-700 text-white text-xs font-bold"
            >
              {savingEmergency ? 'Saving...' : 'Save Helpline'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Detailed Info Modal */}
      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Channel Details"
        size="lg"
      >
        <div className="space-y-4 text-sm text-gray-700">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-14 h-14 rounded-full bg-[#8B1E1E] text-white flex items-center justify-center font-black text-xl">
              {channel.name?.[0]?.toUpperCase() || 'W'}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2B1B12]">{channel.name}</h3>
              <p className="text-xs text-gray-500">Created: {new Date(channel.created_at).toLocaleDateString('en-GB')}</p>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Description</h4>
            <p className="leading-relaxed bg-[#FBF5EC] p-3 rounded-xl border border-[#E8D9C3]">
              {channel.description || 'Official Palkhi Channel on Aapli Wari Platform.'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl border">
              <span className="text-xs text-gray-500 block">Followers</span>
              <span className="text-base font-bold text-[#2B1B12]">{followersCount}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border">
              <span className="text-xs text-gray-500 block">Total Updates</span>
              <span className="text-base font-bold text-[#2B1B12]">{posts.length}</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* 3. Contributors List Modal */}
      <Modal
        isOpen={showContributorsModal}
        onClose={() => setShowContributorsModal(false)}
        title={`All Contributors (${contributors.length})`}
        size="md"
      >
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {contributors.length === 0 ? (
            <p className="text-center py-6 text-xs text-gray-500">No contributors listed.</p>
          ) : (
            contributors.map((c) => (
              <div
                key={c.id || c.user_id}
                className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-[#FBF5EC] rounded-xl border border-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar size="sm" fallback={c.full_name?.[0] || c.username?.[0] || 'S'} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#2B1B12] truncate">{c.full_name || c.username}</p>
                    <p className="text-[11px] text-gray-500 truncate">{c.email}</p>
                  </div>
                </div>
                {c.id === channel?.created_by_user_id ? (
                  <Badge variant="primary" className="text-[10px]">Pramukh</Badge>
                ) : (
                  <Badge variant="default" className="text-[10px]">Sevak</Badge>
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