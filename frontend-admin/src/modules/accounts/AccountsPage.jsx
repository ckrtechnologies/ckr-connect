import React, { useState, useEffect, useCallback } from 'react';
import accountsApi from './api.js';
import CommandBar from '../../core/layout/CommandBar.jsx';
import DataGrid from '../../core/components/DataGrid.jsx';
import AccountDetailModal from './components/AccountDetailModal.jsx';
import { toast } from '../../core/components/Toast.jsx';
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
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await accountsApi.listAccounts();
      if (res?.data) {
        setAccounts(res.data.accounts || res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load accounts directory');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const columns = [
    {
      field: 'company_name',
      header: 'Corporate Account',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={16} color="var(--color-primary)" />
          <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{val}</span>
        </div>
      ),
    },
    {
      field: 'total_deals',
      header: 'Total Opportunities',
      render: (val) => <span style={{ fontWeight: 600 }}>{val || 0}</span>,
    },
    {
      field: 'active_deals_count',
      header: 'Active Pipeline Deals',
      render: (val) => (
        <span style={{ color: (val || 0) > 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: 600 }}>
          {val || 0}
        </span>
      ),
    },
    {
      field: 'total_won_value',
      header: 'Lifetime Won Revenue',
      render: (val) => (
        <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>
          {formatCurrency(val)}
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
            onClick: fetchAccounts,
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
