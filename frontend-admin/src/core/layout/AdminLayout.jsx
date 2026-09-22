import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Header from './Header.jsx';
import SiteMap from './SiteMap.jsx';
import { ToastContainer } from '../components/Toast.jsx';

export default function AdminLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [isSiteMapCollapsed, setIsSiteMapCollapsed] = useState(false);

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-background)',
          fontFamily: 'var(--font-family)',
          color: 'var(--color-text-secondary)',
        }}
      >
        Initializing CKR Connect...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: 'var(--color-background)',
      }}
    >
      <Header
        toggleSiteMap={() => setIsSiteMapCollapsed(!isSiteMapCollapsed)}
        isSiteMapCollapsed={isSiteMapCollapsed}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <SiteMap isCollapsed={isSiteMapCollapsed} />

        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: 'var(--color-background)',
          }}
        >
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
