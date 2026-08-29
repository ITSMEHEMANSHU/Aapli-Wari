import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UploadContent } from '../components/contribution/UploadContent';
import AmenityForm from '../components/contribution/AmenityForm';
import { FiUpload, FiMapPin } from 'react-icons/fi';

const TABS = [
  { id: 'content', label: 'Upload Content', icon: FiUpload },
  { id: 'amenity', label: 'Add Map Amenity', icon: FiMapPin },
];

export const Contribute = () => {
  const [searchParams] = useSearchParams();
  const channelId = searchParams.get('channel');
  const contentType = searchParams.get('type'); // ✅ Add this

  return <UploadContent preSelectedChannelId={channelId} preSelectedType={contentType} />;
  const defaultTab = searchParams.get('tab') === 'amenity' ? 'amenity' : 'content';
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Tab switcher ── */}
      <div className="flex gap-1 bg-[#F5EADA] rounded-xl p-1 mb-8 border border-[#E8D9C3]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === tab.id
                ? 'bg-white text-[#DD6B35] shadow-sm'
                : 'text-[#4A392E]/60 hover:text-[#4A392E]'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {activeTab === 'content' && (
        <UploadContent preSelectedChannelId={channelId} />
      )}
      {activeTab === 'amenity' && (
        <AmenityForm onSuccess={() => {}} />
      )}
    </div>
  );
};

export default Contribute;
