import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    // Static login
    setUser({
      id: 1,
      name: 'John Doe',
      email: email,
      role: 'user',
      permissions: ['view', 'comment']
    });
    return true;
  };

  const register = (userData) => {
    setUser({
      id: 1,
      name: userData.name,
      email: userData.email,
      role: 'user',
      permissions: ['view', 'comment']
    });
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      hasRole,
      hasPermission,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};