import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiHash, FiFile, FiClock, FiTrendingUp, 
  FiCheckCircle, FiPlusCircle, FiAlertCircle, FiChevronRight,
  FiUserPlus, FiFileText, FiSettings, FiHome
} from 'react-icons/fi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { api } from '../../services/api';

const formatRelativeTime = (value) => {
  if (!value) return 'Just now';

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return 'Just now';

  const minutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000));

  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChannels: 0,
    totalContent: 0,
    pendingActions: 0
  });
  const [activities, setActivities] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [adminStats, usersRes, contentRes, channelsRes] = await Promise.all([
          api.getAdminStats(),
          api.users({ limit: 3 }),
          api.contentList({ limit: 3 }),
          api.channels({ limit: 3 }),
        ]);

        const recentUsers = usersRes?.users || [];
        const recentContent = contentRes?.items || [];
        const recentChannels = channelsRes?.items || channelsRes || [];

        const recentActivity = [
          ...recentUsers.map((user) => ({
            id: `user-${user.id}`,
            title: `${user.full_name || user.username || 'New user'} joined`,
            time: formatRelativeTime(user.created_at),
            color: '#E87A1E',
            dot: FiUserPlus,
          })),
          ...recentContent.map((item) => ({
            id: `content-${item.id}`,
            title: `${item.title || 'Content'} ${item.status === 'published' ? 'published' : 'updated'}`,
            time: formatRelativeTime(item.created_at),
            color: '#C86D16',
            dot: FiFileText,
          })),
          ...recentChannels.map((channel) => ({
            id: `channel-${channel.id}`,
            title: `${channel.name || 'Channel'} is ${channel.status || 'active'}`,
            time: formatRelativeTime(channel.created_at),
            color: '#2D6A4F',
            dot: FiHash,
          })),
        ].slice(0, 5);

        setStats({
          totalUsers: adminStats?.total_users ?? 0,
          totalChannels: adminStats?.total_channels ?? 0,
          totalContent: adminStats?.total_content ?? 0,
          pendingActions: adminStats?.pending_review ?? 0,
        });

        setActivities(recentActivity.length ? recentActivity : [
          { id: 'placeholder-user', title: 'No recent activity available', time: 'Just now', color: '#5A4030', dot: FiAlertCircle },
        ]);

        setQuickActions([
          { id: 'users', label: `Manage Users (${adminStats?.total_users ?? 0})`, icon: FiUsers, color: '#E87A1E', path: '/admin/users' },
          { id: 'content', label: `Review Content (${adminStats?.pending_review ?? 0})`, icon: FiFileText, color: '#E87A1E', path: '/admin/content' },
          { id: 'channels', label: `Channel Management (${adminStats?.total_channels ?? 0})`, icon: FiHash, color: '#E87A1E', path: '/admin/channels' },
          { id: 'settings', label: 'System Settings', icon: FiSettings, color: '#3D2518', path: '/admin/settings' },
        ]);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setActivities([
          { id: 'placeholder-user', title: 'Unable to load recent activity', time: 'Just now', color: '#5A4030', dot: FiAlertCircle },
        ]);
        setQuickActions([
          { id: 'users', label: 'Manage Users', icon: FiUsers, color: '#E87A1E', path: '/admin/users' },
          { id: 'content', label: 'Review Content', icon: FiFileText, color: '#E87A1E', path: '/admin/content' },
          { id: 'channels', label: 'Channel Management', icon: FiHash, color: '#E87A1E', path: '/admin/channels' },
          { id: 'settings', label: 'System Settings', icon: FiSettings, color: '#3D2518', path: '/admin/settings' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { 
      id: 'users', 
      label: 'Total Users', 
      value: stats.totalUsers, 
      icon: FiUsers, 
      change: '+12%',
      changeLabel: 'vs last month',
      color: '#E87A1E',
      onClick: () => navigate('/admin/users')
    },
    { 
      id: 'channels', 
      label: 'Total Channels', 
      value: stats.totalChannels, 
      icon: FiHash, 
      change: 'Active',
      changeLabel: '',
      color: '#E87A1E', 
      onClick: () => navigate('/admin/channels')
    },
    { 
      id: 'content', 
      label: 'Content Pieces', 
      value: stats.totalContent, 
      icon: FiFile, 
      change: '+45',
      changeLabel: 'this week',
      color: '#E87A1E',
      onClick: () => navigate('/admin/content')
    },
    { 
      id: 'pending', 
      label: 'Pending Actions', 
      value: stats.pendingActions, 
      icon: FiClock, 
      change: 'Requires Attention',
      changeLabel: '',
      color: '#E87A1E',
      onClick: () => navigate('/admin/users')
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E87A1E] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3D2518] tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-[#5A4030] text-sm sm:text-base mt-1">
            Monitor daily operations and administrative tasks
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.id}
            onClick={stat.onClick}
            className="bg-white p-6 rounded-xl border border-[#E8D9C3] border-l-4 border-l-[#E87A1E] shadow-[0_4px_20px_rgba(61,37,24,0.06)] hover:shadow-[0_8px_30px_rgba(232,122,30,0.15)] transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[#5A4030] font-semibold text-xs uppercase tracking-wider">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-bold text-[#2D1B0E] mt-2">
                  {stat.value.toLocaleString()}
                </h3>
              </div>
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
              >
                <stat.icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-semibold">
              <span 
                className="flex items-center gap-1"
                style={{ color: stat.color }}
              >
                {stat.change.includes('+') && <FiTrendingUp size={14} />}
                {stat.change.includes('Active') && <FiCheckCircle size={14} />}
                {stat.change.includes('Requires') && <FiAlertCircle size={14} />}
                {stat.change}
              </span>
              {stat.changeLabel && (
                <span className="text-[#5A4030] font-normal ml-2 text-xs">{stat.changeLabel}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E8D9C3] shadow-[0_4px_20px_rgba(61,37,24,0.06)] flex flex-col">
          <div className="p-6 border-b border-[#E8D9C3]/50 flex justify-between items-center">
            <h3 className="font-semibold text-lg text-[#3D2518]">Recent Activity</h3>
            <button 
              onClick={() => navigate('/admin/content')}
              className="text-[#E87A1E] font-semibold text-sm hover:underline"
            >
              View All
            </button>
          </div>
          <div className="flex-1 p-6 overflow-y-auto max-h-[400px]">
            <div className="relative border-l-2 border-[#E8D9C3] ml-3 space-y-7">
              {activities.map((activity) => {
                const ActivityIcon = activity.dot;
                return (
                  <div key={activity.id} className="relative pl-6">
                    <span
                      className="absolute -left-[9px] top-1 w-4 h-4 rounded-full shadow-[0_0_0_4px_#FDF8F0]"
                      style={{ backgroundColor: activity.color }}
                    ></span>
                    <div>
                      <span className="text-xs font-semibold text-[#5A4030]">{activity.time}</span>
                      <p className="text-sm text-[#2D1B0E] flex items-center gap-2">
                        <ActivityIcon size={14} style={{ color: activity.color }} />
                        <span>{activity.title}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#E8D9C3] shadow-[0_4px_20px_rgba(61,37,24,0.06)] p-6">
          <h3 className="font-semibold text-lg text-[#3D2518] mb-4 pb-2 border-b border-[#E8D9C3]/50">
            Quick Actions
          </h3>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => navigate(action.path)}
                className="w-full text-left p-4 bg-[#FDF8F0] rounded-lg border border-[#E8D9C3] hover:border-[#E87A1E]/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
                    style={{ backgroundColor: `${action.color}15`, color: action.color }}
                  >
                    <action.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-[#2D1B0E] group-hover:text-[#E87A1E] transition-colors">
                      {action.label}
                    </h4>
                  </div>
                  <FiChevronRight className="text-[#5A4030] group-hover:text-[#E87A1E] transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;