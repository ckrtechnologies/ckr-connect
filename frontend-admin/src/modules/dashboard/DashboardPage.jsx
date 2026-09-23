import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetDashboardQuery, useGetAttendanceMatrixQuery, useGetInteractionsQuery } from '../../core/api/apiSlice.js';
import { setDatePreset } from '../../core/store/slices/dateSlice.js';
import CommandBar from '../../core/layout/CommandBar.jsx';
import DateSlicePicker from '../../core/layout/DateSlicePicker.jsx';
import StatusBadge from '../../core/components/StatusBadge.jsx';
import {
  TrendingUp,
  Target,
  Users,
  Briefcase,
  RefreshCw,
  Award,
  Clock,
  ArrowRight,
  Phone,
  MessageSquare,
  Video,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

const STAGE_CONFIG = [
  { key: 'new', label: 'New', color: '#0078D4', prob: '10%' },
  { key: 'contacted', label: 'Contacted', color: '#2B88D8', prob: '25%' },
  { key: 'follow_up', label: 'Follow Up', color: '#FFB900', prob: '40%' },
  { key: 'proposal', label: 'Proposal', color: '#8764B8', prob: '60%' },
  { key: 'won', label: 'Won', color: '#107C41', prob: '100%' },
  { key: 'lost', label: 'Lost', color: '#D83B01', prob: '0%' },
  { key: 'invalid', label: 'Invalid', color: '#A19F9D', prob: '0%' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const rangePreset = useSelector((state) => state.date.selectedPreset);
  const selectedDate = useSelector((state) => state.date.selectedDate);

  const { data: resData, isLoading, refetch } = useGetDashboardQuery({ range: rangePreset });
  const { data: attendanceRes } = useGetAttendanceMatrixQuery({});
  const { data: interactionsRes } = useGetInteractionsQuery({ limit: 6 });

  const data = resData?.data;
  const kpis = data?.kpis || {};
  const rawFunnel = data?.funnel || [];
  const rawLeaderboard = data?.leaderboard || [];

  // Active pipeline & won calculations
  const activePipelineValue = Number(kpis.active_pipeline_value) || 0;
  const wonRevenue = Number(kpis.won_revenue ?? kpis.won_value) || 0;
  const activeLeadsCount = Number(kpis.active_pipeline_count ?? kpis.total_active_leads ?? kpis.total_leads) || 0;
  const winRate = Number(kpis.win_rate_percent) || 0;

  // Attendance stats fallback from attendance API if available
  const matrixUsers = attendanceRes?.data?.matrix || attendanceRes?.data || [];
  const totalStaffCount = matrixUsers.length || 4;
  const presentCount = attendanceRes?.data?.stats?.present_today ?? (kpis.present_today || 3);

  // Normalize funnel to 7 stages
  const funnelMap = {};
  rawFunnel.forEach((f) => {
    const stKey = String(f.status || '').toLowerCase();
    funnelMap[stKey] = {
      count: Number(f.count) || 0,
      value: Number(f.total_expected_value ?? f.total_value ?? f.total_won_amount) || 0,
    };
  });

  const maxStageCount = Math.max(1, ...STAGE_CONFIG.map((s) => funnelMap[s.key]?.count || 0));

  // Normalize leaderboard
  const leaderboard = rawLeaderboard.map((bdm) => ({
    id: bdm.id || bdm.bdm_id,
    employee_id: bdm.employee_id,
    name: bdm.bdm_name || bdm.full_name || bdm.name || 'BDM Executive',
    wonAmount: Number(bdm.achieved_amount ?? bdm.won_amount) || 0,
    targetAmount: Number(bdm.target_amount ?? bdm.sales_target) || 0,
    achievementPct: Number(bdm.target_achievement_percent ?? bdm.target_achievement_pct) || 0,
    interactions: Number(bdm.total_interactions) || 0,
    meetings: Number(bdm.meetings_held ?? bdm.meetings) || 0,
  }));

  // Normalize recent interactions
  const recentInteractions = Array.isArray(interactionsRes?.data?.items)
    ? interactionsRes.data.items
    : (Array.isArray(interactionsRes?.data) ? interactionsRes.data : []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Authentic Dynamics Command Bar (Screen A-02) */}
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
            <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Canvas (Authentic Prototype Styling) */}
      <div className="admin-content-area" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* 4 Authentic Fluent KPI Stat Cards */}
        <div className="dashboard-grid">
          {/* Tile 1: Weighted Forecast */}
          <div
            className="fluent-tile-card interactive-tile"
            onClick={() => navigate('/leads')}
            title="Click to view all Pipeline Leads"
          >
            <div className="tile-header">
              <span>WEIGHTED PIPELINE FORECAST</span>
              <TrendingUp size={16} color="var(--color-primary)" />
            </div>
            <div className="tile-big-stat">{formatCurrency(activePipelineValue)}</div>
            <div className="tile-footer">Calculated from {activeLeadsCount} active opportunities</div>
            <div className="interactive-tile-hint">View Pipeline Breakdown ›</div>
          </div>

          {/* Tile 2: Closed-Won Revenue */}
          <div
            className="fluent-tile-card interactive-tile"
            onClick={() => navigate('/leads')}
            title="Click to view Closed-Won deals"
          >
            <div className="tile-header">
              <span>CLOSED-WON REVENUE (FY)</span>
              <Target size={16} color="var(--color-success)" />
            </div>
            <div className="tile-big-stat" style={{ color: 'var(--color-success)' }}>
              {formatCurrency(wonRevenue)}
            </div>
            <div className="tile-footer">
              Win rate: <strong style={{ color: 'var(--color-text-primary)', marginLeft: '4px' }}>{winRate}%</strong>
            </div>
            <div className="interactive-tile-hint" style={{ color: 'var(--color-success)' }}>
              View Won Deals ›
            </div>
          </div>

          {/* Tile 3: Active Leads */}
          <div
            className="fluent-tile-card interactive-tile"
            onClick={() => navigate('/leads')}
            title="Click to open Lead Management"
          >
            <div className="tile-header">
              <span>ACTIVE LEADS IN PLAY</span>
              <Briefcase size={16} color="var(--color-text-secondary)" />
            </div>
            <div className="tile-big-stat">{activeLeadsCount}</div>
            <div className="tile-footer">
              Open accounts requiring active engagement
            </div>
            <div className="interactive-tile-hint">Browse All Active Leads ›</div>
          </div>

          {/* Tile 4: Attendance in Range */}
          <div
            className="fluent-tile-card interactive-tile"
            onClick={() => navigate('/attendance')}
            title="Click to open Attendance Matrix"
          >
            <div className="tile-header">
              <span>BDM ATTENDANCE TODAY</span>
              <Users size={16} color="var(--color-info)" />
            </div>
            <div className="tile-big-stat">
              {presentCount} / {totalStaffCount} Present
            </div>
            <div className="tile-footer">
              {totalStaffCount > 0 ? Math.round((presentCount / totalStaffCount) * 100) : 0}% turn-out rate today
            </div>
            <div className="interactive-tile-hint" style={{ color: 'var(--color-info)' }}>
              Open Attendance Matrix (A-11) ›
            </div>
          </div>
        </div>

        {/* Charts Row: Waterfall by Stage + BDM Performance Leaderboard */}
        <div className="dashboard-charts-row">
          {/* Waterfall Chart (Prototype Authentic Styling) */}
          <div className="fluent-tile-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span className="tile-header" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'none', color: 'var(--color-text-primary)' }}>
                Pipeline Waterfall by Stage
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600 }}>
                Live Deal Stages
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Distribution of prospective institutions across active qualification gates
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {STAGE_CONFIG.map((st) => {
                const stData = funnelMap[st.key] || { count: 0, value: 0 };
                const pct = Math.round((stData.count / maxStageCount) * 100);
                return (
                  <div
                    key={st.key}
                    onClick={() => navigate('/leads')}
                    className="waterfall-bar-row interactive-bar"
                    title={`Stage: ${st.label} (${stData.count} leads, ${formatCurrency(stData.value)})`}
                  >
                    <div className="waterfall-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: st.color,
                        }}
                      />
                      <span>{st.label}</span>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>({st.prob})</span>
                    </div>

                    <div className="waterfall-bar-track">
                      <div
                        className="waterfall-bar-fill"
                        style={{
                          width: `${Math.max(8, pct)}%`,
                          backgroundColor: st.color,
                        }}
                      >
                        {stData.count > 0 ? `${stData.count}` : ''}
                      </div>
                    </div>

                    <div style={{ width: '90px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {formatCurrency(stData.value)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BDM Leaderboard (Prototype Authentic Styling) */}
          <div className="fluent-tile-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span className="tile-header" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'none', color: 'var(--color-text-primary)' }}>
                BDM Performance Leaderboard
              </span>
              <a
                onClick={() => navigate('/staff')}
                style={{ fontSize: '11px', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                View Staff (A-08) ›
              </a>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
              Closed revenue, active pipeline, and quota achievements per executive
            </div>

            <div className="leaderboard-table-container" style={{ overflowX: 'auto' }}>
              <table className="fluent-grid-table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '36px' }}>#</th>
                    <th>Executive</th>
                    <th style={{ textAlign: 'right' }}>Won (₹)</th>
                    <th style={{ textAlign: 'right' }}>Target</th>
                    <th style={{ textAlign: 'center' }}>Achieved</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                        No BDM records available
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((bdm, idx) => (
                      <tr
                        key={bdm.id || idx}
                        className="leaderboard-row interactive-row"
                        onClick={() => navigate('/leads')}
                      >
                        <td style={{ fontWeight: 700, color: idx === 0 ? '#D89B00' : 'inherit' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: idx === 0 ? '#FFF4CE' : 'var(--color-surface-alt)',
                              color: idx === 0 ? '#795B00' : 'inherit',
                              fontSize: '11px',
                            }}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          <div>{bdm.name}</div>
                          {bdm.employee_id && (
                            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                              {bdm.employee_id}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--color-success)', fontWeight: 600 }}>
                          {formatCurrency(bdm.wonAmount)}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                          {formatCurrency(bdm.targetAmount)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: bdm.achievementPct >= 100 ? 'var(--color-success-bg)' : 'var(--color-surface-alt)',
                              color: bdm.achievementPct >= 100 ? 'var(--color-success)' : 'var(--color-text-primary)',
                              fontSize: '10px',
                            }}
                          >
                            {bdm.achievementPct}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live Calling & Interaction Ledger (Prototype Screen A-19 / A-02 Section) */}
        <div className="dashboard-ledger-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 className="text-subtitle" style={{ fontSize: '14px', fontWeight: 600 }}>
                Live Interaction & Activity Feed
              </h2>
              <span className="text-caption">Latest customer interactions recorded by BDMs across Voice, WhatsApp, and Meetings</span>
            </div>
            <button
              onClick={() => navigate('/reports')}
              className="fluent-btn fluent-btn-secondary"
              style={{ height: '28px', fontSize: '12px' }}
            >
              Full Calling Ledger (A-19) ›
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentInteractions.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                No recent interactions recorded in system
              </div>
            ) : (
              recentInteractions.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: 'var(--color-surface-alt)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--color-border)',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: act.channel === 'call' || act.type === 'call' ? '#0078D4' : '#107C10',
                      }}
                    >
                      {act.channel || act.type || act.interaction_type || 'CALL'}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {act.lead_title || act.company_name || 'Prospect Lead'}
                      </span>
                      <span style={{ color: 'var(--color-text-secondary)', marginLeft: '8px', fontSize: '12px' }}>
                        logged by <strong style={{ color: 'var(--color-text-primary)' }}>{act.bdm_name || 'BDM'}</strong>
                      </span>
                      {act.notes && (
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px', maxWidth: '600px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {act.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                    <Clock size={12} />
                    <span>{act.created_at ? new Date(act.created_at).toLocaleString('en-IN') : 'Recent'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
