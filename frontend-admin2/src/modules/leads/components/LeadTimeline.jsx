import React from 'react';

export default function LeadTimeline({ interactions = [] }) {
  if (interactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
        No customer interactions recorded yet for this lead.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {interactions.map((i) => {
        const channel = (i.channel || i.type || 'call').toLowerCase();
        const typeIcon =
          channel === 'call'
            ? '📞'
            : channel === 'whatsapp'
            ? '💬'
            : channel === 'meeting'
            ? '👥'
            : '📍';

        const notes = i.discussion_notes || i.notes;
        const outcome = i.outcome || i.call_outcome;

        return (
          <div
            key={i.id}
            style={{
              padding: '12px',
              backgroundColor: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '12px' }}>
                <span>{typeIcon}</span>
                <span style={{ textTransform: 'uppercase' }}>{channel}</span>
                {outcome && (
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      background: 'var(--color-border)',
                      color: 'var(--color-text-secondary)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {outcome.replace('_', ' ')}
                  </span>
                )}
                {i.bdm_name && (
                  <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>
                    by {i.bdm_name}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                {i.created_at ? new Date(i.created_at).toLocaleString() : ''}
              </span>
            </div>

            {notes && (
              <div style={{ fontSize: '12px', color: 'var(--color-text-primary)', lineHeight: '18px' }}>
                {notes}
              </div>
            )}

            {(i.next_followup_date || i.next_action) && (
              <div style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 500 }}>
                ⏰ Next Action: {i.next_action ? `${i.next_action} ` : ''}{i.next_followup_date ? `(${i.next_followup_date})` : ''}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
