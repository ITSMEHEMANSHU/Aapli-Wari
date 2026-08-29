import React, { createContext, useEffect, useState } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext();

const normalizeRole = (value) => {
  if (!value && value !== 0) return '';
  return String(value).trim().toLowerCase();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (!localStorage.getItem('access_token')) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await api.me();
        const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const restoredUser = {
          ...currentUser,
          name: currentUser.full_name || currentUser.username || cachedUser.name,
          role: normalizeRole(cachedUser.role || currentUser.role || ''),
        };
        setUser(restoredUser);
        localStorage.setItem('user', JSON.stringify(restoredUser));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const response = await api.login({ email, password });
    localStorage.setItem('access_token', response.access_token);
    if (response.refresh_token) {
      localStorage.setItem('refresh_token', response.refresh_token);
    }

    const currentUser = await api.me();
    const storedRole = normalizeRole(response.role || currentUser?.role || '');

    const authenticatedUser = {
      ...currentUser,
      name: currentUser.full_name || currentUser.username,
      role: storedRole,
    };

    setUser(authenticatedUser);
    localStorage.setItem('user', JSON.stringify(authenticatedUser));

    return authenticatedUser;
  };

  const register = async (userData) => api.signup(userData);

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // ✅ NEW: Update context and localStorage instantly
  const updateUser = (newData) => {
    const updatedUser = { 
      ...user, 
      ...newData,
      name: newData.full_name || newData.username || user.name 
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const hasRole = (role) => {
    return normalizeRole(user?.role) === normalizeRole(role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateUser, // ✅ Export the new function
      hasRole,
      isAuthenticated: !!user,
      isAdmin: normalizeRole(user?.role) === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};