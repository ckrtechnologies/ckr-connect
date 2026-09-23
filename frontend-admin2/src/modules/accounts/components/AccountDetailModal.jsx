import React from 'react';
import { useGetAccountDetailQuery } from '../../../core/api/apiSlice.js';

export default function AccountDetailModal({ isOpen, accountId, onClose }) {
  const { data: resData, isLoading } = useGetAccountDetailQuery(accountId, { skip: !accountId || !isOpen });

  if (!isOpen) return null;

  const account = resData?.data?.account || resData?.data;
  const childLeads = resData?.data?.leads || resData?.data?.child_leads || account?.leads || [];

  return (
    <div className="fluent-dialog-backdrop open" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="fluent-dialog-box large-modal" onClick={(e) => e.stopPropagation()} style={{ width: '640px', maxWidth: '95vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
            🏢 {account ? account.name || account.company_name : 'Account Profile'}
          </h2>
          <button className="icon-btn-utility" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>Loading account profile...</div>
        ) : (
          <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--color-surface-alt)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block' }}>Primary Contact</span>
                <strong>{account?.contact_name || '—'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block' }}>Contact Phone</span>
                <strong>{account?.contact_phone || account?.phone || '—'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block' }}>City / State</span>
                <span>{account?.city ? `${account.city}, ${account.state || ''}` : account?.state || '—'}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block' }}>Lifetime Revenue</span>
                <strong style={{ color: 'var(--color-success)' }}>
                  ₹{Number(account?.lifetime_revenue || account?.lifetime_value || 0).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <h4 style={{ fontSize: '13px', fontWeight: 600, margin: '8px 0 4px 0' }}>
              Linked Leads & Opportunities ({childLeads.length})
            </h4>

            <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <table className="fluent-grid-table">
                <thead>
                  <tr>
                    <th>Lead Name</th>
                    <th>Assigned BDM</th>
                    <th>Forecast</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {childLeads.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '16px', color: 'var(--color-text-secondary)' }}>
                        No child leads linked to this account.
                      </td>
                    </tr>
                  ) : (
                    childLeads.map((l) => (
                      <tr key={l.id}>
                        <td><strong>{l.name}</strong></td>
                        <td>{l.assigned_bdm_name || 'Unassigned'}</td>
                        <td>₹{(l.expected_value || 0).toLocaleString('en-IN')}</td>
                        <td><span className={`status-badge ${l.status}`}>{l.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="fluent-btn fluent-btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
