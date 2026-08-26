import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';

export const ManageChannel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState({
    name: 'Sant Dnyaneshwar Palkhi',
    description: 'Channel description',
    members: 5,
    posts: 120
  });

  const updateChannel = async () => {
    setLoading(true);
    // API call to update
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="manage-channel-page">
      <h1>Manage Channel</h1>
      
      <div className="manage-grid">
        <div className="manage-stats grid-3">
          <Card>
            <h3>Posts</h3>
            <p className="stat-number">{channel.posts}</p>
          </Card>
          <Card>
            <h3>Members</h3>
            <p className="stat-number">{channel.members}</p>
          </Card>
          <Card>
            <h3>Followers</h3>
            <p className="stat-number">2.5K</p>
          </Card>
        </div>

        <Card className="manage-settings">
          <h3>Channel Settings</h3>
          <Input label="Channel Name" value={channel.name} />
          <Input label="Description" type="textarea" value={channel.description} />
          <Button onClick={updateChannel} loading={loading}>
            Save Changes
          </Button>
        </Card>

        <div className="manage-actions">
          <Button onClick={() => navigate(`/channel/${id}/contributors`)}>
            Manage Contributors
          </Button>
          <Button onClick={() => navigate(`/channel/${id}/approve`)}>
            Content Approval
          </Button>
        </div>
      </div>
    </div>
  );
};