import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

import {
  FiArrowLeft,
  FiFile,
  FiHeart,
  FiShare2,
  FiCheckCircle,
  FiEdit2,
  FiX,
  FiSettings,
  FiStar,
  FiPaperclip,
  FiSearch,
  FiHome,
  FiMapPin,
  FiCalendar,
  FiTag,
  FiPhone,
  FiMessageCircle,
  FiInfo,
  FiUsers,
  FiBookmark,
  FiSend,
  FiImage,
  FiPlus,
  FiBell,
  FiUser,
} from 'react-icons/fi';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import ChannelRouteMap from '../components/channel/ChannelRouteMap';

export const ChannelPage = ({ isAdminView = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, canContribute, canManageChannel } = useAuth();
  const { t, language } = useLanguage();
  const adminView = isAdminView || location.pathname.startsWith('/admin/');
  const canContributePermission = typeof canContribute === 'function' ? canContribute() : false;

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
  const [notice, setNotice] = useState(null);
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(true);

  // Tab & View States
  const [activeTab, setActiveTab] = useState('announcements');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);

  // Modals
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showContributorsModal, setShowContributorsModal] = useState(false);

  // Input & Posting States (Chat & Announcements)
  const [newPost, setNewPost] = useState('');
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [announcementPinned, setAnnouncementPinned] = useState(false);
  const [postMedia, setPostMedia] = useState(null);
  const [posting, setPosting] = useState(false);
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);
  const [replyToPost, setReplyToPost] = useState(null);

  // Local state for toggle-like system per user
  const likedPostsStorageKey = user ? `wari_liked_posts_${user.id}` : 'wari_liked_posts_guest';
  const [likedPostIds, setLikedPostIds] = useState(() => {
    try {
      const stored = localStorage.getItem(likedPostsStorageKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [reactionMap, setReactionMap] = useState({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(likedPostsStorageKey);
      setLikedPostIds(stored ? JSON.parse(stored) : {});
    } catch {
      setLikedPostIds({});
    }
  }, [likedPostsStorageKey]);

  // Emergency contact edit state
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    phone: '',
    role: '',
  });
  const [savingEmergency, setSavingEmergency] = useState(false);

  const showNotice = (text, type = 'info') => {
    setNotice({ text, type });
  };

  const chatCanvasRef = useRef(null);

  // Keep page scrolled to top when opening channel
  useEffect(() => {
    window.scrollTo(0, 0);
    if (chatCanvasRef.current) {
      chatCanvasRef.current.scrollTop = 0;
    }
  }, [id]);

  const scrollToChatBottom = () => {
    if (chatCanvasRef.current) {
      chatCanvasRef.current.scrollTo({
        top: chatCanvasRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  // Fetch Channel & Contributors Data
  useEffect(() => {
    const fetchChannelData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const channelData = await api.channel(id);
        setChannel(channelData);
        setFollowersCount(channelData.followers_count || 0);

        if (user && channelData) {
          const userIsOwner = channelData.is_owner === true || String(channelData.created_by_user_id) === String(user.id);
          setIsOwner(userIsOwner);

          try {
            const memberships = await api.myChannelMemberships();
            const memberIds = new Set((memberships || []).map((c) => c.id));
            setIsMember(memberIds.has(channelData.id));
          } catch (memErr) {
            console.warn('Could not fetch user memberships:', memErr);
            setIsMember(false);
          }

          if (!userIsOwner && canContributePermission) {
            try {
              const myRequest = await api.myJoinRequest(id);
              setJoinRequestPending(Boolean(myRequest && myRequest.status === 'pending'));
            } catch {
              setJoinRequestPending(false);
            }
          } else {
            setJoinRequestPending(false);
          }
        }

        try {
          const contribs = await api.channelContributors(id);
          setContributors(Array.isArray(contribs) ? contribs : []);
        } catch (contribErr) {
          console.warn('Could not fetch channel contributors:', contribErr);
          setContributors([]);
        }

        await fetchPosts();
      } catch (error) {
        console.error('Failed to load channel:', error);
        showNotice('Unable to load this channel right now. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [id, user]);

  // Check Follow Status
  useEffect(() => {
    if (!authLoading && user && channel && !isOwner && !adminView && id) {
      api.getFollowStatus(id)
        .then((data) => setIsFollowing(Boolean(data?.is_following)))
        .catch(() => setIsFollowing(false));
    }
  }, [authLoading, user, channel, isOwner, adminView, id]);

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
    if (!id) return;

    try {
      setLoadingPosts(true);
      const channelPosts = await api.channelPosts(id);
      setPosts(Array.isArray(channelPosts) ? channelPosts : []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setPosts([]);
      showNotice('Unable to load channel updates. Please refresh the page.', 'error');
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
        showNotice('You unfollowed this channel.', 'success');
      } else {
        await api.followChannel(id);
        showNotice('You are now following this channel.', 'success');
      }

      const refreshedChannel = await api.channel(id);
      setChannel(refreshedChannel);
      setFollowersCount(Number(refreshedChannel?.followers_count || 0));
      const status = await api.getFollowStatus(id);
      setIsFollowing(Boolean(status?.is_following));
    } catch (err) {
      console.error('Follow toggle failed:', err);
      showNotice(err?.message || 'Unable to update follow status.', 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleRemoveContributor = async (contributorId) => {
    if (!canEditEmergencyContact) return;
    try {
      await api.removeChannelContributor(id, contributorId);
      setContributors((prev) => prev.filter((c) => (c.id || c.user_id) !== contributorId));
      showNotice('Contributor removed from channel.', 'success');
    } catch (err) {
      showNotice(err.message || 'Failed to remove contributor.', 'error');
    }
  };

  const handleSaveEmergencyContact = async (e) => {
    if (e) e.preventDefault();
    const normalizedPhone = emergencyContact.phone.replace(/\s+/g, '').trim();

    if (!normalizedPhone) {
      showNotice('Please provide a valid emergency phone number.', 'error');
      return;
    }

    try {
      setSavingEmergency(true);
      const updatedChannel = await api.updateEmergencyContact(id, {
        emergency_contact_name: emergencyContact.name.trim() || 'Emergency Coordinator',
        emergency_contact_phone: normalizedPhone,
        emergency_contact_role: emergencyContact.role.trim() || 'Pramukh / Seva Head',
      });

      setChannel(updatedChannel);
      setShowEmergencyModal(false);
      showNotice('Emergency helpline saved successfully.', 'success');
    } catch (err) {
      console.error('Failed to save emergency contact:', err);
      showNotice(err.message || 'Unable to save emergency contact.', 'error');
    } finally {
      setSavingEmergency(false);
    }
  };

  const handlePostAnnouncement = async (e) => {
    if (e) e.preventDefault();
    if (!newAnnouncement.trim()) return;

    try {
      setPostingAnnouncement(true);
      await api.createAnnouncement(id, {
        message: newAnnouncement.trim(),
        is_pinned: announcementPinned,
      });

      setNewAnnouncement('');
      setAnnouncementPinned(false);
      showNotice('Official announcement broadcasted successfully.', 'success');
      await fetchPosts();
    } catch (error) {
      console.error('Failed to post announcement:', error);
      showNotice(error.message || 'Unable to broadcast announcement.', 'error');
    } finally {
      setPostingAnnouncement(false);
    }
  };

  const handlePost = async (e) => {
    if (e) e.preventDefault();
    if (adminView) return;
    if (!user) {
      navigate('/login', { state: { from: `/channel/${id}` } });
      return;
    }

    if (!newPost.trim() && !postMedia) {
      showNotice('Please enter a message or select an image/document.', 'error');
      return;
    }

    try {
      setPosting(true);
      let messageContent = newPost.trim();

      if (replyToPost) {
        const replyTag = `@${replyToPost.user?.full_name || replyToPost.user?.username || 'sevak'}`;
        messageContent = `${replyTag} ${messageContent}`;
      }

      if (postMedia) {
        const payload = {
          title: newPost.trim() || `Attachment - ${postMedia.name}`,
          description: messageContent || `Uploaded ${postMedia.type.startsWith('image') ? 'Photo' : 'Document'}`,
          content_type: postMedia.type.startsWith('image')
            ? 'image'
            : postMedia.type.startsWith('video')
              ? 'video'
              : postMedia.type.startsWith('audio')
                ? 'audio'
                : 'pdf',
          channel_id: id,
          language: 'mr',
          tags: ['channel-post', channel?.name?.toLowerCase().replace(/\s+/g, '-')].filter(Boolean),
        };

        await api.uploadContent(payload, postMedia);
        showNotice('Attachment shared with the channel.', 'success');
      } else {
        await api.createChannelPost(id, messageContent);
      }

      setNewPost('');
      setPostMedia(null);
      setReplyToPost(null);
      await fetchPosts();
      setTimeout(() => scrollToChatBottom(), 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      showNotice(error.message || 'Unable to post message.', 'error');
    } finally {
      setPosting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      showNotice('File size exceeds the 25MB limit.', 'error');
      return;
    }
    setPostMedia(file);
    showNotice(`Attached "${file.name}". Click send to share.`, 'info');
  };

  const handleToggleLike = (postId) => {
    const currentLiked = Boolean(likedPostIds[postId]);
    const nextLiked = !currentLiked;

    const nextLikedMap = { ...likedPostIds, [postId]: nextLiked };
    setLikedPostIds(nextLikedMap);

    try {
      localStorage.setItem(likedPostsStorageKey, JSON.stringify(nextLikedMap));
    } catch (e) {
      console.warn('Could not persist like state to localStorage', e);
    }

    setReactionMap((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + (nextLiked ? 1 : -1),
    }));

    if (nextLiked) {
      api.likeChannelPost?.(id, postId).catch(() => {});
    }
  };

  const handleSharePost = async (post) => {
    const shareText = `🚩 *${channel?.name || 'Aapli Wari Palkhi'}* \n\n${post.message || post.description || ''}\n\nVia Aapli Wari: ${window.location.href}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: channel?.name || 'Aapli Wari Palkhi Update',
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const timeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return language === 'mr' ? 'आत्ताच' : 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return language === 'mr' ? `${minutes} मि.` : `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return language === 'mr' ? `${hours} तास` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return language === 'mr' ? `${days} दिवस` : `${days}d ago`;
    return date.toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-GB', { day: 'numeric', month: 'short' });
  };

  // ─── Filtered Data Slices ──────────────────────────────────────────────────
  const announcementPosts = useMemo(
    () =>
      [...posts.filter((p) => p.is_announcement)]
        .filter((post) => {
          if (!searchQuery.trim()) return true;
          const text = `${post.message || ''} ${post.description || ''} ${post.title || ''}`.toLowerCase();
          return text.includes(searchQuery.toLowerCase());
        })
        .sort((a, b) => {
          if (Number(Boolean(b.is_pinned)) !== Number(Boolean(a.is_pinned))) {
            return Number(Boolean(b.is_pinned)) - Number(Boolean(a.is_pinned));
          }
          return new Date(b.created_at) - new Date(a.created_at);
        }),
    [posts, searchQuery]
  );

  const chatPosts = useMemo(
    () =>
      [...posts.filter((p) => !p.is_announcement)]
        .filter((post) => {
          if (!searchQuery.trim()) return true;
          const text = `${post.message || ''} ${post.description || ''} ${post.user?.full_name || ''} ${post.user?.username || ''}`.toLowerCase();
          return text.includes(searchQuery.toLowerCase());
        })
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    [posts, searchQuery]
  );

  const adminFeedPosts = [...posts].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  // ─── Permission Flags ───────────────────────────────────────────────────────
  const isAdminUser = user?.role === 'admin';
  const canPostChat = !adminView && Boolean(user);
  const canCreateAnnouncement = !adminView && Boolean(user) && (isOwner || isAdminUser);
  const canEditEmergencyContact = !adminView && Boolean(user) && (isOwner || isAdminUser);
  const hasEmergencyContact = Boolean(channel?.emergency_contact_name || channel?.emergency_contact_phone);

  const TABS = useMemo(() => [
    { id: 'announcements', label: t('channelPage.tabs.announcements'), icon: '📢' },
    { id: 'map', label: t('channelPage.tabs.map'), icon: '📍' },
    { id: 'info', label: t('channelPage.tabs.info'), icon: 'ℹ️' },
  ], [language]);

if (loading) {
  return (
    <div className="flex flex-col justify-center items-center min-h-[70vh] gap-4 bg-[#FEFCF8] font-['Poppins',sans-serif]">
      <div className="w-12 h-12 rounded-full border-4 border-[#E87A1E] border-t-transparent animate-spin"></div>
      <p className="font-body-md text-sm font-medium text-[#2F1B12]">Loading Channel...</p>
    </div>
  );
}

  if (!channel) {
    return (
      <div className="text-center py-20 px-4 max-w-md mx-auto bg-[#FEFCF8] font-['Poppins',sans-serif]">
        <div className="w-20 h-20 mx-auto mb-4 bg-[#E87A1E]/10 rounded-full flex items-center justify-center text-3xl shadow-lg">
          🔍
        </div>
        <h2 className="font-headline-md text-2xl font-bold text-[#2F1B12]">Channel Not Found</h2>
        <p className="font-body-md text-sm text-[#2F1B12]/70 mt-2 mb-6">
          The palkhi channel you are looking for might have been moved or removed.
        </p>
        <Link
          to="/channels"
          className="inline-flex items-center px-6 py-3 bg-[#E87A1E] text-white rounded-2xl font-label-md font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
        >
          <FiArrowLeft className="mr-2" /> Back to all channels
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FEFCF8] text-[#2F1B12] min-h-[calc(100vh-4rem)] flex flex-col justify-between font-['Poppins',sans-serif] overflow-hidden">
      {/* App Container */}
      <div className="flex w-full h-[calc(100vh-4rem)] max-w-[1600px] mx-auto bg-white relative shadow-[0_0_60px_rgba(47,27,18,0.08)] overflow-hidden rounded-2xl my-2">

        {/* ========================================================================= */}
        {/* LEFT COLUMN: Fixed, Scrollable (Hidden on Mobile, 26% on Desktop)         */}
        {/* ========================================================================= */}
<aside className="hidden md:flex flex-col w-[26%] h-full bg-[#FEFCF8] border-r border-[#E87A1E]/15 relative overflow-y-auto no-scrollbar pb-4 z-10 shadow-[4px_0_20px_rgba(47,27,18,0.06)] shrink-0">
  
  {/* Header / Profile Section */}
  <div className="px-5 pt-6 pb-4 flex flex-col items-center text-center bg-gradient-to-b from-[#E87A1E]/5 to-transparent">
    <div className="relative mb-3">
      {channel.avatar_url || channel.image_url ? (
        <img
          loading="lazy" 
          alt={channel.name}
          className="w-24 h-24 rounded-full object-cover border-2 border-[#E87A1E] p-1 bg-white shadow-md"
          src={channel.avatar_url || channel.image_url}
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E87A1E] to-[#DD6B35] flex items-center justify-center text-white text-4xl font-headline-lg font-bold shadow-md border-2 border-[#E87A1E] p-1 ring-2 ring-[#E87A1E]/20">
          {channel.name?.[0]?.toUpperCase() || 'W'}
        </div>
      )}

    </div>

    <h1 className="font-headline-lg text-2xl lg:text-3xl text-[#2F1B12] mb-0.5 font-bold leading-tight">
      {channel.name}
    </h1>

    <p className="font-body-md text-sm text-[#2F1B12]/75 flex items-center justify-center gap-1.5 font-medium">
      <FiUser className="text-[#E87A1E]" size={14} />
      <span>{t('channelPage.pramukh')} {channel.owner_name || channel.created_by_name || 'Sant Tukaram Palkhi'}</span>
    </p>

    <div className="mt-2.5 bg-[#E87A1E]/10 px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm border border-[#E87A1E]/20">
      <span className="w-2 h-2 rounded-full bg-[#E87A1E] animate-pulse"></span>
      <span className="font-label-sm text-xs text-[#E87A1E] uppercase tracking-wider font-bold">
        Live Route
      </span>
    </div>
  </div>

  {/* Follower Stats Card */}
  <div className="px-5 pb-3">
    <div className="flex justify-between bg-[#FAF6F0] rounded-xl p-3 shadow-sm border border-[#E87A1E]/15">
      <div className="text-center flex-1">
        <div className="font-headline-md text-2xl text-[#2F1B12] font-bold">
          {followersCount >= 1000 ? `${(followersCount / 1000).toFixed(1)}K` : followersCount}
        </div>
        <div className="font-label-sm text-xs text-[#2F1B12]/60 flex items-center justify-center gap-1 mt-0.5 font-medium">
          <FiUsers size={10} /> {t('channelPage.followers')}
        </div>
      </div>
      <div className="w-px bg-gradient-to-b from-transparent via-[#E87A1E]/20 to-transparent mx-1"></div>
      <div className="text-center flex-1">
        <div className="font-headline-md text-2xl text-[#2F1B12] font-bold">
          {contributors.length}
        </div>
        <div className="font-label-sm text-xs text-[#2F1B12]/60 flex items-center justify-center gap-1 mt-0.5 font-medium">
          <FiUsers size={10} /> Varkaris
        </div>
      </div>
    </div>
  </div>

  {/* Main Action Buttons */}
  <div className="px-5 pb-4 flex flex-col gap-2 border-b border-[#E87A1E]/10">
    {isOwner ? (
      <div className="flex flex-col gap-1.5">
        <div className="py-1.5 px-3 rounded-lg text-xs font-bold bg-[#E87A1E]/10 text-[#E87A1E] border border-[#E87A1E]/20 text-center flex items-center justify-center gap-1.5">
          <FiStar size={12} className="text-[#E87A1E]" /> {t('channelPage.youAreOwner')}
        </div>
        <Link
          to={`/channel/${id}/manage`}
          className="w-full bg-[#E87A1E] text-white font-label-md text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#d06b1a] shadow-sm hover:shadow-md transition-all duration-300 font-bold"
        >
          <FiSettings size={14} />
          {t('channelPage.manageChannel')}
        </Link>
      </div>
    ) : adminView ? (
      <div className="py-2 px-3 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 text-center shadow-sm">
        {t('channelPage.adminViewOnly')}
      </div>
    ) : (
      <button
        onClick={handleFollowToggle}
        disabled={followLoading}
        className={`w-full font-label-md text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-sm font-bold cursor-pointer ${
          isFollowing
            ? 'bg-[#FAF6F0] text-[#2F1B12] border border-[#E87A1E]/30 hover:bg-[#F2ECE4]'
            : 'bg-[#E87A1E] text-white hover:bg-[#d06b1a] hover:shadow-md active:scale-[0.98]'
        }`}
      >
        {followLoading ? (
          <Loader size="xs" />
        ) : isFollowing ? (
          <>
            <FiCheckCircle size={14} className="text-emerald-600" />
            {t('channelPage.following')}
          </>
        ) : (
          <>
            <FiHeart size={14} className="fill-current" />
            {t('channelPage.followChannel')}
          </>
        )}
      </button>
    )}

    <button
      onClick={() => setActiveTab('map')}
      className="w-full border border-[#E87A1E]/30 text-[#2F1B12] bg-white font-label-md text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#E87A1E]/5 hover:border-[#E87A1E]/50 transition-all duration-300 font-bold cursor-pointer shadow-sm"
    >
      <FiMapPin size={14} className="text-[#E87A1E]" />
      {t('channelPage.tabs.map')}
    </button>
  </div>

  {/* Emergency Helpline Card */}
<div className="px-5 py-3 mt-1">
    <div className="bg-[#ffffff] border border-[#321D13] rounded-xl p-3 relative overflow-hidden shadow-sm">
      <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
        <span className="material-symbols-outlined text-[60px] text-red-500" data-weight="fill">emergency</span>
      </div>
      <div className="flex items-start gap-2.5 mb-2 relative z-10">
        <div className="bg-[#321D13] text-white p-1.5 rounded-full flex items-center justify-center shadow-md">
          <FiBell size={16} className="animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-label-md text-sm font-bold text-red-600 truncate">
              {t('channelPage.emergencyHelpline')}
            </h3>
            {canEditEmergencyContact && (
              <button
                onClick={() => setShowEmergencyModal(true)}
                className="text-xs font-bold text-red-600 hover:underline cursor-pointer flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded border border-[#321D13] shadow-2xs"
              >
                <FiEdit2 size={10} /> {t('channelPage.edit')}
              </button>
            )}
          </div>
          <p className="font-label-sm text-xs text-red-900/60 mt-0.5">Available 24/7 during Yatra</p>
        </div>
      </div>

      {hasEmergencyContact ? (
        <a
          href={`tel:${channel.emergency_contact_phone}`}
          className="w-full bg-white text-red-600 border border-[#321D13] font-label-md text-sm py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 hover:bg-red-50 transition-all duration-300 shadow-2xs font-bold truncate"
        >
          <FiBell size={12} className="animate-pulse" />
          {channel.emergency_contact_phone} ({channel.emergency_contact_name || 'Medical Team'})
        </a>
      ) : (
        <div className="text-center pt-0.5">
          <p className="font-label-sm text-xs text-red-900/50 italic mb-1.5">{t('channelPage.noHelpline')}</p>
          {canEditEmergencyContact && (
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="w-full bg-white text-red-600 border border-[#321D13] font-label-md text-sm py-1.5 rounded-lg hover:bg-red-50 font-bold transition-all duration-300 cursor-pointer shadow-2xs"
            >
              {t('channelPage.addEmergencyContact')}
            </button>
          )}
        </div>
      )}
    </div>
  </div>
</aside>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Main Chat Area (100% on Mobile, 74% on Desktop)             */}
        {/* ========================================================================= */}
        <main className="flex-1 flex flex-col h-full relative bg-[#FEFCF8] overflow-hidden">
          
          {/* Emergency Alert Banner (Conditional & Dismissible) */}
          {hasEmergencyContact && showEmergencyBanner && (
            <div className="bg-[#E87A1E] text-white px-4 py-2.5 flex justify-between items-center z-30 shadow-lg">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="bg-white/20 rounded-full p-1 animate-pulse">
                  <FiBell size={14} className="text-white" />
                </div>
                <span className="font-label-sm text-sm font-semibold tracking-wide truncate">
                  Helpline: {channel.emergency_contact_name || 'Emergency Team'} ({channel.emergency_contact_phone})
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  className="font-label-sm text-sm bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg transition-colors font-bold flex items-center gap-1"
                  href={`tel:${channel.emergency_contact_phone}`}
                >
                  <FiBell size={11} /> Call Help
                </a>
                {canEditEmergencyContact && (
                  <button
                    aria-label="Edit banner"
                    onClick={() => setShowEmergencyModal(true)}
                    className="text-white/80 hover:text-white transition-colors cursor-pointer"
                  >
                    <FiEdit2 size={14} />
                  </button>
                )}
                <button
                  aria-label="Close banner"
                  onClick={() => setShowEmergencyBanner(false)}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Top App Bar Header */}
          <header className="bg-white/90 backdrop-blur-md border-b border-[#E87A1E]/10 px-4 py-2.5 z-20 sticky top-0 flex flex-col w-full shadow-sm">
            <div className="flex justify-between items-center w-full">
              {/* Mobile View: Avatar & Title */}
              <div className="flex items-center gap-2.5 md:hidden min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#E87A1E] text-white flex items-center justify-center font-headline-md font-bold text-sm shrink-0 shadow-md">
                  {channel.name?.[0]?.toUpperCase() || 'W'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-md text-base font-bold text-[#2F1B12] leading-tight truncate">
                    {channel.name}
                  </span>
                  <span className="font-label-sm text-xs text-[#2F1B12]/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Live Community
                  </span>
                </div>
              </div>

              {/* Desktop View: Title */}
              <div className="hidden md:flex items-center gap-2.5">
                <span className="font-headline-md text-xl font-bold text-[#2F1B12]">
                  {channel.name}
                </span>
                {channel.status === 'active' && (
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <FiCheckCircle size={11} /> Active
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-0.5 text-[#2F1B12]">
                <button
                  onClick={() => setShowSearchBar((p) => !p)}
                  className="p-2 hover:bg-[#E87A1E]/10 rounded-full transition-all duration-300 active:scale-95 cursor-pointer"
                  title="Search messages"
                >
                  <FiSearch size={16} />
                </button>
                <button
                  onClick={() => setShowContributorsModal(true)}
                  className="p-2 hover:bg-[#E87A1E]/10 rounded-full transition-all duration-300 active:scale-95 cursor-pointer"
                  title="View Contributors"
                >
                  <FiUsers size={16} />
                </button>
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="p-2 hover:bg-[#E87A1E]/10 rounded-full transition-all duration-300 active:scale-95 cursor-pointer hidden md:inline-flex"
                  title="Channel Info"
                >
                  <FiInfo size={16} />
                </button>
                {(isOwner || isAdminUser) && !adminView && (
                  <Link
                    to={`/channel/${id}/manage`}
                    className="p-2 hover:bg-[#E87A1E]/10 rounded-full transition-all duration-300 active:scale-95 cursor-pointer"
                    title="Channel Settings"
                  >
                    <FiSettings size={16} />
                  </Link>
                )}
              </div>
            </div>

            {/* Expandable Quick Search Bar */}
            {showSearchBar && (
              <div className="mt-2.5 flex items-center bg-[#FEFCF8] border-2 border-[#E87A1E]/20 rounded-xl px-3 py-1.5 shadow-inner animate-fade-in">
                <FiSearch size={14} className="text-[#2F1B12]/50 mr-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('channelPage.searchPlaceholder')}
                  className="w-full bg-transparent text-sm text-[#2F1B12] placeholder:text-[#2F1B12]/40 focus:outline-none font-body-md"
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-[#2F1B12]/40 hover:text-[#2F1B12] transition-colors">
                    <FiX size={14} />
                  </button>
                )}
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar w-full mt-2.5 pt-2 border-t border-[#E87A1E]/10">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-2 font-label-md text-sm transition-all duration-300 whitespace-nowrap px-2.5 flex items-center gap-1.5 cursor-pointer border-b-2 ${
                      isActive
                        ? 'text-[#E87A1E] border-[#E87A1E] font-bold'
                        : 'text-[#2F1B12]/60 border-transparent hover:text-[#E87A1E] hover:border-[#E87A1E]/30'
                    }`}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span className="text-sm">{tab.label}</span>
                    {tab.id === 'announcements' && announcementPosts.length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                        isActive ? 'bg-[#E87A1E] text-white' : 'bg-[#E87A1E]/10 text-[#2F1B12]'
                      }`}>
                        {announcementPosts.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </header>

          {notice && (
            <div className={`mx-4 mt-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-semibold shadow-sm animate-slide-down ${
              notice.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : notice.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-[#E87A1E]/20 bg-[#E87A1E]/5 text-[#2F1B12]'
            }`}>
              {notice.text}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB CONTENTS (Independently Scrollable)                                  */}
          {/* ========================================================================= */}
          <div ref={chatCanvasRef} className="flex-1 overflow-y-auto bg-[#FEFCF8] p-4 md:p-5 flex flex-col gap-4 relative">
            
            {/* -------------------- TAB 1: ANNOUNCEMENTS -------------------- */}
            {activeTab === 'announcements' && (
              <div className="space-y-4 max-w-2xl w-full mx-auto">
                {/* Post Announcement Form for Pramukh / Owner / Admins */}
                {canCreateAnnouncement && (
                  <div className="bg-white border-2 border-[#E87A1E]/20 rounded-xl p-4 shadow-lg shadow-[#E87A1E]/5">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="bg-[#E87A1E] text-white p-1.5 rounded-lg">
                        <FiEdit2 size={14} />
                      </div>
                      <h3 className="font-label-md text-sm font-bold uppercase tracking-wider text-[#2F1B12]">
                        {t('channelPage.announcements.postTitle')}
                      </h3>
                    </div>
                    <form onSubmit={handlePostAnnouncement} className="space-y-2.5">
                      <textarea
                        rows={2}
                        placeholder={t('channelPage.announcements.placeholder')}
                        value={newAnnouncement}
                        onChange={(e) => setNewAnnouncement(e.target.value)}
                        className="w-full p-2.5 font-body-md text-sm border-2 border-[#E87A1E]/15 rounded-lg focus:outline-none focus:border-[#E87A1E] focus:ring-4 focus:ring-[#E87A1E]/10 resize-none bg-[#FEFCF8] transition-all duration-300"
                      />
                      <div className="flex items-center justify-between gap-2.5 flex-wrap">
                        <label className="flex items-center gap-1.5 font-label-sm text-sm font-semibold text-[#2F1B12]/70 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={announcementPinned}
                            onChange={(e) => setAnnouncementPinned(e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-[#E87A1E] text-[#E87A1E] focus:ring-[#E87A1E] accent-[#E87A1E]"
                          />
                          <FiBookmark size={12} /> {t('channelPage.announcements.pin')}
                        </label>
                        <Button
                          type="submit"
                          disabled={postingAnnouncement || !newAnnouncement.trim()}
                          className="!px-4 !py-1.5 !bg-[#E87A1E] hover:!shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 text-white font-label-md text-sm font-bold rounded-lg shadow-md cursor-pointer"
                        >
                          {postingAnnouncement ? (
                            <><Loader size="xs" className="inline mr-1.5" /> {t('channelPage.announcements.broadcasting')}</>
                          ) : (
                            <><FiSend size={12} className="inline mr-1.5" /> {t('channelPage.announcements.broadcast')}</>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Announcements Feed */}
                {announcementPosts.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-[#E87A1E]/20 bg-white/80 backdrop-blur-sm p-10 text-center">
                    <div className="text-4xl mb-3">📢</div>
                    <h3 className="font-headline-md text-base font-bold text-[#2F1B12]">{t('channelPage.announcements.empty')}</h3>
                    <p className="font-body-md text-sm text-[#2F1B12]/60 mt-1 max-w-sm mx-auto">
                      {t('channelPage.announcements.emptySub')}
                    </p>
                  </div>
                ) : (
                  announcementPosts.map((post) => (
                    <article
                      key={`ann-${post.id}`}
                      className={`rounded-xl border-2 p-4 sm:p-5 transition-all duration-300 shadow-lg hover:shadow-xl ${
                        post.is_pinned
                          ? 'bg-[#E87A1E]/5 border-[#E87A1E]/30 ring-2 ring-[#E87A1E]/10'
                          : 'bg-white border-[#E87A1E]/10 hover:border-[#E87A1E]/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-[#E87A1E] px-2.5 py-0.5 font-label-sm text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                            📢 {t('channelPage.announcements.badge')}
                          </span>
                          {post.is_pinned && (
                            <span className="inline-flex items-center gap-0.5 rounded-lg bg-[#E87A1E]/10 border border-[#E87A1E]/20 px-2 py-0.5 font-label-sm text-[10px] font-black uppercase tracking-wider text-[#2F1B12]">
                              <FiBookmark size={9} /> {t('channelPage.announcements.pinned')}
                            </span>
                          )}
                        </div>
                        <span className="font-label-sm text-xs text-[#2F1B12]/40">{timeAgo(post.created_at)}</span>
                      </div>

                      {post.title && post.title !== 'Channel Post' && (
                        <h4 className="font-headline-md text-base font-bold text-[#2F1B12] mb-1.5">{post.title}</h4>
                      )}

                      <p className="font-body-md text-sm text-[#2F1B12] whitespace-pre-wrap leading-relaxed">
                        {post.message || post.description}
                      </p>

                      {post.file_url && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-[#E87A1E]/10 bg-gray-50 shadow-inner">
                          {post.content_type === 'image' ? (
                            <img loading="lazy" src={post.file_url} alt={post.title || 'Announcement'} className="w-full max-h-72 object-cover" />
                          ) : (
                            <a href={post.file_url} target="_blank" rel="noopener noreferrer" className="p-2.5 flex items-center gap-1.5 font-label-md text-sm font-bold text-[#E87A1E] hover:bg-gray-100 transition-colors">
                              <FiFile size={14} /> {t('channelPage.announcements.viewDoc')}
                            </a>
                          )}
                        </div>
                      )}

                      <div className="mt-3 pt-2.5 border-t border-[#E87A1E]/10 flex items-center justify-between font-label-sm text-xs text-[#2F1B12]/60">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#E87A1E] text-white flex items-center justify-center font-bold text-[10px] shadow-md">
                            {post.user?.full_name?.[0] || 'P'}
                          </div>
                          <span className="font-bold text-[#2F1B12] text-xs">
                            {post.user?.full_name || 'Palkhi Pramukh'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {(() => {
                            const isLiked = Boolean(likedPostIds[post.id]);
                            const totalLikes = Math.max(0, (post.likes || 0) + (reactionMap[post.id] || 0));
                            return (
                              <button
                                type="button"
                                onClick={() => handleToggleLike(post.id)}
                                className={`flex items-center gap-1 transition-all duration-300 cursor-pointer ${
                                  isLiked ? 'text-red-600 font-bold' : 'hover:text-[#E87A1E]'
                                }`}
                                title={isLiked ? 'Unlike announcement' : 'Like announcement'}
                              >
                                <FiHeart size={12} className={`${isLiked ? 'fill-red-600 text-red-600' : ''} transition-all`} /> {totalLikes}
                              </button>
                            );
                          })()}
                          <button
                            type="button"
                            className="flex items-center gap-1 hover:text-[#E87A1E] transition-colors cursor-pointer"
                            onClick={() => handleSharePost(post)}
                          >
                            <FiShare2 size={12} /> {t('channelPage.announcements.share')}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}

            {/* -------------------- TAB 2: CHAT -------------------- */}
            {activeTab === 'chat' && (
              <div className="space-y-3.5 pb-2 max-w-3xl w-full mx-auto flex flex-col">
                
                {/* Sticky Date Separator */}
                <div className="flex justify-center my-0.5 sticky top-2 z-10">
                  <span className="bg-white/90 backdrop-blur-sm border border-[#E87A1E]/20 text-[#2F1B12]/60 font-label-sm text-xs px-3 py-1 rounded-full shadow-md">
                    Today
                  </span>
                </div>

                {/* System Message / Pinned Notice Highlight */}
                {announcementPosts.length > 0 && (
                  <div className="flex justify-center my-0.5">
                    <div className="bg-[#E87A1E]/5 border border-[#E87A1E]/20 px-4 py-3 rounded-xl flex items-start gap-2.5 max-w-md shadow-md">
                      <div className="bg-[#E87A1E] text-white p-1 rounded-full flex items-center justify-center shadow-md">
                        <FiInfo size={12} />
                      </div>
                      <div>
                        <p className="font-label-md text-sm text-[#2F1B12] font-bold">
                          {announcementPosts[0]?.title || 'Palkhi Route Notice'}
                        </p>
                        <p className="font-label-sm text-xs text-[#2F1B12]/60 mt-0.5 line-clamp-2">
                          {announcementPosts[0]?.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {loadingPosts ? (
                  <div className="flex justify-center py-8"><Loader size="md" /></div>
                ) : chatPosts.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-[#E87A1E]/20 bg-white/80 backdrop-blur-sm p-10 text-center">
                    <div className="text-4xl mb-3">💬</div>
                    <h3 className="font-headline-md text-base font-bold text-[#2F1B12]">{t('channelPage.chat.emptyTitle')}</h3>
                    <p className="font-body-md text-sm text-[#2F1B12]/60 mt-1 max-w-sm mx-auto">
                      {t('channelPage.chat.emptySub')}
                    </p>
                  </div>
                ) : (
                  chatPosts.map((post) => {
                    const isMyPost = Boolean(user) && String(post.user_id) === String(user.id);
                    const isPostOwner = channel && String(post.user_id) === String(channel.created_by_user_id);
                    const isContributorPost = post.user?.role === 'contributor';

                    return isMyPost ? (
                      /* Self Message (Right Aligned) */
                      <div key={post.id} className="flex flex-col items-end self-end max-w-[85%] md:max-w-[70%] animate-slide-in-right">
                        <div className="bg-[#E87A1E]/10 border-2 border-[#E87A1E]/20 p-2.5 rounded-2xl rounded-tr-none shadow-lg shadow-[#E87A1E]/5 relative min-w-[100px]">
                          {post.title && post.title !== 'Channel Post' && (
                            <p className="font-headline-md text-sm font-bold text-[#2F1B12] mb-0.5">
                              {post.title}
                            </p>
                          )}
                          <p className="font-body-md text-sm text-[#2F1B12] whitespace-pre-wrap leading-relaxed">
                            {post.description || post.message}
                          </p>

                          {post.file_url && (
                            <div className="mt-1.5 rounded-lg overflow-hidden border border-[#E87A1E]/10 shadow-inner">
                              {post.content_type === 'image' && (
                                <img
                                  loading="lazy" 
                                  src={post.file_url}
                                  alt="Attachment"
                                  className="w-full max-h-64 object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                                  onClick={() => window.open(post.file_url, '_blank')}
                                />
                              )}
                              {post.content_type === 'video' && (
                                <video src={post.file_url} controls className="w-full max-h-64 rounded-lg" />
                              )}
                              {post.content_type === 'pdf' && (
                                <a
                                  href={post.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 p-1.5 rounded-lg text-sm font-semibold bg-white text-[#E87A1E] hover:bg-gray-50 transition-colors"
                                >
                                  <FiFile size={14} /> Attached Document (PDF)
                                </a>
                              )}
                            </div>
                          )}

                          <div className="flex justify-end items-center mt-1 gap-1 text-xs text-[#2F1B12]/40">
                            <span>{timeAgo(post.created_at)}</span>
                            <FiCheckCircle size={12} className="text-[#E87A1E]" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Other User / Admin Message (Left Aligned) */
                      <div key={post.id} className="flex flex-col items-start max-w-[85%] md:max-w-[70%] animate-slide-in-left">
                        <div className="flex items-end gap-1.5 mb-1">
                          <div className="w-7 h-7 rounded-full bg-[#E87A1E] text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">
                            {post.user?.full_name?.[0]?.toUpperCase() || post.user?.username?.[0]?.toUpperCase() || 'W'}
                          </div>
                          <span className="font-label-sm text-sm font-semibold text-[#2F1B12]">
                            {post.user?.full_name || post.user?.username || t('channelPage.chat.warkari')}
                          </span>
                          {isPostOwner ? (
                            <span className="bg-[#E87A1E] text-white font-label-sm text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-sm">
                              {t('channelPage.chat.pramukh')}
                            </span>
                          ) : isContributorPost ? (
                            <span className="bg-emerald-600 text-white font-label-sm text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-sm">
                              {t('channelPage.chat.sevak')}
                            </span>
                          ) : null}
                        </div>

                        <div className="bg-white border-2 border-[#E87A1E]/10 p-2.5 rounded-2xl rounded-tl-none shadow-lg shadow-[#2F1B12]/5 ml-8 min-w-[120px] hover:shadow-xl transition-shadow duration-300">
                          {post.title && post.title !== 'Channel Post' && (
                            <p className="font-headline-md text-sm font-bold text-[#2F1B12] mb-0.5">
                              {post.title}
                            </p>
                          )}
                          
                          {/* Image Thumbnail if attached */}
                          {post.file_url && post.content_type === 'image' && (
                            <img
                              loading="lazy" 
                              src={post.file_url}
                              alt="Attachment"
                              className="w-full max-h-56 object-cover rounded-lg mb-1.5 border border-[#E87A1E]/10 cursor-pointer transition-transform hover:scale-105"
                              onClick={() => window.open(post.file_url, '_blank')}
                            />
                          )}

                          {post.file_url && post.content_type === 'video' && (
                            <video src={post.file_url} controls className="w-full max-h-56 rounded-lg mb-1.5" />
                          )}

                          {post.file_url && post.content_type === 'pdf' && (
                            <a
                              href={post.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 p-1.5 rounded-lg text-sm font-semibold bg-[#FEFCF8] text-[#E87A1E] mb-1.5 hover:bg-[#E87A1E]/5 transition-colors"
                            >
                              <FiFile size={14} /> Attached Document (PDF)
                            </a>
                          )}

                          <p className="font-body-md text-sm text-[#2F1B12] whitespace-pre-wrap leading-relaxed">
                            {post.description || post.message}
                          </p>

                          <div className="flex justify-between items-center mt-1.5 pt-1 border-t border-[#E87A1E]/10 text-xs text-[#2F1B12]/60">
                            <div className="flex items-center gap-2.5">
                              {(() => {
                                const isLiked = Boolean(likedPostIds[post.id]);
                                const totalLikes = Math.max(0, (post.likes || 0) + (reactionMap[post.id] || 0));
                                return (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleLike(post.id)}
                                    className={`flex items-center gap-1 transition-all duration-300 cursor-pointer ${
                                      isLiked ? 'text-red-600 font-bold' : 'hover:text-[#E87A1E]'
                                    }`}
                                  >
                                    <FiHeart size={11} className={`${isLiked ? 'fill-red-600 text-red-600' : ''} transition-all`} /> {totalLikes}
                                  </button>
                                );
                              })()}
                              <button
                                type="button"
                                className="hover:text-[#E87A1E] font-medium transition-colors cursor-pointer"
                                onClick={() => setReplyToPost(post)}
                              >
                                <FiMessageCircle size={11} className="inline mr-0.5" /> {t('channelPage.chat.reply')}
                              </button>
                            </div>
                            <span className="text-xs text-[#2F1B12]/40">{timeAgo(post.created_at)}</span>
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
              <div className="w-full h-full -m-4 md:-m-5">
                <ChannelRouteMap
                  channelId={id}
                  channelName={channel.name}
                  isOwner={isOwner}
                  userToken={localStorage.getItem('access_token')}
                />
              </div>
            )}

            {/* -------------------- TAB 4: ABOUT & INFO -------------------- */}
            {activeTab === 'info' && (
              <div className="space-y-3.5 max-w-2xl w-full mx-auto">
                <div className="bg-white border-2 border-[#E87A1E]/10 rounded-xl p-5 shadow-lg shadow-[#2F1B12]/5">
                  <h3 className="font-headline-md text-sm font-bold text-[#2F1B12] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <FiInfo size={14} /> {t('channelPage.info.aboutTitle')}
                  </h3>
                  <p className="font-body-md text-sm text-[#2F1B12] leading-relaxed">
                    {channel.description || t('channelPage.info.aboutDefault')}
                  </p>
                </div>

                {/* Emergency Contact detail card */}
                <div className="bg-[#E87A1E]/5 border-2 border-[#E87A1E]/15 rounded-xl p-5 shadow-lg shadow-[#E87A1E]/5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-label-md text-sm font-bold uppercase tracking-wider text-[#E87A1E] flex items-center gap-1.5">
                      <div className="bg-[#E87A1E] text-white p-1 rounded-full shadow-md">
                        <FiBell size={12} />
                      </div>
                      {t('channelPage.info.helplineTitle')}
                    </h3>
                    {canEditEmergencyContact && (
                      <button
                        onClick={() => setShowEmergencyModal(true)}
                        className="text-xs font-bold text-[#E87A1E] underline hover:no-underline transition-colors cursor-pointer"
                      >
                        <FiEdit2 size={10} className="inline mr-0.5" /> {t('channelPage.info.editHelpline')}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 font-body-md text-sm text-[#2F1B12]">
                    <div className="flex items-start gap-1.5">
                      <FiUser size={12} className="text-[#2F1B12]/50 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#2F1B12]/70">{t('channelPage.contactPerson')}</span>{' '}
                        <span className="font-medium">{channel.emergency_contact_name || t('channelPage.notSpecified')}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <FiPhone size={12} className="text-[#2F1B12]/50 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#2F1B12]/70">{t('channelPage.helplinePhone')}</span>{' '}
                        {channel.emergency_contact_phone ? (
                          <a href={`tel:${channel.emergency_contact_phone}`} className="text-[#E87A1E] font-bold hover:underline">
                            {channel.emergency_contact_phone}
                          </a>
                        ) : t('channelPage.notSpecified')}
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <FiTag size={12} className="text-[#2F1B12]/50 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#2F1B12]/70">{t('channelPage.role')}</span>{' '}
                        <span className="font-medium">{channel.emergency_contact_role || 'Pramukh / Seva Head'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contributors List card */}
                <div className="bg-white border-2 border-[#E87A1E]/10 rounded-xl p-5 shadow-lg shadow-[#2F1B12]/5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-headline-md text-sm font-bold text-[#2F1B12] uppercase tracking-wider flex items-center gap-1.5">
                      <FiUsers size={14} /> {t('channelPage.info.authorizedSevaks')} ({contributors.length})
                    </h3>
                    <button
                      onClick={() => setShowContributorsModal(true)}
                      className="font-label-md text-xs font-bold text-[#E87A1E] hover:underline transition-colors cursor-pointer"
                    >
                      {t('channelPage.info.viewAll')}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {contributors.slice(0, 6).map((c) => (
                      <div key={c.id || c.user_id} className="flex items-center gap-2 p-2 bg-[#FEFCF8] rounded-lg border border-[#E87A1E]/10 hover:border-[#E87A1E]/30 transition-all duration-300">
                        <div className="w-7 h-7 rounded-full bg-[#E87A1E] text-white flex items-center justify-center font-bold text-xs shadow-md">
                          {c.full_name?.[0] || 'S'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-label-md text-sm font-bold text-[#2F1B12] truncate">{c.full_name || c.username}</p>
                          <p className="font-label-sm text-xs text-[#2F1B12]/50 truncate">{c.email || t('channelPage.info.verifiedSevak')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

{activeTab === 'chat' && !window.location.pathname.includes('/admin') && (
  <footer className="bg-white/95 backdrop-blur-md border-t-2 border-[#E87A1E]/10 p-2.5 md:p-3.5 sticky bottom-0 z-20 shadow-[0_-8px_30px_rgba(0,0,0,0.03)]">
    <form onSubmit={handlePost} className="flex flex-col gap-1.5">
      {/* Reply Context Banner */}
      {replyToPost && (
        <div className="bg-[#E87A1E]/5 px-3 py-1.5 rounded-t-xl border-l-4 border-[#E87A1E] flex justify-between items-center text-sm shadow-inner">
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-[#E87A1E] font-bold text-sm flex items-center gap-1">
              <FiMessageCircle size={10} /> {t('channelPage.chat.replyingTo')} {replyToPost.user?.full_name || replyToPost.user?.username || 'sevak'}
            </span>
            <span className="font-body-md text-xs text-[#2F1B12]/60 truncate max-w-[280px] sm:max-w-md">
              {replyToPost.description || replyToPost.message}
            </span>
          </div>
          <button type="button" onClick={() => setReplyToPost(null)} className="text-[#2F1B12]/60 hover:text-[#2F1B12] transition-colors p-1 rounded-full hover:bg-white/50">
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* Selected Media Indicator */}
      {postMedia && (
        <div className="bg-[#2F1B12] text-white text-xs px-3 py-1.5 rounded-full flex items-center justify-between gap-2.5 max-w-sm shadow-md">
          <span className="truncate flex items-center gap-1.5">
            <FiImage size={12} /> {postMedia.name}
          </span>
          <button type="button" onClick={() => setPostMedia(null)} className="text-red-400 hover:text-white transition-colors">
            <FiX size={14} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 bg-[#FEFCF8] rounded-xl p-1.5 border-2 border-[#E87A1E]/15 focus-within:bg-white focus-within:border-[#E87A1E] transition-all duration-300 shadow-inner">
        {/* Attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 text-[#2F1B12]/60 hover:text-[#E87A1E] transition-all duration-300 rounded-full shrink-0 flex items-center justify-center h-9 w-9 cursor-pointer hover:bg-[#E87A1E]/10"
          title="Attach Media or Document"
        >
          <FiPlus size={18} className="hover:rotate-90 transition-transform duration-300" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,audio/*,application/pdf"
          onChange={handleFileChange}
        />

        {/* Textarea */}
        <textarea
          rows={1}
          placeholder={t('channelPage.chat.placeholder')}
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handlePost(e);
            }
          }}
          className="flex-1 bg-transparent border-none focus:ring-0 resize-none font-body-md text-sm py-2 px-0.5 max-h-28 min-h-[38px] text-[#2F1B12] placeholder:text-[#2F1B12]/40 no-scrollbar outline-none"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={posting}
          className="bg-[#E87A1E] text-white p-2 rounded-full shrink-0 flex items-center justify-center h-9 w-9 hover:shadow-lg transform hover:scale-105 transition-all duration-300 active:scale-95 ml-0.5 mb-0.5 cursor-pointer disabled:opacity-50 disabled:transform-none"
          title="Send message"
        >
          {posting ? (
            <Loader size="xs" />
          ) : (
            <FiSend size={16} className="transform rotate-[-30deg] translate-x-0.5 -translate-y-0.5" />
          )}
        </button>
      </div>
    </form>
  </footer>
)}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Visible on mobile < md)                     */}
      {/* ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white/95 backdrop-blur-md border-t-2 border-[#E87A1E]/10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
        <div className="flex justify-between items-center px-2 py-0.5">
          <Link to="/" className="flex flex-col items-center p-1.5 text-[#2F1B12]/60 flex-1 transition-colors hover:text-[#E87A1E]">
            <FiHome size={20} />
            <span className="font-label-sm text-xs mt-0.5">Home</span>
          </Link>
          <Link to="/map" className="flex flex-col items-center p-1.5 text-[#2F1B12]/60 flex-1 transition-colors hover:text-[#E87A1E]">
            <FiMapPin size={20} />
            <span className="font-label-sm text-xs mt-0.5">Schedule</span>
          </Link>
          <button
            onClick={() => setActiveTab('chat')}
            className="flex flex-col items-center p-1.5 text-[#E87A1E] flex-1 cursor-pointer relative"
          >
            <div className="bg-[#E87A1E]/20 px-3 py-0.5 rounded-full shadow-inner">
              <FiMessageCircle size={20} className="fill-current" />
            </div>
            <span className="font-label-sm text-xs font-bold">Chat</span>
          </button>
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="flex flex-col items-center p-1.5 text-[#E87A1E] flex-1 transition-colors hover:text-[#E87A1E]/80 cursor-pointer"
          >
            <FiBell size={20} className="animate-pulse" />
            <span className="font-label-sm text-xs mt-0.5">Alerts</span>
          </button>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* MODALS: Emergency Contact Editor, Info & Contributors List                 */}
      {/* ========================================================================= */}

      {/* 1. Emergency Contact Edit Modal */}
      <Modal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        title={t('channelPage.modals.emergencyTitle')}
        size="md"
      >
        <form onSubmit={handleSaveEmergencyContact} className="space-y-4 font-body-md">
          <div>
            <label className="block font-label-md text-sm font-bold text-[#2F1B12] uppercase tracking-wide mb-1 flex items-center gap-1">
              <FiUser size={12} /> {t('channelPage.modals.personName')}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Patil / Palkhi Seva Kendra"
              value={emergencyContact.name}
              onChange={(e) => setEmergencyContact((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm border-2 border-[#E87A1E]/15 rounded-lg focus:border-[#E87A1E] focus:ring-4 focus:ring-[#E87A1E]/10 focus:outline-none bg-[#FEFCF8] transition-all duration-300"
            />
          </div>
          <div>
            <label className="block font-label-md text-sm font-bold text-[#2F1B12] uppercase tracking-wide mb-1 flex items-center gap-1">
              <FiPhone size={12} /> {t('channelPage.modals.phone')}
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={emergencyContact.phone}
              onChange={(e) => setEmergencyContact((p) => ({ ...p, phone: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm border-2 border-[#E87A1E]/15 rounded-lg focus:border-[#E87A1E] focus:ring-4 focus:ring-[#E87A1E]/10 focus:outline-none bg-[#FEFCF8] transition-all duration-300"
            />
          </div>
          <div>
            <label className="block font-label-md text-sm font-bold text-[#2F1B12] uppercase tracking-wide mb-1 flex items-center gap-1">
              <FiTag size={12} /> {t('channelPage.modals.roleDesc')}
            </label>
            <input
              type="text"
              placeholder="e.g. Medical Van Coordinator, Local Pramukh"
              value={emergencyContact.role}
              onChange={(e) => setEmergencyContact((p) => ({ ...p, role: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm border-2 border-[#E87A1E]/15 rounded-lg focus:border-[#E87A1E] focus:ring-4 focus:ring-[#E87A1E]/10 focus:outline-none bg-[#FEFCF8] transition-all duration-300"
            />
          </div>
          <div className="flex gap-2.5 pt-1.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEmergencyModal(false)}
              className="flex-1 text-sm cursor-pointer font-label-md border-2 border-[#E87A1E]/20 hover:bg-[#FEFCF8] transition-all duration-300"
            >
              {t('channelPage.modals.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={savingEmergency}
              className="flex-1 !bg-[#E87A1E] hover:!shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 text-white text-sm font-bold cursor-pointer font-label-md"
            >
              {savingEmergency ? (
                <><Loader size="xs" className="inline mr-1.5" /> {t('channelPage.modals.saving')}</>
              ) : (
                <><FiBell size={12} className="inline mr-1.5" /> {t('channelPage.modals.saveHelpline')}</>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Detailed Info Modal */}
      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title={t('channelPage.modals.detailsTitle')}
        size="lg"
      >
        <div className="space-y-4 font-body-md text-sm text-[#2F1B12]">
          <div className="flex items-center gap-3.5 pb-3.5 border-b-2 border-[#E87A1E]/10">
            <div className="w-14 h-14 rounded-full bg-[#E87A1E] text-white flex items-center justify-center font-headline-md font-bold text-xl shadow-lg">
              {channel.name?.[0]?.toUpperCase() || 'W'}
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold text-[#2F1B12]">{channel.name}</h3>
              <p className="font-label-sm text-xs text-[#2F1B12]/60 flex items-center gap-1">
                <FiCalendar size={11} /> {t('channelPage.modals.created')} {new Date(channel.created_at).toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-GB')}
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-label-md text-xs font-bold uppercase tracking-wider text-[#2F1B12]/60 mb-1 flex items-center gap-1">
              <FiInfo size={12} /> {t('channelPage.modals.descLabel')}
            </h4>
            <p className="leading-relaxed bg-[#FEFCF8] p-3 rounded-lg border border-[#E87A1E]/10">
              {channel.description || t('channelPage.info.aboutDefault')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-white rounded-lg border border-[#E87A1E]/10 shadow-sm">
              <span className="font-label-sm text-xs text-[#2F1B12]/60 flex items-center gap-1">
                <FiUsers size={12} /> {t('channelPage.followers')}
              </span>
              <span className="font-headline-md text-base font-bold text-[#2F1B12] block mt-0.5">{followersCount}</span>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#E87A1E]/10 shadow-sm">
              <span className="font-label-sm text-xs text-[#2F1B12]/60 flex items-center gap-1">
                <FiMessageCircle size={12} /> {t('channelPage.modals.totalUpdates')}
              </span>
              <span className="font-headline-md text-base font-bold text-[#2F1B12] block mt-0.5">{posts.length}</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* 3. Contributors List Modal */}
      <Modal
        isOpen={showContributorsModal}
        onClose={() => setShowContributorsModal(false)}
        title={`${t('channelPage.modals.contributorsTitle')} (${contributors.length})`}
        size="md"
      >
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1 no-scrollbar">
          {contributors.length === 0 ? (
            <p className="text-center py-6 font-label-sm text-xs text-[#2F1B12]/60">{t('channelPage.modals.noContributors')}</p>
          ) : (
            contributors.map((c) => (
              <div
                key={c.id || c.user_id}
                className="flex items-center justify-between p-2.5 bg-white hover:bg-[#FEFCF8] rounded-lg border border-[#E87A1E]/10 hover:border-[#E87A1E]/30 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#E87A1E] text-white flex items-center justify-center font-bold text-xs shadow-md">
                    {c.full_name?.[0] || c.username?.[0] || 'S'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-label-md text-sm font-bold text-[#2F1B12] truncate">{c.full_name || c.username}</p>
                    <p className="font-label-sm text-xs text-[#2F1B12]/50 truncate">{c.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.id === channel?.created_by_user_id ? (
                    <Badge variant="primary" className="text-[10px] bg-[#E87A1E] text-white px-2 py-0.5 rounded-full">
                      {t('channelPage.chat.pramukh')}
                    </Badge>
                  ) : (
                    <Badge variant="default" className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      {t('channelPage.chat.sevak')}
                    </Badge>
                  )}
                  {canEditEmergencyContact && c.id !== channel?.created_by_user_id && (
                    <button
                      onClick={() => handleRemoveContributor(c.id || c.user_id)}
                      className="font-label-sm text-xs text-red-600 hover:text-red-700 hover:underline font-bold p-0.5 transition-colors cursor-pointer"
                      title={t('channelPage.modals.remove')}
                    >
                      <FiX size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ChannelPage;