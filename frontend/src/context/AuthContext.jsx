import React, { createContext, useEffect, useState } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserWithPermissions = async () => {
    const currentUser = await api.me();
    let permissions = {
      is_contributor_applied: false,
      is_palkhi_pramukh_applied: false,
      can_contribute: currentUser.role === 'admin',
      can_manage_channel: currentUser.role === 'admin',
    };

    try {
      const perms = await api.getMyPermissions();
      permissions = {
        ...permissions,
        ...perms,
      };
    } catch (permErr) {
      console.warn('Failed to fetch permissions:', permErr);
    }

    const fullUser = {
      ...currentUser,
      name: currentUser.full_name || currentUser.username,
      role: currentUser.role,
      permissions,
    };

    return fullUser;
  };

  useEffect(() => {
    const restoreSession = async () => {
      if (!localStorage.getItem('access_token')) {
        setLoading(false);
        return;
      }

      try {
        const fullUser = await fetchUserWithPermissions();
        setUser(fullUser);
        localStorage.setItem('user', JSON.stringify(fullUser));
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

    const fullUser = await fetchUserWithPermissions();
    setUser(fullUser);
    localStorage.setItem('user', JSON.stringify(fullUser));
    return fullUser;
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
      const fullUser = await fetchUserWithPermissions();
      setUser(fullUser);
      localStorage.setItem('user', JSON.stringify(fullUser));
      return fullUser;
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

  const getCurrentRole = () => {
    return user?.role || 'guest';
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const canView = () => {
    return true;
  };

  const isContributorApplied = () => {
    return Boolean(user?.permissions?.is_contributor_applied);
  };

  const isPalkhiPramukhApplied = () => {
    return Boolean(user?.permissions?.is_palkhi_pramukh_applied);
  };

  const canContribute = () => {
    if (isAdmin()) return true;
    return isContributorApplied();
  };

  const canCreateChannel = () => {
    if (isAdmin()) return true;
    return isPalkhiPramukhApplied();
  };

  const canManageChannel = () => {
    if (isAdmin()) return true;
    return isPalkhiPramukhApplied();
  };

  const canApproveContributors = () => {
    if (isAdmin()) return true;
    return isPalkhiPramukhApplied();
  };

  const isContributor = () => {
    return canContribute();
  };

  const hasContributePermission = () => {
    return canContribute();
  };

  const isPalkhiPramukh = () => {
    return canCreateChannel();
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
      getCurrentRole,
      isAdmin,
      canView,
      isContributorApplied,
      isPalkhiPramukhApplied,
      canContribute,
      canCreateChannel,
      canManageChannel,
      canApproveContributors,
      isContributor,
      hasContributePermission,
      isPalkhiPramukh,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};