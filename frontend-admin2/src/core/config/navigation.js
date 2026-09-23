// Declarative Navigation Registry for CKR Connect Admin Portal
// Exactly matching Approved Prototype v0.1 (prototype/app.js lines 944-1000)

export const NAVIGATION_SECTIONS = [
  {
    id: 'core_operations',
    title: 'Core Operations',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        screenId: 'A-02',
        icon: 'dashboard',
      },
      {
        id: 'leads',
        label: 'Leads',
        path: '/leads',
        screenId: 'A-03',
        icon: 'leads',
      },
      {
        id: 'staff',
        label: 'Staff (BDMs)',
        path: '/staff',
        screenId: 'A-08',
        icon: 'staff',
      },
      {
        id: 'attendance',
        label: 'Attendance',
        path: '/attendance',
        screenId: 'A-11',
        icon: 'attendance',
      },
      {
        id: 'masters',
        label: 'Masters (Tags)',
        path: '/masters',
        screenId: 'A-10',
        icon: 'masters',
      },
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    items: [
      {
        id: 'daily_interactions',
        label: 'Daily Interactions',
        path: '/reports',
        screenId: 'A-19',
        icon: 'interactions',
      },
      {
        id: 'followups',
        label: 'Followups',
        path: '/reports?tab=followup',
        screenId: 'A-19-B',
        icon: 'dashboard',
      },
      {
        id: 'export_analytics',
        label: 'Export & Analytics',
        path: '/reports?tab=export',
        screenId: 'A-15',
        icon: 'export',
      },
    ],
  },
  {
    id: 'reserved_phase2',
    title: 'Reserved (Phase 2)',
    items: [
      {
        id: 'accounts',
        label: 'Accounts & Renewals',
        path: '/accounts',
        screenId: 'A-17',
        icon: 'accounts',
        badge: 'Phase 2',
        badgeClass: 'phase2-badge',
      },
      {
        id: 'finance',
        label: 'Finance & P&L',
        path: '/finance',
        icon: 'finance',
        disabled: true,
        badge: 'Soon',
      },
      {
        id: 'marketing',
        label: 'Marketing',
        path: '/marketing',
        icon: 'marketing',
        disabled: true,
        badge: 'Soon',
      },
      {
        id: 'projects',
        label: 'Projects',
        path: '/projects',
        icon: 'projects',
        disabled: true,
        badge: 'Soon',
      },
    ],
  },
];
