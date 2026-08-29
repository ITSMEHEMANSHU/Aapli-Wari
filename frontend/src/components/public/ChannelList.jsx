import React, { useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCheckCircle,
  FiUsers,
  FiBook,
  FiPlus,
  FiChevronRight,
  FiRadio,
  FiAlertCircle,
  FiShield,
  FiStar,
  FiUserCheck,
  FiUserPlus,
} from 'react-icons/fi';

import Button from '../common/Button';
import Card from '../common/Card';
import { api } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

export const ChannelList = () => {
  const navigate = useNavigate();
  const { user, isPalkhiPramukh, isOwnerOfChannel } = useContext(AuthContext);

  const [channels, setChannels] = useState([]);
  const [followingMap, setFollowingMap] = useState({});
  const [followingLoading, setFollowingLoading] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  
  // Pagination state
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  // ── Load All Channels ───────────────────────────────────────────
  const loadChannels = async (currentOffset = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      
      setError('');
      const data = await api.channels({ limit: LIMIT, offset: currentOffset });
      
      const newChannels = Array.isArray(data) ? data : [];
      
      if (append) {
        setChannels(prev => {
          // Avoid duplicates by checking IDs
          const existingIds = new Set(prev.map(c => c.id));
          const uniqueNew = newChannels.filter(c => !existingIds.has(c.id));
          return [...prev, ...uniqueNew];
        });
      } else {
        setChannels(newChannels);
      }
      
      if (newChannels.length < LIMIT) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error('Failed to load channels:', err);
      setError(err.message || 'Failed to load channels');
    } finally {
      if (!append) setLoading(false);
      else setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadChannels(0, false);
  }, [user]); // user is in dep array to reload properly on auth change

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    loadChannels(newOffset, true);
  };

  // ── Fetch Follow Status For Authenticated Users ─────────────────
  useEffect(() => {
    if (!user || channels.length === 0) return;

    const fetchFollowStatuses = async () => {
      // Find channels where user is not the owner
      const channelsToFetch = channels.filter(ch => {
        const isOwner = ch.is_owner === true || (user && String(ch.created_by_user_id) === String(user.id));
        return !isOwner;
      });

      if (channelsToFetch.length === 0) return;

      const idsToFetch = channelsToFetch.map(ch => ch.id).filter(id => followingMap[id] === undefined);
      if (idsToFetch.length === 0) return;

      try {
        const statuses = await api.getFollowStatusBatch(idsToFetch);
        setFollowingMap(prev => ({ ...prev, ...statuses }));
      } catch (err) {
        console.error('Failed to load batch follow statuses:', err);
        // Fallback or ignore
      }
    };

    fetchFollowStatuses();
  }, [user, channels]); // dependencies ensure it runs when new channels are loaded

  // ── Follow / Unfollow Handler ──────────────────────────────────
  const handleFollowToggle = useCallback(async (channelId, e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { from: '/channels' } });
      return;
    }

    setFollowingLoading((prev) => ({ ...prev, [channelId]: true }));
    try {
      if (followingMap[channelId]) {
        await api.unfollowChannel(channelId);
        setFollowingMap((prev) => ({ ...prev, [channelId]: false }));
        setChannels((prev) =>
          prev.map((ch) =>
            ch.id === channelId
              ? { ...ch, followers_count: Math.max(0, (ch.followers_count || 0) - 1) }
              : ch
          )
        );
      } else {
        await api.followChannel(channelId);
        setFollowingMap((prev) => ({ ...prev, [channelId]: true }));
        setChannels((prev) =>
          prev.map((ch) =>
            ch.id === channelId
              ? { ...ch, followers_count: (ch.followers_count || 0) + 1 }
              : ch
          )
        );
      }
    } catch (err) {
      console.error('Follow toggle failed:', err);
    } finally {
      setFollowingLoading((prev) => ({ ...prev, [channelId]: false }));
    }
  }, [user, followingMap, navigate]);

  // ── Handle "Create Channel" Gateway Button ──────────────────────
  const handleCreateChannelClick = () => {
    if (!user) {
      navigate('/login', { state: { from: '/channel/create' } });
      return;
    }

    const isPramukh = typeof isPalkhiPramukh === 'function' ? isPalkhiPramukh() : user.role === 'palkhi_pramukh' || user.role === 'admin';
    if (isPramukh) {
      navigate('/channel/create');
    } else {
      navigate('/apply-palkhi-pramukh', { state: { from: '/channel/create' } });
    }
  };

  // ── Computed Channel Groups ─────────────────────────────────────
  const isChannelOwnedByUser = useCallback((ch) => {
    if (!user) return false;
    if (ch.is_owner === true) return true;
    if (typeof isOwnerOfChannel === 'function' && isOwnerOfChannel(ch)) return true;
    return String(ch.created_by_user_id) === String(user.id);
  }, [user, isOwnerOfChannel]);

  const userOwnedChannels = useMemo(() => channels.filter(isChannelOwnedByUser), [channels, isChannelOwnedByUser]);
  const otherChannels = useMemo(() => channels.filter((ch) => !isChannelOwnedByUser(ch)), [channels, isChannelOwnedByUser]);
  const userHasChannel = userOwnedChannels.length > 0;

  // ── 1. Loading State ──
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center space-y-3">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-[#DD6B35] border-t-transparent" />
        <p className="text-sm font-medium text-gray-500">Loading channels...</p>
      </div>
    );
  }

  // ── 2. Error State ──
  if (error) {
    return (
      <div className="max-w-5xl mx-auto my-8 p-4">
        <Card className="bg-rose-50/60 border-rose-200 flex items-center justify-between text-rose-800">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FiAlertCircle className="text-lg flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="border-rose-300 text-rose-800 hover:bg-rose-100"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 sm:p-6">
      {/* ── Page Header ── */}
      <div className="border-b border-[#E8D9C3] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B1B12]">Palkhi Channels</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Follow official Palkhi updates, route alerts, aarti schedules, and traditional heritage feeds.
          </p>
        </div>

        {/* Create Channel button: Visible to all users who do NOT yet have an active channel */}
        {!userHasChannel && (
          <Button
            variant="primary"
            size="sm"
            className="bg-[#DD6B35] hover:bg-[#C85A28] text-white flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-sm text-xs font-bold"
            onClick={handleCreateChannelClick}
          >
            <FiPlus className="text-sm" /> Create Channel
          </Button>
        )}
      </div>

      {/* ── 1. Your Owned Channels Section (if user owns one) ── */}
      {userHasChannel && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#2B1B12] flex items-center gap-2">
              <FiRadio className="text-[#DD6B35]" /> Your Channel
            </h2>
          </div>

          <div className="space-y-3">
            {userOwnedChannels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                navigate={navigate}
                isOwner={true}
                currentUser={user}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── 2. Other Active Channels Section ── */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#2B1B12] flex items-center gap-2">
          {userHasChannel ? 'Other Active Channels' : 'All Wari Channels'}
        </h2>

        {otherChannels.length === 0 ? (
          <Card className="text-center py-10 text-xs text-gray-500 border-dashed">
            {userHasChannel
              ? 'No other channels available right now.'
              : 'No active channels available at this time.'}
          </Card>
        ) : (
          <div className="space-y-3">
            {otherChannels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                navigate={navigate}
                isOwner={false}
                currentUser={user}
                isFollowing={Boolean(followingMap[channel.id])}
                onFollowToggle={handleFollowToggle}
                followLoading={Boolean(followingLoading[channel.id])}
              />
            ))}
          </div>
        )}
      </section>

      {/* Pagination / Load More */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline" 
            onClick={handleLoadMore} 
            disabled={loadingMore}
            className="text-sm font-semibold px-6 border-[#E8D9C3] text-[#2B1B12]"
          >
            {loadingMore ? 'Loading...' : 'Load More Channels'}
          </Button>
        </div>
      )}
    </div>
  );
};

