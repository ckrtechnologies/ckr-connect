import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toggleSiteMap } from '../store/slices/uiSlice.js';
import { NAVIGATION_SECTIONS } from '../config/navigation.js';

export default function SiteMap({ isCollapsed }) {
  const dispatch = useDispatch();
  const location = useLocation();

  return (
    <nav className={`dynamics-sitemap ${isCollapsed ? 'collapsed' : ''}`} id="dynamics-sitemap">
      {/* Subheader: Dynamics Sales Hub with Hamburger Toggle */}
      <div className="sitemap-toggle-row">
        <span className="sitemap-title">Dynamics Sales Hub</span>
        <button
          type="button"
          className="sitemap-toggle-btn"
          onClick={() => dispatch(toggleSiteMap())}
          title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
            />
          </svg>
        </button>
      </div>

      {/* Menu List */}
      <ul className="sitemap-menu-list">
        {NAVIGATION_SECTIONS.map((section) => (
          <React.Fragment key={section.id}>
            <li className="sitemap-section-label">{section.title}</li>
            {section.items.map((item) => {
              if (item.disabled) {
                return (
                  <li key={item.id} className="sitemap-item disabled" title={`${item.label} (Coming Soon)`}>
                    {renderIcon(item.id)}
                    <span className="sitemap-item-text">{item.label}</span>
                    {item.badge && <span className="sitemap-coming-soon">{item.badge}</span>}
                  </li>
                );
              }

              const isActive =
                item.path === '/leads'
                  ? location.pathname.startsWith('/leads')
                  : location.pathname === item.path;

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <li className={`sitemap-item ${isActive ? 'active' : ''}`}>
                    {renderIcon(item.id)}
                    <span className="sitemap-item-text">{item.label}</span>
                    {item.badge && (
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
                </NavLink>
              );
            })}
          </React.Fragment>
        ))}
      </ul>
    </nav>
  );
}

// Authentic SVG Icons from prototype/app.js
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
          <path d="M2 1a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l4.586-4.586a1 1 0 0 0 0-1.414l-7-7A1 1 0 0 0 6.586 1H2zm4 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
        </svg>
      );
    case 'daily_interactions':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
        </svg>
      );
    case 'daily_reports':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" />
          <path d="M3 12h8v1H3v-1zm0-2h8v1H3v-1zm0-2h8v1H3v-1z" />
        </svg>
      );
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
          <path fillRule="evenodd" d="M14.763.075A.5.5 0 0 1 15 .5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .342-.474L6 7.64V4.5a.5.5 0 0 1 .276-.447l8-4a.5.5 0 0 1 .487.022zM6 8.694 1 10.36V15h5V8.694zM7 15h2v-1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15h2V1.709l-7 3.5V15z" />
        </svg>
      );
    case 'finance':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.253-.3-1.873-.83-1.873-1.764 0-.965.75-1.743 1.873-1.85v3.614zm1.043 1.414c1.26.36 1.815.86 1.815 1.875 0 1.05-.83 1.808-1.815 1.95V8.359z" />
        </svg>
      );
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3z" />
        </svg>
      );
  }
}
