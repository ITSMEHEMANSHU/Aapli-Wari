import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FiMenu, FiBell, FiUser, FiLogOut, FiChevronDown,
  FiHome, FiUsers, FiFile, FiHash, FiSettings
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const AdminSidebar = ({ isOpen, setIsOpen, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/admin' },
    { id: 'users', label: 'Users', icon: FiUsers, path: '/admin/users' },
    { id: 'content', label: 'Content', icon: FiFile, path: '/admin/content' },
    { id: 'channels', label: 'Channels', icon: FiHash, path: '/admin/channels' },
    { id: 'settings', label: 'Settings', icon: FiSettings, path: '/admin/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar with requested gradient background */}
      <aside
        className={`bg-gradient-to-br from-[#3D2518] to-[#2B1810] text-[#ffdcbd] fixed left-0 top-0 h-full w-[260px] border-r border-[#dac1bf]/10 shadow-2xl flex flex-col py-6 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="px-6 pb-6 border-b border-[#dac1bf]/10 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#ffdcbd] tracking-tight">Aapli Wari</h1>
            <p className="text-[#f0bd8b]/80 text-xs font-semibold mt-1 tracking-widest uppercase">Admin</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-[#ffdcbd] hover:bg-[#523324] p-1 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'border-l-4 border-[#E87A1E] bg-[#523324]/60 text-[#ffdcbd] font-semibold shadow-inner'
                      : 'text-[#ffb3b0]/80 hover:text-[#ffdcbd] hover:bg-[#523324]/30'
                  }`}
                >
                  <item.icon className="mr-3 text-[20px]" size={20} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-4 pt-4 border-t border-[#dac1bf]/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-[#E87A1E] hover:bg-[#c66b20] text-[#ffdcbd] px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md"
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Ref to detect outside clicks for profile dropdown
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#FBF5EC] text-[#2D1B0E] overflow-hidden">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-[260px] h-full overflow-hidden">
        
        {/* Header with requested background color */}
        <header className="bg-[#F9F1E5] sticky top-0 z-30 w-full shadow-sm flex justify-between items-center px-4 md:px-8 py-3 h-[72px] border-b border-[#E8D9C3]/60">
          <div className="flex items-center flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#3D2518] p-2 mr-2 hover:bg-[#EFE4D6] rounded-lg transition-colors"
            >
              <FiMenu size={24} />
            </button>
            <span className="font-semibold text-lg text-[#E87A1E] hidden lg:block tracking-wide">Aapli Wari Admin</span>
          </div>

          <div className="flex items-center space-x-3">
            <button className="relative p-2 text-[#554241] hover:text-[#3D2518] rounded-full hover:bg-[#EFE4D6] transition-colors">
              <FiBell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#ba1a1a] ring-2 ring-[#F9F1E5]"></span>
            </button>

            {/* Profile Dropdown Container wrapped with ref */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 bg-[#EFE4D6] px-3 py-1.5 rounded-full hover:bg-[#E8D9C3] transition-all border border-[#E8D9C3]"
              >
                <Avatar size="sm" fallback={user?.name?.[0] || 'A'} />
                <span className="text-sm font-semibold text-[#3D2518] hidden sm:inline">Profile</span>
                <FiChevronDown size={14} className="text-[#3D2518]" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E8D9C3] py-2 z-50">
                  <div className="px-4 py-3 border-b border-[#E8D9C3]/30">
                    <p className="font-semibold text-sm text-[#2D1B0E]">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-[#5A4030]">{user?.email || 'admin@aapliwari.org'}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#2D1B0E] hover:bg-[#FBF5EC] flex items-center gap-2 transition-colors"
                  >
                    <FiUser size={16} /> My Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#ba1a1a] hover:bg-rose-50 flex items-center gap-2 border-t border-[#E8D9C3]/30 transition-colors"
                  >
                    <FiLogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Page with requested page background */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#FBF5EC]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;