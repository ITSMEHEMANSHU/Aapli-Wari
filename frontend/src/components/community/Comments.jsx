import React, { useEffect, useState } from 'react';
import { FaPaperPlane, FaTrashAlt, FaUser } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { addComment, deleteComment, getComments } from '../../services/content';

export const Comments = ({ contentId, postId }) => {
  const resolvedContentId = contentId || postId;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!resolvedContentId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getComments(resolvedContentId);
        if (active) setComments(data);
      } catch (err) {
        if (active) setError(err.message || 'Unable to load comments.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [resolvedContentId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = newComment.trim();
    if (!text || submitting) return;
    if (!user) {
      navigate('/login', { state: { message: 'Please log in to comment.' } });
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const added = await addComment(resolvedContentId, text);
      setComments((current) => [...current, added]);
      setNewComment('');
    } catch (err) {
      setError(err.message || 'Unable to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(commentId);
      setComments((current) => current.filter((comment) => comment.id !== commentId));
    } catch (err) {
      setError(err.message || 'Unable to delete comment.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-bold text-lg mb-4">Comments ({comments.length})</h3>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {loading ? <p className="text-sm text-gray-500">Loading comments...</p> : comments.length === 0 ? (
        <p className="text-sm text-gray-500 mb-4">No comments yet. Be the first!</p>
      ) : comments.map((comment) => {
        const canDelete = user && (user.id === comment.user_id || user.role === 'admin');
        const name = comment.user?.full_name || comment.user?.username || 'Unknown user';
        return <div key={comment.id} className="flex gap-3 py-3 border-b border-gray-100">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600"><FaUser size={14} /></div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3"><strong className="text-sm">{name}</strong>{canDelete && <button onClick={() => handleDelete(comment.id)} className="text-xs text-red-600 hover:text-red-800" aria-label="Delete comment"><FaTrashAlt /></button>}</div>
            <p className="text-gray-700 text-sm">{comment.text}</p>
            <small className="text-gray-400 text-xs">{new Date(comment.created_at).toLocaleString()}</small>
          </div>
        </div>;
      })}
      {user ? <form onSubmit={handleSubmit} className="flex gap-3 mt-4">
        <input placeholder="Write a comment..." value={newComment} onChange={(event) => setNewComment(event.target.value)} disabled={submitting} className="flex-1 px-4 py-2 border rounded focus:outline-none focus:border-primary" />
        <button type="submit" disabled={submitting || !newComment.trim()} className="bg-primary text-white px-4 py-2 rounded hover:bg-red-800 disabled:opacity-50 transition flex items-center gap-2"><FaPaperPlane size={14} /> {submitting ? 'Sending...' : 'Send'}</button>
      </form> : <p className="mt-4 text-sm text-gray-500">Please log in to comment.</p>}
    </div>
  );
};
