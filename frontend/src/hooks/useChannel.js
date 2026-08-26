import { useState, useEffect } from 'react';

// Mock data
const mockChannels = {
  1: {
    id: 1,
    name: 'Sant Dnyaneshwar Palkhi',
    description: 'Preserving the legacy of Sant Dnyaneshwar',
    logo: '',
    followers: 5234,
    posts: 120,
    verified: true,
    created: '2024-01-01',
    posts: [
      { id: 1, title: 'Palkhi Procession 2024', text: 'Beautiful moments from this year\'s procession...', likes: 120, comments: 15, time: '2 hours ago' },
      { id: 2, title: 'Sant Dnyaneshwar Teachings', text: 'Wisdom from the great saint...', likes: 89, comments: 8, time: '5 hours ago' },
      { id: 3, title: 'Wari Heritage Update', text: 'New discoveries in the archives...', likes: 45, comments: 3, time: '1 day ago' }
    ]
  },
  2: {
    id: 2,
    name: 'Sant Tukaram Palkhi',
    description: 'Following the footsteps of Sant Tukaram',
    logo: '',
    followers: 4100,
    posts: 95,
    verified: true,
    created: '2024-02-15',
    posts: [
      { id: 4, title: 'Tukaram Abhangs', text: 'Collection of spiritual songs...', likes: 78, comments: 12, time: '3 hours ago' },
      { id: 5, title: 'Palkhi Route 2024', text: 'The sacred journey route...', likes: 56, comments: 7, time: '1 day ago' }
    ]
  }
};

export const useChannel = (channelId) => {
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      const data = mockChannels[channelId];
      if (data) {
        setChannel(data);
      } else {
        setError('Channel not found');
      }
      setLoading(false);
    }, 500);
  }, [channelId]);

  return { channel, loading, error };
};

export const getAllChannels = () => {
  return Object.values(mockChannels);
};