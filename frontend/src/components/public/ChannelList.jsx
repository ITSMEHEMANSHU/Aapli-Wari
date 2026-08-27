import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCheckCircle,
  FiUsers,
  FiBook,
} from 'react-icons/fi';

import { Button } from '../common/Button';
import { api } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';


export const ChannelList = () => {
  const navigate = useNavigate();
  const { user } = React.useContext(AuthContext);

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

        /*
         * CONTRIBUTOR
         *
         * Get ONLY the channels that belong
         * to the currently authenticated user.
         */
        if (user?.role === 'contributor') {

          const myChannelIds =
            await api.myChannelMemberships();

          const membershipMap = {};

          data.forEach((channel) => {
            membershipMap[channel.id] = {
              isMember: myChannelIds.includes(channel.id),
              requestPending: false,
            };
          });

          setMembership(membershipMap);
        }

      } catch (err) {
        setError(
          err.message ||
            'Failed to load channels'
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadChannels();
    }
  }, [user]);


  const sendJoinRequest = async (channelId) => {
    try {
      setRequesting((prev) => ({
        ...prev,
        [channelId]: true,
      }));

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
      setError(
        err.message ||
          'Failed to send join request'
      );
    } finally {
      setRequesting((prev) => ({
        ...prev,
        [channelId]: false,
      }));
    }
  };


  if (loading) {
    return (
      <div className="py-10 text-center">
        Loading channels...
      </div>
    );
  }


  if (error) {
    return (
      <div className="py-10 text-center text-red-600">
        {error}
      </div>
    );
  }


  /*
   * =========================================
   * PALKHI PRAMUKH
   * =========================================
   */

  if (user?.role === 'palkhi_pramukh') {

    const myChannels = channels.filter(
      (channel) =>
        channel.created_by_user_id === user.id
    );

    const otherChannels = channels.filter(
      (channel) =>
        channel.created_by_user_id !== user.id
    );

    return (
      <div>

        <h1 className="text-2xl font-bold mb-2">
          Palkhi Channels
        </h1>

        <p className="text-gray-600 mb-6">
          Follow and explore Wari channels
        </p>


        {myChannels.length > 0 && (
          <section className="mb-8">

            <h2 className="text-lg font-bold mb-3">
              Your Channel
            </h2>

            <div className="space-y-3">

              {myChannels.map((channel) =>
                renderChannel(
                  channel,
                  true,
                  navigate
                )
              )}

            </div>

          </section>
        )}


        {myChannels.length === 0 && (
          <div className="mb-6">

            <Button
              variant="primary"
              onClick={() =>
                navigate('/channel/create')
              }
            >
              Create Channel
            </Button>

          </div>
        )}


        <section>

          <h2 className="text-lg font-bold mb-3">
            Other Channels
          </h2>

          {otherChannels.length === 0 ? (

            <div className="text-center py-10">
              No other channels available.
            </div>

          ) : (

            <div className="space-y-3">

              {otherChannels.map((channel) =>
                renderChannel(
                  channel,
                  false,
                  navigate
                )
              )}

            </div>

          )}

        </section>

      </div>
    );
  }


  /*
   * =========================================
   * CONTRIBUTOR
   * =========================================
   */

  if (user?.role === 'contributor') {

    const myChannels = channels.filter(
      (channel) =>
        membership[channel.id]?.isMember === true
    );

    const otherChannels = channels.filter(
      (channel) =>
        membership[channel.id]?.isMember !== true
    );


    return (
      <div>

        <h1 className="text-2xl font-bold mb-2">
          Palkhi Channels
        </h1>

        <p className="text-gray-600 mb-6">
          Follow and explore Wari channels
        </p>


        {/* ==============================
            YOUR CHANNELS
        ============================== */}

        {myChannels.length > 0 && (

          <section className="mb-8">

            <h2 className="text-lg font-bold mb-3">
              Your Channels
            </h2>

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


        {/* ==============================
            OTHER CHANNELS
        ============================== */}

        <section>

          <h2 className="text-lg font-bold mb-3">
            Other Channels
          </h2>


          {otherChannels.length === 0 ? (

            <div className="text-center py-10">
              No other channels available.
            </div>

          ) : (

            <div className="space-y-3">

              {otherChannels.map((channel) => (

                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  navigate={navigate}
                  isContributor={false}
                  requestPending={
                    membership[channel.id]
                      ?.requestPending
                  }
                  requesting={
                    requesting[channel.id]
                  }
                  onJoinRequest={() =>
                    sendJoinRequest(channel.id)
                  }
                />

              ))}

            </div>

          )}

        </section>

      </div>
    );
  }


  /*
   * =========================================
   * NORMAL USER
   * =========================================
   */

  return (
    <div>

      <h1 className="text-2xl font-bold mb-2">
        Palkhi Channels
      </h1>

      <p className="text-gray-600 mb-6">
        Follow and explore Wari channels
      </p>


      {channels.length === 0 ? (

        <div className="text-center py-10">
          No active channels available.
        </div>

      ) : (

        <div className="space-y-3">

          {channels.map((channel) => (

            <ChannelCard
              key={channel.id}
              channel={channel}
              navigate={navigate}
            />

          ))}

        </div>

      )}

    </div>
  );
};


/*
 * =========================================
 * CHANNEL CARD
 * =========================================
 */

const ChannelCard = ({
  channel,
  navigate,
  isContributor = false,
  requestPending = false,
  requesting = false,
  onJoinRequest,
}) => {

  return (

    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">


        <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">

          {channel.name?.[0]?.toUpperCase() || 'C'}

        </div>


        <div className="flex-1">

          <div className="flex items-center gap-2 flex-wrap">

            <h3 className="font-bold">
              {channel.name}
            </h3>


            {channel.status === 'active' && (
              <FiCheckCircle className="text-green-600" />
            )}


            {isContributor && (
              <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">
                You are a contributor
              </span>
            )}

          </div>


          <p className="text-sm text-gray-600 mb-2">

            {channel.description ||
              'No description available.'}

          </p>


          <div className="flex gap-4 text-sm text-gray-600">

            <span className="flex items-center gap-1">
              <FiBook />
              {channel.status}
            </span>

            <span className="flex items-center gap-1">
              <FiUsers />
              Channel
            </span>

          </div>

        </div>


        <div className="flex gap-2 flex-wrap">

          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              navigate(
                `/channel/${channel.id}`
              )
            }
          >
            View
          </Button>


          {isContributor ? (

            <span className="text-sm text-green-600 font-medium self-center">
              Member
            </span>

          ) : requestPending ? (

            <Button
              variant="secondary"
              size="sm"
              disabled
            >
              Request Pending
            </Button>

          ) : onJoinRequest ? (

            <Button
              variant="outline"
              size="sm"
              loading={requesting}
              onClick={onJoinRequest}
            >
              Send Join Request
            </Button>

          ) : null}

        </div>

      </div>

    </div>
  );
};


