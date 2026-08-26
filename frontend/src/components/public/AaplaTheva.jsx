import React from 'react';
import { FiPlay, FiEye } from 'react-icons/fi';
import Button from '../common/Button';
import Card from '../common/Card';

export const AaplaTheva = () => {
  const shorts = [
    { id: 1, title: 'Wari History in 60 Seconds', views: '10.2K', duration: '60s' },
    { id: 2, title: 'Sant Dnyaneshwar Story', views: '8.5K', duration: '45s' },
    { id: 3, title: 'Palkhi Journey Highlights', views: '15.3K', duration: '90s' },
    { id: 4, title: 'Wari Bhajan Collection', views: '6.8K', duration: '120s' },
    { id: 5, title: 'Tukaram Abhang', views: '12.1K', duration: '55s' },
    { id: 6, title: 'Pandharpur Vithal Temple', views: '9.7K', duration: '75s' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Aapla Theva - Shorts</h1>
      <p className="text-gray-600 mb-6">Quick knowledge bites from Wari heritage</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shorts.map(short => (
          <Card key={short.id} className="hover:shadow-lg transition overflow-hidden p-0">
            <div className="bg-primary p-8 text-center text-white relative">
              <FiPlay className="text-4xl mx-auto" />
              <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs">
                {short.duration}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-2">{short.title}</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm flex items-center gap-1"><FiEye /> {short.views}</span>
                <Button variant="outline" size="sm">Watch</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AaplaTheva;