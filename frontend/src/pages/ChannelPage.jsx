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
} from 'react-icons/fi';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';

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
  const [activeTab, setActiveTab] = useState('chat'); // 'announcements' | 'chat' | 'map' | 'info'
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
        await api.createChannelPost(id, { message: messageContent });
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
    { id: 'announcements', label: t('channelPage.tabs.announcements'), icon: 'campaign' },
    { id: 'chat', label: t('channelPage.tabs.chat'), icon: 'forum' },
    { id: 'map', label: t('channelPage.tabs.map'), icon: 'map' },
    { id: 'info', label: t('channelPage.tabs.info'), icon: 'info' },
  ], [language]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] gap-3 bg-[#FBF5EC]">
        <Loader size="lg" />
        <p className="font-body-md text-sm font-medium text-[#6a020a] animate-pulse">Loading Aapli Wari Channel...</p>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="text-center py-20 px-4 max-w-md mx-auto bg-[#FBF5EC]">
        <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center text-2xl text-[#a13f09]">
          🔍
        </div>
        <h2 className="font-headline-md text-2xl font-bold text-[#1f1b18]">Channel Not Found</h2>
        <p className="font-body-md text-sm text-[#58413f] mt-2 mb-6">
          The palkhi channel you are looking for might have been moved or removed.
        </p>
        <Link
          to="/channels"
          className="inline-flex items-center px-4 py-2.5 bg-[#6a020a] text-white rounded-xl font-label-md font-semibold shadow-sm hover:bg-[#8b1e1e] transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to all channels
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FBF5EC] text-[#1f1b18] min-h-[calc(100vh-4rem)] flex flex-col justify-between font-body-md overflow-hidden">
      {/* App Container */}
      <div className="flex w-full h-[calc(100vh-4rem)] max-w-[1600px] mx-auto bg-[#fff8f5] relative shadow-[0_0_40px_rgba(106,2,10,0.05)] overflow-hidden">

        {/* ========================================================================= */}
        {/* LEFT COLUMN: Fixed, Scrollable (Hidden on Mobile, 30% on Desktop)         */}
        {/* ========================================================================= */}
        <aside className="hidden md:flex flex-col w-[30%] h-full bg-[#fbf2ed] border-r border-[#dfbfbc]/30 relative overflow-y-auto no-scrollbar pb-6 z-10 shadow-[4px_0_12px_rgba(106,2,10,0.02)] shrink-0">
          
          {/* Header / Profile Section */}
          <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center">
            <div className="relative mb-3">
              {channel.avatar_url || channel.image_url ? (
                <img
                  alt={channel.name}
                  className="w-28 h-28 lg:w-32 lg:h-32 rounded-full object-cover border-2 border-[#a13f09] p-1 bg-white shadow-sm"
                  src={channel.avatar_url || channel.image_url}
                />
              ) : (
                <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-[#6a020a] to-[#a13f09] flex items-center justify-center text-white text-4xl lg:text-5xl font-headline-lg font-bold shadow-md border-2 border-[#a13f09] p-1 ring-2 ring-white">
                  {channel.name?.[0]?.toUpperCase() || 'W'}
                </div>
              )}

              {channel.status === 'active' && (
                <div className="absolute bottom-1 right-1 bg-white text-[#6a020a] rounded-full p-1 shadow-sm border border-[#dfbfbc] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]" data-weight="fill">verified</span>
                </div>
              )}
            </div>

            <h1 className="font-headline-lg text-2xl lg:text-[28px] text-[#6a020a] mb-1 font-bold leading-tight">
              {channel.name}
            </h1>

            <p className="font-body-md text-sm text-[#58413f] flex items-center justify-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-[18px] text-[#a13f09]">groups</span>
              <span>{t('channelPage.pramukh')} {channel.owner_name || channel.created_by_name || 'Sant Tukaram Palkhi'}</span>
            </p>

            <div className="mt-2 bg-[#efe6e2] px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#a13f09]"></span>
              <span className="font-label-sm text-[11px] text-[#58413f] uppercase tracking-wider font-semibold">
                Live Route
              </span>
            </div>
          </div>

          {/* Follower Stats Card */}
          <div className="px-6 pb-4">
            <div className="flex justify-between bg-white rounded-xl p-3 shadow-[0_2px_8px_rgba(106,2,10,0.03)] border border-[#dfbfbc]/20">
              <div className="text-center flex-1">
                <div className="font-headline-md text-xl lg:text-2xl text-[#6a020a] font-bold">
                  {followersCount >= 1000 ? `${(followersCount / 1000).toFixed(1)}K` : followersCount}
                </div>
                <div className="font-label-sm text-xs text-[#58413f]">{t('channelPage.followers')}</div>
              </div>
              <div className="w-[1px] bg-[#dfbfbc]/50"></div>
              <div className="text-center flex-1">
                <div className="font-headline-md text-xl lg:text-2xl text-[#6a020a] font-bold">
                  {contributors.length}
                </div>
                <div className="font-label-sm text-xs text-[#58413f]">Varkaris</div>
              </div>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="px-6 pb-5 flex flex-col gap-2.5 border-b border-[#dfbfbc]/30">
            {isOwner ? (
              <div className="flex flex-col gap-2">
                <div className="py-1.5 px-3 rounded-xl text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 text-center flex items-center justify-center gap-1.5">
                  <FiStar size={11} className="text-amber-500" /> {t('channelPage.youAreOwner')}
                </div>
                <Link
                  to={`/channel/${id}/manage`}
                  className="w-full bg-[#6a020a] text-white font-label-md text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#8b1e1e] transition-colors shadow-sm font-semibold"
                >
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  {t('channelPage.manageChannel')}
                </Link>
              </div>
            ) : adminView ? (
              <div className="py-2.5 px-4 rounded-xl text-xs font-bold bg-[#FDF8F0] text-[#6a020a] border border-[#dfbfbc] text-center shadow-sm">
                {t('channelPage.adminViewOnly')}
              </div>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`w-full font-label-md text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm font-semibold cursor-pointer ${
                  isFollowing
                    ? 'bg-[#FBF5EC] text-[#6a020a] border border-[#a13f09]/40 hover:bg-red-50'
                    : 'bg-[#a13f09] text-white hover:bg-[#8b3506] active:scale-[0.98]'
                }`}
              >
                {followLoading ? (
                  <Loader size="xs" />
                ) : isFollowing ? (
                  <>
                    <span className="material-symbols-outlined text-[18px]" data-weight="fill">volunteer_activism</span>
                    {t('channelPage.following')}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]" data-weight="fill">volunteer_activism</span>
                    {t('channelPage.followChannel')}
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setActiveTab('map')}
              className="w-full border border-[#6a020a] text-[#6a020a] font-label-md text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#6a020a]/5 transition-colors font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]" data-weight="fill">map</span>
              {t('channelPage.tabs.map')}
            </button>
          </div>

          {/* Emergency Helpline Card (Prominent) */}
          <div className="px-6 py-4 mt-2">
            <div className="bg-[#ba1a1a]/5 border border-[#ba1a1a]/20 rounded-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[64px] text-[#ba1a1a]" data-weight="fill">emergency</span>
              </div>
              <div className="flex items-start gap-3 mb-3 relative z-10">
                <div className="bg-[#ba1a1a] text-white p-1.5 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]" data-weight="fill">medical_services</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-label-md text-sm font-bold text-[#ba1a1a] truncate">
                      {t('channelPage.emergencyHelpline')}
                    </h3>
                    {canEditEmergencyContact && (
                      <button
                        onClick={() => setShowEmergencyModal(true)}
                        className="text-[11px] font-bold text-[#ba1a1a] hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <FiEdit2 size={10} /> {t('channelPage.edit')}
                      </button>
                    )}
                  </div>
                  <p className="font-label-sm text-[11px] text-[#ba1a1a]/80">Available 24/7 during Yatra</p>
                </div>
              </div>

              {hasEmergencyContact ? (
                <a
                  href={`tel:${channel.emergency_contact_phone}`}
                  className="w-full bg-white text-[#ba1a1a] border border-[#ba1a1a]/20 font-label-md text-xs py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#ba1a1a]/5 transition-colors shadow-sm font-bold truncate"
                >
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  {channel.emergency_contact_phone} ({channel.emergency_contact_name || 'Medical Team'})
                </a>
              ) : (
                <div className="text-center pt-1">
                  <p className="font-label-sm text-xs text-[#58413f]/70 italic mb-2">{t('channelPage.noHelpline')}</p>
                  {canEditEmergencyContact && (
                    <button
                      onClick={() => setShowEmergencyModal(true)}
                      className="w-full bg-white text-[#ba1a1a] border border-[#ba1a1a]/20 font-label-md text-xs py-2 rounded-lg hover:bg-red-50 font-bold transition-colors cursor-pointer"
                    >
                      {t('channelPage.addEmergencyContact')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links (SideNavBar style mapping) */}
          <nav className="px-4 mt-auto pt-4">
            <ul className="flex flex-col gap-1.5">
              <li>
                <Link
                  to="/"
                  className="flex items-center gap-3 text-[#58413f] px-4 py-2.5 hover:bg-[#efe6e2] rounded-xl transition-all font-label-md text-sm font-medium"
                >
                  <span className="material-symbols-outlined text-[20px]">home</span>
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/map"
                  className="flex items-center gap-3 text-[#58413f] px-4 py-2.5 hover:bg-[#efe6e2] rounded-xl transition-all font-label-md text-sm font-medium"
                >
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                  <span>Schedule</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all font-label-md text-sm font-bold text-left cursor-pointer ${
                    activeTab === 'chat'
                      ? 'bg-[#fe844c]/20 text-[#6a2500] shadow-[0_2px_4px_rgba(0,0,0,0.03)]'
                      : 'text-[#58413f] hover:bg-[#efe6e2]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]" data-weight={activeTab === 'chat' ? 'fill' : undefined}>forum</span>
                  <span>Community Chat</span>
                </button>
              </li>
              <li>
                <Link
                  to={isOwner ? `/channel/${id}/manage` : '/settings'}
                  className="flex items-center gap-3 text-[#58413f] px-4 py-2.5 hover:bg-[#efe6e2] rounded-xl transition-all font-label-md text-sm font-medium"
                >
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                  <span>Settings</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Main Chat Area (100% on Mobile, 70% on Desktop)             */}
        {/* ========================================================================= */}
        <main className="flex-1 flex flex-col h-full relative bg-[#ffffff] overflow-hidden">
          
          {/* Emergency Alert Banner (Conditional & Dismissible) */}
          {hasEmergencyContact && showEmergencyBanner && (
            <div className="bg-[#ba1a1a] text-white px-4 py-2 flex justify-between items-center z-30 shadow-md">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="material-symbols-outlined text-[20px] shrink-0" data-weight="fill">warning</span>
                <span className="font-label-sm text-xs font-semibold tracking-wide truncate">
                  Helpline: {channel.emergency_contact_name || 'Emergency Team'} ({channel.emergency_contact_phone})
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <a
                  className="font-label-sm text-xs underline hover:text-white/80 transition-colors font-bold"
                  href={`tel:${channel.emergency_contact_phone}`}
                >
                  Call Help
                </a>
                {canEditEmergencyContact && (
                  <button
                    aria-label="Edit banner"
                    onClick={() => setShowEmergencyModal(true)}
                    className="text-white/80 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                )}
                <button
                  aria-label="Close banner"
                  onClick={() => setShowEmergencyBanner(false)}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>
          )}

          {/* Top App Bar Header */}
          <header className="bg-[#fff8f5] border-b border-[#dfbfbc]/40 px-4 py-3 z-20 sticky top-0 flex flex-col w-full shadow-[0_2px_10px_rgba(106,2,10,0.02)]">
            <div className="flex justify-between items-center w-full">
              {/* Mobile View: Avatar & Title */}
              <div className="flex items-center gap-3 md:hidden min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6a020a] to-[#a13f09] text-white flex items-center justify-center font-headline-md font-bold text-sm shrink-0 border border-[#a13f09]/40">
                  {channel.name?.[0]?.toUpperCase() || 'W'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-md text-base font-bold text-[#6a020a] leading-tight truncate">
                    {channel.name}
                  </span>
                  <span className="font-label-sm text-[11px] text-[#58413f]">Live Community</span>
                </div>
              </div>

              {/* Desktop View: Title */}
              <div className="hidden md:flex items-center gap-2">
                <span className="font-headline-md text-xl font-bold text-[#6a020a]">
                  {channel.name}
                </span>
                {channel.status === 'active' && (
                  <span className="material-symbols-outlined text-[#2D6A4F] text-[18px]" data-weight="fill">verified</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 text-[#6a020a]">
                <button
                  onClick={() => setShowSearchBar((p) => !p)}
                  className="p-2 hover:bg-[#efe6e2] rounded-full transition-colors active:scale-95 cursor-pointer"
                  title="Search messages"
                >
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </button>
                <button
                  onClick={() => setShowContributorsModal(true)}
                  className="p-2 hover:bg-[#efe6e2] rounded-full transition-colors active:scale-95 cursor-pointer"
                  title="View Contributors"
                >
                  <span className="material-symbols-outlined text-[20px]">groups</span>
                </button>
                {(isOwner || isAdminUser) && !adminView && (
                  <Link
                    to={`/channel/${id}/manage`}
                    className="p-2 hover:bg-[#efe6e2] rounded-full transition-colors active:scale-95 cursor-pointer"
                    title="Channel Settings"
                  >
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Expandable Quick Search Bar */}
            {showSearchBar && (
              <div className="mt-2.5 flex items-center bg-white border border-[#dfbfbc]/60 rounded-xl px-3 py-1.5 shadow-2xs animate-fade-in">
                <span className="material-symbols-outlined text-[#58413f] text-[18px] mr-2">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('channelPage.searchPlaceholder')}
                  className="w-full bg-transparent text-xs text-[#1f1b18] placeholder:text-gray-400 focus:outline-none font-body-md"
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-[#6a020a]">
                    <FiX size={14} />
                  </button>
                )}
              </div>
            )}

            {/* Navigation Tabs (Announcements, Chat, Map, Info) */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar w-full mt-2 pt-2 border-t border-[#dfbfbc]/20">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-2 font-label-md text-sm transition-colors whitespace-nowrap px-2 flex items-center gap-1.5 cursor-pointer border-b-2 ${
                      isActive
                        ? 'text-[#a13f09] border-[#a13f09] font-bold'
                        : 'text-[#58413f] border-transparent hover:text-[#a13f09]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]" data-weight={isActive ? 'fill' : undefined}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                    {tab.id === 'announcements' && announcementPosts.length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive ? 'bg-[#a13f09] text-white' : 'bg-[#efe6e2] text-[#6a020a]'
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
            <div className={`mx-4 mt-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
              notice.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}>
              {notice.text}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB CONTENTS (Independently Scrollable with Chat Canvas Background)        */}
          {/* ========================================================================= */}
          <div ref={chatCanvasRef} className="flex-1 overflow-y-auto chat-bg p-4 md:p-6 flex flex-col gap-4 relative">
            
            {/* -------------------- TAB 1: ANNOUNCEMENTS -------------------- */}
            {activeTab === 'announcements' && (
              <div className="space-y-4 max-w-2xl w-full mx-auto">
                {/* Post Announcement Form for Pramukh / Owner / Admins */}
                {canCreateAnnouncement && (
                  <div className="bg-white border border-[#a13f09]/30 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-[#6a020a] text-[20px]" data-weight="fill">campaign</span>
                      <h3 className="font-label-md text-xs font-bold uppercase tracking-wider text-[#6a020a]">
                        {t('channelPage.announcements.postTitle')}
                      </h3>
                    </div>
                    <form onSubmit={handlePostAnnouncement} className="space-y-3">
                      <textarea
                        rows={3}
                        placeholder={t('channelPage.announcements.placeholder')}
                        value={newAnnouncement}
                        onChange={(e) => setNewAnnouncement(e.target.value)}
                        className="w-full p-3 font-body-md text-sm border border-[#dfbfbc]/50 rounded-xl focus:outline-none focus:border-[#6a020a] focus:ring-1 focus:ring-[#6a020a]/20 resize-none bg-[#fff8f5]"
                      />
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <label className="flex items-center gap-2 font-label-sm text-xs font-semibold text-[#58413f] cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={announcementPinned}
                            onChange={(e) => setAnnouncementPinned(e.target.checked)}
                            className="w-4 h-4 rounded text-[#6a020a] focus:ring-[#6a020a] accent-[#6a020a]"
                          />
                          {t('channelPage.announcements.pin')}
                        </label>
                        <Button
                          type="submit"
                          disabled={postingAnnouncement || !newAnnouncement.trim()}
                          className="!px-4 !py-2 !bg-[#6a020a] hover:!bg-[#8b1e1e] text-white font-label-md text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                        >
                          {postingAnnouncement ? t('channelPage.announcements.broadcasting') : t('channelPage.announcements.broadcast')}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Announcements Feed */}
                {announcementPosts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#dfbfbc] bg-white p-10 text-center">
                    <div className="text-4xl mb-3">📢</div>
                    <h3 className="font-headline-md text-base font-bold text-[#1f1b18]">{t('channelPage.announcements.empty')}</h3>
                    <p className="font-body-md text-xs text-[#58413f] mt-1 max-w-sm mx-auto">
                      {t('channelPage.announcements.emptySub')}
                    </p>
                  </div>
                ) : (
                  announcementPosts.map((post) => (
                    <article
                      key={`ann-${post.id}`}
                      className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-[0_2px_8px_rgba(106,2,10,0.04)] ${
                        post.is_pinned
                          ? 'bg-[#FFFBF2] border-amber-300 ring-1 ring-amber-200'
                          : 'bg-white border-[#dfbfbc]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#6a020a] px-2.5 py-0.5 font-label-sm text-[10px] font-black uppercase tracking-wider text-white">
                            📢 {t('channelPage.announcements.badge')}
                          </span>
                          {post.is_pinned && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 border border-amber-300 px-2 py-0.5 font-label-sm text-[10px] font-black uppercase tracking-wider text-amber-900">
                              {t('channelPage.announcements.pinned')}
                            </span>
                          )}
                        </div>
                        <span className="font-label-sm text-[11px] text-[#58413f]/70">{timeAgo(post.created_at)}</span>
                      </div>

                      {post.title && post.title !== 'Channel Post' && (
                        <h4 className="font-headline-md text-base font-bold text-[#1f1b18] mb-1.5">{post.title}</h4>
                      )}

                      <p className="font-body-md text-sm text-[#1f1b18] whitespace-pre-wrap leading-relaxed">
                        {post.message || post.description}
                      </p>

                      {post.file_url && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-[#dfbfbc]/30 bg-gray-50">
                          {post.content_type === 'image' ? (
                            <img src={post.file_url} alt={post.title || 'Announcement'} className="w-full max-h-80 object-cover" />
                          ) : (
                            <a href={post.file_url} target="_blank" rel="noopener noreferrer" className="p-3 flex items-center gap-2 font-label-md text-xs font-bold text-[#6a020a]">
                              <FiFile size={16} /> {t('channelPage.announcements.viewDoc')}
                            </a>
                          )}
                        </div>
                      )}

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between font-label-sm text-xs text-[#58413f]">
                        <div className="flex items-center gap-2">
                          <Avatar size="xs" fallback={post.user?.full_name?.[0] || 'P'} />
                          <span className="font-bold text-[#1f1b18] text-xs">
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
                                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  isLiked ? 'text-red-600 font-bold' : 'hover:text-[#6a020a]'
                                }`}
                                title={isLiked ? 'Unlike announcement' : 'Like announcement'}
                              >
                                <FiHeart size={13} className={isLiked ? 'fill-red-600 text-red-600' : ''} /> {totalLikes}
                              </button>
                            );
                          })()}
                          <button
                            type="button"
                            className="flex items-center gap-1 hover:text-[#6a020a] cursor-pointer"
                            onClick={() => handleSharePost(post)}
                          >
                            <FiShare2 size={13} /> {t('channelPage.announcements.share')}
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
              <div className="space-y-4 pb-2 max-w-3xl w-full mx-auto flex flex-col">
                
                {/* Sticky Date Separator */}
                <div className="flex justify-center my-1 sticky top-2 z-10">
                  <span className="bg-white border border-[#dfbfbc]/30 text-[#58413f] font-label-sm text-xs px-3 py-1 rounded-full shadow-sm">
                    Today
                  </span>
                </div>

                {/* System Message / Pinned Notice Highlight */}
                {announcementPosts.length > 0 && (
                  <div className="flex justify-center my-1">
                    <div className="bg-[#6a020a]/5 border border-[#6a020a]/20 px-4 py-3 rounded-xl flex items-start gap-3 max-w-md shadow-sm">
                      <span className="material-symbols-outlined text-[#6a020a] text-[20px] mt-0.5" data-weight="fill">info</span>
                      <div>
                        <p className="font-label-md text-xs text-[#6a020a] font-bold">
                          {announcementPosts[0]?.title || 'Palkhi Route Notice'}
                        </p>
                        <p className="font-label-sm text-xs text-[#58413f] mt-0.5 line-clamp-2">
                          {announcementPosts[0]?.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {loadingPosts ? (
                  <div className="flex justify-center py-10"><Loader size="md" /></div>
                ) : chatPosts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#dfbfbc] bg-white p-10 text-center">
                    <div className="text-4xl mb-3">💬</div>
                    <h3 className="font-headline-md text-base font-bold text-[#1f1b18]">{t('channelPage.chat.emptyTitle')}</h3>
                    <p className="font-body-md text-xs text-[#58413f] mt-1 max-w-sm mx-auto">
                      {t('channelPage.chat.emptySub')}
                    </p>
                  </div>
                ) : (
                  chatPosts.map((post) => {
                    const isMyPost = Boolean(user) && String(post.user_id) === String(user.id);
                    const isPostOwner = channel && String(post.user_id) === String(channel.created_by_user_id);
                    const isContributorPost = post.user?.role === 'contributor';

                    return isMyPost ? (
                      /* Self Message (Right Aligned, Warm Peach Tint) */
                      <div key={post.id} className="flex flex-col items-end self-end max-w-[85%] md:max-w-[70%]">
                        <div className="bg-[#FFF0E6] border border-[#FFDBCD] p-3 rounded-2xl rounded-tr-none shadow-[0_2px_8px_rgba(161,63,9,0.06)] relative min-w-[120px]">
                          {post.title && post.title !== 'Channel Post' && (
                            <p className="font-headline-md text-xs font-bold text-[#6a020a] mb-1">
                              {post.title}
                            </p>
                          )}
                          <p className="font-body-md text-sm text-[#1f1b18] whitespace-pre-wrap leading-relaxed">
                            {post.description || post.message}
                          </p>

                          {post.file_url && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-[#FFDBCD]">
                              {post.content_type === 'image' && (
                                <img
                                  src={post.file_url}
                                  alt="Attachment"
                                  className="w-full max-h-72 object-cover rounded-lg cursor-pointer"
                                  onClick={() => window.open(post.file_url, '_blank')}
                                />
                              )}
                              {post.content_type === 'video' && (
                                <video src={post.file_url} controls className="w-full max-h-72 rounded-lg" />
                              )}
                              {post.content_type === 'pdf' && (
                                <a
                                  href={post.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold bg-white text-[#6a020a]"
                                >
                                  <FiFile size={16} /> Attached Document (PDF)
                                </a>
                              )}
                            </div>
                          )}

                          <div className="flex justify-end items-center mt-1.5 gap-1 text-[11px] text-[#58413f]/80">
                            <span>{timeAgo(post.created_at)}</span>
                            <span className="material-symbols-outlined text-[14px] text-[#a13f09]" data-weight="fill">done_all</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Other User / Admin Message (Left Aligned, Pure White Card) */
                      <div key={post.id} className="flex flex-col items-start max-w-[85%] md:max-w-[70%]">
                        <div className="flex items-end gap-1.5 mb-1">
                          <div className="w-7 h-7 rounded-full bg-[#efe6e2] text-[#6a020a] flex items-center justify-center font-bold text-xs shadow-sm border border-[#dfbfbc]/40">
                            {post.user?.full_name?.[0]?.toUpperCase() || post.user?.username?.[0]?.toUpperCase() || 'W'}
                          </div>
                          <span className="font-label-sm text-xs font-semibold text-[#6a020a]">
                            {post.user?.full_name || post.user?.username || t('channelPage.chat.warkari')}
                          </span>
                          {isPostOwner ? (
                            <span className="bg-[#6a020a]/10 text-[#6a020a] font-label-sm text-[10px] px-2 py-[1px] rounded-full uppercase tracking-wider font-bold">
                              {t('channelPage.chat.pramukh')}
                            </span>
                          ) : isContributorPost ? (
                            <span className="bg-emerald-100 text-emerald-800 font-label-sm text-[10px] px-2 py-[1px] rounded-full uppercase tracking-wider font-bold">
                              {t('channelPage.chat.sevak')}
                            </span>
                          ) : null}
                        </div>

                        <div className="bg-white border border-[#dfbfbc]/20 p-3 rounded-2xl rounded-tl-none shadow-[0_2px_8px_rgba(106,2,10,0.04)] ml-8 min-w-[140px]">
                          {post.title && post.title !== 'Channel Post' && (
                            <p className="font-headline-md text-xs font-bold text-[#6a020a] mb-1">
                              {post.title}
                            </p>
                          )}
                          
                          {/* Image Thumbnail if attached */}
                          {post.file_url && post.content_type === 'image' && (
                            <img
                              src={post.file_url}
                              alt="Attachment"
                              className="w-full max-h-64 object-cover rounded-xl mb-2 border border-[#dfbfbc]/20 cursor-pointer"
                              onClick={() => window.open(post.file_url, '_blank')}
                            />
                          )}

                          {post.file_url && post.content_type === 'video' && (
                            <video src={post.file_url} controls className="w-full max-h-64 rounded-xl mb-2" />
                          )}

                          {post.file_url && post.content_type === 'pdf' && (
                            <a
                              href={post.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold bg-[#fbf2ed] text-[#6a020a] mb-2"
                            >
                              <FiFile size={16} /> Attached Document (PDF)
                            </a>
                          )}

                          <p className="font-body-md text-sm text-[#1f1b18] whitespace-pre-wrap leading-relaxed">
                            {post.description || post.message}
                          </p>

                          <div className="flex justify-between items-center mt-2 pt-1 border-t border-gray-50 text-[11px] text-[#58413f]">
                            <div className="flex items-center gap-2.5">
                              {(() => {
                                const isLiked = Boolean(likedPostIds[post.id]);
                                const totalLikes = Math.max(0, (post.likes || 0) + (reactionMap[post.id] || 0));
                                return (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleLike(post.id)}
                                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                                      isLiked ? 'text-red-600 font-bold' : 'hover:text-[#6a020a]'
                                    }`}
                                  >
                                    <FiHeart size={12} className={isLiked ? 'fill-red-600 text-red-600' : ''} /> {totalLikes}
                                  </button>
                                );
                              })()}
                              <button
                                type="button"
                                className="hover:text-[#6a020a] font-medium cursor-pointer"
                                onClick={() => setReplyToPost(post)}
                              >
                                {t('channelPage.chat.reply')}
                              </button>
                            </div>
                            <span className="text-[11px] text-[#58413f]/70">{timeAgo(post.created_at)}</span>
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
              <div className="bg-white border border-[#dfbfbc]/30 rounded-3xl p-6 sm:p-10 text-center max-w-2xl w-full mx-auto shadow-sm">
                <div className="w-20 h-20 mx-auto mb-4 bg-[#fbf2ed] rounded-full flex items-center justify-center text-4xl text-[#a13f09] shadow-inner border border-[#dfbfbc]/30">
                  <span className="material-symbols-outlined text-[36px]" data-weight="fill">map</span>
                </div>
                <h3 className="font-headline-md text-xl font-bold text-[#1f1b18]">{t('channelPage.map.title')}</h3>
                <p className="font-body-md text-xs sm:text-sm text-[#58413f] mt-2 max-w-md mx-auto leading-relaxed">
                  {t('channelPage.map.desc')}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 max-w-lg mx-auto">
                  <div className="p-3 bg-[#fbf2ed] rounded-xl text-center border border-[#dfbfbc]/30">
                    <span className="text-lg">🏕️</span>
                    <p className="font-label-sm text-[11px] font-bold text-[#58413f] mt-1">{t('channelPage.map.nightHalts')}</p>
                  </div>
                  <div className="p-3 bg-[#fbf2ed] rounded-xl text-center border border-[#dfbfbc]/30">
                    <span className="text-lg">🍲</span>
                    <p className="font-label-sm text-[11px] font-bold text-[#58413f] mt-1">{t('channelPage.map.annachhatra')}</p>
                  </div>
                  <div className="p-3 bg-[#fbf2ed] rounded-xl text-center border border-[#dfbfbc]/30">
                    <span className="text-lg">🚑</span>
                    <p className="font-label-sm text-[11px] font-bold text-[#58413f] mt-1">{t('channelPage.map.medical')}</p>
                  </div>
                  <div className="p-3 bg-[#fbf2ed] rounded-xl text-center border border-[#dfbfbc]/30">
                    <span className="text-lg">💧</span>
                    <p className="font-label-sm text-[11px] font-bold text-[#58413f] mt-1">{t('channelPage.map.waterTanks')}</p>
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/map')}
                  className="!bg-[#6a020a] hover:!bg-[#8b1e1e] text-white font-label-md text-xs font-bold !px-6 !py-3 rounded-xl shadow-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">near_me</span>
                  {t('channelPage.map.openMap')}
                </Button>
              </div>
            )}

            {/* -------------------- TAB 4: ABOUT & INFO -------------------- */}
            {activeTab === 'info' && (
              <div className="space-y-4 max-w-2xl w-full mx-auto">
                <div className="bg-white border border-[#dfbfbc]/30 rounded-2xl p-5 shadow-[0_2px_8px_rgba(106,2,10,0.03)]">
                  <h3 className="font-headline-md text-sm font-bold text-[#6a020a] mb-2 uppercase tracking-wider">
                    {t('channelPage.info.aboutTitle')}
                  </h3>
                  <p className="font-body-md text-sm text-[#1f1b18] leading-relaxed">
                    {channel.description || t('channelPage.info.aboutDefault')}
                  </p>
                </div>

                {/* Emergency Contact detail card */}
                <div className="bg-[#ba1a1a]/5 border border-[#ba1a1a]/20 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-label-md text-xs font-bold uppercase tracking-wider text-[#ba1a1a] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]" data-weight="fill">medical_services</span>
                      {t('channelPage.info.helplineTitle')}
                    </h3>
                    {canEditEmergencyContact && (
                      <button
                        onClick={() => setShowEmergencyModal(true)}
                        className="text-xs font-bold text-[#ba1a1a] underline cursor-pointer"
                      >
                        {t('channelPage.info.editHelpline')}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 font-body-md text-sm text-[#1f1b18]">
                    <p><span className="font-semibold text-[#58413f]">{t('channelPage.contactPerson')}</span> {channel.emergency_contact_name || t('channelPage.notSpecified')}</p>
                    <p>
                      <span className="font-semibold text-[#58413f]">{t('channelPage.helplinePhone')}</span>{' '}
                      {channel.emergency_contact_phone ? (
                        <a href={`tel:${channel.emergency_contact_phone}`} className="text-[#ba1a1a] font-bold underline">
                          {channel.emergency_contact_phone}
                        </a>
                      ) : t('channelPage.notSpecified')}
                    </p>
                    <p><span className="font-semibold text-[#58413f]">{t('channelPage.role')}</span> {channel.emergency_contact_role || 'Pramukh / Seva Head'}</p>
                  </div>
                </div>

                {/* Contributors List card */}
                <div className="bg-white border border-[#dfbfbc]/30 rounded-2xl p-5 shadow-[0_2px_8px_rgba(106,2,10,0.03)]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-headline-md text-sm font-bold text-[#6a020a] uppercase tracking-wider">
                      {t('channelPage.info.authorizedSevaks')} ({contributors.length})
                    </h3>
                    <button
                      onClick={() => setShowContributorsModal(true)}
                      className="font-label-md text-xs font-bold text-[#a13f09] hover:underline cursor-pointer"
                    >
                      {t('channelPage.info.viewAll')}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {contributors.slice(0, 6).map((c) => (
                      <div key={c.id || c.user_id} className="flex items-center gap-2.5 p-2 bg-[#fbf2ed] rounded-xl border border-[#dfbfbc]/40">
                        <Avatar size="xs" fallback={c.full_name?.[0] || 'S'} />
                        <div className="min-w-0">
                          <p className="font-label-md text-xs font-bold text-[#1f1b18] truncate">{c.full_name || c.username}</p>
                          <p className="font-label-sm text-[10px] text-[#58413f] truncate">{c.email || t('channelPage.info.verifiedSevak')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* STICKY INPUT AREA (WhatsApp style matching code.html)                      */}
          {/* ========================================================================= */}
          {activeTab === 'chat' && (
            <footer className="bg-white border-t border-[#dfbfbc]/30 p-3 md:p-4 sticky bottom-0 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
              {canPostChat ? (
                <form onSubmit={handlePost} className="flex flex-col gap-1.5">
                  {/* Reply Context Banner */}
                  {replyToPost && (
                    <div className="bg-[#fbf2ed] px-3 py-1.5 rounded-t-xl border-l-4 border-[#a13f09] flex justify-between items-center text-xs">
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-sm text-[#a13f09] font-bold text-[11px]">
                          {t('channelPage.chat.replyingTo')} {replyToPost.user?.full_name || replyToPost.user?.username || 'sevak'}
                        </span>
                        <span className="font-body-md text-xs text-[#58413f] truncate max-w-[280px] sm:max-w-md">
                          {replyToPost.description || replyToPost.message}
                        </span>
                      </div>
                      <button type="button" onClick={() => setReplyToPost(null)} className="text-[#58413f] hover:text-[#6a020a]">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  )}

                  {/* Selected Media Indicator */}
                  {postMedia && (
                    <div className="bg-[#1f1b18] text-white text-xs px-3 py-1 rounded-full flex items-center justify-between gap-2 max-w-sm mb-1">
                      <span className="truncate">📎 {postMedia.name}</span>
                      <button type="button" onClick={() => setPostMedia(null)} className="text-red-400 hover:text-white">
                        <FiX size={14} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-end gap-2 bg-[#FBF5EC] rounded-2xl p-1.5 border border-[#dfbfbc]/40 focus-within:bg-white focus-within:border-[#a13f09] transition-colors shadow-sm">
                    {/* Attachment button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-[#58413f] hover:text-[#a13f09] transition-colors rounded-full shrink-0 flex items-center justify-center h-10 w-10 cursor-pointer"
                      title="Attach Media or Document"
                    >
                      <span className="material-symbols-outlined text-[24px]">add_circle</span>
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
                      placeholder={
                        replyToPost
                          ? `${t('channelPage.chat.replyPlaceholder')} ${replyToPost.user?.full_name || replyToPost.user?.username || 'sevak'}...`
                          : postMedia
                            ? `File attached: ${postMedia.name}`
                            : t('channelPage.chat.placeholder')
                      }
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handlePost(e);
                        }
                      }}
                      className="flex-1 bg-transparent border-none focus:ring-0 resize-none font-body-md text-sm py-[10px] px-1 max-h-32 min-h-[44px] text-[#1f1b18] placeholder:text-[#58413f]/50 no-scrollbar outline-none"
                    />

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={posting || (!newPost.trim() && !postMedia)}
                      className="bg-[#a13f09] text-white p-2 rounded-full shrink-0 flex items-center justify-center h-10 w-10 hover:bg-[#8b3506] transition-transform active:scale-95 shadow-md ml-1 mb-[2px] cursor-pointer disabled:opacity-50"
                      title="Send message"
                    >
                      {posting ? (
                        <Loader size="xs" />
                      ) : (
                        <span
                          className="material-symbols-outlined text-[20px]"
                          data-weight="fill"
                          style={{ transform: 'rotate(-45deg) translateX(2px) translateY(-2px)' }}
                        >
                          send
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-3 py-2 px-3 bg-[#fbf2ed] rounded-xl border border-[#dfbfbc]/40">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#a13f09] text-[22px]">forum</span>
                    <div>
                      <p className="font-label-md text-xs font-bold text-[#1f1b18]">{t('channelPage.chat.joinTitle')}</p>
                      <p className="font-label-sm text-[11px] text-[#58413f]">{t('channelPage.chat.joinSub')}</p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/login', { state: { from: `/channel/${id}` } })}
                    className="!bg-[#a13f09] hover:!bg-[#8b3506] text-white font-label-md text-xs font-bold shrink-0 shadow-xs cursor-pointer"
                  >
                    {t('channelPage.chat.signIn')}
                  </Button>
                </div>
              )}
            </footer>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Visible on mobile < md)                     */}
      {/* ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-[#dfbfbc]/40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40">
        <div className="flex justify-between items-center px-3 py-1">
          <Link to="/" className="flex flex-col items-center p-2 text-[#58413f] flex-1">
            <span className="material-symbols-outlined text-[22px]">home</span>
            <span className="font-label-sm text-[10px] mt-0.5">Home</span>
          </Link>
          <Link to="/map" className="flex flex-col items-center p-2 text-[#58413f] flex-1">
            <span className="material-symbols-outlined text-[22px]">calendar_month</span>
            <span className="font-label-sm text-[10px] mt-0.5">Schedule</span>
          </Link>
          <button
            onClick={() => setActiveTab('chat')}
            className="flex flex-col items-center p-2 text-[#a13f09] flex-1 cursor-pointer"
          >
            <div className="bg-[#fe844c]/20 px-3.5 py-0.5 rounded-full mb-0.5">
              <span className="material-symbols-outlined text-[22px]" data-weight="fill">forum</span>
            </div>
            <span className="font-label-sm text-[10px] font-bold">Chat</span>
          </button>
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="flex flex-col items-center p-2 text-[#ba1a1a] flex-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">emergency</span>
            <span className="font-label-sm text-[10px] mt-0.5">Alerts</span>
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
            <label className="block font-label-md text-xs font-bold text-[#1f1b18] uppercase tracking-wide mb-1">
              {t('channelPage.modals.personName')}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Patil / Palkhi Seva Kendra"
              value={emergencyContact.name}
              onChange={(e) => setEmergencyContact((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm border border-[#dfbfbc] rounded-xl focus:border-[#6a020a] focus:outline-none bg-[#fff8f5]"
            />
          </div>
          <div>
            <label className="block font-label-md text-xs font-bold text-[#1f1b18] uppercase tracking-wide mb-1">
              {t('channelPage.modals.phone')}
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={emergencyContact.phone}
              onChange={(e) => setEmergencyContact((p) => ({ ...p, phone: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm border border-[#dfbfbc] rounded-xl focus:border-[#6a020a] focus:outline-none bg-[#fff8f5]"
            />
          </div>
          <div>
            <label className="block font-label-md text-xs font-bold text-[#1f1b18] uppercase tracking-wide mb-1">
              {t('channelPage.modals.roleDesc')}
            </label>
            <input
              type="text"
              placeholder="e.g. Medical Van Coordinator, Local Pramukh"
              value={emergencyContact.role}
              onChange={(e) => setEmergencyContact((p) => ({ ...p, role: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm border border-[#dfbfbc] rounded-xl focus:border-[#6a020a] focus:outline-none bg-[#fff8f5]"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEmergencyModal(false)}
              className="flex-1 text-xs cursor-pointer font-label-md"
            >
              {t('channelPage.modals.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={savingEmergency}
              className="flex-1 !bg-[#ba1a1a] hover:!bg-[#93000a] text-white text-xs font-bold cursor-pointer font-label-md"
            >
              {savingEmergency ? t('channelPage.modals.saving') : t('channelPage.modals.saveHelpline')}
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
        <div className="space-y-4 font-body-md text-sm text-[#1f1b18]">
          <div className="flex items-center gap-3 pb-3 border-b border-[#dfbfbc]/30">
            <div className="w-14 h-14 rounded-full bg-[#6a020a] text-white flex items-center justify-center font-headline-md font-bold text-xl">
              {channel.name?.[0]?.toUpperCase() || 'W'}
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold text-[#6a020a]">{channel.name}</h3>
              <p className="font-label-sm text-xs text-[#58413f]">{t('channelPage.modals.created')} {new Date(channel.created_at).toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-GB')}</p>
            </div>
          </div>
          <div>
            <h4 className="font-label-md text-xs font-bold uppercase tracking-wider text-[#58413f] mb-1">{t('channelPage.modals.descLabel')}</h4>
            <p className="leading-relaxed bg-[#fbf2ed] p-3 rounded-xl border border-[#dfbfbc]/40">
              {channel.description || t('channelPage.info.aboutDefault')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-xl border border-[#dfbfbc]/30">
              <span className="font-label-sm text-xs text-[#58413f] block">{t('channelPage.followers')}</span>
              <span className="font-headline-md text-base font-bold text-[#6a020a]">{followersCount}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#dfbfbc]/30">
              <span className="font-label-sm text-xs text-[#58413f] block">{t('channelPage.modals.totalUpdates')}</span>
              <span className="font-headline-md text-base font-bold text-[#6a020a]">{posts.length}</span>
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
            <p className="text-center py-6 font-label-sm text-xs text-[#58413f]">{t('channelPage.modals.noContributors')}</p>
          ) : (
            contributors.map((c) => (
              <div
                key={c.id || c.user_id}
                className="flex items-center justify-between p-2.5 bg-white hover:bg-[#fbf2ed] rounded-xl border border-[#dfbfbc]/30 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar size="sm" fallback={c.full_name?.[0] || c.username?.[0] || 'S'} />
                  <div className="min-w-0">
                    <p className="font-label-md text-xs font-bold text-[#1f1b18] truncate">{c.full_name || c.username}</p>
                    <p className="font-label-sm text-[11px] text-[#58413f] truncate">{c.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.id === channel?.created_by_user_id ? (
                    <Badge variant="primary" className="text-[10px]">{t('channelPage.chat.pramukh')}</Badge>
                  ) : (
                    <Badge variant="default" className="text-[10px]">{t('channelPage.chat.sevak')}</Badge>
                  )}
                  {canEditEmergencyContact && c.id !== channel?.created_by_user_id && (
                    <button
                      onClick={() => handleRemoveContributor(c.id || c.user_id)}
                      className="font-label-sm text-[11px] text-[#ba1a1a] hover:underline font-bold p-1 transition-colors cursor-pointer"
                      title={t('channelPage.modals.remove')}
                    >
                      {t('channelPage.modals.remove')}
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