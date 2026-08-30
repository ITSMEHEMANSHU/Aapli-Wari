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
  FiLogOut,
  FiEdit3,
  FiX,
  FiUser,
  FiHeart,
  FiMessageCircle,
  FiEye
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Loader from '../components/common/Loader';
import Input from '../components/common/Input';

export const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('contributions');
  const [loading, setLoading] = useState(true);
  const [palkhi, setPalkhi] = useState(null);
  const [contributions, setContributions] = useState([]);
  
  // Real-time stats state
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  
  // Edit Profile Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    palkhi_affiliation: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Fetch real backend data and poll/refetch for live real-time values
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // 1. Fetch real Palkhi data
        try {
          const palkhiData = await api.myPalkhi();
          if (isMounted) {
            setPalkhi(palkhiData);
            // Update followers count from palkhi data - same as ChannelPage
            if (palkhiData) {
              setFollowersCount(palkhiData.followers_count || palkhiData.members_count || 0);
            }
          }
        } catch (err) {
          console.warn('No active palkhi channel found:', err);
          setPalkhi(null);
          setFollowersCount(0);
        }

        // 2. Fetch real user contributions
        try {
          const contribData = await api.getMyContributions();
          if (isMounted) {
            setContributions(contribData || []);
            setPostsCount(contribData?.length || 0);
          }
        } catch (err) {
          console.warn('Could not fetch contributions:', err);
          setContributions([]);
          setPostsCount(0);
        }

        // 3. Fetch following count if available
        try {
          const followingData = await api.getFollowingCount?.();
          if (isMounted && followingData) {
            setFollowingCount(followingData.count || 0);
          }
        } catch (err) {
          console.warn('Could not fetch following count:', err);
          setFollowingCount(0);
        }

      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    // Setup real-time polling interval (every 10 seconds) to ensure live data sync
    const intervalId = setInterval(fetchData, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Initialize edit form when user data loads or changes
  useEffect(() => {
    if (user) {
      setEditFormData({
        full_name: user.full_name || user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        palkhi_affiliation: user.palkhi_affiliation || ''
      });
    }
  }, [user]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingEdit(true);
      const updated = await api.updateProfile(editFormData);
      if (updateUser) {
        updateUser(updated);
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 sm:p-6 pb-20">
      
      {loading ? (
        <div className="flex justify-center items-center py-32">
          <Loader size="lg" />
        </div>
      ) : (
      <>
        {/* ── STREAMLINED PROFILE HEADER (CARD STYLE) ── */}
        <Card className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E87A1E]/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#E87A1E] via-[#fd7b12] to-[#E87A1E]" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-2">
            <div className="flex items-start sm:items-center gap-5">
              <Avatar 
                size="xl" 
                src={user?.avatar_url || user?.profile_picture}
                fallback={(user?.full_name || user?.username || 'U').substring(0, 2).toUpperCase()} 
                className="ring-4 ring-[#E87A1E]/10 bg-[#E87A1E] text-white font-bold" 
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold font-headline-lg text-[#2F1B12]">
                    {user?.full_name || user?.username || 'Pilgrim User'}
                  </h1>
                  <Badge variant="secondary" className="bg-[#E87A1E]/10 text-[#E87A1E] border border-[#E87A1E]/20 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <FiShield className="text-[10px]" /> {user?.role || 'Member'}
                  </Badge>
                </div>
                <p className="text-xs text-[#2F1B12]/60 font-medium">@{user?.username || 'username'} • Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recent'}</p>
                <p className="text-sm text-[#2F1B12]/80 pt-1 max-w-lg">{user?.bio || palkhi?.description || 'No bio provided yet.'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
              <Button 
                onClick={() => setIsEditing(true)}
                variant="outline" 
                className="border-[#E87A1E]/20 text-[#E87A1E] text-xs font-semibold rounded-xl px-4 py-2 flex items-center gap-1.5 hover:bg-[#E87A1E]/5 transition-all duration-300"
              >
                <FiEdit3 className="text-sm" /> Edit Profile
              </Button>
              <Button 
                variant="danger" 
                onClick={() => { logout(); navigate('/login'); }}
                className="bg-[#2F1B12] text-white border border-[#2F1B12] text-xs font-semibold rounded-xl px-4 py-2 flex items-center gap-1.5 shadow-sm transition-all hover:bg-[#2F1B12]/90"
              >
                <FiLogOut className="text-sm text-white" /> Sign Out
              </Button>
            </div>
          </div>

          {/* ── REAL-TIME STATS ROW ── */}
          <div className="mt-6 pt-5 border-t border-[#E87A1E]/10 grid grid-cols-3 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#2F1B12]">{followersCount}</p>
              <p className="text-[10px] text-[#2F1B12]/60 font-medium flex items-center justify-center gap-1">
                <FiUsers size={12} /> Followers
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#2F1B12]">{followingCount}</p>
              <p className="text-[10px] text-[#2F1B12]/60 font-medium flex items-center justify-center gap-1">
                <FiHeart size={12} /> Following
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#2F1B12]">{postsCount}</p>
              <p className="text-[10px] text-[#2F1B12]/60 font-medium flex items-center justify-center gap-1">
                <FiMessageCircle size={12} /> Posts
              </p>
            </div>
            <div className="text-center hidden md:block">
              <p className="text-2xl font-bold text-[#2F1B12]">{contributions.filter(c => c.status === 'approved').length}</p>
              <p className="text-[10px] text-[#2F1B12]/60 font-medium flex items-center justify-center gap-1">
                <FiCheckCircle size={12} /> Approved
              </p>
            </div>
          </div>

          {/* ── REAL PALKHI BANNER ── */}
          {palkhi ? (
            <div className="mt-4 pt-4 border-t border-[#E87A1E]/10 flex flex-wrap items-center justify-between gap-4 bg-[#E87A1E]/5 -mx-6 -mb-6 p-6 rounded-b-3xl">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#E87A1E]">Managed Palkhi Channel</span>
                <h4 className="font-bold text-base text-[#2F1B12]">{palkhi.name}</h4>
                <p className="text-xs text-[#2F1B12]/60">{palkhi.palkhi_affiliation || palkhi.route || 'Verified Route Group'}</p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <p className="text-xs text-[#2F1B12]/60 font-medium">Followers</p>
                  <p className="font-bold text-[#2F1B12] text-lg">{followersCount}</p>
                </div>
                <div className="h-8 w-[1px] bg-[#E87A1E]/20" />
                <div>
                  <p className="text-xs text-[#2F1B12]/60 font-medium">Status</p>
                  <p className="font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {palkhi.status || 'Active'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-[#E87A1E]/10 flex flex-wrap items-center justify-between gap-4 bg-[#E87A1E]/5 -mx-6 -mb-6 p-6 rounded-b-3xl">
              <div>
                <p className="text-sm font-semibold text-[#2F1B12]">No Palkhi Channel Registered</p>
                <p className="text-xs text-[#2F1B12]/60">Create your group channel to broadcast updates and manage schedule.</p>
              </div>
              <Button 
                onClick={() => navigate('/create-palkhi')}
                className="bg-[#E87A1E] hover:bg-[#d06b1a] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all duration-300"
              >
                + Create Palkhi
              </Button>
            </div>
          )}
        </Card>

        {/* ── MODAL: EDIT PROFILE ── */}
        {isEditing && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E87A1E]/20 relative animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#E87A1E]/10 pb-4">
                <h3 className="text-lg font-bold font-headline-md text-[#2F1B12]">Edit Personal Profile</h3>
                <button onClick={() => setIsEditing(false)} className="text-[#2F1B12]/40 hover:text-[#2F1B12] p-1 transition-colors">
                  <FiX className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                  className="focus:border-[#E87A1E] focus:ring-[#E87A1E]/20"
                />
                <Input
                  label="Username"
                  value={editFormData.username}
                  onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                  className="focus:border-[#E87A1E] focus:ring-[#E87A1E]/20"
                />
                <Input
                  label="Bio"
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({...editFormData, bio: e.target.value})}
                  className="focus:border-[#E87A1E] focus:ring-[#E87A1E]/20"
                />
                <Input
                  label="Palkhi Affiliation"
                  value={editFormData.palkhi_affiliation}
                  onChange={(e) => setEditFormData({...editFormData, palkhi_affiliation: e.target.value})}
                  className="focus:border-[#E87A1E] focus:ring-[#E87A1E]/20"
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-[#E87A1E]/10">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    className="border-[#E87A1E]/20 text-[#2F1B12]/60 hover:bg-[#E87A1E]/5 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={savingEdit}
                    className="bg-[#E87A1E] hover:bg-[#d06b1a] text-white font-semibold px-5 py-2 rounded-xl transition-all duration-300 hover:shadow-lg"
                  >
                    {savingEdit ? (
                      <><Loader size="xs" className="inline mr-2" /> Saving...</>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── STREAMLINED TABS & SECTIONS CONTAINER ── */}
        <div className="space-y-4">
          <div className="flex gap-2 border-b border-[#E87A1E]/10 pb-3 overflow-x-auto scrollbar-none">
            {[
              { id: 'contributions', label: 'My Contributions', icon: FiMessageCircle },
              { id: 'activity', label: 'Recent Activity', icon: FiClock },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-[#E87A1E] text-white shadow-sm'
                      : 'bg-white text-[#2F1B12]/60 hover:bg-[#E87A1E]/5 border border-[#E87A1E]/10'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB: CONTRIBUTIONS */}
          {activeTab === 'contributions' && (
            <div className="space-y-3">
              {contributions.length === 0 ? (
                <Card className="text-center py-12 bg-white rounded-2xl border-[#E87A1E]/10 shadow-sm">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-xs text-[#2F1B12]/60 font-medium">No real contribution records found for your account.</p>
                  <p className="text-[10px] text-[#2F1B12]/40 mt-1">Start contributing to your palkhi channel to see updates here.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contributions.map((item) => (
                    <Card key={item.id} className="bg-white rounded-2xl border-[#E87A1E]/10 p-5 shadow-sm space-y-2 hover:shadow-md transition-all duration-300">
                      <h4 className="font-bold text-sm text-[#2F1B12]">{item.title}</h4>
                      <div className="flex items-center gap-3 flex-wrap">
                        <small className="text-xs text-[#2F1B12]/40 flex items-center gap-1">
                          <FiCalendar size={12} /> {new Date(item.created_at).toLocaleDateString()}
                        </small>
                        <Badge variant={item.status === 'approved' ? 'success' : 'warning'} className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold">
                          {item.status || 'Pending'}
                        </Badge>
                      </div>
                      {item.description && <p className="text-xs text-[#2F1B12]/70 pt-1">{item.description}</p>}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <Card className="bg-white rounded-2xl border-[#E87A1E]/10 p-6 shadow-sm">
                <h3 className="font-semibold text-sm text-[#2F1B12] mb-4 flex items-center gap-2">
                  <FiClock size={16} className="text-[#E87A1E]" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-[#E87A1E]/5 rounded-xl border border-[#E87A1E]/10">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5"></div>
                    <div>
                      <p className="text-xs font-medium text-[#2F1B12]">You joined the channel</p>
                      <p className="text-[10px] text-[#2F1B12]/40">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  {contributions.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-[#E87A1E]/5 rounded-xl border border-[#E87A1E]/10">
                      <div className="w-2 h-2 rounded-full bg-[#E87A1E] mt-1.5"></div>
                      <div>
                        <p className="text-xs font-medium text-[#2F1B12]">You contributed: {item.title}</p>
                        <p className="text-[10px] text-[#2F1B12]/40">{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {contributions.length === 0 && (
                    <p className="text-xs text-[#2F1B12]/40 text-center py-4">No recent activity to show</p>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </>
      )}
    </div>
  );
};

export default Profile;