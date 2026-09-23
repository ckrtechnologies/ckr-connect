import React, { useState } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../context/AuthContext.jsx';
import SiteMap from './SiteMap.jsx';
import { ToastContainer, toast } from '../components/Toast.jsx';
import { setDatePreset, setSelectedDate } from '../store/slices/dateSlice.js';

export default function AdminLayout() {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isSiteMapCollapsed = useSelector((state) => state.ui.isSiteMapCollapsed);
  const { selectedDate, selectedPreset } = useSelector((state) => state.date);

  const [panelSide, setPanelSide] = useState('right');
  const [protoState, setProtoState] = useState('normal');

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

  // Derive current screen code & title
  const getScreenMeta = () => {
    const p = location.pathname;
    if (p.startsWith('/dashboard')) return { code: 'A-02', label: 'A-02 · Executive Dashboard' };
    if (p.startsWith('/leads/') && p !== '/leads') return { code: 'A-04', label: 'A-04 · Lead Detail & BPF' };
    if (p.startsWith('/leads')) return { code: 'A-03', label: 'A-03 · Lead Management (Grid)' };
    if (p.startsWith('/staff')) return { code: 'A-08', label: 'A-08 · Staff Management (BDM Roster)' };
    if (p.startsWith('/attendance')) return { code: 'A-11', label: 'A-11 · Attendance Matrix' };
    if (p.startsWith('/masters')) return { code: 'A-10', label: 'A-10 · Offering Tags Master' };
    if (p.startsWith('/reports')) return { code: 'A-19', label: 'A-19 · Daily Interactions & Ledger' };
    if (p.startsWith('/accounts')) return { code: 'A-17', label: 'A-17 · Accounts Directory (Phase 2)' };
    return { code: 'A-03', label: 'A-03 · Lead Management (Grid)' };
  };

  const currentMeta = getScreenMeta();

  const handleScreenChange = (val) => {
    switch (val) {
      case 'A-01':
        logout();
        navigate('/login');
        break;
      case 'A-02':
        navigate('/dashboard');
        break;
      case 'A-03':
        navigate('/leads');
        break;
      case 'A-08':
        navigate('/staff');
        break;
      case 'A-10':
        navigate('/masters');
        break;
      case 'A-11':
        navigate('/attendance');
        break;
      case 'A-15':
      case 'A-16':
      case 'A-19':
        navigate('/reports');
        break;
      case 'A-17':
      case 'A-18':
        navigate('/accounts');
        break;
      case 'SIGNOFF':
        toast.info('Sign-Off: Internal Review Sheet signed off.');
        break;
      default:
        navigate('/leads');
    }
  };

  return (
    <div className="proto-shell">
      {/* Top Meta & Testing Control Bar (Approved Prototype v0.1) */}
      <div className="proto-topbar">
        <div className="proto-topbar-left">
          <div className="proto-brand">
            <span>CKR CONNECT</span>
            <span className="proto-brand-tag">PROTOTYPE v0.1</span>
          </div>
          <span className="proto-separator">|</span>
          <div className="proto-screen-badge" id="proto-screen-badge">
            {currentMeta.label}
          </div>
        </div>

        <div className="proto-topbar-center">
          {/* Direct Screen Selector (28 Screens) */}
          <select
            className="proto-screen-select"
            id="proto-screen-select"
            value={currentMeta.code}
            onChange={(e) => handleScreenChange(e.target.value)}
          >
            <optgroup label="Admin Panel (A-01 to A-18)">
              <option value="A-01">A-01: Admin Login</option>
              <option value="A-02">A-02: Executive Dashboard (Waterfall & Funnel)</option>
              <option value="A-03">A-03: Lead Management Grid (Command Bar)</option>
              <option value="A-08">A-08: Staff Management (BDM Roster)</option>
              <option value="A-10">A-10: Offering Tags Master</option>
              <option value="A-11">A-11: Monthly Attendance Matrix</option>
              <option value="A-15">A-15: Export & Reports</option>
              <option value="A-16">A-16: Daily Interaction Report</option>
              <option value="A-19">A-19: Daily Interaction History & Calling Ledger</option>
              <option value="A-17">A-17: Accounts Directory (Parent Entities)</option>
            </optgroup>
            <optgroup label="Approval & Documentation">
              <option value="SIGNOFF">Sign-Off: Internal Review Sheet</option>
            </optgroup>
          </select>
        </div>

        <div className="proto-topbar-right">
          {/* Global Platform Date Picker */}
          <div
            className="proto-control-group"
            title="Global Platform Date (Filters dashboard, interactions & attendance)"
          >
            <span style={{ fontSize: '11px' }}>📅 Date:</span>
            <input
              type="date"
              id="proto-date-picker"
              value={selectedDate || '2026-09-22'}
              onChange={(e) => dispatch(setSelectedDate(e.target.value))}
              style={{
                background: '#2D2D2D',
                color: '#FFFFFF',
                border: '1px solid #4D4D4D',
                borderRadius: '3px',
                fontSize: '11px',
                padding: '2px 4px',
                outline: 'none',
                cursor: 'pointer',
              }}
            />
            <select
              id="proto-range-select"
              value={selectedPreset || 'today'}
              onChange={(e) => dispatch(setDatePreset(e.target.value))}
              style={{
                background: '#2D2D2D',
                color: '#FFFFFF',
                border: '1px solid #4D4D4D',
                borderRadius: '3px',
                fontSize: '11px',
                padding: '2px 4px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="this_week">This Week</option>
              <option value="mtd">MTD</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="qtd">QTD</option>
              <option value="ytd">YTD</option>
              <option value="this_year">This Year</option>
              <option value="last_year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Quick Create Dock Side Switcher (DESIGN.md §2.7) */}
          <div className="proto-control-group" title="Test Authentic Dynamics Right Dock vs Left Drawer">
            <span>Panel Side:</span>
            <button
              className={`proto-btn-toggle ${panelSide === 'left' ? 'active' : ''}`}
              onClick={() => setPanelSide('left')}
            >
              Left
            </button>
            <button
              className={`proto-btn-toggle ${panelSide === 'right' ? 'active' : ''}`}
              onClick={() => setPanelSide('right')}
            >
              Right
            </button>
          </div>

          {/* Unhappy State Simulator */}
          <div className="proto-control-group">
            <span>State:</span>
            <select
              id="proto-state-select"
              value={protoState}
              onChange={(e) => setProtoState(e.target.value)}
              style={{
                background: 'transparent',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '11px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="normal">Normal</option>
              <option value="skeleton">Skeleton Shimmer</option>
              <option value="empty">Empty State</option>
              <option value="error">Error State</option>
            </select>
          </div>

          {/* Formal Sign-Off Button */}
          <button
            className="proto-btn-signoff"
            id="proto-signoff-btn"
            onClick={() => toast.success('Approved Prototype v0.1 verified.')}
          >
            ✓ Sign-off Sheet
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="proto-main-container">
        {/* Left Platform Switcher */}
        <aside className="proto-platform-bar">
          <button
            className="proto-platform-btn active"
            data-platform="admin"
            title="Admin Desktop Web Portal"
            onClick={() => navigate('/dashboard')}
          >
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm1 2v8h14V4H1zm0 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1H1zm14-10H1V2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1z" />
            </svg>
            <span>Admin</span>
          </button>

          <button
            className="proto-platform-btn"
            data-platform="bdm"
            title="BDM Mobile-First App (390×844)"
            onClick={() => toast.info('BDM Mobile App view available on mobile breakpoint')}
          >
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5z" />
              <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
            </svg>
            <span>BDM</span>
          </button>
        </aside>

        {/* Center Viewport Canvas */}
        <main className="proto-viewport-canvas" id="proto-viewport-canvas">
          <div className="admin-layout" style={{ display: 'flex', width: '100%', height: '100%' }}>
            <SiteMap isCollapsed={isSiteMapCollapsed} />

            <div className="admin-viewport">
              <Outlet context={{ panelSide, protoState }} />
            </div>
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
