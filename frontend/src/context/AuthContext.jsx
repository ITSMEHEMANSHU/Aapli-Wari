import React, { createContext, useEffect, useState } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext();

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
          name: currentUser.full_name || currentUser.username,
          role: currentUser.role || cachedUser.role,
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
    const authenticatedUser = {
      ...currentUser,
      name: currentUser.full_name || currentUser.username,
      role: response.role || currentUser.role,
    };
    setUser(authenticatedUser);
    localStorage.setItem('user', JSON.stringify(authenticatedUser));
    return authenticatedUser;
  };

  const register = async (userData) => {
    const response = await api.signup(userData);
    if (userData.email && userData.password) {
      try {
        await login(userData.email, userData.password);
      } catch (loginErr) {
        console.warn('Auto-login after signup failed:', loginErr);
      }
    }
    return response;
  };

  const registerPalkhiPramukh = async (pramukhData) => {
    const response = await api.registerPalkhiPramukh(pramukhData);
    if (pramukhData.email && pramukhData.password) {
      try {
        await login(pramukhData.email, pramukhData.password);
      } catch (loginErr) {
        console.warn('Auto-login after palkhi pramukh registration failed:', loginErr);
      }
    }
    return response;
  };

  const refreshUser = async () => {
    try {
      const currentUser = await api.me();
      const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updated = {
        ...currentUser,
        name: currentUser.full_name || currentUser.username,
        role: currentUser.role || cachedUser.role,
      };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Failed to refresh user profile:', e);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const isContributor = () => {
    return ['contributor', 'palkhi_pramukh', 'admin'].includes(user?.role);
  };

  const hasContributePermission = () => {
    return isContributor();
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      registerPalkhiPramukh,
      logout,
      refreshUser,
      hasRole,
      isContributor,
      hasContributePermission,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};