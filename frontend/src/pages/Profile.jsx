import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, 
  FiCheckCircle, 
  FiClock, 
  FiShield, 
  FiCalendar, 
  FiMapPin,
  FiSend,
  FiAlertCircle,
  FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Loader from '../components/common/Loader';

export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('announcements');
  const [groupNotice, setGroupNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [palkhi, setPalkhi] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [attendance] = useState({ present: 320, resting: 15, medical: 2 });

  // Fetch Palkhi and Contributions data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user's palkhi (dindi) data
        try {
          const palkhiData = await api.myPalkhi();
          setPalkhi(palkhiData);
        } catch (err) {
          console.warn('Could not fetch palkhi data:', err);
        }

        // Fetch user's contributions
        try {
          const contribData = await api.getMyContributions();
          setContributions(contribData || []);
        } catch (err) {
          console.warn('Could not fetch contributions:', err);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const dindiProfile = {
    name: user?.full_name || user?.name || user?.username || 'User',
    email: user?.email || 'user@aaplawari.org',
    role: user?.role || 'User',
    dindiNumber: palkhi?.id ? `Palkhi No. ${palkhi.id}` : 'No Palkhi Yet',
    dindiName: palkhi?.name || 'Create Your Palkhi Channel',
    palkhiAffiliation: palkhi?.name || 'Join or create a Palkhi to get started',
    position: palkhi ? 'Organizer' : 'Not yet created',
    totalMembers: palkhi?.followers_count || 0,
    joined: user?.created_at || new Date().toISOString(),
    bio: palkhi?.description || 'Start your Palkhi channel to organize pilgrimage events and engage with members.'
  };

  const itinerary = [];

  const handleSendNotice = (e) => {
    e.preventDefault();
    if (!groupNotice.trim()) return;
    alert(`Notice broadcast to all members: "${groupNotice}"`);
    setGroupNotice('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader size="lg" />
        </div>
      ) : (
      <>
      {/* ── 1. Dindi Pramukh Profile Header ── */}
      <Card className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between border-l-4 border-l-[#DD6B35]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar size="xl" fallback={dindiProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2)} />
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[#2B1B12]">{dindiProfile.name}</h1>
              <Badge variant="primary" className={palkhi ? 'bg-[#DD6B35] text-white' : 'bg-gray-300 text-gray-700'}>
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

        <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto">
          {!palkhi && (
            <Button 
              onClick={() => navigate('/create-palkhi')}
              className="flex-1 sm:flex-none bg-[#DD6B35] hover:bg-[#C85A28] text-white flex items-center justify-center gap-2 cursor-pointer text-sm font-semibold"
            >
              + Create Palkhi
            </Button>
          )}
          <Button variant="outline" className="flex-1 sm:flex-none border-[#E8D9C3] hover:bg-[#FBF5EC] text-[#2B1B12]">
            Edit Profile
          </Button>
          <Button 
            variant="danger" 
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex-1 sm:flex-none bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center justify-center gap-2 cursor-pointer text-sm font-semibold"
          >
            <FiLogOut className="text-sm" /> Sign Out
          </Button>
        </div>
      </Card>

      {/* ── 2. Dindi Status Overview ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-emerald-50/50 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Followers</p>
              <h3 className="text-xl font-bold text-emerald-900 mt-1">{dindiProfile.totalMembers} Followers</h3>
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
              <h3 className="text-xl font-bold text-amber-900 mt-1">{attendance.resting} Members</h3>
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
              <p className="text-xs text-gray-500 uppercase font-bold">Active Members</p>
              <h3 className="text-xl font-bold text-blue-900 mt-1">{attendance.present} Active</h3>
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
          <h3 className="text-base font-bold text-[#2B1B12]">Send Update to All Members</h3>
          
          {!palkhi ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">📢</div>
              <h4 className="font-bold text-amber-900 mb-2">Create a Palkhi to Send Broadcasts</h4>
              <p className="text-xs text-amber-800 mb-4">
                You haven't created a Palkhi channel yet. Create one to start sending announcements and updates to your members.
              </p>
              <Button 
                onClick={() => navigate('/create-palkhi')}
                className="bg-[#DD6B35] hover:bg-[#C85A28] text-white"
              >
                + Create Palkhi Channel
              </Button>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500">
                Send immediate announcements, location instructions, or updates to all members in your group.
              </p>

              <form onSubmit={handleSendNotice} className="space-y-3">
                <textarea
                  rows={3}
                  value={groupNotice}
                  onChange={(e) => setGroupNotice(e.target.value)}
                  placeholder="e.g. Evening gathering at camp at 7:30 PM..."
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DD6B35]"
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Target Audience: {dindiProfile.totalMembers} Members</span>
                  <Button type="submit" variant="primary" className="bg-[#DD6B35] text-white flex items-center gap-2">
                    <FiSend className="text-xs" /> Broadcast Notice
                  </Button>
                </div>
              </form>
            </>
          )}
        </Card>
      )}

      {/* TAB 2: Schedule & Halts */}
      {activeTab === 'schedule' && (
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-[#2B1B12]">Group Timetable & Stops</h3>
          {!palkhi ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <FiCalendar className="mx-auto text-amber-300 text-3xl mb-3" />
              <h4 className="font-bold text-amber-900 mb-2">Create a Palkhi to Add Schedule</h4>
              <p className="text-xs text-amber-800 mb-4">
                You need a Palkhi channel to manage group schedules and itineraries.
              </p>
              <Button 
                onClick={() => navigate('/create-palkhi')}
                className="bg-[#DD6B35] hover:bg-[#C85A28] text-white"
              >
                + Create Palkhi Channel
              </Button>
            </div>
          ) : itinerary.length === 0 ? (
            <div className="text-center py-10">
              <FiCalendar className="mx-auto text-gray-300 text-3xl mb-2" />
              <p className="text-gray-500">No schedule added yet</p>
            </div>
          ) : (
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
          )}
        </Card>
      )}

      {/* TAB 3: Contributions */}
      {activeTab === 'contributions' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#2B1B12]">My Contributions</h3>
          {contributions.length === 0 ? (
            <Card className="text-center py-10">
              <p className="text-gray-500">No contributions yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contributions.map((item) => (
                <Card key={item.id}>
                  <h4 className="font-bold text-[#2B1B12]">{item.title || 'Untitled Contribution'}</h4>
                  <div className="flex items-center gap-3 mt-2">
                    <small className="text-gray-500">
                      {new Date(item.created_at || item.date).toLocaleDateString()}
                    </small>
                    <Badge variant={item.status === 'approved' ? 'success' : 'warning'} className="flex items-center gap-1">
                      {item.status === 'approved' ? <FiCheckCircle /> : <FiClock />}
                      {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending'}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-600 mt-2">{item.description}</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default Profile;