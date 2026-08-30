import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiCalendar, FiEye, FiEyeOff } from 'react-icons/fi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { api } from '../../services/api';

export const ChannelManagement = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const data = await api.channels();
        setChannels(data || []);
      } catch (error) {
        console.error('Failed to fetch channels:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, []);

  const filteredChannels = useMemo(() => {
    return channels.filter((c) => {
      const matchesStatus = statusFilter === 'All' ||
        (statusFilter === 'Active' && c.status === 'active') ||
        (statusFilter === 'Inactive' && c.status === 'inactive');

      const query = search.toLowerCase().trim();
      const matchesSearch = !query ||
        c.name?.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [channels, statusFilter, search]);

  const handleToggleStatus = async () => {
    if (!selectedChannel) return;
    try {
      // ✅ UNCOMMENTED: Live API update
      const newStatus = selectedChannel.status === 'active' ? 'inactive' : 'active';
      await api.updateChannel(selectedChannel.id, { status: newStatus });

      setChannels(channels.map(c =>
        c.id === selectedChannel.id
          ? { ...c, status: newStatus }
          : c
      ));
      setShowToggleModal(false);
      setSelectedChannel(null);
    } catch (error) {
      console.error('Failed to toggle channel status:', error);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2D1B0E] tracking-tight">
            Channel Management
          </h2>
          <p className="text-[#5A4030] text-sm sm:text-base mt-1">
            Manage and monitor all Palkhi channels
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center p-4">
          <p className="text-xs text-[#5A4030] font-semibold uppercase tracking-wider">Total</p>
          <p className="text-3xl font-bold text-[#2D1B0E]">{channels.length}</p>
        </Card>
        <Card className="text-center p-4 border-l-4 border-l-[#2D6A4F]">
          <p className="text-xs text-[#5A4030] font-semibold uppercase tracking-wider">Active</p>
          <p className="text-3xl font-bold text-[#2D6A4F]">{channels.filter(c => c.status === 'active').length}</p>
        </Card>
        <Card className="text-center p-4 border-l-4 border-l-[#D4A373]">
          <p className="text-xs text-[#5A4030] font-semibold uppercase tracking-wider">Inactive</p>
          <p className="text-3xl font-bold text-[#D4A373]">{channels.filter(c => c.status === 'inactive').length}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          {['All', 'Active', 'Inactive'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${statusFilter === filter
                ? 'bg-[#efdfdd] text-[#2D1B0E] border-[#E8D9C3] shadow-sm'
                : 'bg-white text-[#5A4030] border-[#E8D9C3] hover:bg-[#efdfdd]/60'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A4030]" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search channels..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8D9C3] rounded-lg text-sm text-[#2D1B0E] focus:outline-none focus:border-[#8b3a3a]"
          />
        </div>
      </div>

      {/* Channel List */}
      <div className="space-y-4">
        {filteredChannels.length === 0 ? (
          <Card className="text-center py-12 text-[#5A4030]">No channels found</Card>
        ) : (
          filteredChannels.map((channel) => (
            <Card key={channel.id} className="hover:shadow-lg transition-all border-l-4 border-l-[#D4A373]">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="w-12 h-12 rounded-xl bg-[#8b3a3a]/10 text-[#8b3a3a] font-bold text-lg flex items-center justify-center flex-shrink-0 border border-[#8b3a3a]/20">
                  {channel.name?.[0]?.toUpperCase() || 'C'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-[#2D1B0E]">{channel.name}</h3>
                    <Badge variant={channel.status === 'active' ? 'success' : 'warning'}>
                      {channel.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {channel.description && (
                    <p className="text-xs text-[#5A4030] line-clamp-1">{channel.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-[#5A4030] mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <FiUser size={12} />
                      {channel.owner_name || channel.created_by_name || channel.palkhi?.owner?.full_name || 'Palkhi Pramukh'}
                    </span>
                    <span className="flex items-center gap-1"><FiCalendar size={12} /> {new Date(channel.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/channels/${channel.id}`)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#8b3a3a] border border-[#8b3a3a] rounded-lg hover:bg-[#8b3a3a] hover:text-white transition-colors flex items-center gap-1"
                  >
                    <FiEye size={14} /> View
                  </button>
                  <button
                    onClick={() => {
                      setSelectedChannel(channel);
                      setShowToggleModal(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-[#D4A373] border border-[#D4A373] rounded-lg hover:bg-[#D4A373] hover:text-white transition-colors flex items-center gap-1"
                  >
                    {channel.status === 'active' ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    {channel.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Toggle Modal */}
      <Modal
        isOpen={showToggleModal}
        onClose={() => { setShowToggleModal(false); setSelectedChannel(null); }}
        title={`${selectedChannel?.status === 'active' ? 'Disable' : 'Enable'} Channel`}
      >
        <div className="text-center">
          <p className="text-[#5A4030] mb-4">
            Are you sure you want to {selectedChannel?.status === 'active' ? 'disable' : 'enable'} "{selectedChannel?.name}"?
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="ghost" onClick={() => { setShowToggleModal(false); setSelectedChannel(null); }}>
              Cancel
            </Button>
            <Button
              variant={selectedChannel?.status === 'active' ? 'danger' : 'primary'}
              className={selectedChannel?.status === 'active' ? 'bg-[#ba1a1a] hover:bg-[#93000a] text-white' : 'bg-[#2D6A4F] hover:bg-[#1b5e20] text-white'}
              onClick={handleToggleStatus}
            >
              {selectedChannel?.status === 'active' ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChannelManagement;