import { useState } from 'react';

// Mock content data
const mockContent = {
  1: {
    id: 1,
    title: 'Palkhi Procession 2024',
    type: 'video',
    channel: 'Sant Dnyaneshwar Palkhi',
    description: 'Beautiful footage of the annual Palkhi procession with thousands of devotees.',
    content: 'Video content will be displayed here...',
    uploaded: '2026-08-20',
    likes: 150,
    comments: 25,
    tags: ['palkhi', 'procession', '2024']
  },
  2: {
    id: 2,
    title: 'Ancient Manuscript Discovery',
    type: 'image',
    channel: 'Sant Tukaram Palkhi',
    description: 'Rare manuscript discovered in the archives.',
    content: 'Image will be displayed here...',
    uploaded: '2026-08-18',
    likes: 89,
    comments: 12,
    tags: ['manuscript', 'history', 'discovery']
  }
};

export const useContent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadContent = (formData) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setLoading(false);
        resolve({ success: true, id: Date.now() });
      }, 1000);
    });
  };

  const getContent = (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const data = mockContent[id];
        if (data) {
          resolve(data);
        } else {
          reject(new Error('Content not found'));
        }
      }, 300);
    });
  };

  const searchContent = (query) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = Object.values(mockContent).filter(
          item => item.title.toLowerCase().includes(query.toLowerCase()) ||
                   item.description.toLowerCase().includes(query.toLowerCase())
        );
        resolve(results);
      }, 300);
    });
  };

  return { uploadContent, getContent, searchContent, loading, error };
};