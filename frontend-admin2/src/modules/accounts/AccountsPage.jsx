import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAccountsQuery } from '../../core/api/apiSlice.js';
import AccountDetailModal from './components/AccountDetailModal.jsx';
import UserAvatarMenu from '../../core/components/UserAvatarMenu.jsx';

export default function AccountsPage() {
  const navigate = useNavigate();
  const { data: resData, isLoading } = useGetAccountsQuery();
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const accounts = Array.isArray(resData?.data?.accounts)
    ? resData.data.accounts
    : Array.isArray(resData?.data)
    ? resData.data
    : [];

  return (
    <>
      {/* Dynamics Command Bar (Screen A-17) */}
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
                Accounts & Renewals (Phase 2)
              </span>
            </div>
            <div className="command-bar-page-title" style={{ fontSize: '15px', fontWeight: 600 }}>
              Accounts Directory (Parent Entities)
            </div>
          </div>
        </div>

        <div className="command-bar-right">
          <UserAvatarMenu />
        </div>
      </header>

      {/* Main Accounts Grid (Screen A-17) */}
      <div className="admin-content-area" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div className="fluent-grid-container">
          <div className="fluent-grid-toolbar">
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Parent Institutional Accounts ({accounts.length})</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="fluent-grid-table">
              <thead>
                <tr>
                  <th>Account / Entity Name</th>
                  <th>City & State</th>
                  <th>Primary Contact</th>
                  <th>Active Leads</th>
                  <th>Lifetime Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
                      Loading accounts directory...
                    </td>
                  </tr>
                ) : accounts.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
                      No institutional accounts found.
                    </td>
                  </tr>
                ) : (
                  accounts.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => setSelectedAccountId(a.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td><strong>{a.name || a.company_name}</strong></td>
                      <td>{a.city ? `${a.city}, ${a.state || ''}` : a.state || '—'}</td>
                      <td>{a.contact_name || '—'}</td>
                      <td><strong>{a.total_leads ?? a.active_leads_count ?? 0}</strong></td>
                      <td>
                        <strong style={{ color: 'var(--color-success)' }}>
                          ₹{Number(a.lifetime_revenue ?? a.lifetime_value ?? 0).toLocaleString('en-IN')}
                        </strong>
                      </td>
                      <td>
                        <span className="status-badge won">Active</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AccountDetailModal
        isOpen={Boolean(selectedAccountId)}
        accountId={selectedAccountId}
        onClose={() => setSelectedAccountId(null)}
      />
    </>
  );
}
