import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/', label: '🏠 Home' },
    { path: '/explore', label: '🔍 Explore' },
    { path: '/channels', label: '📢 Channels' },
    { path: '/ai-assistant', label: '🤖 AI Assistant' },
    { path: '/shorts', label: '🎬 Shorts' },
  ];

  const authItems = user ? [
    { path: '/feed', label: '📱 Feed' },
    { path: '/contribute', label: '✍️ Contribute' },
    { path: '/profile', label: '👤 Profile' },
    { path: '/settings', label: '⚙️ Settings' },
  ] : [];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
        
        {authItems.length > 0 && (
          <>
            <hr className="sidebar-divider" />
            {authItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
};