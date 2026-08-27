import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  FaCheckCircle,
  FaUsers,
  FaCalendarAlt,
} from 'react-icons/fa';

import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';

import { api } from '../services/api';

export const ChannelPage = () => {
  const { id } = useParams();

  const [channel, setChannel] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contributorsLoading, setContributorsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const loadChannel = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await api.channel(id);

        setChannel(data);
      } catch (err) {
        setError(err.message || 'Failed to load channel');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadChannel();
    }
  }, [id]);

  useEffect(() => {
    const loadContributors = async () => {
      try {
        setContributorsLoading(true);

        const data = await api.channelContributors(id);

        setContributors(data);
      } catch {
        setContributors([]);
      } finally {
        setContributorsLoading(false);
      }
    };

    if (id) {
      loadContributors();
    }
  }, [id]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        {error}
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="text-center py-10">
        Channel not found
      </div>
    );
  }

  return (
    <div>
      <Card className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-6">

        <Avatar
          size="xl"
          fallback={channel.name?.[0] || 'C'}
        />

        <div className="flex-1">

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">
              {channel.name}
            </h1>

            {channel.status === 'active' && (
              <FaCheckCircle className="text-green-600" />
            )}
          </div>

          <p className="text-gray-600 mb-2">
            {channel.description || 'No description available.'}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">

            <span className="flex items-center gap-1">
              <FaUsers />
              {contributors.length} contributors
            </span>

            <span className="flex items-center gap-1">
              <FaCalendarAlt />
              Since{' '}
              {new Date(channel.created_at).getFullYear()}
            </span>

          </div>

        </div>

      </Card>

      <div className="flex gap-2 mb-6">

        <Button
          variant={activeTab === 'about' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('about')}
        >
          About
        </Button>

        <Button
          variant={
            activeTab === 'contributors'
              ? 'primary'
              : 'ghost'
          }
          onClick={() => setActiveTab('contributors')}
        >
          Contributors
        </Button>

      </div>

      {activeTab === 'about' && (
        <Card>
          <h3 className="font-bold text-lg mb-3">
            About {channel.name}
          </h3>

          <p>
            {channel.description ||
              'No description available.'}
          </p>

          <hr className="my-4" />

          <p>
            <strong>Status:</strong>{' '}
            {channel.status}
          </p>

          <p>
            <strong>Created:</strong>{' '}
            {new Date(
              channel.created_at
            ).toLocaleDateString()}
          </p>
        </Card>
      )}

      {activeTab === 'contributors' && (
        <Card>
          <h3 className="font-bold text-lg mb-3">
            Contributors
          </h3>

          {contributorsLoading ? (
            <p>Loading contributors...</p>
          ) : contributors.length === 0 ? (
            <p>No contributors assigned.</p>
          ) : (
            <div className="space-y-3">
              {contributors.map((contributor) => (
                <div
                  key={contributor.id}
                  className="flex items-center gap-3"
                >
                  <Avatar
                    size="sm"
                    fallback={
                      contributor.full_name?.[0] ||
                      contributor.username?.[0] ||
                      'U'
                    }
                  />

                  <div>
                    <p className="font-medium">
                      {contributor.full_name ||
                        contributor.username ||
                        'Unnamed contributor'}
                    </p>

                    <p className="text-sm text-gray-500">
                      {contributor.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ChannelPage;