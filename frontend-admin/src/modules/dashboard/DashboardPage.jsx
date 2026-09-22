import { useDispatch, useSelector } from 'react-redux';
import { useGetDashboardQuery } from '../../core/api/apiSlice.js';
import { setDatePreset } from '../../core/store/slices/dateSlice.js';
import CommandBar from '../../core/layout/CommandBar.jsx';
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
} from 'lucide-react';

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export default function DashboardPage() {
  const dispatch = useDispatch();
  const rangePreset = useSelector((state) => state.date.selectedPreset);
  const { data: resData, isLoading, refetch } = useGetDashboardQuery({ range: rangePreset });
  const data = resData?.data;

  const kpis = data?.kpis || {};
  const funnel = data?.funnel || [];
  const leaderboard = data?.leaderboard || [];
  const recentActivity = data?.recent_activity || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <CommandBar
        title="Executive Overview"
        subtitle="Real-time Sales & Operations Performance"
        actions={[
          {
            label: 'Refresh',
            icon: <RefreshCw size={14} className={isLoading ? 'spin' : ''} />,
            onClick: fetchDashboard,
          },
        ]}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Period:
          </span>
          <select
            value={rangePreset}
            onChange={(e) => dispatch(setDatePreset(e.target.value))}
            className="fluent-select"
            style={{ width: '130px', height: '28px', fontSize: '12px' }}
          >
            <option value="today">Today</option>
            <option value="mtd">MTD (Month to Date)</option>
            <option value="qtd">QTD (Quarter)</option>
            <option value="ytd">YTD (Year)</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </CommandBar>

      {/* Main Dashboard Canvas */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Top 4 KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Card 1: Pipeline Value */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              boxShadow: 'var(--shadow-level1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="text-caption" style={{ fontWeight: 600, textTransform: 'uppercase' }}>
                Active Pipeline
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="text-display" style={{ color: 'var(--color-primary)' }}>
              {formatCurrency(kpis.active_pipeline_value)}
            </div>
            <div className="text-caption" style={{ marginTop: '6px' }}>
              Across {kpis.total_active_leads || 0} active opportunities
            </div>
          </div>

          {/* Card 2: Won Value vs Target */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              boxShadow: 'var(--shadow-level1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="text-caption" style={{ fontWeight: 600, textTransform: 'uppercase' }}>
                Closed Won Revenue
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--color-success-bg)',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Target size={18} />
              </div>
            </div>
            <div className="text-display" style={{ color: 'var(--color-success)' }}>
              {formatCurrency(kpis.won_value)}
            </div>
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Target: {formatCurrency(kpis.total_target)}</span>
                <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{kpis.target_achievement_pct || 0}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--color-surface-alt)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, kpis.target_achievement_pct || 0)}%`,
                    backgroundColor: 'var(--color-success)',
                    borderRadius: '3px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Team Attendance */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              boxShadow: 'var(--shadow-level1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="text-caption" style={{ fontWeight: 600, textTransform: 'uppercase' }}>
                BDM Attendance Today
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: '#EFF6FC',
                  color: '#0078D4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={18} />
              </div>
            </div>
            <div className="text-display">
              {kpis.present_today || 0}{' '}
              <span style={{ fontSize: '16px', color: 'var(--color-text-secondary)', fontWeight: 400 }}>
                / {kpis.active_bdms || 0} Present
              </span>
            </div>
            <div className="text-caption" style={{ marginTop: '6px' }}>
              {kpis.active_bdms ? Math.round(((kpis.present_today || 0) / kpis.active_bdms) * 100) : 0}% turn-out rate today
            </div>
          </div>

          {/* Card 4: Deals In Play */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              boxShadow: 'var(--shadow-level1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="text-caption" style={{ fontWeight: 600, textTransform: 'uppercase' }}>
                Pipeline Volume
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--color-warning-bg)',
                  color: '#797673',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Briefcase size={18} />
              </div>
            </div>
            <div className="text-display">{kpis.total_active_leads || 0}</div>
            <div className="text-caption" style={{ marginTop: '6px' }}>
              Open customer accounts requiring engagement
            </div>
          </div>
        </div>

        {/* Middle Section: Funnel Waterfall & Leaderboard */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Sales Pipeline Funnel */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px',
              boxShadow: 'var(--shadow-level1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 className="text-subtitle">Pipeline Conversion Waterfall</h2>
              <span className="text-caption">By Deal Stage</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {funnel.map((item) => (
                <div key={item.status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StatusBadge status={item.status} size="small" />
                      <span style={{ fontWeight: 500 }}>{item.count} leads</span>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {formatCurrency(item.total_value)}
                    </span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--color-surface-alt)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, Math.max(5, (Number(item.count) / Math.max(1, kpis.total_active_leads || 1)) * 100))}%`,
                        backgroundColor:
                          item.status === 'WON'
                            ? 'var(--color-success)'
                            : item.status === 'LOST'
                            ? 'var(--color-error)'
                            : 'var(--color-primary)',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BDM Performance Leaderboard */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px',
              boxShadow: 'var(--shadow-level1)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 className="text-subtitle">BDM Quota Leaderboard</h2>
              <Award size={18} color="var(--color-primary)" />
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', textAlign: 'left' }}>
                    <th style={{ padding: '6px 8px', width: '36px' }}>#</th>
                    <th style={{ padding: '6px 8px' }}>BDM</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' }}>Won Revenue</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' }}>Target</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' }}>Achieved</th>
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
                      <tr key={bdm.id} style={{ borderBottom: '1px solid var(--color-border)', height: '36px' }}>
                        <td style={{ padding: '6px 8px', fontWeight: 700, color: idx === 0 ? '#D89B00' : 'inherit' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '6px 8px', fontWeight: 600 }}>{bdm.full_name}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--color-success)', fontWeight: 600 }}>
                          {formatCurrency(bdm.won_amount)}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                          {formatCurrency(bdm.sales_target)}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: (bdm.target_achievement_pct || 0) >= 100 ? 'var(--color-success-bg)' : 'var(--color-surface-alt)',
                              color: (bdm.target_achievement_pct || 0) >= 100 ? 'var(--color-success)' : 'var(--color-text-primary)',
                              fontWeight: 700,
                              fontSize: '11px',
                            }}
                          >
                            {bdm.target_achievement_pct || 0}%
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

        {/* Recent Activity Ledger */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '20px',
            boxShadow: 'var(--shadow-level1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 className="text-subtitle">Live Activity Feed</h2>
            <span className="text-caption">Latest customer interactions recorded by BDMs</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentActivity.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                No recent interactions recorded
              </div>
            ) : (
              recentActivity.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: 'var(--color-surface-alt)',
                    borderRadius: 'var(--radius-xs)',
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
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}
                    >
                      {act.interaction_type}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600 }}>{act.lead_title || act.company_name}</span>
                      <span style={{ color: 'var(--color-text-secondary)', marginLeft: '6px' }}>
                        logged by <strong style={{ color: 'var(--color-text-primary)' }}>{act.bdm_name}</strong>
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                    <Clock size={13} />
                    <span>{new Date(act.created_at).toLocaleString()}</span>
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
