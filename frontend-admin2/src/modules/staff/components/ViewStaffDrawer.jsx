import React from 'react';

export default function ViewStaffDrawer({
  isOpen,
  staff,
  onClose,
  onEdit,
  onResetPassword,
  onDelete,
}) {
  if (!isOpen || !staff) return null;

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'System Administrator';
      case 'manager':
        return 'Sales Manager';
      case 'telecaller':
        return 'Telecalling Executive';
      case 'bdm':
      default:
        return 'Business Development Manager';
    }
  };

  return (
    <div
      className="fluent-dialog-backdrop open"
      onClick={onClose}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        className="fluent-panel-drawer"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '520px',
          maxWidth: '100vw',
          background: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-panel, -8px 0 24px rgba(0,0,0,0.15))',
          height: '100%',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-surface-alt)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              {staff.name ? staff.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 600, margin: 0, color: 'var(--color-text-primary)' }}>
                {staff.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>
                  {staff.employee_id || 'ID Pending'}
                </span>
                <span className={`status-badge ${staff.status === 'active' ? 'won' : 'invalid'}`}>
                  {staff.status || (staff.is_active ? 'active' : 'inactive')}
                </span>
              </div>
            </div>
          </div>
          <button className="icon-btn-utility" onClick={onClose} title="Close drawer">
            ✕
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* Quick Metrics */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
              Sales & Activity Metrics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'var(--color-surface-alt)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Monthly Quota</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {formatCurrency(staff.target_amount ?? staff.sales_target)}
                </div>
              </div>

              <div style={{ background: 'var(--color-surface-alt)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Active Pipeline Leads</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {staff.active_leads_count ?? 0}
                </div>
              </div>

              <div style={{ background: 'var(--color-surface-alt)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Won Leads Closed</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-success)' }}>
                  {staff.total_won_leads ?? '—'}
                </div>
              </div>

              <div style={{ background: 'var(--color-surface-alt)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Lifetime Won Revenue</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-success)' }}>
                  {formatCurrency(staff.lifetime_won_revenue)}
                </div>
              </div>
            </div>
          </div>

          {/* Profile & Contact Details */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
              Staff Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--color-surface-alt)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Full Role</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{getRoleLabel(staff.role)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Designation</div>
                <div style={{ fontSize: '13px' }}>{staff.designation || 'Not specified'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Official Email</div>
                <div style={{ fontSize: '13px', color: 'var(--color-primary)' }}>{staff.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Mobile Phone</div>
                <div style={{ fontSize: '13px' }}>{staff.phone || 'Not recorded'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Department</div>
                <div style={{ fontSize: '13px' }}>{staff.department || 'Sales & Field Operations'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Member Since</div>
                <div style={{ fontSize: '13px' }}>{formatDate(staff.created_at)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Actions Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-surface-alt)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <button
            type="button"
            className="fluent-btn"
            style={{
              color: '#d13438',
              borderColor: '#fde7e9',
              background: '#fff',
            }}
            onClick={() => onDelete(staff)}
          >
            🗑️ Delete Staff
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="fluent-btn fluent-btn-secondary"
              onClick={() => onResetPassword(staff)}
            >
              🔑 Reset Password
            </button>
            <button
              type="button"
              className="fluent-btn fluent-btn-primary"
              onClick={() => onEdit(staff)}
            >
              ✏️ Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
