import React, { useState, useEffect } from 'react';
import Modal from '../../../core/components/Modal.jsx';
import accountsApi from '../api.js';
import StatusBadge from '../../../core/components/StatusBadge.jsx';
import { toast } from '../../../core/components/Toast.jsx';
import { Building, DollarSign, Briefcase } from 'lucide-react';

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export default function AccountDetailModal({ isOpen, onClose, accountId }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (accountId && isOpen) {
      setIsLoading(true);
      accountsApi
        .getAccount(accountId)
        .then((res) => setData(res.data))
        .catch(() => toast.error('Failed to load corporate account details'))
        .finally(() => setIsLoading(false));
    }
  }, [accountId, isOpen]);

  const account = data?.account;
  const leads = data?.leads || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={account?.company_name || 'Corporate Account'}
      subtitle="Parent company profile and linked deals"
      maxWidth={640}
      footer={
        <button type="button" onClick={onClose} className="fluent-btn fluent-btn-secondary">
          Close
        </button>
      }
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-secondary)' }}>
          Loading account details...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div
              style={{
                backgroundColor: 'var(--color-surface-alt)',
                padding: '12px',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              <div className="fluent-label">Total Deals Closed</div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>{leads.length}</div>
            </div>
            <div
              style={{
                backgroundColor: 'var(--color-surface-alt)',
                padding: '12px',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              <div className="fluent-label">Lifetime Won Revenue</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-success)' }}>
                {formatCurrency(account?.total_won_value)}
              </div>
            </div>
          </div>

          {/* Linked Deals List */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
              Linked Opportunities
            </h4>
            <div
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xs)',
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: '6px 10px' }}>Opportunity Title</th>
                    <th style={{ padding: '6px 10px' }}>Stage</th>
                    <th style={{ padding: '6px 10px', textAlign: 'right' }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                        No opportunities linked
                      </td>
                    </tr>
                  ) : (
                    leads.map((l) => (
                      <tr key={l.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '6px 10px', fontWeight: 600 }}>{l.title}</td>
                        <td style={{ padding: '6px 10px' }}>
                          <StatusBadge status={l.status} size="small" />
                        </td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>
                          {formatCurrency(l.status === 'WON' ? l.won_amount : l.expected_value)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
