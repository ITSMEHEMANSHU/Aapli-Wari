import React, { useState } from 'react';
import { 
  FiUsers, 
  FiCheckCircle, 
  FiClock, 
  FiShield, 
  FiCalendar, 
  FiMapPin,
  FiSend,
  FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';

export const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('announcements');
  const [groupNotice, setGroupNotice] = useState('');
  const [attendance] = useState({ present: 320, resting: 15, medical: 2 });

  const dindiProfile = {
    name: user?.name || user?.username || 'Gaikwad Maharaj',
    email: user?.email || 'dindi27@aaplawari.org',
    role: user?.role || 'Dindi Pramukh',
    dindiNumber: 'Dindi No. 27',
    dindiName: 'Shri Sant Dnyaneshwar Gaikwad Dindi',
    palkhiAffiliation: 'Sant Dnyaneshwar Maharaj Palkhi',
    position: 'Phudachi Dindi (Ahead of Palkhi)',
    totalMembers: 337,
    joined: user?.created_at || new Date().toISOString(),
    bio: 'Leading 330+ Varkaris from Satara region in the annual pilgrimage procession.'
  };

  const itinerary = [
    { id: 1, location: 'Hadapsar', event: 'Morning Tea & Breakfast', status: 'completed', time: '07:30 AM' },
    { id: 2, location: 'Divve Ghat Base', event: 'Group Regroup & Water Distribution', status: 'in_progress', time: '12:00 PM' },
    { id: 3, location: 'Saswad High School Ground', event: 'Night Camp & Tent Setup', status: 'upcoming', time: '06:00 PM' },
  ];

  const contributions = [
    { id: 1, title: 'Dindi No. 27 Pilgrim Directory 2026', status: 'approved', date: '2026-08-20' },
    { id: 2, title: 'Satara Group Medical Camp Report', status: 'pending', date: '2026-08-18' },
  ];

  const handleSendNotice = (e) => {
    e.preventDefault();
    if (!groupNotice.trim()) return;
    alert(`Notice broadcast to all Dindi members: "${groupNotice}"`);
    setGroupNotice('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      
      {/* ── 1. Dindi Pramukh Profile Header ── */}
      <Card className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between border-l-4 border-l-[#DD6B35]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar size="xl" fallback={dindiProfile.name.split(' ').map(n => n[0]).join('')} />
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[#2B1B12]">{dindiProfile.name}</h1>
              <Badge variant="primary" className="bg-[#DD6B35] text-white">
                {dindiProfile.dindiNumber}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <FiShield className="text-xs" /> {dindiProfile.role}
              </Badge>
            </div>
            <p className="text-xs font-semibold text-[#DD6B35]">{dindiProfile.dindiName}</p>
            <p className="text-xs text-gray-500 font-medium">{dindiProfile.position} • {dindiProfile.palkhiAffiliation}</p>
            <p className="text-sm text-gray-600 max-w-xl pt-1">{dindiProfile.bio}</p>
          </div>
        </div>

        <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none border-[#E8D9C3] hover:bg-[#FBF5EC]">
            Edit Profile
          </Button>
          <Button variant="primary" className="flex-1 sm:flex-none bg-[#DD6B35] hover:bg-[#C85A28] text-white">
            Contact Palkhi HQ
          </Button>
        </div>
      </Card>

      {/* ── 2. Dindi Status Overview ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-emerald-50/50 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Total Strength</p>
              <h3 className="text-xl font-bold text-emerald-900 mt-1">{dindiProfile.totalMembers} Pilgrims</h3>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
              <FiUsers className="text-xl" />
            </div>
          </div>
        </Card>

        <Card className="bg-amber-50/50 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Resting / Vehicles</p>
              <h3 className="text-xl font-bold text-amber-900 mt-1">{attendance.resting} Varkaris</h3>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl text-amber-700">
              <FiClock className="text-xl" />
            </div>
          </div>
        </Card>

        <Card className="bg-rose-50/50 border-rose-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Medical Support</p>
              <h3 className="text-xl font-bold text-rose-900 mt-1">{attendance.medical} Cases</h3>
            </div>
            <div className="p-3 bg-rose-100 rounded-xl text-rose-700">
              <FiAlertCircle className="text-xl" />
            </div>
          </div>
        </Card>

        <Card className="bg-blue-50/50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Assigned Camp</p>
              <h3 className="text-xl font-bold text-blue-900 mt-1">Sector 4 - T27</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl text-blue-700">
              <FiMapPin className="text-xl" />
            </div>
          </div>
        </Card>
      </div>

      {/* ── 3. Navigation Tabs ── */}
      <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <Button 
          variant={activeTab === 'announcements' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('announcements')}
          className={activeTab === 'announcements' ? 'bg-[#DD6B35] text-white' : ''}
        >
          Group Broadcast
        </Button>
        <Button 
          variant={activeTab === 'schedule' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('schedule')}
          className={activeTab === 'schedule' ? 'bg-[#DD6B35] text-white' : ''}
        >
          Group Schedule
        </Button>
        <Button 
          variant={activeTab === 'contributions' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('contributions')}
          className={activeTab === 'contributions' ? 'bg-[#DD6B35] text-white' : ''}
        >
          Contributions
        </Button>
      </div>

      {/* ── 4. Dynamic Tab Contents ── */}
      
      {/* TAB 1: Direct Group Announcement */}
      {activeTab === 'announcements' && (
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-[#2B1B12]">Send Update to All Dindi Members</h3>
          <p className="text-xs text-gray-500">
            Send immediate announcements, location instructions, or meal timings to everyone registered in Dindi No. 27.
          </p>

          <form onSubmit={handleSendNotice} className="space-y-3">
            <textarea
              rows={3}
              value={groupNotice}
              onChange={(e) => setGroupNotice(e.target.value)}
              placeholder="e.g. Evening Mahaprasad will be served at Camp 27 at 7:30 PM..."
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DD6B35]"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Target Audience: {dindiProfile.totalMembers} Members</span>
              <Button type="submit" variant="primary" className="bg-[#DD6B35] text-white flex items-center gap-2">
                <FiSend className="text-xs" /> Broadcast Notice
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: Schedule & Halts */}
      {activeTab === 'schedule' && (
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-[#2B1B12]">Group Timetable & Stops</h3>
          <div className="space-y-3">
            {itinerary.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${
                    item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    item.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <FiMapPin />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#2B1B12]">{item.location}</h4>
                    <p className="text-xs text-gray-500">{item.event}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 font-medium">{item.time}</span>
                  <Badge variant={
                    item.status === 'completed' ? 'success' :
                    item.status === 'in_progress' ? 'warning' : 'secondary'
                  }>
                    {item.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: Contributions */}
      {activeTab === 'contributions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contributions.map((item) => (
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

    </div>
  );
};

export default Profile;