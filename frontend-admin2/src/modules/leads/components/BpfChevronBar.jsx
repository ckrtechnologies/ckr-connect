import React from 'react';

export const STAGES = [
  { key: 'new', label: 'New', defaultProb: 10 },
  { key: 'contacted', label: 'Contacted', defaultProb: 20 },
  { key: 'follow_up', label: 'Follow Up', defaultProb: 40 },
  { key: 'proposal', label: 'Proposal', defaultProb: 60 },
  { key: 'won', label: 'Won', defaultProb: 100 },
];

export default function BpfChevronBar({ currentStatus, onStageClick, onDropoffClick }) {
  const normalized = (currentStatus || 'new').toLowerCase();
  const activeStatus = normalized === 'negotiation' ? 'proposal' : normalized;

  // If lost or invalid, none of the 5 won steps are active in normal flow
  const isLostOrInvalid = activeStatus === 'lost' || activeStatus === 'invalid';
  const activeIdx = isLostOrInvalid ? -1 : STAGES.findIndex((s) => s.key === activeStatus);

  return (
    <div className="dynamics-bpf-bar" style={{ width: '100%' }}>
      {STAGES.map((st, idx) => {
        const isCompleted = activeIdx > idx;
        const isActive = activeIdx === idx;

        return (
          <div
            key={st.key}
            className={`bpf-stage ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            onClick={() => onStageClick && onStageClick(st.key)}
            title={`Advance to ${st.label} (${st.defaultProb}%)`}
          >
            <span className="bpf-stage-num">{isCompleted ? '✓' : idx + 1}</span>
            <span>{st.label}</span>
          </div>
        );
      })}

      <button
        type="button"
        className="bpf-dropoff-btn"
        onClick={() => onDropoffClick && onDropoffClick()}
        title="Mark lead as Lost or Invalid"
      >
        <span style={{ fontSize: '13px' }}>✕</span>
        <span>Mark Lost / Invalid</span>
      </button>
    </div>
  );
}
