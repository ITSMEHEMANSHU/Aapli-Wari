import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiUsers, FiBook, FiFlag } from 'react-icons/fi';
import { Button } from '../common/Button';

export const ChannelList = () => {
  const navigate = useNavigate();
  const channels = [
    { id: 1, name: 'Sant Dnyaneshwar Palkhi', followers: 5234, posts: 120, verified: true },
    { id: 2, name: 'Sant Tukaram Palkhi', followers: 4100, posts: 95, verified: true },
    { id: 3, name: 'Wari Heritage Foundation', followers: 2500, posts: 60, verified: false },
    { id: 4, name: 'Sant Eknath Palkhi', followers: 1800, posts: 45, verified: false },
    { id: 5, name: 'Wari Sangeet', followers: 1500, posts: 35, verified: false },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Palkhi Channels</h1>
      <p className="text-gray-600 mb-6">Follow and explore verified Wari channels</p>

      <div className="space-y-3">
        {channels.map(channel => (
          <div key={channel.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {channel.name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold">{channel.name}</h3>
                  {channel.verified && <FiCheckCircle className="text-green-600" />}
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1"><FiUsers /> {channel.followers} followers</span>
                  <span className="flex items-center gap-1"><FiBook /> {channel.posts} posts</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => navigate(`/channel/${channel.id}`)}
                >
                  View
                </Button>
                <Button variant="outline" size="sm">
                  Follow
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChannelList;