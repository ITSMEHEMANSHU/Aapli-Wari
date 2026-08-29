import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCheckCircle,
  FiUsers,
  FiBook,
  FiPlus,
  FiClock,
  FiSend,
  FiChevronRight,
  FiRadio,
  FiAlertCircle
} from 'react-icons/fi';

import Button from '../common/Button';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { api } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

export const ChannelList = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [channels, setChannels] = useState([]);
  const [membership, setMembership] = useState({});
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const loadChannels = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await api.channels();
        setChannels(data);

        if (user?.role === 'contributor') {
          const myMemberships = await api.myChannelMemberships();
          const myChannelIds = new Set(
            myMemberships.map((channel) => String(channel.id || channel))
          );

          const myJoinRequests = await api.myJoinRequests();
          const pendingChannelIds = new Set(
            myJoinRequests
              .filter((request) => request.status === 'pending')
              .map((request) => String(request.channel_id))
          );

          const membershipMap = {};
          data.forEach((channel) => {
            membershipMap[channel.id] = {
              isMember: myChannelIds.has(String(channel.id)),
              requestPending: pendingChannelIds.has(String(channel.id)),
            };
          });

          setMembership(membershipMap);
        } else {
          setMembership({});
        }
      } catch (err) {
        setError(err.message || 'Failed to load channels');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadChannels();
    } else {
      setLoading(false);
    }
  }, [user]);

  const sendJoinRequest = async (channelId) => {
    try {
      setRequesting((prev) => ({ ...prev, [channelId]: true }));
      setError('');
      await api.joinChannel(channelId);

      setMembership((prev) => ({
        ...prev,
        [channelId]: {
          ...(prev[channelId] || {}),
          isMember: false,
          requestPending: true,
        },
      }));
    } catch (err) {
      setError(err.message || 'Failed to send join request');
    } finally {
      setRequesting((prev) => ({ ...prev, [channelId]: false }));
    }
  };

  /* ── 1. Loading State ── */
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center space-y-3">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-[#DD6B35] border-t-transparent" />
        <p className="text-sm font-medium text-gray-500">Loading channels...</p>
      </div>
    );
  }

  /* ── 2. Error State ── */
  if (error) {
    return (
      <div className="max-w-5xl mx-auto my-8 p-4">
        <Card className="bg-rose-50/60 border-rose-200 flex items-center justify-between text-rose-800">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FiAlertCircle className="text-lg flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="border-rose-300 text-rose-800 hover:bg-rose-100">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  /* ── 3. Unauthenticated State ── */
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="p-4 bg-[#FBF5EC] text-[#DD6B35] rounded-full inline-block">
          <FiRadio className="text-3xl" />
        </div>
        <h2 className="text-xl font-bold text-[#2B1B12]">Access Palkhi Channels</h2>
        <p className="text-xs text-gray-600">Please sign in to explore and follow live procession updates.</p>
        <Button variant="primary" className="bg-[#DD6B35] text-white w-full" onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </div>
    );
  }

  /* ── 4. Palkhi Pramukh View ── */
  if (user?.role === 'palkhi_pramukh') {
    const myChannels = channels.filter((c) => c.created_by_user_id === user.id);
    const otherChannels = channels.filter((c) => c.created_by_user_id !== user.id);

    return (
      <div className="max-w-5xl mx-auto space-y-8 p-4">
        <HeaderSection 
          title="Palkhi Channels" 
          subtitle="Manage your procession channel and follow official Wari feeds" 
        />

        {/* Your Managed Channels */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#2B1B12] flex items-center gap-2">
              <FiRadio className="text-[#DD6B35]" /> Your Channel
            </h2>
            {myChannels.length === 0 && (
              <Button 
                variant="primary" 
                size="sm" 
                className="bg-[#DD6B35] text-white flex items-center gap-1.5"
                onClick={() => navigate('/channel/create')}
              >
                <FiPlus className="text-sm" /> Create Channel
              </Button>
            )}
          </div>

          {myChannels.length > 0 ? (
            <div className="space-y-3">
              {myChannels.map((channel) => renderPalkhiChannelCard(channel, true, navigate))}
            </div>
          ) : (
            <Card className="text-center py-8 space-y-3 border-dashed">
              <p className="text-xs text-gray-500">You haven't created a channel for your Palkhi yet.</p>
            </Card>
          )}
        </section>

        {/* Other Channels */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#2B1B12]">Other Active Channels</h2>
          {otherChannels.length === 0 ? (
            <Card className="text-center py-8 text-xs text-gray-500">No other channels available right now.</Card>
          ) : (
            <div className="space-y-3">
              {otherChannels.map((channel) => renderPalkhiChannelCard(channel, false, navigate))}
            </div>
          )}
        </section>
      </div>
    );
  }

  /* ── 5. Contributor View ── */
  if (user?.role === 'contributor') {
    const myChannels = channels.filter((c) => membership[c.id]?.isMember === true);
    const otherChannels = channels.filter((c) => membership[c.id]?.isMember !== true);

    return (
      <div className="max-w-5xl mx-auto space-y-8 p-4">
        <HeaderSection 
          title="Palkhi Channels" 
          subtitle="Post updates to your assigned channels or request access to join new ones" 
        />

        {/* Contributor Channels */}
        {myChannels.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#2B1B12]">Your Channels</h2>
            <div className="space-y-3">
              {myChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  navigate={navigate}
                  isContributor={true}
                />
              ))}
            </div>
          </section>
        )}

        {/* Other Channels */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#2B1B12]">Explore Other Channels</h2>
          {otherChannels.length === 0 ? (
            <Card className="text-center py-8 text-xs text-gray-500">No other channels available to join.</Card>
          ) : (
            <div className="space-y-3">
              {otherChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  navigate={navigate}
                  isContributor={false}
                  requestPending={membership[channel.id]?.requestPending}
                  requesting={requesting[channel.id]}
                  onJoinRequest={() => sendJoinRequest(channel.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  /* ── 6. Normal User View ── */
  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4">
      <HeaderSection 
        title="Palkhi Channels" 
        subtitle="Follow live route updates, announcements, and traditional schedules" 
      />

      {channels.length === 0 ? (
        <Card className="text-center py-10 text-xs text-gray-500">No active channels available at this time.</Card>
      ) : (
        <div className="space-y-3">
          {channels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Common Page Header ── */
const HeaderSection = ({ title, subtitle }) => (
  <div className="border-b border-[#E8D9C3] pb-4">
    <h1 className="text-2xl font-bold text-[#2B1B12]">{title}</h1>
    <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
  </div>
);

/* ── Standard / Contributor Channel Card Component ── */
const ChannelCard = ({
  channel,
  navigate,
  isContributor = false,
  requestPending = false,
  requesting = false,
  onJoinRequest,
}) => {
  return (
    <Card hover className="p-4 sm:p-5 transition-all">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        
        {/* Left Section: Avatar & Info */}
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 rounded-xl bg-[#DD6B35]/10 text-[#DD6B35] font-bold text-lg flex items-center justify-center flex-shrink-0 border border-[#DD6B35]/20">
            {channel.name?.[0]?.toUpperCase() || 'C'}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-[#2B1B12]">{channel.name}</h3>

              {channel.status === 'active' && (
                <FiCheckCircle className="text-emerald-600 text-sm" title="Active Channel" />
              )}

              {isContributor && (
                <Badge variant="success" className="bg-emerald-100 text-emerald-800 text-[10px]">
                  Contributor
                </Badge>
              )}
            </div>

            <p className="text-xs text-gray-600 line-clamp-2 max-w-2xl">
              {channel.description || 'No description available for this channel.'}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
              <span className="flex items-center gap-1">
                <FiBook className="text-gray-400" />
                <span className="capitalize">{channel.status}</span>
              </span>
              <span className="flex items-center gap-1">
                <FiUsers className="text-gray-400" />
                Official Channel
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="border-[#E8D9C3] hover:bg-[#FBF5EC] text-xs flex items-center gap-1"
            onClick={() => navigate(`/channel/${channel.id}`)}
          >
            View Channel <FiChevronRight className="text-xs" />
          </Button>

          {/* Action State for Contributors */}
          {isContributor ? (
            <span className="text-xs text-emerald-700 font-semibold px-2 py-1 bg-emerald-50 rounded-lg">
              Assigned
            </span>
          ) : requestPending ? (
            <Button variant="ghost" size="sm" disabled className="bg-amber-50 text-amber-700 text-xs flex items-center gap-1">
              <FiClock className="text-xs" /> Request Pending
            </Button>
          ) : onJoinRequest ? (
            <Button
              variant="primary"
              size="sm"
              loading={requesting}
              className="bg-[#DD6B35] hover:bg-[#C85A28] text-white text-xs flex items-center gap-1"
              onClick={onJoinRequest}
            >
              <FiSend className="text-xs" /> Request to Join
            </Button>
          ) : null}
        </div>

      </div>
    </Card>
  );
};

/* ── Palkhi Pramukh Specific Card Renderer ── */
const renderPalkhiChannelCard = (channel, isOwnChannel, navigate) => (
  <Card key={channel.id} hover className={`p-4 sm:p-5 transition-all ${isOwnChannel ? 'border-l-4 border-l-[#DD6B35]' : ''}`}>
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      
      <div className="flex items-start gap-4 flex-1">
        <div className={`w-12 h-12 rounded-xl text-lg font-bold flex items-center justify-center flex-shrink-0 ${
          isOwnChannel ? 'bg-[#DD6B35] text-white' : 'bg-[#DD6B35]/10 text-[#DD6B35] border border-[#DD6B35]/20'
        }`}>
          {channel.name?.[0]?.toUpperCase() || 'C'}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-base text-[#2B1B12]">{channel.name}</h3>

            {channel.status === 'active' && (
              <FiCheckCircle className="text-emerald-600 text-sm" />
            )}

            {isOwnChannel && (
              <Badge className="bg-[#DD6B35] text-white text-[10px]">
                Your Channel
              </Badge>
            )}
          </div>

          <p className="text-xs text-gray-600 line-clamp-2 max-w-2xl">
            {channel.description || 'No description available for this channel.'}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
            <span className="flex items-center gap-1">
              <FiBook className="text-gray-400" />
              <span className="capitalize">{channel.status}</span>
            </span>
            <span className="flex items-center gap-1">
              <FiUsers className="text-gray-400" />
              Official Channel
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 justify-end">
        <Button
          variant="outline"
          size="sm"
          className="border-[#E8D9C3] hover:bg-[#FBF5EC] text-xs"
          onClick={() => navigate(`/channel/${channel.id}`)}
        >
          View
        </Button>

        {isOwnChannel && (
          <Button
            variant="primary"
            size="sm"
            className="bg-[#DD6B35] hover:bg-[#C85A28] text-white text-xs"
            onClick={() => navigate(`/channel/${channel.id}/manage`)}
          >
            Manage
          </Button>
        )}
      </div>

    </div>
  </Card>
);

export default ChannelList;