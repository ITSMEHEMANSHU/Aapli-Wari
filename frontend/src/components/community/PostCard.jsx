import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaBookmark, FaRegBookmark } from 'react-icons/fa';

export const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
          {post.channelName?.[0] || 'C'}
        </div>
        <div>
          <h4 className="font-bold">{post.channelName || 'Unknown Channel'}</h4>
          <small className="text-gray-500">{post.time || 'Just now'}</small>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-bold mb-2">{post.title}</h3>
        <p className="text-gray-700">{post.text}</p>
      </div>

      <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
        <button onClick={handleLike} className="flex items-center gap-2 hover:text-primary transition">
          {liked ? <FaHeart className="text-red-600" /> : <FaRegHeart />} {likeCount}
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 hover:text-primary transition">
          <FaComment /> {post.comments || 0}
        </button>
        <button className="flex items-center gap-2 hover:text-primary transition">
          <FaShare /> Share
        </button>
        <button onClick={() => setSaved(!saved)} className="flex items-center gap-2 hover:text-primary transition">
          {saved ? <FaBookmark className="text-primary" /> : <FaRegBookmark />}
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex gap-3">
            <input placeholder="Write a comment..." className="flex-1 px-4 py-2 border rounded focus:outline-none focus:border-primary" />
            <button className="bg-primary text-white px-4 py-2 rounded hover:bg-red-800 transition">Post</button>
          </div>
        </div>
      )}
    </div>
  );
};