import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';

import { api } from '../../services/api';

export const ContributorManagement = () => {
  const { id } = useParams();

  const [contributors, setContributors] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);

  const [newContributorId, setNewContributorId] = useState('');

  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);

  const [error, setError] = useState('');

  const loadContributors = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await api.channelContributors(id);

      setContributors(data);
    } catch (err) {
      setError(
        err.message || 'Failed to load contributors'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadJoinRequests = async () => {
    try {
      setRequestsLoading(true);

      const data = await api.channelJoinRequests(id);

      setJoinRequests(data);
    } catch (err) {
      // If there are no permission/request issues, don't
      // overwrite the main contributor error.
      console.error('Failed to load join requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    loadContributors();
    loadJoinRequests();
  }, [id]);

  const addContributor = async () => {
    if (!newContributorId.trim()) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      await api.addChannelContributor(
        id,
        newContributorId.trim()
      );

      setNewContributorId('');

      await loadContributors();
    } catch (err) {
      setError(
        err.message ||
          'Failed to assign contributor'
      );
    } finally {
      setSaving(false);
    }
  };

  const removeContributor = async (contributorId) => {
    try {
      setError('');

      await api.removeChannelContributor(
        id,
        contributorId
      );

      await loadContributors();
    } catch (err) {
      setError(
        err.message ||
          'Failed to remove contributor'
      );
    }
  };

  const decideJoinRequest = async (
    requestId,
    action
  ) => {
    try {
      setProcessingRequest(requestId);
      setError('');

      await api.decideJoinRequest(
        id,
        requestId,
        action
      );

      await loadJoinRequests();

      if (action === 'approve') {
        await loadContributors();
      }
    } catch (err) {
      setError(
        err.message ||
          `Failed to ${action} join request`
      );
    } finally {
      setProcessingRequest(null);
    }
  };

  return (
    <div className="contributor-management">

      <h1>Contributor Management</h1>

      {error && (
        <div className="text-red-600 mb-4">
          {error}
        </div>
      )}

      {/* JOIN REQUESTS */}

      <Card className="mb-6">
        <h2 className="text-xl font-bold mb-4">
          Join Requests
        </h2>

        {requestsLoading ? (
          <p>Loading join requests...</p>
        ) : joinRequests.length === 0 ? (
          <p className="text-gray-600">
            No pending join requests.
          </p>
        ) : (
          <div className="space-y-3">

            {joinRequests.map((request) => (
              <Card
                key={request.id}
                className="p-4"
              >
                <div className="flex items-center gap-4">

                  <Avatar
                    size="sm"
                    fallback={
                      request.user?.full_name?.[0] ||
                      request.user?.username?.[0] ||
                      'U'
                    }
                  />

                  <div className="flex-1">
                    <h4 className="font-semibold">
                      {request.user?.full_name ||
                        request.user?.username ||
                        'Unknown contributor'}
                    </h4>

                    <small className="text-gray-600">
                      {request.user?.email}
                    </small>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    loading={
                      processingRequest === request.id
                    }
                    onClick={() =>
                      decideJoinRequest(
                        request.id,
                        'approve'
                      )
                    }
                  >
                    Approve
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    disabled={
                      processingRequest === request.id
                    }
                    onClick={() =>
                      decideJoinRequest(
                        request.id,
                        'reject'
                      )
                    }
                  >
                    Reject
                  </Button>

                </div>
              </Card>
            ))}

          </div>
        )}
      </Card>

      {/* DIRECT ASSIGNMENT */}

      <Card className="mb-6">
        <h2 className="text-xl font-bold mb-4">
          Assign Contributor Directly
        </h2>

        <div className="add-contributor flex gap-3">

          <Input
            placeholder="Enter Contributor User ID"
            value={newContributorId}
            onChange={(e) =>
              setNewContributorId(e.target.value)
            }
          />

          <Button
            onClick={addContributor}
            loading={saving}
          >
            Add Contributor
          </Button>

        </div>
      </Card>

      {/* CURRENT CONTRIBUTORS */}

      <Card>
        <h2 className="text-xl font-bold mb-4">
          Current Contributors
        </h2>

        {loading ? (
          <p>Loading contributors...</p>
        ) : contributors.length === 0 ? (
          <p className="text-gray-600">
            No contributors assigned.
          </p>
        ) : (
          <div className="space-y-3">

            {contributors.map((contributor) => (
              <Card
                key={contributor.id}
                className="contributor-item"
              >

                <div className="flex items-center gap-4">

                  <Avatar
                    size="sm"
                    fallback={
                      contributor.full_name?.[0] ||
                      contributor.username?.[0] ||
                      'U'
                    }
                  />

                  <div className="flex-1">
                    <h4>
                      {contributor.full_name ||
                        contributor.username ||
                        'Unnamed contributor'}
                    </h4>

                    <small>
                      {contributor.email}
                    </small>
                  </div>

                  <span className="role-badge">
                    contributor
                  </span>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      removeContributor(
                        contributor.id
                      )
                    }
                  >
                    Remove
                  </Button>

                </div>

              </Card>
            ))}

          </div>
        )}

      </Card>

    </div>
  );
};

export default ContributorManagement;