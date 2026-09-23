import React, { useState } from 'react';
import { useGetStaffQuery, useUpdateStaffMutation } from '../../core/api/apiSlice.js';
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
  const { data: resData, isLoading, refetch } = useGetStaffQuery();
  const [updateStaff] = useUpdateStaffMutation();
  const staff = Array.isArray(resData?.data?.items)
    ? resData.data.items
    : (Array.isArray(resData?.data?.staff)
      ? resData.data.staff
      : (Array.isArray(resData?.data) ? resData.data : []));
  const [activeTab, setActiveTab] = useState('ALL');

  // Modals
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedStaffForReset, setSelectedStaffForReset] = useState(null);

  const handleToggleActive = async (member) => {
    const memberName = member.name || member.full_name || 'Staff member';
    try {
      await updateStaff({
        id: member.id,
        is_active: !member.is_active,
      }).unwrap();
      toast.success(`${memberName} is now ${!member.is_active ? 'Active' : 'Inactive'}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredStaff = staff.filter((s) => {
    const r = String(s.role || '').toLowerCase();
    if (activeTab === 'BDM') return r === 'bdm';
    if (activeTab === 'ADMIN') return r === 'admin' || r === 'super_admin';
    return true;
  });

  const columns = [
    {
      field: 'full_name',
      header: 'Staff Name',
      render: (val, row) => {
        const displayName = val || row.name || 'Unnamed';
        return (
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
              {displayName[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{displayName}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                {row.employee_id ? `${row.employee_id} · ` : ''}{row.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      field: 'role',
      header: 'Role',
      render: (val) => <StatusBadge status={String(val || '').toUpperCase()} />,
    },
    {
      field: 'sales_target',
      header: 'Monthly Quota',
      render: (val, row) =>
        String(row.role || '').toLowerCase() === 'bdm' ? (
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
            onClick: refetch,
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
        onSuccess={refetch}
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
