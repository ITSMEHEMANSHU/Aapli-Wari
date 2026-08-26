import React, { useState } from 'react';
import { FaUser, FaPaperPlane } from 'react-icons/fa';

export const Comments = ({ postId }) => {
  const [comments, setComments] = useState([
    { id: 1, user: 'Rahul Sharma', text: 'This is amazing content! Thanks for sharing.', time: '2 hours ago' },
    { id: 2, user: 'Priya Patel', text: 'Very informative. I learned a lot about Wari.', time: '1 hour ago' },
    { id: 3, user: 'Amit Kumar', text: 'Great work! Keep it up.', time: '30 minutes ago' },
  ]);
  const [newComment, setNewComment] = useState('');

  const addComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { 
        id: Date.now(), 
        user: 'You', 
        text: newComment, 
        time: 'Just now' 
      }]);
      setNewComment('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-bold text-lg mb-4">Comments ({comments.length})</h3>
      
      {comments.map(comment => (
        <div key={comment.id} className="flex gap-3 py-3 border-b border-gray-100">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
            <FaUser size={14} />
          </div>
          <div className="flex-1">
            <strong className="text-sm">{comment.user}</strong>
            <p className="text-gray-700 text-sm">{comment.text}</p>
            <small className="text-gray-400 text-xs">{comment.time}</small>
          </div>
        </div>
      ))}
      
      <div className="flex gap-3 mt-4">
        <input
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 px-4 py-2 border rounded focus:outline-none focus:border-primary"
        />
        <button onClick={addComment} className="bg-primary text-white px-4 py-2 rounded hover:bg-red-800 transition flex items-center gap-2">
          <FaPaperPlane size={14} /> Post
        </button>
      </div>
    </div>
  );
};