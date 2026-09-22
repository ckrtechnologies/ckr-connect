// Declarative Navigation Registry for CKR Connect Admin Portal
// Designed for seamless plug-and-play addition of future modules (Finance, Marketing, Projects, Renewals)

export const NAVIGATION_SECTIONS = [
  {
    id: 'sales',
    title: 'SALES & PIPELINE',
    items: [
      {
        id: 'dashboard',
        label: 'Executive Dashboard',
        path: '/dashboard',
        icon: 'LayoutDashboard',
      },
      {
        id: 'leads',
        label: 'Leads & Opportunities',
        path: '/leads',
        icon: 'Flame',
      },
      {
        id: 'accounts',
        label: 'Parent Accounts',
        path: '/accounts',
        icon: 'Building2',
      },
    ],
  },
  {
    id: 'operations',
    title: 'TEAM & OPERATIONS',
    items: [
      {
        id: 'staff',
        label: 'Staff & BDM Roster',
        path: '/staff',
        icon: 'Users',
      },
      {
        id: 'attendance',
        label: 'Attendance Matrix',
        path: '/attendance',
        icon: 'CalendarCheck',
      },
      {
        id: 'interactions',
        label: 'Telecalling Ledger',
        path: '/reports',
        icon: 'PhoneCall',
      },
    ],
  },
  {
    id: 'settings',
    title: 'CONFIGURATION & MASTERS',
    items: [
      {
        id: 'masters',
        label: 'Tags & Holiday Masters',
        path: '/masters',
        icon: 'SlidersHorizontal',
      },
    ],
  },
  // Future Upgrades (Phase 2) — Pluggable entries
  {
    id: 'future_phase2',
    title: 'EXPANSION (PHASE 2)',
    items: [
      {
        id: 'finance',
        label: 'Invoices & Milestones',
        path: '/finance',
        icon: 'Receipt',
        phase2: true,
        badge: 'Soon',
      },
      {
        id: 'marketing',
        label: 'Meta & WhatsApp Ads',
        path: '/marketing',
        icon: 'Megaphone',
        phase2: true,
        badge: 'Soon',
      },
      {
        id: 'projects',
        label: 'Project Delivery Handoff',
        path: '/projects',
        icon: 'FolderKanban',
        phase2: true,
        badge: 'Soon',
      },
      {
        id: 'renewals',
        label: 'AMC & Subscriptions',
        path: '/renewals',
        icon: 'Repeat',
        phase2: true,
        badge: 'Soon',
      },
    ],
  },
];
