import React, { useState } from 'react';
import { FiVideo, FiImage, FiMusic, FiFile, FiSearch } from 'react-icons/fi';

import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

export const ExploreWari = () => {
  const [filter, setFilter] = useState('all');

  const content = [
    { id: 1, title: 'Palkhi Procession 2024', type: 'video', channel: 'Sant Dnyaneshwar' },
    { id: 2, title: 'Ancient Manuscript', type: 'image', channel: 'Sant Tukaram' },
    { id: 3, title: 'Wari Bhajan Collection', type: 'audio', channel: 'Wari Sangeet' },
    { id: 4, title: 'Historical Document', type: 'pdf', channel: 'Heritage Foundation' },
  ];

  const filters = [
    { id: 'all', label: 'All', icon: FiSearch },
    { id: 'video', label: 'Videos', icon: FiVideo },
    { id: 'image', label: 'Images', icon: FiImage },
    { id: 'audio', label: 'Audio', icon: FiMusic },
    { id: 'pdf', label: 'Documents', icon: FiFile },
  ];

  const filteredContent = filter === 'all' ? content : content.filter(c => c.type === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Explore Wari Heritage</h1>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map(f => (
          <Button
            key={f.id}
            variant={filter === f.id ? 'primary' : 'ghost'}
            onClick={() => setFilter(f.id)}
            className="flex items-center gap-2"
          >
            <f.icon size={14} /> {f.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredContent.map(item => (
          <Card key={item.id} className="hover:shadow-lg transition">
            <div className="flex items-center gap-2 mb-2">
              {item.type === 'video' && <FiVideo className="text-primary" />}
              {item.type === 'image' && <FiImage className="text-primary" />}
              {item.type === 'audio' && <FiMusic className="text-primary" />}
              {item.type === 'pdf' && <FiFile className="text-primary" />}
              <Badge variant="default">{item.type}</Badge>
            </div>
            <h3 className="font-bold">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.channel}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};