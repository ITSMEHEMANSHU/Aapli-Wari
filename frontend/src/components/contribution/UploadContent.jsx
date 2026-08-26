import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaVideo, FaImage, FaMusic, FaFilePdf, FaPen } from 'react-icons/fa';
import { ContentForm } from './ContentForm';

export const UploadContent = () => {
  const navigate = useNavigate();
  const [contentType, setContentType] = useState('');

  const types = [
    { id: 'video', label: 'Video', icon: FaVideo },
    { id: 'image', label: 'Image', icon: FaImage },
    { id: 'audio', label: 'Audio', icon: FaMusic },
    { id: 'manuscript', label: 'Manuscript', icon: FaFilePdf },
    { id: 'story', label: 'Story', icon: FaPen },
  ];

  if (contentType) {
    return <ContentForm 
      contentType={contentType}
      onBack={() => setContentType('')}
      onSuccess={() => navigate('/profile')}
    />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Contribute Content</h1>
      <p className="text-gray-600 mb-6">Share your Wari heritage knowledge with the community</p>

      <h3 className="font-bold mb-4">Choose content type</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {types.map(type => (
          <div
            key={type.id}
            onClick={() => setContentType(type.id)}
            className="bg-white rounded-lg shadow-md p-6 text-center cursor-pointer hover:shadow-lg transition border-2 border-transparent hover:border-primary"
          >
            <type.icon className="text-4xl text-primary mx-auto mb-3" />
            <h4 className="font-bold">{type.label}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};