/*
 * =========================================
 * PALKHI PRAMUKH CHANNEL CARD
 * =========================================
 */

const renderChannel = (
  channel,
  isOwnChannel,
  navigate
) => (

  <div
    key={channel.id}
    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
  >

    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">


      <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">

        {channel.name?.[0]?.toUpperCase() || 'C'}

      </div>


      <div className="flex-1">

        <div className="flex items-center gap-2 flex-wrap">

          <h3 className="font-bold">
            {channel.name}
          </h3>


          {channel.status === 'active' && (
            <FiCheckCircle className="text-green-600" />
          )}


          {isOwnChannel && (

            <span className="text-xs font-semibold px-2 py-1 rounded bg-primary text-white">
              Your Channel
            </span>

          )}

        </div>


        <p className="text-sm text-gray-600 mb-2">

          {channel.description ||
            'No description available.'}

        </p>


        <div className="flex gap-4 text-sm text-gray-600">

          <span className="flex items-center gap-1">
            <FiBook />
            {channel.status}
          </span>

          <span className="flex items-center gap-1">
            <FiUsers />
            Channel
          </span>

        </div>

      </div>


      <div className="flex gap-2">

        <Button
          variant="primary"
          size="sm"
          onClick={() =>
            navigate(
              `/channel/${channel.id}`
            )
          }
        >
          View
        </Button>


        {isOwnChannel && (

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(
                `/channel/${channel.id}/manage`
              )
            }
          >
            Manage
          </Button>

        )}

      </div>

    </div>

  </div>
);


export default ChannelList;