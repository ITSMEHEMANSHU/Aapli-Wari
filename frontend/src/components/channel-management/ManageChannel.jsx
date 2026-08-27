import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';

import { api } from '../../services/api';

export const ManageChannel = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [error, setError] = useState('');

  const [channel, setChannel] = useState({
    name: '',
    description: '',
    status: '',
  });

  const [joinRequests, setJoinRequests] = useState([]);

  useEffect(() => {
    const loadChannel = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await api.channel(id);

        setChannel({
          name: data.name || '',
          description: data.description || '',
          status: data.status,
        });
      } catch (err) {
        setError(
          err.message ||
            'Failed to load channel'
        );
      } finally {
        setLoading(false);
      }
    };

    loadChannel();
  }, [id]);

  const loadJoinRequests = async () => {
    try {
      setLoadingRequests(true);

      const data =
        await api.channelJoinRequests(id);

      setJoinRequests(data);
    } catch (err) {
      console.error(
        'Failed to load join requests:',
        err
      );
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadJoinRequests();
  }, [id]);

  const updateChannel = async () => {
    try {
      setSaving(true);
      setError('');

      const updated =
        await api.updateChannel(id, {
          name: channel.name,
          description: channel.description,
        });

      setChannel({
        name: updated.name,
        description: updated.description || '',
        status: updated.status,
      });
    } catch (err) {
      setError(
        err.message ||
          'Failed to update channel'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="manage-channel-page">

      <h1>Manage Channel</h1>

      {error && (
        <div className="text-red-600 mb-4">
          {error}
        </div>
      )}

      {/* CHANNEL SETTINGS */}

      <Card className="manage-settings">

        <h3 className="mb-4">
          Channel Settings
        </h3>

        <Input
          label="Channel Name"
          value={channel.name}
          onChange={(e) =>
            setChannel({
              ...channel,
              name: e.target.value,
            })
          }
        />

        <Input
          label="Description"
          type="textarea"
          value={channel.description}
          onChange={(e) =>
            setChannel({
              ...channel,
              description: e.target.value,
            })
          }
        />

        <div className="mt-3 mb-4">
          <strong>Status:</strong>{' '}
          {channel.status}
        </div>

        <Button
          onClick={updateChannel}
          loading={saving}
        >
          Save Changes
        </Button>

      </Card>

      {/* JOIN REQUESTS */}

      <Card className="mt-6">

        <div className="flex items-center justify-between">

          <div>
            <h3 className="font-bold text-lg">
              Contributor Join Requests
            </h3>

            <p className="text-gray-600 text-sm">
              {loadingRequests
                ? 'Loading...'
                : `${joinRequests.length} pending request${
                    joinRequests.length === 1
                      ? ''
                      : 's'
                  }`}
            </p>
          </div>

          <Button
            onClick={() =>
              navigate(
                `/channel/${id}/contributors`
              )
            }
          >
            Manage Requests
          </Button>

        </div>

      </Card>

      {/* OTHER ACTIONS */}

      <div className="manage-actions mt-6">

        <Button
          onClick={() =>
            navigate(
              `/channel/${id}/contributors`
            )
          }
        >
          Manage Contributors
        </Button>

      </div>

    </div>
  );
};

export default ManageChannel;