/* ── Unified Channel Card Component ── */
const ChannelCard = memo(({
  channel,
  navigate,
  isOwner = false,
  currentUser,
  isFollowing = false,
  onFollowToggle,
  followLoading = false,
}) => {
  return (
    <Card
      hover
      className={`p-4 sm:p-5 transition-all ${
        isOwner ? 'border-l-4 border-l-[#DD6B35] ring-1 ring-[#DD6B35]/20 bg-white' : 'bg-white'
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Left Section: Avatar & Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className={`w-12 h-12 rounded-2xl font-black text-lg flex items-center justify-center flex-shrink-0 ${
              isOwner
                ? 'bg-gradient-to-br from-[#8B1E1E] to-[#DD6B35] text-white shadow-md'
                : 'bg-[#DD6B35]/10 text-[#DD6B35] border border-[#DD6B35]/20'
            }`}
          >
            {channel.name?.[0]?.toUpperCase() || 'C'}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-[#2B1B12] truncate">{channel.name}</h3>

              {channel.status === 'active' && (
                <FiCheckCircle className="text-emerald-600 text-sm shrink-0" title="Active Channel" />
              )}

              {isOwner && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                  <FiStar size={9} className="text-amber-500" /> You are the owner
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 line-clamp-2 max-w-2xl">
              {channel.description || 'Dedicated channel for Palkhi updates and pilgrim coordination.'}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
              <span className="flex items-center gap-1">
                <FiBook className="text-gray-400" />
                <span className="capitalize">{channel.status || 'Active'}</span>
              </span>
              <span className="flex items-center gap-1">
                <FiUsers className="text-gray-400" />
                {channel.followers_count || 0} followers
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 justify-end shrink-0">
          {/* Follow/Unfollow Button: only for non-owner channels */}
          {!isOwner && (
            <button
              onClick={(e) => onFollowToggle && onFollowToggle(channel.id, e)}
              disabled={followLoading}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                isFollowing
                  ? 'bg-[#FBF5EC] text-[#8B1E1E] border-[#DD6B35]/40 hover:bg-red-50'
                  : 'bg-[#DD6B35] text-white border-[#DD6B35] hover:bg-[#C85A28] shadow-xs'
              } disabled:opacity-60`}
            >
              {followLoading ? (
                '...'
              ) : isFollowing ? (
                <>
                  <FiUserCheck size={13} /> Following
                </>
              ) : (
                <>
                  <FiUserPlus size={13} /> + Follow
                </>
              )}
            </button>
          )}

          {/* View Channel Button */}
          <Button
            variant="outline"
            size="sm"
            className="border-[#E8D9C3] hover:bg-[#FBF5EC] text-xs font-bold flex items-center gap-1 text-[#2B1B12]"
            onClick={() => navigate(`/channel/${channel.id}`)}
          >
            View <FiChevronRight className="text-xs" />
          </Button>

          {/* Manage Button: for owned channels */}
          {isOwner && (
            <Button
              variant="primary"
              size="sm"
              className="bg-[#8B1E1E] hover:bg-[#701616] text-white text-xs font-bold flex items-center gap-1 shadow-sm"
              onClick={() => navigate(`/channel/${channel.id}/manage`)}
            >
              <FiShield size={12} /> Manage
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
});

export default ChannelList;