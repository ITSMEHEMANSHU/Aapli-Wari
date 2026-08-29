import React, { createContext, useEffect, useState } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext();

const normalizeRole = (value) => {
  if (!value && value !== 0) return '';
  return String(value).trim().toLowerCase().replaceAll(' ', '_');
};

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

    const fullUser = await fetchUserWithPermissions();
    setUser(fullUser);
    localStorage.setItem('user', JSON.stringify(fullUser));
    return fullUser;
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

  const getCurrentRole = () => {
    return user?.role || 'guest';
  };

  const isAdmin = () => {
    return normalizeRole(user?.role) === 'admin';
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
    return isAdmin() || normalizeRole(user?.role) === 'palkhi_pramukh' || isPalkhiPramukhApplied();
  };

  const canManageChannel = () => {
    return isAdmin() || normalizeRole(user?.role) === 'palkhi_pramukh' || isPalkhiPramukhApplied();
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
    if (!user) return false;
    if (isAdmin()) return true;
    return user.role === 'palkhi_pramukh' || isPalkhiPramukhApplied();
  };

  // Returns true if the current user is the owner of the given channel object or ID
  const isOwnerOfChannel = (channelOrId, channelsList = []) => {
    if (!user) return false;
    if (typeof channelOrId === 'object' && channelOrId !== null) {
      if (channelOrId.is_owner === true) return true;
      return String(user.id) === String(channelOrId.created_by_user_id);
    }
    if (Array.isArray(channelsList)) {
      const ch = channelsList.find((c) => String(c.id) === String(channelOrId));
      if (ch) {
        if (ch.is_owner === true) return true;
        return String(user.id) === String(ch.created_by_user_id);
      }
    }
    return false;
  };

  // Returns true if the user already has created an owned channel
  const hasChannel = (channelsList = []) => {
    if (!user || !Array.isArray(channelsList)) return false;
    return channelsList.some((c) => isOwnerOfChannel(c));
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
      isOwnerOfChannel,
      hasChannel,
      isAuthenticated: !!user,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};