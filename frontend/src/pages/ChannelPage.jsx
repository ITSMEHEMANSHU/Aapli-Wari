import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaCheckCircle, FaUsers, FaBook, FaCalendarAlt } from 'react-icons/fa';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';

import { PostCard } from '../components/community/PostCard';
import { FollowButton } from '../components/community/FollowButton';

export const ChannelPage = () => {
  const { id } = useParams();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const mockChannels = {
      1: {
        id: 1,
        name: 'Sant Dnyaneshwar Palkhi',
        description: 'Preserving the legacy of Sant Dnyaneshwar through authentic content.',
        followers: 5234,
        posts: 120,
        verified: true,
        created: '2024-01-01',
        posts: [
          { id: 1, title: 'Palkhi Procession 2024', text: 'Beautiful moments from this year\'s procession.', channelName: 'Sant Dnyaneshwar Palkhi', likes: 120, comments: 15, time: '2 hours ago' },
          { id: 2, title: 'Sant Dnyaneshwar Teachings', text: 'Wisdom from the great saint.', channelName: 'Sant Dnyaneshwar Palkhi', likes: 89, comments: 8, time: '5 hours ago' },
        ]
      },
      2: {
        id: 2,
        name: 'Sant Tukaram Palkhi',
        description: 'Following the footsteps of Sant Tukaram.',
        followers: 4100,
        posts: 95,
        verified: true,
        created: '2024-02-15',
        posts: [
          { id: 3, title: 'Tukaram Abhangs', text: 'Collection of spiritual songs.', channelName: 'Sant Tukaram Palkhi', likes: 78, comments: 12, time: '3 hours ago' },
        ]
      }
    };

    setTimeout(() => {
      setChannel(mockChannels[id] || mockChannels[1]);
      setLoading(false);
    }, 300);
  }, [id]);

  if (loading) return <Loader />;
  if (!channel) return <div className="text-center py-10">Channel not found</div>;

  return (
    <div>
      <Card className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-6">
        <Avatar size="xl" fallback={channel.name[0]} />
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{channel.name}</h1>
            {channel.verified && <FaCheckCircle className="text-green-600" />}
          </div>
          <p className="text-gray-600 mb-2">{channel.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1"><FaUsers /> {channel.followers} followers</span>
            <span className="flex items-center gap-1"><FaBook /> {channel.posts} posts</span>
            <span className="flex items-center gap-1"><FaCalendarAlt /> Since {new Date(channel.created).getFullYear()}</span>
          </div>
        </div>
        <FollowButton channelId={channel.id} />
      </Card>

      <div className="flex gap-2 mb-6">
        <Button 
          variant={activeTab === 'posts' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </Button>
        <Button 
          variant={activeTab === 'about' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('about')}
        >
          About
        </Button>
      </div>

      {activeTab === 'posts' && (
        <div className="space-y-4">
          {channel.posts?.map(post => <PostCard key={post.id} post={post} />)}
          {!channel.posts?.length && <Card className="text-center">No posts yet</Card>}
        </div>
      )}
      {activeTab === 'about' && (
        <Card>
          <h3 className="font-bold text-lg mb-3">About {channel.name}</h3>
          <p>{channel.description}</p>
          <hr className="my-4" />
          <p><strong>Created:</strong> {new Date(channel.created).toLocaleDateString()}</p>
          <p><strong>Total Posts:</strong> {channel.posts}</p>
          <p><strong>Followers:</strong> {channel.followers}</p>
        </Card>
      )}
    </div>
  );
};
export default ChannelPage;