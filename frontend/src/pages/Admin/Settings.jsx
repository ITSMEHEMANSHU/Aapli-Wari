import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export const Settings = () => {
  const { user, updateUser, isAdmin } = useAuth();
  
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    palkhi_affiliation: user?.palkhi_affiliation || '',
  });

  const [systemSaved, setSystemSaved] = useState(false);
  const [systemSettings, setSystemSettings] = useState({
    suiteName: 'Aapli Wari Admin',
    adminEmail: 'admin@aapliwari.org',
    activeSeason: true,
    autoApproveContributors: false,
    emergencyAlerts: true,
  });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const updatedResponse = await api.updateProfile(profileData);
      updateUser(updatedResponse); // Updates global avatar/name instantly
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleSystemSave = (e) => {
    e.preventDefault();
    // Connect to your system settings API here when ready
    setSystemSaved(true);
    setTimeout(() => setSystemSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#2D1B0E] tracking-tight">Settings</h2>
        <p className="text-[#5A4030] text-sm mt-1">Manage your profile and platform preferences</p>
      </div>

      {/* User Profile Form */}
      <form onSubmit={handleProfileSave} className="space-y-6">
        <Card>
          <h3 className="font-semibold text-lg text-[#2D1B0E] pb-3 border-b border-[#E8D9C3]/50 flex items-center justify-between">
            Personal Profile
            {profileSaved && <span className="text-sm font-normal text-green-600 bg-green-50 px-2 py-1 rounded">✓ Saved</span>}
          </h3>
          <div className="space-y-4 pt-4">
            <Input
              label="Full Name"
              value={profileData.full_name}
              onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
            />
            <Input
              label="Username"
              value={profileData.username}
              onChange={(e) => setProfileData({...profileData, username: e.target.value})}
            />
            <Input
              label="Bio"
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
            />
            <Input
              label="Palkhi Affiliation"
              value={profileData.palkhi_affiliation}
              onChange={(e) => setProfileData({...profileData, palkhi_affiliation: e.target.value})}
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary">Update Profile</Button>
            </div>
          </div>
        </Card>
      </form>

      {/* System Settings Form - Visible Only to Admins */}
      {isAdmin && (
        <form onSubmit={handleSystemSave} className="space-y-6">
          <Card>
            <h3 className="font-semibold text-lg text-[#2D1B0E] pb-3 border-b border-[#E8D9C3]/50 flex items-center justify-between">
              General Configuration
              {systemSaved && <span className="text-sm font-normal text-green-600 bg-green-50 px-2 py-1 rounded">✓ Saved</span>}
            </h3>
            <div className="space-y-4 pt-4">
              <Input
                label="Admin Suite Title"
                value={systemSettings.suiteName}
                onChange={(e) => setSystemSettings({...systemSettings, suiteName: e.target.value})}
              />
              <Input
                label="Support Email"
                type="email"
                value={systemSettings.adminEmail}
                onChange={(e) => setSystemSettings({...systemSettings, adminEmail: e.target.value})}
              />
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-lg text-[#2D1B0E] pb-3 border-b border-[#E8D9C3]/50 flex items-center gap-2">
              Broadcast Controls
            </h3>
            <div className="space-y-4 pt-4">
              {[
                { key: 'activeSeason', label: 'Active Palkhi Season Mode', desc: 'Enables GPS tracking and live telemetry' },
                { key: 'emergencyAlerts', label: 'Emergency Push Broadcasts', desc: 'Allow high-priority audio and SMS alerts' },
                { key: 'autoApproveContributors', label: 'Auto-publish Trusted Content', desc: 'Bypass review for certified contributors' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-[#FDF8F0] border border-[#E8D9C3]">
                  <div>
                    <p className="font-semibold text-sm text-[#2D1B0E]">{item.label}</p>
                    <p className="text-xs text-[#5A4030]">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemSettings[item.key]}
                      onChange={() => setSystemSettings({...systemSettings, [item.key]: !systemSettings[item.key]})}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full peer transition-colors ${systemSettings[item.key] ? 'bg-[#4CAF50]' : 'bg-[#E8D9C3]'} after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${systemSettings[item.key] ? 'after:translate-x-full' : ''}`}></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" className="bg-[#8b3a3a] hover:bg-[#6d2325] text-white">Save System Configuration</Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;