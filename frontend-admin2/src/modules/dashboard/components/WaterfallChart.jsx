import React from 'react';
import { STAGE_CONFIG } from '../../../core/config/constants.js';

export default function WaterfallChart({ funnel = [], onStageClick }) {
  const counts = {};
  funnel.forEach((f) => {
    const k = String(f.status || '').toLowerCase();
    counts[k] = Number(f.count) || 0;
  });

  const maxCount = Math.max(1, ...STAGE_CONFIG.map((s) => counts[s.key] || 0));

  return (
    <div className="fluent-tile-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span className="tile-header" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'none', color: 'var(--color-text-primary)' }}>
          Pipeline Waterfall by Stage
        </span>
        <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600 }}>Click any stage to filter leads</span>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
        Distribution of prospective institutions across active qualification gates
      </div>

      <div className="waterfall-bars-container">
        {STAGE_CONFIG.map((st) => {
          const count = counts[st.key] || 0;
          const pct = Math.round((count / maxCount) * 100);

          return (
            <div
              key={st.key}
              className="waterfall-bar-group"
              onClick={() => onStageClick && onStageClick(st.key)}
              title={`Filter leads by stage: ${st.label} (${count} leads)`}
              style={{ cursor: 'pointer' }}
            >
              <div className="waterfall-bar-label-top">{count}</div>
              <div className="waterfall-bar-track">
                <div
                  className="waterfall-bar-fill"
                  style={{ height: `${Math.max(6, pct)}%`, background: st.color }}
                />
              </div>
              <div className="waterfall-bar-label-bottom">{st.label}</div>
              <div className="waterfall-bar-prob">{st.prob}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
