import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import apiClient from '../http/client.js';

const BootstrapContext = createContext(null);

export function BootstrapProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [bootstrapData, setBootstrapData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBootstrap = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await apiClient.get('/bootstrap');
      if (res?.data) {
        setBootstrapData(res.data);
      }
    } catch (err) {
      console.warn('Bootstrap fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBootstrap();
    } else {
      setBootstrapData(null);
    }
  }, [isAuthenticated]);

  const value = {
    bootstrap: bootstrapData,
    loading,
    refreshBootstrap: fetchBootstrap,
    tags: bootstrapData?.tags || [],
    bdms: bootstrapData?.bdms || [],
    holidays: bootstrapData?.holidays || [],
    roles: ['admin', 'bdm'],
    stages: bootstrapData?.metadata?.lead_statuses || [],
    leadStatuses: bootstrapData?.metadata?.lead_statuses || [],
    leadSources: bootstrapData?.metadata?.lead_sources || [],
    callOutcomes: bootstrapData?.metadata?.call_outcomes || [],
    bpfStages: bootstrapData?.metadata?.bpf_stages || [],
  };

  return (
    <BootstrapContext.Provider value={value}>
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
