import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ActivityFeed({ interactions = [] }) {
  const navigate = useNavigate();
  const [activeChannel, setActiveChannel] = useState('all');

  const callCount = interactions.filter((i) => (i.channel || i.type) === 'call').length;
  const waCount = interactions.filter((i) => (i.channel || i.type) === 'whatsapp').length;
  const demoCount = interactions.filter((i) => (i.channel || i.type) === 'meeting').length;
  const visitCount = interactions.filter((i) => (i.channel || i.type) === 'site_visit').length;

  const filteredInteractions = activeChannel === 'all'
    ? interactions
    : interactions.filter((i) => (i.channel || i.type) === activeChannel);

  const positiveCount = interactions.filter((i) => {
    const res = (i.call_result_type || i.outcome || '').toLowerCase();
    return res === 'positive' || res.includes('interested') || res.includes('won') || res.includes('demo');
  }).length;

  const neutralCount = interactions.length - positiveCount;

  return (
    <div className="fluent-tile-card" style={{ marginTop: '16px', padding: '16px' }}>
      {/* Section Header with Channel Filter Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🌊</span>
            <span>Daily Interaction History & Calling Ledger</span>
            <span style={{ fontSize: '11px', fontWeight: 700, background: '#E8F4FC', color: '#004578', padding: '2px 8px', borderRadius: '10px', border: '1px solid #C7E0F4' }}>
              {interactions.length} Activities
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Real-time chronological activity feed of phone calls, WhatsApp messages, video demos, and client visits
          </div>
        </div>

        {/* Channel Filter Chips */}
        <div className="ledger-filter-chips">
          <button
            type="button"
            className={`ledger-pill-btn ${activeChannel === 'all' ? 'active' : ''}`}
            onClick={() => setActiveChannel('all')}
          >
            All Channels ({interactions.length})
          </button>
          <button
            type="button"
            className={`ledger-pill-btn ${activeChannel === 'call' ? 'active' : ''}`}
            onClick={() => setActiveChannel('call')}
          >
            📞 Calls ({callCount})
          </button>
          <button
            type="button"
            className={`ledger-pill-btn ${activeChannel === 'whatsapp' ? 'active' : ''}`}
            onClick={() => setActiveChannel('whatsapp')}
          >
            💬 WhatsApp ({waCount})
          </button>
          <button
            type="button"
            className={`ledger-pill-btn ${activeChannel === 'meeting' ? 'active' : ''}`}
            onClick={() => setActiveChannel('meeting')}
          >
            🎥 Demos ({demoCount})
          </button>
          <button
            type="button"
            className={`ledger-pill-btn ${activeChannel === 'site_visit' ? 'active' : ''}`}
            onClick={() => setActiveChannel('site_visit')}
          >
            🏢 Site Visits ({visitCount})
          </button>
        </div>
      </div>

      {/* Summary Metric Strip */}
      <div className="ledger-summary-strip" style={{ margin: '12px 0' }}>
        <div><span style={{ color: 'var(--color-text-secondary)' }}>Total Logged:</span> <strong style={{ color: 'var(--color-primary)' }}>{interactions.length}</strong></div>
        <div><span style={{ color: 'var(--color-text-secondary)' }}>🟢 Positive Outcomes:</span> <strong style={{ color: 'var(--color-success)' }}>{positiveCount}</strong></div>
        <div><span style={{ color: 'var(--color-text-secondary)' }}>🟡 In Progress / Follow-ups:</span> <strong style={{ color: '#795B00' }}>{neutralCount}</strong></div>
        <div><span style={{ color: 'var(--color-text-secondary)' }}>👥 Demos & Visits:</span> <strong style={{ color: '#004578' }}>{demoCount + visitCount}</strong></div>
      </div>

      {/* Daily Interactions Table */}
      {filteredInteractions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--color-border)' }}>
          <div style={{ fontSize: '24px', marginBottom: '6px' }}>📅</div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>No interactions recorded for this filter</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
          <table className="ledger-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Time</th>
                <th style={{ width: '140px' }}>BDM Staff</th>
                <th style={{ minWidth: '180px' }}>Contact & Institution</th>
                <th style={{ width: '120px' }}>Channel</th>
                <th style={{ minWidth: '150px' }}>Call Outcome</th>
                <th style={{ minWidth: '220px' }}>Discussion Notes</th>
                <th style={{ minWidth: '160px' }}>Next Action</th>
                <th style={{ width: '90px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInteractions.map((item) => {
                const ch = (item.channel || item.type || 'call').toLowerCase();
                const typeIcon = ch === 'call' ? '📞' : ch === 'whatsapp' ? '💬' : ch === 'meeting' ? '🎥' : ch === 'site_visit' ? '🏢' : '📝';
                const typeLabel = ch === 'call' ? 'Call' : ch === 'whatsapp' ? 'WhatsApp' : ch === 'meeting' ? 'Demo' : ch === 'site_visit' ? 'Visit' : 'Note';

                const resultType = item.call_result_type || 'neutral';
                const outcomeText = (item.outcome || item.call_result || 'Completed').replace('_', ' ');

                return (
                  <tr key={item.id}>
                    <td style={{ fontSize: '11px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td>
                      <span
                        className="ledger-pill-btn"
                        onClick={() => navigate(`/leads?bdm=${item.bdm_id}`)}
                        title={`Filter leads assigned to ${item.bdm_name}`}
                        style={{ background: '#E8F4FC', color: '#004578', fontWeight: 600, borderColor: '#C7E0F4', fontSize: '11px', padding: '2px 8px', cursor: 'pointer' }}
                      >
                        👤 {item.bdm_name || 'BDM'}
                      </span>
                    </td>
                    <td>
                      <span
                        onClick={() => item.lead_id && navigate(`/leads/${item.lead_id}`)}
                        style={{ cursor: item.lead_id ? 'pointer' : 'default', color: item.lead_id ? 'var(--color-primary)' : 'inherit', fontWeight: 600 }}
                      >
                        {item.lead_name || item.company_name || 'Lead'}
                      </span>
                      {item.company_name && item.lead_name && item.company_name !== item.lead_name && (
                        <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{item.company_name}</div>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
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
                        className={`status-badge ${resultType === 'positive' ? 'won' : resultType === 'negative' ? 'lost' : 'neutral'}`}
                        style={{ fontSize: '10px', textTransform: 'capitalize' }}
                      >
                        {outcomeText}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', maxWidth: '280px', whiteSpace: 'normal', lineHeight: 1.3 }}>
                      {item.discussion_notes || item.notes || '—'}
                    </td>
                    <td style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 500 }}>
                      {item.next_action || 'None'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {item.lead_id ? (
                        <button
                          type="button"
                          className="fluent-btn fluent-btn-secondary"
                          style={{ height: '24px', fontSize: '11px', padding: '0 8px' }}
                          onClick={() => navigate(`/leads/${item.lead_id}`)}
                        >
                          View ›
                        </button>
                      ) : (
                        <span style={{ color: 'var(--color-text-disabled)' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
