import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './core/context/AuthContext.jsx';
import { BootstrapProvider } from './core/context/BootstrapContext.jsx';
import AdminLayout from './core/layout/AdminLayout.jsx';

// Modules
import LoginPage from './modules/auth/LoginPage.jsx';
import DashboardPage from './modules/dashboard/DashboardPage.jsx';
import LeadsPage from './modules/leads/LeadsPage.jsx';
import LeadDetailPage from './modules/leads/LeadDetailPage.jsx';
import StaffPage from './modules/staff/StaffPage.jsx';
import AttendancePage from './modules/attendance/AttendancePage.jsx';
import MastersPage from './modules/masters/MastersPage.jsx';
import ReportsPage from './modules/interactions/ReportsPage.jsx';
import AccountsPage from './modules/accounts/AccountsPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BootstrapProvider>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Enterprise Admin Shell (Approved Prototype v0.1) */}
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/leads/:id" element={<LeadDetailPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/masters" element={<MastersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BootstrapProvider>
    </AuthProvider>
  );
}
