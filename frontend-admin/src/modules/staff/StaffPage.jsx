import React, { useState, useEffect, useCallback } from 'react';
import staffApi from './api.js';
import CommandBar from '../../core/layout/CommandBar.jsx';
import DataGrid from '../../core/components/DataGrid.jsx';
import StatusBadge from '../../core/components/StatusBadge.jsx';
import InviteStaffModal from './components/InviteStaffModal.jsx';
import ResetPasswordModal from './components/ResetPasswordModal.jsx';
import { toast } from '../../core/components/Toast.jsx';
import { UserPlus, KeyRound, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  // Modals
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedStaffForReset, setSelectedStaffForReset] = useState(null);

  const fetchStaff = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await staffApi.listStaff();
      if (res?.data) {
        setStaff(res.data.staff || res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load staff roster');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleToggleActive = async (member) => {
    try {
      await staffApi.updateStaff(member.id, {
        is_active: !member.is_active,
      });
      toast.success(`${member.full_name} is now ${!member.is_active ? 'Active' : 'Inactive'}`);
      fetchStaff();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredStaff = staff.filter((s) => {
    if (activeTab === 'BDM') return s.role === 'BDM';
    if (activeTab === 'ADMIN') return s.role === 'ADMIN' || s.role === 'SUPER_ADMIN';
    return true;
  });

  const columns = [
    {
      field: 'full_name',
      header: 'Staff Name',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {val ? val[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{val}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      field: 'role',
      header: 'Role',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      field: 'sales_target',
      header: 'Monthly Quota',
      render: (val, row) =>
        row.role === 'BDM' ? (
          <span style={{ fontWeight: 600 }}>{formatCurrency(val)}</span>
        ) : (
          <span style={{ color: 'var(--color-text-secondary)' }}>N/A (Admin)</span>
        ),
    },
    {
      field: 'is_active',
      header: 'Status',
      render: (val) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            color: val ? 'var(--color-success)' : 'var(--color-text-disabled)',
            fontWeight: 600,
          }}
        >
          {val ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {val ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      field: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedStaffForReset(row)}
            className="fluent-btn fluent-btn-secondary"
            style={{ fontSize: '11px', padding: '3px 8px' }}
            title="Reset Password"
          >
            <KeyRound size={12} />
            <span>Reset Pwd</span>
          </button>
          <button
            onClick={() => handleToggleActive(row)}
            className="fluent-btn fluent-btn-subtle"
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              color: row.is_active ? 'var(--color-error)' : 'var(--color-success)',
            }}
          >
            {row.is_active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  const filterTabs = [
    { id: 'ALL', label: 'All Staff' },
    { id: 'BDM', label: 'Sales BDMs' },
    { id: 'ADMIN', label: 'Administrators' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <CommandBar
        title="Staff & BDM Roster"
        subtitle="Manage sales representatives and quota targets"
        actions={[
          {
            label: 'Add Member',
            primary: true,
            icon: <UserPlus size={14} />,
            onClick: () => setIsInviteOpen(true),
          },
          {
            label: 'Refresh',
            icon: <RefreshCw size={14} className={isLoading ? 'spin' : ''} />,
            onClick: fetchStaff,
          },
        ]}
      />

      <div style={{ flex: 1, padding: '20px', overflow: 'hidden' }}>
        <DataGrid
          columns={columns}
          data={filteredStaff}
          keyField="id"
          isLoading={isLoading}
          filterTabs={filterTabs}
          activeFilterTab={activeTab}
          onFilterTabChange={setActiveTab}
          searchPlaceholder="Search staff by name or email..."
        />
      </div>

      {/* Invite Staff Modal */}
      <InviteStaffModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={fetchStaff}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={!!selectedStaffForReset}
        onClose={() => setSelectedStaffForReset(null)}
        staffMember={selectedStaffForReset}
      />
    </div>
  );
}
