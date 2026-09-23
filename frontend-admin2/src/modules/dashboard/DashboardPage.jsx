import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetDashboardQuery } from '../../core/api/apiSlice.js';
import DateSlicePicker from '../../core/layout/DateSlicePicker.jsx';
import KpiCard from './components/KpiCard.jsx';
import WaterfallChart from './components/WaterfallChart.jsx';
import LeaderboardTable from './components/LeaderboardTable.jsx';
import ActivityFeed from './components/ActivityFeed.jsx';
import UserAvatarMenu from '../../core/components/UserAvatarMenu.jsx';
import { toast } from '../../core/components/Toast.jsx';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { selectedPreset, dateRange } = useSelector((state) => state.date);

  const { data: resData, isLoading, refetch } = useGetDashboardQuery({
    range: selectedPreset,
    start_date: dateRange?.startDate || undefined,
    end_date: dateRange?.endDate || undefined,
  });

  const dashboardData = resData?.data || {};
  const kpis = dashboardData.kpis || {};
  const funnel = dashboardData.funnel || [];
  const leaderboard = dashboardData.leaderboard || [];
  const recentInteractions = Array.isArray(dashboardData.recent_interactions)
    ? dashboardData.recent_interactions
    : [];

  const activePipelineValue = Number(kpis.active_pipeline_value) || 0;
  const wonRevenue = Number(kpis.won_revenue ?? kpis.won_value) || 0;
  const activeLeadsCount = Number(kpis.active_pipeline_count ?? kpis.total_active_leads) || 0;
  const presentToday = Number(kpis.present_today ?? 0);
  const totalStaff = Number(kpis.total_bdms ?? 0);

  return (
    <>
      {/* Dynamics Command Bar (Screen A-02) */}
      <header className="dynamics-command-bar">
        <div className="command-bar-left">
          <div className="command-bar-title-section">
            <div className="command-bar-breadcrumb">
              <span className="breadcrumb-link" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                CKR Connect
              </span>
              <span className="breadcrumb-sep" style={{ color: 'var(--color-text-secondary)', margin: '0 4px' }}>
                ›
              </span>
              <span className="breadcrumb-current" style={{ color: 'var(--color-text-secondary)' }}>
                Dashboard
              </span>
            </div>
            <div className="command-bar-page-title" style={{ fontSize: '15px', fontWeight: 600 }}>
              Executive Dashboard (Waterfall & Funnel)
            </div>
          </div>
        </div>

        <div className="command-bar-right">
          <DateSlicePicker />

          <button
            className="fluent-btn-command"
            onClick={refetch}
            title="Refresh dashboard metrics"
          >
            <span>🔄 Refresh</span>
          </button>

          {/* Notification Bell */}
          <button
            className="icon-btn-utility"
            onClick={() => toast.info('No unread notifications')}
            title="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z" />
            </svg>
          </button>

          {/* User Avatar with Sign-Out Menu */}
          <UserAvatarMenu />
        </div>
      </header>

      {/* Main Dashboard Canvas (Prototype Screen A-02) */}
      <div className="admin-content-area" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* 4 Fluent KPI Stat Cards */}
        <div className="dashboard-grid">
          {/* Tile 1: Weighted Forecast */}
          <KpiCard
            title="WEIGHTED PIPELINE FORECAST"
            stat={`₹${Math.round(activePipelineValue).toLocaleString('en-IN')}`}
            footer={`Calculated from ${activeLeadsCount} active opportunities`}
            hint="View Active Pipeline"
            onClick={() => navigate('/leads?filter=active')}
            icon={
              <svg width="16" height="16" fill="var(--color-primary)" viewBox="0 0 16 16">
                <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-4zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2z" />
              </svg>
            }
          />

          {/* Tile 2: Closed-Won Revenue */}
          <KpiCard
            title="CLOSED-WON REVENUE (FY)"
            stat={`₹${Math.round(wonRevenue).toLocaleString('en-IN')}`}
            footer="Total bookings collected"
            hint="View Won Deals"
            color="var(--color-success)"
            onClick={() => navigate('/leads?status=won')}
            icon={
              <svg width="16" height="16" fill="var(--color-success)" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
              </svg>
            }
          />

          {/* Tile 3: Active Leads */}
          <KpiCard
            title="ACTIVE LEADS"
            stat={activeLeadsCount}
            footer="Open accounts requiring active engagement"
            hint="Browse All Active Leads"
            onClick={() => navigate('/leads?filter=active')}
            icon={
              <svg width="16" height="16" fill="var(--color-text-secondary)" viewBox="0 0 16 16">
                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
              </svg>
            }
          />

          {/* Tile 4: Attendance in Range */}
          <KpiCard
            title={`ATTENDANCE (${(dateRange?.shortLabel || 'TODAY').toUpperCase()})`}
            stat={`${presentToday} / ${totalStaff} Present`}
            footer="Turn-out rate today"
            hint="Open Attendance Matrix (A-11)"
            color="var(--color-info)"
            onClick={() => navigate('/attendance')}
            icon={
              <svg width="16" height="16" fill="var(--color-info)" viewBox="0 0 16 16">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
              </svg>
            }
          />
        </div>

        {/* Charts & Leaderboard Row */}
        <div className="dashboard-charts-row" style={{ marginTop: '16px' }}>
          <WaterfallChart
            funnel={funnel}
            onStageClick={(stage) => navigate(`/leads?status=${stage}`)}
          />

          <LeaderboardTable leaderboard={leaderboard} />
        </div>

        {/* Live Interaction & Activity Feed */}
        <ActivityFeed interactions={recentInteractions} />
      </div>
    </>
  );
}
