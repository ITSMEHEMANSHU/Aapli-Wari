import React, { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiEdit2, FiEye, FiX } from 'react-icons/fi';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import { api } from '../../services/api';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  
  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [activeUser, setActiveUser] = useState(null);

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
      contributor: 'bg-[#FDF8F0] text-[#E87A1E] border-[#E87A1E]/30',
      palkhi_pramukh: 'bg-[#F9F1E5] text-[#3D2518] border-[#E8D9C3]',
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

  const openViewModal = (user) => {
    setActiveUser(user);
    setShowViewModal(true);
  };

  const openEditModal = (user) => {
    setActiveUser(user);
    setFormError('');
    setFormData({
      role: user.role || 'user',
      is_active: user.is_active,
    });
    setShowEditModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!activeUser) return;
    setSaving(true);
    setFormError('');

    try {
      const updated = await api.updateUserRole(activeUser.id, formData.role);
      await api.updateUserStatus(activeUser.id, formData.is_active);
      setUsers((currentUsers) => currentUsers.map((user) => (
        user.id === activeUser.id
          ? { ...user, ...(updated?.user || {}), is_active: formData.is_active }
          : user
      )));
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E87A1E] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3D2518] tracking-tight">
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
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${selectedRole === filter
                  ? 'bg-[#E87A1E] text-white border-[#E87A1E] shadow-sm'
                  : 'bg-white text-[#5A4030] border-[#E8D9C3] hover:bg-[#F9F1E5]'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A4030]" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search users by name or email..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8D9C3] rounded-xl text-sm text-[#3D2518] focus:outline-none focus:border-[#E87A1E] shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Styled Table Card */}
      <div className="bg-white rounded-2xl border border-[#E8D9C3] shadow-[0_4px_20px_rgba(61,37,24,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8D9C3] bg-[#F9F1E5]">
                <th className="py-4 px-6 text-xs font-bold text-[#3D2518] uppercase tracking-wider">User</th>
                <th className="py-4 px-6 text-xs font-bold text-[#3D2518] uppercase tracking-wider">Role</th>
                <th className="py-4 px-6 text-xs font-bold text-[#3D2518] uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-[#3D2518] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D9C3]/40">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-sm text-[#5A4030]">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="flex-shrink-0">
                          <Avatar size="md" fallback={user.full_name?.[0] || user.username?.[0] || 'U'} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-[#3D2518] truncate">
                            {user.full_name || user.username || 'Unknown User'}
                          </div>
                          <div className="text-xs text-[#5A4030] truncate">
                            {user.email || 'No email provided'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(user.role)}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium focus:outline-none"
                      >
                        {getStatusBadge(user.is_active)}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openViewModal(user)}
                          className="p-2 text-[#5A4030] hover:text-[#E87A1E] hover:bg-[#F9F1E5] rounded-xl transition-all border border-transparent hover:border-[#E8D9C3]"
                          title="View User Details"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-[#5A4030] hover:text-[#E87A1E] hover:bg-[#F9F1E5] rounded-xl transition-all border border-transparent hover:border-[#E8D9C3]"
                          title="Edit User Details"
                        >
                          <FiEdit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E8D9C3] px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#F9F1E5]">
          <span className="text-xs font-medium text-[#5A4030]">
            Showing <span className="font-bold text-[#3D2518]">{filteredUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
            <span className="font-bold text-[#3D2518]">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of{' '}
            <span className="font-bold text-[#3D2518]">{filteredUsers.length}</span> entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 border border-[#E8D9C3] rounded-lg text-xs font-semibold text-[#3D2518] bg-white hover:bg-[#FDF8F0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Prev
            </button>
            <span className="text-xs font-bold text-[#3D2518] px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-1.5 border border-[#E8D9C3] rounded-lg text-xs font-semibold text-[#3D2518] bg-white hover:bg-[#FDF8F0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Modal (Inline Native Implementation) */}
      {showViewModal && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-[#E8D9C3] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8D9C3] bg-[#F9F1E5]">
              <h3 className="font-bold text-base text-[#3D2518]">User Details</h3>
              <button 
                onClick={() => setShowViewModal(false)}
                className="p-1 text-[#5A4030] hover:text-[#3D2518] rounded-lg transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-[#E8D9C3]">
                <Avatar size="lg" fallback={activeUser.full_name?.[0] || 'U'} />
                <div>
                  <h4 className="font-bold text-base text-[#3D2518]">
                    {activeUser.full_name || activeUser.username || 'Unknown User'}
                  </h4>
                  <p className="text-xs text-[#5A4030]">{activeUser.email || 'No email provided'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs font-semibold text-[#5A4030] uppercase">Role</span>
                  <span className="font-medium text-[#3D2518] capitalize">{activeUser.role || 'User'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-[#5A4030] uppercase">Status</span>
                  <span className="font-medium text-[#3D2518]">{activeUser.is_active ? 'Active' : 'Suspended'}</span>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-[#E8D9C3]/40">
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-[#E87A1E] hover:bg-[#d06915] text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (Inline Native Implementation) */}
      {showEditModal && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-[#E8D9C3] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8D9C3] bg-[#F9F1E5]">
              <h3 className="font-bold text-base text-[#3D2518]">Edit User</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 text-[#5A4030] hover:text-[#3D2518] rounded-lg transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              {formError && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{formError}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4030] uppercase tracking-wider mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(event) => setFormData({ ...formData, role: event.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E8D9C3] rounded-xl focus:outline-none focus:border-[#E87A1E] text-sm text-[#3D2518] bg-white"
                  >
                    <option value="user">User</option>
                    <option value="contributor">Contributor</option>
                    <option value="palkhi_pramukh">Palkhi Pramukh</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A4030] uppercase tracking-wider mb-1">Account Status</label>
                  <select
                    value={String(formData.is_active)}
                    onChange={(event) => setFormData({ ...formData, is_active: event.target.value === 'true' })}
                    className="w-full px-4 py-2.5 border border-[#E8D9C3] rounded-xl focus:outline-none focus:border-[#E87A1E] text-sm text-[#3D2518] bg-white"
                  >
                    <option value="true">Active</option>
                    <option value="false">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E8D9C3]/40 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#5A4030] hover:bg-[#F9F1E5] rounded-xl transition-colors border border-[#E8D9C3]"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-4 py-2 bg-[#E87A1E] hover:bg-[#d06915] text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;