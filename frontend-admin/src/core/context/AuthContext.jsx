import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../http/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial sync
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const authToken = res?.data?.accessToken || res?.data?.token;
    if (authToken && res?.data?.user) {
      const userData = res.data.user;
      userData.full_name = userData.name || userData.full_name;
      
      // Enforce Admin role (case-insensitive)
      const role = String(userData.role || '').toLowerCase();
      if (role !== 'admin' && role !== 'super_admin') {
        throw new Error('Access denied. Administrator privileges required.');
      }

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      return userData;
    }
    throw new Error('Invalid response from authentication server');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/admin/login';
  };

  const updateUser = (updated) => {
    const nextUser = { ...user, ...updated };
    setUser(nextUser);
    localStorage.setItem('user', JSON.stringify(nextUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: ['admin', 'super_admin'].includes(String(user?.role || '').toLowerCase()),
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
