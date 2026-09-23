import React, { useState } from 'react';
import { useGetAccountsQuery } from '../../core/api/apiSlice.js';
import CommandBar from '../../core/layout/CommandBar.jsx';
import DataGrid from '../../core/components/DataGrid.jsx';
import AccountDetailModal from './components/AccountDetailModal.jsx';
import { RefreshCw, Building2 } from 'lucide-react';

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export default function AccountsPage() {
  const { data: resData, isLoading, refetch } = useGetAccountsQuery();
  const accounts = Array.isArray(resData?.data?.items)
    ? resData.data.items
    : (Array.isArray(resData?.data?.accounts)
      ? resData.data.accounts
      : (Array.isArray(resData?.data) ? resData.data : []));
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const columns = [
    {
      field: 'name',
      header: 'Corporate Account',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={16} color="var(--color-primary)" />
          <div>
            <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{val || row.company_name}</span>
            {(row.city || row.state) && (
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                {[row.city, row.state].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      field: 'total_leads',
      header: 'Total Opportunities',
      render: (val, row) => <span style={{ fontWeight: 600 }}>{val ?? row.total_deals ?? 0}</span>,
    },
    {
      field: 'won_deals_count',
      header: 'Closed-Won Deals',
      render: (val, row) => (
        <span style={{ color: (val || 0) > 0 ? 'var(--color-success)' : 'var(--color-text-secondary)', fontWeight: 600 }}>
          {val ?? row.active_deals_count ?? 0}
        </span>
      ),
    },
    {
      field: 'lifetime_revenue',
      header: 'Lifetime Won Revenue',
      render: (val, row) => (
        <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>
          {formatCurrency(val ?? row.total_won_value)}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <CommandBar
        title="Parent Accounts"
        subtitle="Corporate entities and organizational client profiles"
        actions={[
          {
            label: 'Refresh',
            icon: <RefreshCw size={14} className={isLoading ? 'spin' : ''} />,
            onClick: refetch,
          },
        ]}
      />

      <div style={{ flex: 1, padding: '20px', overflow: 'hidden' }}>
        <DataGrid
          columns={columns}
          data={accounts}
          keyField="id"
          isLoading={isLoading}
          onRowClick={(row) => setSelectedAccountId(row.id)}
          searchPlaceholder="Search accounts by name..."
        />
      </div>

      <AccountDetailModal
        isOpen={!!selectedAccountId}
        onClose={() => setSelectedAccountId(null)}
        accountId={selectedAccountId}
      />
    </div>
  );
}
