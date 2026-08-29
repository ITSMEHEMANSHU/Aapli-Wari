import React, { useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UploadContent } from '../components/contribution/UploadContent';
import AmenityForm from '../components/contribution/AmenityForm';
import { FiUpload, FiMapPin } from 'react-icons/fi';

const TABS = [
  { id: 'content', label: 'Upload Content', icon: FiUpload },
  { id: 'amenity', label: 'Add Map Amenity', icon: FiMapPin },
];

export const Contribute = () => {
  const { isAuthenticated, loading, isContributor } = useAuth();
  const [searchParams] = useSearchParams();
  const channelId = searchParams.get('channel');
  const contentType = searchParams.get('type');
  const defaultTab = searchParams.get('tab') === 'amenity' ? 'amenity' : 'content';
  const [activeTab, setActiveTab] = useState(defaultTab);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-[#DD6B35] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/contribute' }} replace />;
  }

  if (!isContributor || !isContributor()) {
    return <Navigate to="/apply-contributor" state={{ from: '/contribute' }} replace />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Tab switcher ── */}
      <div className="flex gap-1 bg-[#F5EADA] rounded-xl p-1 mb-8 border border-[#E8D9C3]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
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
        <UploadContent preSelectedChannelId={channelId} preSelectedType={contentType} />
      )}
      {activeTab === 'amenity' && (
        <AmenityForm onSuccess={() => {}} />
      )}
    </div>
  );
};

export default Contribute;
