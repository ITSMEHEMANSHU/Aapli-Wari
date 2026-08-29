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

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChannels: 0,
    totalContent: 0,
    pendingActions: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch real aggregated stats from backend to prevent connection overload
        const data = await api.getAdminStats();
        
        setStats({
          totalUsers: data?.users || 0,
          totalChannels: data?.channels || 0,
          totalContent: data?.content || 0,
          pendingActions: data?.pendingApproval || 0
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
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
      color: '#6d2325',
      onClick: () => navigate('/admin/users')
    },
    { 
      id: 'channels', 
      label: 'Total Channels', 
      value: stats.totalChannels, 
      icon: FiHash, 
      change: 'Active',
      changeLabel: '',
      color: '#7d562d',
      onClick: () => navigate('/admin/channels')
    },
    { 
      id: 'content', 
      label: 'Content Pieces', 
      value: stats.totalContent, 
      icon: FiFile, 
      change: '+45',
      changeLabel: 'this week',
      color: '#8b3a3a',
      onClick: () => navigate('/admin/content')
    },
    { 
      id: 'pending', 
      label: 'Pending Actions', 
      value: stats.pendingActions, 
      icon: FiClock, 
      change: 'Requires Attention',
      changeLabel: '',
      color: '#ba1a1a',
      onClick: () => navigate('/admin/users')
    },
  ];

  const quickActions = [
    { id: 'users', label: 'Manage Users', icon: FiUsers, color: '#8b3a3a', path: '/admin/users' },
    { id: 'content', label: 'Review Content', icon: FiFileText, color: '#7d562d', path: '/admin/content' },
    { id: 'channels', label: 'Channel Management', icon: FiHash, color: '#6d2325', path: '/admin/channels' },
    { id: 'settings', label: 'System Settings', icon: FiSettings, color: '#554241', path: '/admin/settings' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8b3a3a] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2D1B0E] tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-[#5A4030] text-sm sm:text-base mt-1">
            Monitor daily operations and administrative tasks
          </p>
        </div>
        <Button
          variant="primary"
          className="bg-[#8b3a3a] hover:bg-[#6d2325] text-white flex items-center gap-2 self-start sm:self-auto"
        >
          <FiPlusCircle size={16} /> New Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.id}
            onClick={stat.onClick}
            className="bg-white p-6 rounded-xl border border-[#E8D9C3] border-l-4 shadow-[0_4px_20px_rgba(139,58,58,0.08)] hover:shadow-[0_8px_30px_rgba(139,58,58,0.15)] transition-all cursor-pointer"
            style={{ borderLeftColor: stat.color }}
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
                style={{ backgroundColor: `${stat.color}10`, color: stat.color }}
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
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E8D9C3] shadow-[0_4px_20px_rgba(139,58,58,0.08)] flex flex-col">
          <div className="p-6 border-b border-[#E8D9C3]/50 flex justify-between items-center">
            <h3 className="font-semibold text-lg text-[#2D1B0E]">Recent Activity</h3>
            <button 
              onClick={() => navigate('/admin/content')}
              className="text-[#8b3a3a] font-semibold text-sm hover:underline"
            >
              View All
            </button>
          </div>
          <div className="flex-1 p-6 overflow-y-auto max-h-[400px]">
            <div className="relative border-l-2 border-[#E8D9C3] ml-3 space-y-7">
              <div className="relative pl-6">
                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#8b3a3a] shadow-[0_0_0_4px_#FDF8F0]"></span>
                <div>
                  <span className="text-xs font-semibold text-[#5A4030]">Just Now</span>
                  <p className="text-sm text-[#2D1B0E]">
                    <span className="font-semibold text-[#8b3a3a]">New user registered:</span> John Doe
                  </p>
                </div>
              </div>
              <div className="relative pl-6">
                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#D4A373] shadow-[0_0_0_4px_#FDF8F0]"></span>
                <div>
                  <span className="text-xs font-semibold text-[#5A4030]">2 hours ago</span>
                  <p className="text-sm text-[#2D1B0E]">
                    <span className="font-semibold text-[#D4A373]">Channel created:</span> Sant Eknath
                  </p>
                </div>
              </div>
              <div className="relative pl-6">
                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#2D6A4F] shadow-[0_0_0_4px_#FDF8F0]"></span>
                <div>
                  <span className="text-xs font-semibold text-[#5A4030]">Yesterday</span>
                  <p className="text-sm text-[#2D1B0E]">
                    <span className="font-semibold text-[#2D6A4F]">Content approved:</span> Ringan Ceremony
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#E8D9C3] shadow-[0_4px_20px_rgba(139,58,58,0.08)] p-6">
          <h3 className="font-semibold text-lg text-[#2D1B0E] mb-4 pb-2 border-b border-[#E8D9C3]/50">
            Quick Actions
          </h3>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => navigate(action.path)}
                className="w-full text-left p-4 bg-[#FDF8F0] rounded-lg border border-[#E8D9C3] hover:border-[#8b3a3a]/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
                    style={{ backgroundColor: `${action.color}15`, color: action.color }}
                  >
                    <action.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-[#2D1B0E] group-hover:text-[#8b3a3a] transition-colors">
                      {action.label}
                    </h4>
                  </div>
                  <FiChevronRight className="text-[#5A4030] group-hover:text-[#8b3a3a] transition-colors" />
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