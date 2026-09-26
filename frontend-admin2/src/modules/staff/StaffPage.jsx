import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetStaffQuery, useResetStaffPasswordMutation } from '../../core/api/apiSlice.js';
import AddStaffModal from './components/AddStaffModal.jsx';
import EditStaffModal from './components/EditStaffModal.jsx';
import ViewStaffDrawer from './components/ViewStaffDrawer.jsx';
import DeleteStaffModal from './components/DeleteStaffModal.jsx';
import UserAvatarMenu from '../../core/components/UserAvatarMenu.jsx';
import { toast } from '../../core/components/Toast.jsx';

export default function StaffPage() {
  const navigate = useNavigate();
  const { data: resData, isLoading, refetch } = useGetStaffQuery();
  const [resetPassword] = useResetStaffPasswordMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal & Drawer states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(null);
  const [tempPasswordModal, setTempPasswordModal] = useState(null);

  const staffList = Array.isArray(resData?.data?.users)
    ? resData.data.users
    : Array.isArray(resData?.data)
    ? resData.data
    : [];

  const handleResetPassword = async (user) => {
    try {
      const res = await resetPassword(user.id).unwrap();
      const tempPass = res?.data?.temporary_password || 'password@1';
      setTempPasswordModal({ name: user.name, password: tempPass });
      toast.success(`Temporary password generated for ${user.name}`);
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    }
  };

  const filteredStaff = staffList.filter((u) => {
    const matchesSearch =
      !searchTerm ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.designation?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <>
      {/* Dynamics Command Bar (Screen A-08) */}
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
                Staff
              </span>
            </div>
            <div className="command-bar-page-title" style={{ fontSize: '15px', fontWeight: 600 }}>
              Staff Management (Field Force Roster)
            </div>
          </div>

          <div className="command-bar-actions">
            <button
              className="fluent-btn-command primary-cmd"
              onClick={() => setIsAddModalOpen(true)}
            >
              + Add Staff
            </button>
          </div>
        </div>

        <div className="command-bar-right">
          <button
            className="fluent-btn-command"
            onClick={refetch}
            title="Refresh staff roster"
          >
            <span>🔄 Refresh</span>
          </button>
          <UserAvatarMenu />
        </div>
      </header>

      {/* Main Table Area (Screen A-08) */}
      <div className="admin-content-area" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div className="fluent-grid-container">
          <div
            className="fluent-grid-toolbar"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '12px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>
                Active Staff ({filteredStaff.length} of {staffList.length})
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Search by name, ID, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    width: '220px',
                  }}
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <option value="all">All Roles</option>
                  <option value="bdm">BDM</option>
                  <option value="telecaller">Telecaller</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <button
              className="fluent-btn fluent-btn-secondary"
              style={{ fontSize: '12px', height: '28px' }}
              onClick={() => setIsAddModalOpen(true)}
            >
              + New Staff
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="fluent-grid-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Role</th>
                  <th>Designation</th>
                  <th>Work Email</th>
                  <th>Phone Number</th>
                  <th>Joining Date</th>
                  <th>Active Leads</th>
                  <th>Monthly Quota</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-secondary)' }}>
                      Loading staff roster...
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-secondary)' }}>
                      {searchTerm || roleFilter !== 'all'
                        ? 'No staff members match the selected filters.'
                        : 'No staff members registered yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((u) => (
                    <tr
                      key={u.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setViewingStaff(u)}
                    >
                      <td>
                        <strong>{u.employee_id || '—'}</strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{u.name}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: u.role === 'admin' ? 'rgba(0, 120, 212, 0.1)' : 'rgba(16, 124, 65, 0.1)',
                            color: u.role === 'admin' ? '#0078d4' : '#107c41',
                            textTransform: 'uppercase',
                          }}
                        >
                          {u.role || 'bdm'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          {u.designation || (u.role === 'admin' ? 'Administrator' : 'BDM')}
                        </span>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone || '—'}</td>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          {u.date_of_joining ? new Date(u.date_of_joining).toLocaleDateString('en-IN') : 'Not Set'}
                        </span>
                      </td>
                      <td>
                        <strong>{u.active_leads_count ?? 0}</strong>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 500 }}>
                          {formatCurrency(u.target_amount ?? u.sales_target)}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: 600, marginTop: '2px' }}>
                          🎯 {u.daily_call_target ?? 15} calls/day
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${u.status === 'active' || u.is_active ? 'won' : 'invalid'}`}>
                          {u.status || (u.is_active ? 'active' : 'inactive')}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="fluent-btn fluent-btn-secondary"
                            style={{ height: '24px', fontSize: '11px', padding: '0 6px' }}
                            onClick={() => setViewingStaff(u)}
                            title="View Staff Profile"
                          >
                            👁️ View
                          </button>
                          <button
                            className="fluent-btn fluent-btn-secondary"
                            style={{ height: '24px', fontSize: '11px', padding: '0 6px' }}
                            onClick={() => setEditingStaff(u)}
                            title="Edit Staff Member"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="fluent-btn fluent-btn-secondary"
                            style={{ height: '24px', fontSize: '11px', padding: '0 6px' }}
                            onClick={() => handleResetPassword(u)}
                            title="Reset Staff Password"
                          >
                            🔑 Pwd
                          </button>
                          <button
                            className="fluent-btn"
                            style={{
                              height: '24px',
                              fontSize: '11px',
                              padding: '0 6px',
                              color: '#d13438',
                              borderColor: '#fde7e9',
                            }}
                            onClick={() => setDeletingStaff(u)}
                            title="Delete Staff Member"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={refetch}
      />

      {/* Edit Staff Modal */}
      <EditStaffModal
        isOpen={Boolean(editingStaff)}
        staff={editingStaff}
        onClose={() => setEditingStaff(null)}
        onSuccess={() => {
          refetch();
          if (viewingStaff && editingStaff && viewingStaff.id === editingStaff.id) {
            setViewingStaff(null);
          }
        }}
      />

      {/* View Staff Drawer */}
      <ViewStaffDrawer
        isOpen={Boolean(viewingStaff)}
        staff={viewingStaff}
        onClose={() => setViewingStaff(null)}
        onEdit={(staff) => {
          setViewingStaff(null);
          setEditingStaff(staff);
        }}
        onResetPassword={(staff) => handleResetPassword(staff)}
        onDelete={(staff) => {
          setViewingStaff(null);
          setDeletingStaff(staff);
        }}
      />

      {/* Delete Staff Confirmation Modal */}
      <DeleteStaffModal
        isOpen={Boolean(deletingStaff)}
        staff={deletingStaff}
        onClose={() => setDeletingStaff(null)}
        onSuccess={refetch}
      />

      {/* Temporary Password Display Dialog */}
      {tempPasswordModal && (
        <div
          className="fluent-dialog-backdrop open"
          onClick={() => setTempPasswordModal(null)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            className="fluent-dialog-box"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '450px', maxWidth: '95vw', textAlign: 'center', padding: '24px' }}
          >
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔑</div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>
              Password Reset
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
              Temporary password for <strong>{tempPasswordModal.name}</strong>:
            </p>
            <div
              style={{
                background: 'var(--color-surface-alt)',
                border: '1px dashed var(--color-border)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '1px',
                marginBottom: '20px',
              }}
            >
              {tempPasswordModal.password}
            </div>
            <button
              className="fluent-btn fluent-btn-primary"
              onClick={() => {
                navigator.clipboard.writeText(tempPasswordModal.password);
                toast.success('Password copied to clipboard');
                setTempPasswordModal(null);
              }}
            >
              Copy Password & Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
