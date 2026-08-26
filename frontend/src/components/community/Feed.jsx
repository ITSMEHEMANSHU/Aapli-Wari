import React, { useState, useEffect } from 'react';
import { PostCard } from './PostCard';
import { Loader } from '../common/Loader';

export const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch feed posts
    setTimeout(() => {
      setPosts([
        { id: 1, title: 'Palkhi Procession 2024', text: 'Beautiful moments from this year...', channelName: 'Sant Dnyaneshwar', likes: 120, comments: 15 },
        { id: 2, title: 'Ancient Manuscript Found', text: 'New discovery in archives...', channelName: 'Sant Tukaram', likes: 89, comments: 8 },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="feed-page">
      <h1>Your Feed</h1>
      <div className="feed-posts">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};