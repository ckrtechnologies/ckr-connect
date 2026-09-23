import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LeaderboardTable({ leaderboard = [] }) {
  const navigate = useNavigate();

  return (
    <div className="fluent-tile-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span className="tile-header" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'none', color: 'var(--color-text-primary)' }}>
          BDM Performance Leaderboard
        </span>
        <span
          onClick={() => navigate('/staff')}
          style={{ fontSize: '11px', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
        >
          View All Staff ›
        </span>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
        Closed revenue, active pipeline, and quota achievements per executive
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="fluent-grid-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Executive</th>
              <th>Won (₹)</th>
              <th>Target</th>
              <th>Achieved</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '16px', color: 'var(--color-text-secondary)' }}>
                  No performance records found.
                </td>
              </tr>
            ) : (
              leaderboard.map((item, idx) => {
                const won = Number(item.won_amount ?? item.achieved_amount ?? 0);
                const target = Number(item.target_amount ?? item.sales_target ?? 0);
                const pct = target > 0 ? Math.round((won / target) * 100) : 0;

                return (
                  <tr
                    key={item.bdm_id || item.id || idx}
                    onClick={() => navigate(`/leads?bdm=${item.bdm_id || item.id}`)}
                    title={`Filter leads assigned to ${item.bdm_name || item.name}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <span className={`rank-badge ${idx === 0 ? 'rank-1' : ''}`}>{idx + 1}</span>
                    </td>
                    <td>
                      <div>
                        <strong>{item.bdm_name || item.name || '—'}</strong>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                          {item.employee_id || '—'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: won > 0 ? 'var(--color-success)' : 'inherit' }}>
                        ₹{won.toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>₹{target.toLocaleString('en-IN')}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: pct >= 100 ? 'var(--color-success)' : pct >= 50 ? '#795B00' : 'var(--color-text-secondary)',
                          background: pct >= 100 ? '#DFF6DD' : pct >= 50 ? '#FFF4CE' : 'var(--color-surface-alt)',
                          padding: '2px 6px',
                          borderRadius: '10px',
                        }}
                      >
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
