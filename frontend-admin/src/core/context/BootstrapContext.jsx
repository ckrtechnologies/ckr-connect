import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../http/client.js';
import { useAuth } from './AuthContext.jsx';

const BootstrapContext = createContext(null);

export function BootstrapProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState({
    tags: [],
    bdms: [],
    holidays: [],
    metadata: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBootstrap = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get('/bootstrap');
      if (res?.data) {
        setData({
          tags: res.data.tags || [],
          bdms: res.data.bdms || [],
          holidays: res.data.holidays || [],
          metadata: res.data.metadata || {},
        });
      }
      setError(null);
    } catch (err) {
      console.warn('Bootstrap fetch warning:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBootstrap();
    }
  }, [isAuthenticated, fetchBootstrap]);

  return (
    <BootstrapContext.Provider
      value={{
        ...data,
        loading,
        error,
        refreshBootstrap: fetchBootstrap,
      }}
    >
      {children}
    </BootstrapContext.Provider>
  );
}

export function useBootstrap() {
  const context = useContext(BootstrapContext);
  if (!context) {
    throw new Error('useBootstrap must be used within a BootstrapProvider');
  }
  return context;
}
