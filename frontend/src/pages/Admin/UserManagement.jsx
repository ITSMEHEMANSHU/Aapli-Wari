import React, { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiEdit2 } from 'react-icons/fi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { api } from '../../services/api';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({ role: 'user', is_active: true });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.users({ limit: 100 });
        setUsers(data?.users || []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const roleFilters = ['All', 'Contributors', 'Palkhi Pramukh', 'Admins'];

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const role = u.role?.toLowerCase().replaceAll(' ', '_');
      const matchesRole = selectedRole === 'All' ||
        (selectedRole === 'Contributors' && role === 'contributor') ||
        (selectedRole === 'Palkhi Pramukh' && role === 'palkhi_pramukh') ||
        (selectedRole === 'Admins' && role === 'admin');

      const query = search.toLowerCase().trim();
      const matchesSearch = !query ||
        u.full_name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.role?.toLowerCase().includes(query);

      return matchesRole && matchesSearch;
    });
  }, [users, selectedRole, search]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getRoleBadge = (role) => {
    const normalizedRole = role?.toLowerCase().replaceAll(' ', '_');
    const styles = {
      admin: 'bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]/20',
      contributor: 'bg-[#E8F5E9] text-[#2E7D32] border-[#4CAF50]/20',
      palkhi_pramukh: 'bg-[#ffca98] text-[#7a532a] border-[#7d562d]/20',
    };
    return styles[normalizedRole] || 'bg-[#efdfdd] text-[#554241] border-[#E8D9C3]';
  };

  const getStatusBadge = (isActive) => {
    return isActive
      ? <Badge variant="success">Active</Badge>
      : <Badge variant="warning">Suspended</Badge>;
  };

  const handleToggleStatus = async (userId, isActive) => {
    try {
      await api.updateUserStatus(userId, !isActive);
      setUsers((currentUsers) => currentUsers.map((user) => (
        user.id === userId ? { ...user, is_active: !isActive } : user
      )));
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormError('');
    setFormData({
      role: user.role || 'user',
      is_active: user.is_active,
    });
    setShowEditModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      if (editingUser) {
        const updated = await api.updateUserRole(editingUser.id, formData.role);
        await api.updateUserStatus(editingUser.id, formData.is_active);
        setUsers((currentUsers) => currentUsers.map((user) => (
          user.id === editingUser.id
            ? { ...user, ...(updated?.user || {}), is_active: formData.is_active }
            : user
        )));
      }
      setShowEditModal(false);
    } catch (error) {
      setFormError(error.message || 'Unable to save user');
    } finally {
      setSaving(false);
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
            User Management
          </h2>
          <p className="text-[#5A4030] text-sm sm:text-base mt-1">
            Manage system access, roles, and contributor permissions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex overflow-x-auto gap-2 w-full sm:w-auto pb-1">
          {roleFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => { setSelectedRole(filter); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${selectedRole === filter
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
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search users..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8D9C3] rounded-lg text-sm text-[#2D1B0E] focus:outline-none focus:border-[#8b3a3a]"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8D9C3] bg-[#FDF8F0]">
                <th className="p-4 text-xs font-semibold text-[#5A4030] uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-semibold text-[#5A4030] uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-semibold text-[#5A4030] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D9C3]/50">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-10 text-sm text-[#5A4030]">
                    No users found
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#FDF8F0]/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" fallback={user.full_name?.[0] || user.username?.[0] || 'U'} />
                        <div>
                          <div className="font-semibold text-sm text-[#2D1B0E]">
                            {user.full_name || user.username || 'Unknown'}
                          </div>
                          <div className="text-xs text-[#5A4030]">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-80 transition-opacity"
                      >
                        {getStatusBadge(user.is_active)}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-[#E8D9C3] p-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#FDF8F0]">
          <span className="text-xs text-[#5A4030]">
            Showing {filteredUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-[#E8D9C3] rounded text-xs text-[#5A4030] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <span className="text-xs font-semibold text-[#2D1B0E] px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-[#E8D9C3] rounded text-xs text-[#5A4030] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        size="lg"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          {formError && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{formError}</p>}
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.role}
              onChange={(event) => setFormData({ ...formData, role: event.target.value })}
              className="w-full px-4 py-2 border border-[#E8D9C3] rounded-lg focus:outline-none focus:border-[#8b3a3a] text-sm"
            >
              <option value="user">User</option>
              <option value="contributor">Contributor</option>
              <option value="palkhi_pramukh">Palkhi Pramukh</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={String(formData.is_active)}
              onChange={(event) => setFormData({ ...formData, is_active: event.target.value === 'true' })}
              className="w-full px-4 py-2 border border-[#E8D9C3] rounded-lg focus:outline-none focus:border-[#8b3a3a] text-sm"
            >
              <option value="true">Active</option>
              <option value="false">Suspended</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button type="submit" disabled={saving} variant="primary" className="bg-[#8b3a3a] hover:bg-[#6d2325] text-white">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;