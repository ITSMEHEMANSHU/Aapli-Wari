import React, { useState } from 'react';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';

export const FollowButton = ({ channelId, initialFollow = false }) => {
  const [isFollowing, setIsFollowing] = useState(initialFollow);
  const [loading, setLoading] = useState(false);

  const toggleFollow = () => {
    setLoading(true);
    setTimeout(() => {
      setIsFollowing(!isFollowing);
      setLoading(false);
    }, 500);
  };

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded flex items-center gap-2 transition ${
        isFollowing 
          ? 'border-2 border-primary text-primary hover:bg-primary hover:text-white' 
          : 'bg-primary text-white hover:bg-red-800'
      }`}
    >
      {loading ? '...' : isFollowing ? <FaUserCheck /> : <FaUserPlus />}
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};