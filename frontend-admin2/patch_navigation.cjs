const fs = require('fs');
const file = '/Users/chandanmallik/projects/ckrcrm/frontend-admin2/src/core/config/navigation.js';

const newNav = `// Declarative Navigation Registry for CKR Connect Admin Portal
// Exactly matching Approved Prototype v0.1 (prototype/app.js lines 944-1000)

export const NAVIGATION_SECTIONS = [
  {
    id: 'workspace',
    title: 'Workspace',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        screenId: 'A-02',
        icon: 'dashboard',
      }
    ],
  },
  {
    id: 'crm',
    title: 'CRM & Sales',
    items: [
      {
        id: 'leads',
        label: 'Leads',
        path: '/leads',
        screenId: 'A-03',
        icon: 'leads',
      },
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
      }
    ],
  },
  {
    id: 'team',
    title: 'Team & HR',
    items: [
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
      }
    ]
  },
  {
    id: 'config',
    title: 'Configuration',
    items: [
      {
        id: 'masters',
        label: 'Masters (Tags)',
        path: '/masters',
        screenId: 'A-10',
        icon: 'masters',
      }
    ]
  },
  {
    id: 'upcoming',
    title: 'Upcoming Modules',
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
`;

fs.writeFileSync(file, newNav);
