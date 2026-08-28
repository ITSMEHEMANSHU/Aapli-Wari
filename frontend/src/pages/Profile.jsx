import React, { useState } from 'react';
import { FiBook, FiUsers, FiUserPlus, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';

export const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('contributions');
  
  const profile = {
    name: user?.name || user?.username || 'User',
    email: user?.email || '',
    role: user?.role || 'Assigned role',
    joined: user?.created_at || new Date().toISOString(),
    contributions: 15,
    followers: 120,
    following: 45,
    bio: 'Passionate about Wari heritage preservation.'
  };

  const contributions = [
    { id: 1, title: 'Palkhi History', status: 'approved', date: '2026-08-20' },
    { id: 2, title: 'Sant Dnyaneshwar Story', status: 'pending', date: '2026-08-18' },
  ];

  const savedItems = [
    { id: 1, title: 'Ancient Manuscript Article', date: '2026-08-20' },
    { id: 2, title: 'Palkhi Video Documentary', date: '2026-08-19' }
  ];

  return (
    <div>
      <Card className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-6">
        <Avatar size="xl" fallback={profile.name.split(' ').map(n => n[0]).join('')} />
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <Badge variant="secondary">{profile.role}</Badge>
          </div>
          <p className="text-gray-600">{profile.bio}</p>
          <div className="flex flex-wrap gap-4 text-sm mt-2">
            <span className="flex items-center gap-1"><FiBook /> {profile.contributions} contributions</span>
            <span className="flex items-center gap-1"><FiUsers /> {profile.followers} followers</span>
            <span className="flex items-center gap-1"><FiUserPlus /> {profile.following} following</span>
          </div>
          <small className="text-gray-500">Joined {new Date(profile.joined).toLocaleDateString()}</small>
        </div>
        <Button variant="outline">Edit Profile</Button>
      </Card>

      <div className="flex gap-2 mb-6">
        <Button 
          variant={activeTab === 'contributions' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('contributions')}
        >
          Contributions
        </Button>
        <Button 
          variant={activeTab === 'saved' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('saved')}
        >
          Saved
        </Button>
      </div>

      {activeTab === 'contributions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contributions.map(item => (
            <Card key={item.id}>
              <h4 className="font-bold">{item.title}</h4>
              <div className="flex items-center gap-3 mt-1">
                <small className="text-gray-500">{new Date(item.date).toLocaleDateString()}</small>
                <Badge variant={item.status === 'approved' ? 'success' : 'warning'} className="flex items-center gap-1">
                  {item.status === 'approved' ? <FiCheckCircle /> : <FiClock />}
                  {item.status === 'approved' ? 'Approved' : 'Pending'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedItems.map(item => (
            <Card key={item.id}>
              <h4 className="font-bold">{item.title}</h4>
              <small className="text-gray-500">Saved on {new Date(item.date).toLocaleDateString()}</small>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;