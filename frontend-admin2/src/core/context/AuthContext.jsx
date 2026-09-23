import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logout as storeLogout } from '../store/slices/authSlice.js';
import apiClient from '../http/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const token = res?.data?.accessToken || res?.data?.token || res?.accessToken || res?.token;
    const user = res?.data?.user || res?.user;
    if (token && user) {
      dispatch(setCredentials({ user, token }));
      return res.data || res;
    }
    throw new Error('Invalid authentication response');
  };

  const logout = () => {
    dispatch(storeLogout());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading: false,
        login,
        logout,
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
