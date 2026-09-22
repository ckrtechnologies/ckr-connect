import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext.jsx';
import { toggleSiteMap } from '../store/slices/uiSlice.js';
import { setDatePreset, setSelectedDate } from '../store/slices/dateSlice.js';
import { ShieldCheck, LogOut, User as UserIcon, Bell, ChevronDown, Calendar } from 'lucide-react';

export default function Header() {
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // RTK Slices
  const isSiteMapCollapsed = useSelector((state) => state.ui.isSiteMapCollapsed);
  const { selectedPreset, selectedDate } = useSelector((state) => state.date);

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: '#1E1E1E', // Dark Fluent Dynamics top ribbon
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid #333333',
        zIndex: 100,
        userSelect: 'none',
      }}
    >
      {/* Brand & Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => dispatch(toggleSiteMap())}
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 'var(--radius-xs)',
          }}
          title={isSiteMapCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              width: '26px',
              height: '26px',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '-0.5px',
            }}
          >
            C
          </div>
          <span style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '0.2px' }}>
            CKR CONNECT
          </span>
          <span
            style={{
              backgroundColor: '#333333',
              color: '#00A4EF',
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '2px',
              textTransform: 'uppercase',
            }}
          >
            Admin Sales Hub
          </span>
        </div>
      </div>

      {/* Center: Global RTK Date Slice with Presets */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#2B2B2B',
          padding: '3px 10px',
          borderRadius: 'var(--radius-xs)',
          border: '1px solid #3E3E3E',
        }}
        title="Global Platform Date (RTK Date Slice)"
      >
        <Calendar size={13} color="#00A4EF" />
        <span style={{ fontSize: '11px', color: '#AAAAAA' }}>Range:</span>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => dispatch(setSelectedDate(e.target.value))}
          style={{
            background: 'transparent',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '11px',
            outline: 'none',
            cursor: 'pointer',
          }}
        />
        <select
          value={selectedPreset}
          onChange={(e) => dispatch(setDatePreset(e.target.value))}
          style={{
            background: '#1E1E1E',
            color: '#FFFFFF',
            border: '1px solid #4D4D4D',
            borderRadius: '2px',
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
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Right Controls: Notifications & User Avatar Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {user?.full_name ? user.full_name[0].toUpperCase() : 'A'}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>{user?.full_name || 'Admin'}</div>
              <div style={{ fontSize: '10px', color: '#AAAAAA' }}>{user?.role || 'admin'}</div>
            </div>
            <ChevronDown size={14} color="#AAAAAA" />
          </button>

          {/* User Menu Dropdown */}
          {menuOpen && (
            <>
              <div
                onClick={() => setMenuOpen(false)}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '4px',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  boxShadow: 'var(--shadow-level3)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  minWidth: '200px',
                  zIndex: 100,
                  padding: '6px 0',
                }}
              >
                <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{user?.full_name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{user?.email}</div>
                </div>

                <button
                  onClick={logout}
                  className="fluent-btn-subtle"
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    padding: '8px 16px',
                    borderRadius: 0,
                    color: 'var(--color-error)',
                    gap: '8px',
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
