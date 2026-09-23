import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext.jsx';
import SiteMap from './SiteMap.jsx';
import { ToastContainer } from '../components/Toast.jsx';

export default function AdminLayout() {
  const { isAuthenticated, loading } = useAuth();
  const isSiteMapCollapsed = useSelector((state) => state.ui.isSiteMapCollapsed);

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
      className="dynamics-app-layout"
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--color-background)',
      }}
    >
      {/* Dynamics Sales Hub Left Nav (Collapsible, Enterprise Clean) */}
      <SiteMap isCollapsed={isSiteMapCollapsed} />

      {/* Main Dynamics Workspace Viewport */}
      <main
        className="admin-main-viewport"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          height: '100%',
          overflow: 'hidden',
          background: 'var(--color-background)',
        }}
      >
        <Outlet context={{ panelSide: 'right' }} />
      </main>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
