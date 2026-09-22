import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_SECTIONS } from '../config/navigation.js';
import {
  LayoutDashboard,
  Flame,
  Building2,
  Users,
  CalendarCheck,
  PhoneCall,
  SlidersHorizontal,
  Receipt,
  Megaphone,
  FolderKanban,
  Repeat,
} from 'lucide-react';

const ICON_MAP = {
  LayoutDashboard,
  Flame,
  Building2,
  Users,
  CalendarCheck,
  PhoneCall,
  SlidersHorizontal,
  Receipt,
  Megaphone,
  FolderKanban,
  Repeat,
};

export default function SiteMap({ isCollapsed }) {
  return (
    <aside
      style={{
        width: isCollapsed ? 'var(--sitemap-collapsed-width)' : 'var(--sitemap-width)',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid var(--color-border)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'width 200ms cubic-bezier(0.1, 0.9, 0.2, 1)',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: isCollapsed ? '12px 4px' : '16px 8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {NAVIGATION_SECTIONS.map((section) => (
          <div key={section.id}>
            {!isCollapsed && (
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                  letterSpacing: '0.6px',
                  padding: '4px 12px 8px 12px',
                  textTransform: 'uppercase',
                }}
              >
                {section.title}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map((item) => {
                const IconComponent = ICON_MAP[item.icon] || LayoutDashboard;

                if (item.phase2) {
                  return (
                    <div
                      key={item.id}
                      title={isCollapsed ? `${item.label} (Phase 2)` : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: isCollapsed ? '8px 0' : '8px 12px',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        color: 'var(--color-text-disabled)',
                        fontSize: '13px',
                        cursor: 'not-allowed',
                        borderRadius: 'var(--radius-xs)',
                      }}
                    >
                      <IconComponent size={18} opacity={0.5} />
                      {!isCollapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <span>{item.label}</span>
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: 700,
                              backgroundColor: 'var(--color-surface-alt)',
                              color: 'var(--color-text-secondary)',
                              padding: '2px 5px',
                              borderRadius: '2px',
                              textTransform: 'uppercase',
                            }}
                          >
                            {item.badge}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    title={isCollapsed ? item.label : undefined}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: isCollapsed ? '8px 0' : '8px 12px',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '13px',
                      textDecoration: 'none',
                      borderRadius: 'var(--radius-xs)',
                      borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                      transition: 'all 120ms ease',
                    })}
                  >
                    <IconComponent size={18} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
