import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiHeart, FiBookmark, FiShare, FiTag } from 'react-icons/fi'

import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { Comments } from '../components/community/Comments';

export const ContentDetail = () => {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const mockContent = {
      1: {
        id: 1,
        title: 'Palkhi Procession 2024',
        type: 'Video',
        channel: 'Sant Dnyaneshwar Palkhi',
        description: 'Beautiful footage of the annual Palkhi procession with thousands of devotees.',
        content: 'Video content will be displayed here.',
        uploaded: '2026-08-20',
        likes: 150,
        comments: 25,
        tags: ['palkhi', 'procession', '2024']
      },
      2: {
        id: 2,
        title: 'Ancient Manuscript Discovery',
        type: 'Image',
        channel: 'Sant Tukaram Palkhi',
        description: 'Rare manuscript discovered in the archives.',
        content: 'Image content will be displayed here.',
        uploaded: '2026-08-18',
        likes: 89,
        comments: 12,
        tags: ['manuscript', 'history']
      }
    };

    setTimeout(() => {
      const data = mockContent[id] || mockContent[1];
      setContent(data);
      setLikeCount(data.likes || 0);
      setLoading(false);
    }, 300);
  }, [id]);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  if (loading) return <Loader />;
  if (!content) return <div className="text-center py-10">Content not found</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{content.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>{content.channel}</span>
          <span>📅 {new Date(content.uploaded).toLocaleDateString()}</span>
          <Badge variant="default">{content.type}</Badge>
        </div>
      </div>

      <Card className="mb-4">
        <div className="bg-gray-100 rounded-lg p-12 text-center mb-4">
          <p className="text-2xl">{content.content}</p>
          <small className="text-gray-500">Content placeholder (static demo)</small>
        </div>
        <p className="text-gray-700">{content.description}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {content.tags.map(tag => (
            <Badge key={tag} variant="default" className="flex items-center gap-1">
              <FiTag size={12} /> {tag}
            </Badge>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-3 mb-6">
        <Button onClick={handleLike} className="flex items-center gap-2">
          {liked ? <FiHeart className="fill-current" /> : <FiHeart />} Like ({likeCount})
        </Button>
        <Button variant="outline" onClick={() => setSaved(!saved)} className="flex items-center gap-2">
          <FiBookmark className={saved ? 'fill-current' : ''} /> Save
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <FiShare /> Share
        </Button>
      </div>

      <Comments postId={content.id} />
    </div>
  );
};

export default ContentDetail;