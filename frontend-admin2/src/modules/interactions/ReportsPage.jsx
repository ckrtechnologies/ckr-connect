import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetInteractionsQuery, useGetDailySummaryQuery, useGetStaffQuery, useGetLeadsQuery } from '../../core/api/apiSlice.js';
import DateSlicePicker from '../../core/layout/DateSlicePicker.jsx';
import interactionsApi from './api.js';
import UserAvatarMenu from '../../core/components/UserAvatarMenu.jsx';
import { toast } from '../../core/components/Toast.jsx';

export default function ReportsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'interactions';
  const { dateRange } = useSelector((state) => state.date);

  const [followupBdmFilter, setFollowupBdmFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [bdmFilter, setBdmFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: interactionsRes, isLoading, refetch } = useGetInteractionsQuery({
    start_date: dateRange?.startDate || undefined,
    end_date: dateRange?.endDate || undefined,
  });
  const { data: summaryRes } = useGetDailySummaryQuery({
    start_date: dateRange?.startDate || undefined,
    end_date: dateRange?.endDate || undefined,
  });
  const { data: staffRes } = useGetStaffQuery();
  const { data: followupsRes, isLoading: isLoadingFollowups } = useGetLeadsQuery({ has_followup: true, limit: 1000 });

  const allInteractions = useMemo(() => {
    if (Array.isArray(interactionsRes?.data?.items)) return interactionsRes.data.items;
    if (Array.isArray(interactionsRes?.data)) return interactionsRes.data;
    return [];
  }, [interactionsRes]);

  const bdms = useMemo(() => {
    const list = Array.isArray(staffRes?.data?.users)
      ? staffRes.data.users
      : Array.isArray(staffRes?.data)
      ? staffRes.data
      : [];
    // Allow both admins and bdms to appear in the filter, 
    // since admins can also log interactions.
    return list;
  }, [staffRes]);

  const summary = summaryRes?.data?.summary || summaryRes?.data || {};

  const followups = useMemo(() => {
    let list = [];
    if (Array.isArray(followupsRes?.data?.items)) list = followupsRes.data.items;
    else if (Array.isArray(followupsRes?.data?.leads)) list = followupsRes.data.leads;
    else if (Array.isArray(followupsRes?.data?.data)) list = followupsRes.data.data;
    else if (Array.isArray(followupsRes?.data)) list = followupsRes.data;
    
    if (dateRange?.startDate && dateRange?.endDate) {
      list = list.filter(f => {
        if (!f.next_followup_date) return false;
        try {
          const d = new Date(f.next_followup_date).toISOString().slice(0, 10);
          return d >= dateRange.startDate && d <= dateRange.endDate;
        } catch(e) {
          return false;
        }
      });
    }

    if (followupBdmFilter !== 'all') {
      list = list.filter(f => f.assigned_to === followupBdmFilter);
    }
    
    return list;
  }, [followupsRes, dateRange, followupBdmFilter]);

  // Filtering
  const filteredInteractions = useMemo(() => {
    return allInteractions.filter((i) => {
      const ch = (i.channel || i.type || 'call').toLowerCase();
      if (channelFilter !== 'all' && ch !== channelFilter) return false;
      if (bdmFilter !== 'all' && i.bdm_id !== bdmFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const contactMatch = (i.lead_name || i.company_name || '').toLowerCase().includes(q);
        const notesMatch = (i.discussion_notes || i.notes || '').toLowerCase().includes(q);
        const bdmMatch = (i.bdm_name || '').toLowerCase().includes(q);
        const actionMatch = (i.next_action || '').toLowerCase().includes(q);
        if (!contactMatch && !notesMatch && !bdmMatch && !actionMatch) return false;
      }
      return true;
    });
  }, [allInteractions, channelFilter, bdmFilter, searchQuery]);

  // Counts
  const totalCount = allInteractions.length;
  const callCount = allInteractions.filter((i) => (i.channel || i.type) === 'call').length;
  const waCount = allInteractions.filter((i) => (i.channel || i.type) === 'whatsapp').length;
  const demoCount = allInteractions.filter((i) => (i.channel || i.type) === 'meeting').length;
  const visitCount = allInteractions.filter((i) => (i.channel || i.type) === 'site_visit').length;

  const positiveCount = allInteractions.filter((i) => {
    const res = (i.call_result_type || i.outcome || '').toLowerCase();
    return res === 'positive' || res.includes('interested') || res.includes('won') || res.includes('demo');
  }).length;

  const neutralCount = totalCount - positiveCount;

  const handleExportCsv = async () => {
    try {
      toast.info('Exporting Daily Calling Ledger...');
      const blob = await interactionsApi.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interactions_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Calling Ledger exported to CSV');
    } catch {
      toast.error('Failed to export ledger CSV');
    }
  };

  const getPageTitle = () => {
    if (activeTab === 'daily') return 'Daily Interaction Activity Report';
    if (activeTab === 'export') return 'Ledger Data Export & Analytics';
    return 'Daily Interaction History & Calling Ledger';
  };

  return (
    <>
      {/* Dynamics Command Bar (Screen A-19 / A-16 / A-15) */}
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
                Reports
              </span>
            </div>
            <div className="command-bar-page-title" style={{ fontSize: '15px', fontWeight: 600 }}>
              {getPageTitle()}
            </div>
          </div>

          <div className="command-bar-actions">
            <button className="fluent-btn-command primary-cmd" onClick={handleExportCsv} title="Download CSV ledger">
              📥 Export CSV
            </button>
            <button className="fluent-btn-command" onClick={refetch} title="Refresh interactions">
              🔄 Refresh
            </button>
          </div>
        </div>

        <div className="command-bar-right">
          <DateSlicePicker />
          <UserAvatarMenu />
        </div>
      </header>

      {/* Main Content Area (Screen A-19) */}
      <div className="admin-content-area" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {activeTab === 'export' && (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--color-text-secondary)' }}>
            <h3>Data Export & Analytics</h3>
            <p>Coming soon: Advanced filters and bulk CSV exports.</p>
          </div>
        )}

        {activeTab === 'followup' && (
          <div className="fluent-grid-container">
            <div className="fluent-grid-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Pending Follow-ups ({followups.length})</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Filter by BDM:</span>
                <select 
                  className="form-field-input" 
                  style={{ width: '150px', height: '26px', fontSize: '12px', padding: '0 8px' }}
                  value={followupBdmFilter}
                  onChange={e => setFollowupBdmFilter(e.target.value)}
                >
                  <option value="all">All BDMs</option>
                  {bdms.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="fluent-grid-table">
                <thead>
                  <tr>
                    <th>Lead Name</th>
                    <th>Company</th>
                    <th>Next Follow-up</th>
                    <th>Assigned To</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingFollowups ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
                        Loading follow-ups...
                      </td>
                    </tr>
                  ) : followups.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
                        No pending follow-ups found.
                      </td>
                    </tr>
                  ) : (
                    followups.map(f => (
                      <tr key={f.id}>
                        <td>
                          <strong>{f.name}</strong>
                          {f.status && (
                            <span
                              className={`status-badge ${f.status === 'won' ? 'won' : f.status === 'invalid' ? 'invalid' : ''}`}
                              style={{ marginLeft: '8px', fontSize: '10px', textTransform: 'uppercase' }}
                            >
                              {f.status.replace('_', ' ')}
                            </span>
                          )}
                        </td>
                        <td>{f.company_name || '—'}</td>
                        <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                          {f.next_followup_date ? new Date(f.next_followup_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                        </td>
                        <td>{f.assigned_bdm_name || 'Unassigned'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="fluent-btn fluent-btn-primary"
                            style={{ height: '26px', fontSize: '11px', padding: '0 8px', color: '#ffffff' }}
                            onClick={() => navigate(`/leads/${f.id}`)}
                          >
                            View Lead
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'interactions' && (
        <>
        {/* Sub-Header Notice */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Showing chronological calling ledger, WhatsApp interactions, and client demos ({totalCount} total records)
          </span>
        </div>

        {/* 4 Fluent KPI Stat Cards */}
        <div className="dashboard-grid">
          <div className="fluent-tile-card" style={{ padding: '14px', gap: '4px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
              TOTAL INTERACTIONS
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)' }}>
              {totalCount}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              {callCount} calls · {waCount} WA · {demoCount + visitCount} demos/visits
            </div>
          </div>

          <div className="fluent-tile-card" style={{ padding: '14px', gap: '4px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
              🟢 POSITIVE OUTCOMES
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-success)' }}>
              {positiveCount}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              Agreements, demos booked, high interest
            </div>
          </div>

          <div className="fluent-tile-card" style={{ padding: '14px', gap: '4px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
              🟡 IN PROGRESS / FOLLOW-UPS
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#795B00' }}>
              {neutralCount}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              Callbacks requested, discussions pending
            </div>
          </div>

          <div className="fluent-tile-card" style={{ padding: '14px', gap: '4px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
              ACTIVE TELECALLERS
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#004578' }}>
              {new Set(allInteractions.map((i) => i.bdm_id).filter(Boolean)).size} / {bdms.length || 1}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              Sales staff logging activities
            </div>
          </div>
        </div>

        {/* BDM Filter Strip (Sales Staff Filter) */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
              Filter by Sales Staff (BDM):
            </span>
            <button
              type="button"
              className={`ledger-pill-btn ${bdmFilter === 'all' ? 'active' : ''}`}
              onClick={() => setBdmFilter('all')}
            >
              All BDMs ({totalCount})
            </button>
            {bdms.map((u) => {
              const uCount = allInteractions.filter((i) => i.bdm_id === u.id).length;
              return (
                <button
                  type="button"
                  key={u.id}
                  className={`ledger-pill-btn ${bdmFilter === u.id ? 'active' : ''}`}
                  onClick={() => setBdmFilter(u.id)}
                >
                  👤 {u.name} ({uCount})
                </button>
              );
            })}
          </div>

          {bdmFilter !== 'all' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="fluent-btn fluent-btn-secondary"
                style={{ height: '26px', fontSize: '11px', padding: '0 8px' }}
                onClick={() => navigate(`/leads?bdm=${bdmFilter}`)}
              >
                View Staff's Assigned Leads ›
              </button>
            </div>
          )}
        </div>

        {/* Channel Filter Chips & Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div className="ledger-filter-chips">
            <button
              type="button"
              className={`ledger-pill-btn ${channelFilter === 'all' ? 'active' : ''}`}
              onClick={() => setChannelFilter('all')}
            >
              All Channels ({allInteractions.length})
            </button>
            <button
              type="button"
              className={`ledger-pill-btn ${channelFilter === 'call' ? 'active' : ''}`}
              onClick={() => setChannelFilter('call')}
            >
              📞 Calls ({callCount})
            </button>
            <button
              type="button"
              className={`ledger-pill-btn ${channelFilter === 'whatsapp' ? 'active' : ''}`}
              onClick={() => setChannelFilter('whatsapp')}
            >
              💬 WhatsApp ({waCount})
            </button>
            <button
              type="button"
              className={`ledger-pill-btn ${channelFilter === 'meeting' ? 'active' : ''}`}
              onClick={() => setChannelFilter('meeting')}
            >
              🎥 Demos ({demoCount})
            </button>
            <button
              type="button"
              className={`ledger-pill-btn ${channelFilter === 'site_visit' ? 'active' : ''}`}
              onClick={() => setChannelFilter('site_visit')}
            >
              🏢 Site Visits ({visitCount})
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              className="form-field-input"
              placeholder="Search contact, notes, next action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: '30px', width: '260px', fontSize: '12px' }}
            />
          </div>
        </div>

        {/* Dense Calling Ledger Table */}
        <div className="fluent-grid-container">
          <div className="fluent-grid-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              Chronological Activity Ledger ({filteredInteractions.length} records)
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="fluent-grid-table">
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>Timestamp</th>
                  <th style={{ width: '160px' }}>BDM Executive</th>
                  <th style={{ minWidth: '180px' }}>Contact / Institution</th>
                  <th style={{ width: '130px' }}>Channel</th>
                  <th style={{ width: '150px' }}>Outcome</th>
                  <th style={{ minWidth: '240px' }}>Discussion Notes</th>
                  <th style={{ minWidth: '160px' }}>Next Action</th>
                  <th style={{ width: '80px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
                      Loading activity ledger...
                    </td>
                  </tr>
                ) : filteredInteractions.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
                      No interactions recorded for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredInteractions.map((i) => {
                    const ch = (i.channel || i.type || 'call').toLowerCase();
                    const typeIcon = ch === 'call' ? '📞' : ch === 'whatsapp' ? '💬' : ch === 'meeting' ? '🎥' : ch === 'site_visit' ? '🏢' : '📝';
                    const typeLabel = ch === 'call' ? 'Call' : ch === 'whatsapp' ? 'WhatsApp' : ch === 'meeting' ? 'Demo' : ch === 'site_visit' ? 'Site Visit' : 'Note';

                    const outcome = i.outcome || i.call_result || i.call_result_type || 'neutral';
                    const notes = i.discussion_notes || i.notes || '—';

                    return (
                      <tr key={i.id}>
                        <td style={{ fontSize: '11px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                          {i.created_at ? new Date(i.created_at).toLocaleString() : '—'}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="ledger-pill-btn"
                            onClick={() => navigate(`/leads?bdm=${i.bdm_id}`)}
                            title={`Filter leads assigned to ${i.bdm_name}`}
                            style={{ background: '#E8F4FC', color: '#004578', fontWeight: 600, borderColor: '#C7E0F4', fontSize: '11px', padding: '2px 8px', cursor: 'pointer' }}
                          >
                            👤 {i.bdm_name || 'Staff Member'}
                          </button>
                        </td>
                        <td>
                          <span
                            onClick={() => i.lead_id && navigate(`/leads/${i.lead_id}`)}
                            style={{ cursor: i.lead_id ? 'pointer' : 'default', color: i.lead_id ? 'var(--color-primary)' : 'inherit', fontWeight: 600 }}
                          >
                            {i.lead_name || i.company_name || '—'}
                          </span>
                          {i.company_name && i.lead_name && i.company_name !== i.lead_name && (
                            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{i.company_name}</div>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: ch === 'call' ? '#EBF3FC' : ch === 'whatsapp' ? '#DFF6DD' : ch === 'meeting' ? '#F3E8FF' : '#FFF4CE',
                              color: ch === 'call' ? '#0078D4' : ch === 'whatsapp' ? '#107C41' : ch === 'meeting' ? '#6E56CF' : '#795B00',
                            }}
                          >
                            <span>{typeIcon}</span>
                            <span>{typeLabel}</span>
                          </span>
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              fontSize: '10px',
                              textTransform: 'uppercase',
                            }}
                          >
                            {outcome.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ maxWidth: '300px', fontSize: '12px', whiteSpace: 'normal', lineHeight: 1.3 }}>
                          {notes}
                        </td>
                        <td style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 500 }}>
                          {i.next_action || i.next_followup_date || 'None scheduled'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {i.lead_id ? (
                            <button
                              type="button"
                              className="fluent-btn fluent-btn-secondary"
                              style={{ height: '24px', fontSize: '11px', padding: '0 8px' }}
                              onClick={() => navigate(`/leads/${i.lead_id}`)}
                            >
                              View ›
                            </button>
                          ) : (
                            <span style={{ color: 'var(--color-text-disabled)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </div>
    </>
  );
}
