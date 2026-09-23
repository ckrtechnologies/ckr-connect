import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toggleSiteMap } from '../store/slices/uiSlice.js';
import { NAVIGATION_SECTIONS } from '../config/navigation.js';

export default function SiteMap({ isCollapsed }) {
  const dispatch = useDispatch();
  const location = useLocation();

  return (
    <nav className={`dynamics-sitemap ${isCollapsed ? 'collapsed' : ''}`} id="dynamics-sitemap">
      {/* Subheader: Hamburger Toggle on LEFT + CKR Technologies Connect Branding */}
      <div className="sitemap-toggle-row">
        <button
          type="button"
          className="sitemap-toggle-btn"
          onClick={() => dispatch(toggleSiteMap())}
          title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
            />
          </svg>
        </button>

        {!isCollapsed && (
          <div className="sitemap-brand-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '5px',
                background: 'linear-gradient(135deg, #0078D4 0%, #004E8C 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '10px',
                letterSpacing: '-0.3px',
                flexShrink: 0,
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
              }}
            >
              CKR
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, lineHeight: 1.15 }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                CKR Technologies
              </span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 500, letterSpacing: '0.2px', whiteSpace: 'nowrap' }}>
                Connect Platform
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Menu List */}
      <ul className="sitemap-menu-list">
        {NAVIGATION_SECTIONS.map((section) => (
          <React.Fragment key={section.id}>
            {!isCollapsed && <li className="sitemap-section-label">{section.title}</li>}
            {section.items.map((item) => {
              const iconKey = item.icon || item.id;
              if (item.disabled) {
                return (
                  <li key={item.id} className="sitemap-item disabled" title={`${item.label} (Coming Soon)`}>
                    {renderIcon(iconKey)}
                    {!isCollapsed && <span className="sitemap-item-text">{item.label}</span>}
                    {!isCollapsed && item.badge && <span className="sitemap-coming-soon">{item.badge}</span>}
                  </li>
                );
              }

              const currentFullUrl = location.pathname + location.search;
              let isActive = false;
              if (item.path.includes('?')) {
                isActive = currentFullUrl === item.path;
              } else if (item.path === '/leads') {
                isActive = location.pathname.startsWith('/leads');
              } else if (item.path === '/reports') {
                isActive = location.pathname === '/reports' && (!location.search || location.search === '?tab=interactions');
              } else {
                isActive = location.pathname === item.path;
              }

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <li className={`sitemap-item ${isActive ? 'active' : ''}`} title={isCollapsed ? item.label : undefined}>
                    {renderIcon(iconKey)}
                    {!isCollapsed && <span className="sitemap-item-text">{item.label}</span>}
                    {!isCollapsed && item.badge && (
                      <span
                        className="sitemap-coming-soon"
                        style={
                          item.badgeClass === 'phase2-badge'
                            ? { backgroundColor: '#E0E7FF', color: '#3730A3' }
                            : {}
                        }
                      >
                        {item.badge}
                      </span>
                    )}
                  </li>
                </Link>
              );
            })}
          </React.Fragment>
        ))}
      </ul>
    </nav>
  );
}

// Authentic SVG Icons matching prototype/app.js lines 950-1010
function renderIcon(id) {
  switch (id) {
    case 'dashboard':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z" />
        </svg>
      );
    case 'leads':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
        </svg>
      );
    case 'staff':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
          <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z" />
        </svg>
      );
    case 'attendance':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
        </svg>
      );
    case 'masters':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586V2zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
        </svg>
      );
    case 'interactions':
    case 'daily_interactions':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
        </svg>
      );
    case 'reports':
    case 'daily_reports':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" />
        </svg>
      );
    case 'export':
    case 'export_analytics':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
        </svg>
      );
    case 'accounts':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h11A1.5 1.5 0 0 1 15 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13.5v-11zm1.5-.5a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-11z" />
          <path d="M4 4h2v2H4V4zm3 0h2v2H7V4zm3 0h2v2h-2V4zM4 7h2v2H4V7zm3 0h2v2H7V7zm3 0h2v2h-2V7zM4 10h2v2H4v-2zm3 0h2v2H7v-2zm3 0h2v2h-2v-2z" />
        </svg>
      );
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="8" r="6" />
        </svg>
      );
  }
}
