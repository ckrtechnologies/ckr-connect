import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetLeadsQuery, useGetStaffQuery, useGetTagsQuery } from '../../core/api/apiSlice.js';
import { useAuth } from '../../core/context/AuthContext.jsx';
import leadsApi from './api.js';
import DateSlicePicker from '../../core/layout/DateSlicePicker.jsx';
import QuickCreateDrawer from './components/QuickCreateDrawer.jsx';
import BulkAssignModal from './components/BulkAssignModal.jsx';
import CsvImportModal from './components/CsvImportModal.jsx';
import { toast } from '../../core/components/Toast.jsx';

export default function LeadsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Modal states
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Filters
  const [bdmFilter, setBdmFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Backend queries
  const { data: leadsData, isLoading: leadsLoading, refetch } = useGetLeadsQuery();
  const { data: usersData } = useGetStaffQuery();
  const { data: tagsData } = useGetTagsQuery();

  const allLeads = useMemo(() => {
    if (Array.isArray(leadsData?.data?.items)) return leadsData.data.items;
    if (Array.isArray(leadsData?.data?.leads)) return leadsData.data.leads;
    if (Array.isArray(leadsData?.data)) return leadsData.data;
    return [];
  }, [leadsData]);

  const bdms = useMemo(() => {
    const list = Array.isArray(usersData?.data?.users)
      ? usersData.data.users
      : Array.isArray(usersData?.data)
      ? usersData.data
      : [];
    return list.filter((u) => u.role === 'bdm');
  }, [usersData]);

  const tags = useMemo(() => {
    return Array.isArray(tagsData?.data?.tags)
      ? tagsData.data.tags
      : Array.isArray(tagsData?.data)
      ? tagsData.data
      : [];
  }, [tagsData]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return allLeads.filter((l) => {
      if (bdmFilter === 'unassigned' && l.assigned_to) return false;
      if (bdmFilter && bdmFilter !== 'unassigned' && l.assigned_to !== bdmFilter) return false;
      if (statusFilter && l.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (l.name || '').toLowerCase().includes(q);
        const matchComp = (l.company_name || '').toLowerCase().includes(q);
        const matchCity = (l.city || '').toLowerCase().includes(q);
        if (!matchName && !matchComp && !matchCity) return false;
      }
      return true;
    });
  }, [allLeads, bdmFilter, statusFilter, searchQuery]);

  // Selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(filteredLeads.map((l) => l.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleExportCsv = async () => {
    try {
      toast.info('Exporting Leads to CSV...');
      const blob = await leadsApi.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Leads CSV downloaded successfully');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  const allSelected = filteredLeads.length > 0 && selectedIds.size === filteredLeads.length;

  return (
    <>
      {/* Dynamics Command Bar (Screen A-03) */}
      <header className="dynamics-command-bar">
        <div className="command-bar-left">
          {/* Breadcrumb & Screen Title */}
          <div className="command-bar-title-section">
            <div className="command-bar-breadcrumb">
              <span
                className="breadcrumb-link"
                onClick={() => navigate('/dashboard')}
                style={{ cursor: 'pointer' }}
              >
                CKR Connect
              </span>
              <span className="breadcrumb-sep" style={{ color: 'var(--color-text-secondary)', margin: '0 4px' }}>
                ›
              </span>
              <span className="breadcrumb-current" style={{ color: 'var(--color-text-secondary)' }}>
                Leads
              </span>
            </div>
            <div className="command-bar-page-title" style={{ fontSize: '15px', fontWeight: 600 }}>
              Lead Management (Grid)
            </div>
          </div>

          {/* Contextual Action Buttons */}
          <div className="command-bar-actions">
            <button
              className="fluent-btn-command primary-cmd"
              id="cmd-new-lead"
              onClick={() => setIsQuickCreateOpen(true)}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z" />
              </svg>
              New Lead
            </button>

            <button
              className="fluent-btn-command"
              id="cmd-bulk-upload"
              onClick={() => setIsCsvImportOpen(true)}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V10.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
              </svg>
              Bulk upload
            </button>

            {selectedIds.size > 0 && (
              <button
                className="fluent-btn-command primary-cmd"
                id="cmd-assign-selected"
                onClick={() => setIsBulkAssignOpen(true)}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                  <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z" />
                </svg>
                Assign ({selectedIds.size})
              </button>
            )}

            <button
              className="fluent-btn-command"
              id="cmd-export-leads"
              onClick={handleExportCsv}
            >
              Export
            </button>
          </div>
        </div>

        <div className="command-bar-right">
          {/* Authentic Top Bar RTK Date Slice with Presets */}
          <DateSlicePicker />

          {/* Search Box */}
          <div className="fluent-search-box">
            <svg className="fluent-search-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
            <input
              type="text"
              placeholder="Filter or search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Notification Bell */}
          <button
            className="icon-btn-utility"
            onClick={() => toast.info('No unread notifications')}
            title="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z" />
            </svg>
          </button>

          {/* User Avatar with Sign-Out Menu */}
          <div style={{ position: 'relative' }}>
            <div
              className="fluent-avatar"
              style={{ cursor: 'pointer' }}
              title="Chandan Mallik (CTO) · Click for options"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              CM
            </div>
            {userMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '38px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-level2)',
                  width: '170px',
                  zIndex: 1000,
                  padding: '6px 0',
                }}
              >
                <div
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  Chandan Mallik (CTO)
                </div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    fontSize: '12px',
                    color: 'var(--color-error)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🚪</span> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area (A-03 Dense Table) */}
      <div className="admin-content-area">
        <div className="fluent-grid-container">
          {/* Grid Toolbar with Direct BDM & Status Filters */}
          <div
            className="fluent-grid-toolbar"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>
                {bdmFilter
                  ? `${bdms.find((u) => u.id === bdmFilter)?.name || 'Filtered'}'s Assigned Leads`
                  : 'All Active Leads'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                ({filteredLeads.length} records)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* BDM Filter Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  BDM:
                </span>
                <select
                  className="form-field-select"
                  style={{ height: '28px', fontSize: '12px', minWidth: '170px' }}
                  value={bdmFilter}
                  onChange={(e) => setBdmFilter(e.target.value)}
                >
                  <option value="">All BDMs (Sales Staff)</option>
                  {bdms.map((u) => (
                    <option key={u.id} value={u.id}>
                      👤 {u.name} ({allLeads.filter((l) => l.assigned_to === u.id).length} leads)
                    </option>
                  ))}
                  <option value="unassigned">
                    ⚠️ Unassigned Pool ({allLeads.filter((l) => !l.assigned_to).length})
                  </option>
                </select>
              </div>

              {/* Stage Filter Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Stage:
                </span>
                <select
                  className="form-field-select"
                  style={{ height: '28px', fontSize: '12px' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="new">New (10%)</option>
                  <option value="contacted">Contacted (20%)</option>
                  <option value="follow_up">Follow-up (40%)</option>
                  <option value="proposal">Proposal (60%)</option>
                  <option value="won">Won (100%)</option>
                  <option value="lost">Lost Deals</option>
                  <option value="invalid">Invalid Data</option>
                </select>
              </div>

              {/* Search Field */}
              <input
                type="text"
                className="form-field-input"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: '28px', width: '140px', fontSize: '12px' }}
              />

              {(bdmFilter || statusFilter || searchQuery) && (
                <button
                  className="fluent-btn fluent-btn-secondary"
                  style={{ height: '28px', fontSize: '11px', padding: '0 8px' }}
                  onClick={() => {
                    setBdmFilter('');
                    setStatusFilter('');
                    setSearchQuery('');
                  }}
                >
                  ✕ Reset
                </button>
              )}
            </div>
          </div>

          {/* Dense Table with Hairline Dividers (40px row height) */}
          <div style={{ overflowX: 'auto' }}>
            <table className="fluent-grid-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input
                      type="checkbox"
                      className="fluent-checkbox"
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="sortable">Contact Name</th>
                  <th className="sortable">Company / Institution</th>
                  <th>State & City</th>
                  <th>Product / Service</th>
                  <th>Deal Type</th>
                  <th>Forecast (₹)</th>
                  <th>Status</th>
                  <th>Assigned BDM</th>
                  <th>Next Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      style={{
                        textAlign: 'center',
                        padding: '32px',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {leadsLoading ? 'Loading live leads...' : 'No leads match the active filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((l) => {
                    const isChecked = selectedIds.has(l.id);
                    const tag = tags.find((t) => t.id === l.tag_id);
                    const bdm = bdms.find((u) => u.id === l.assigned_to);

                    return (
                      <tr
                        key={l.id}
                        className={isChecked ? 'selected' : ''}
                        onClick={() => navigate(`/leads/${l.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td
                          className="checkbox-col"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectOne(l.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            className="fluent-checkbox"
                            checked={isChecked}
                            onChange={() => handleSelectOne(l.id)}
                          />
                        </td>
                        <td>
                          <strong>{l.name}</strong>
                        </td>
                        <td>{l.company_name || '—'}</td>
                        <td>{l.city ? `${l.city}, ${l.state || ''}` : l.state || '—'}</td>
                        <td>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                            {tag ? tag.name : '—'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
                            {(l.deal_type || 'NEW_BUSINESS').replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <strong>
                            ₹{(l.expected_value || l.budget || 0).toLocaleString('en-IN')}
                          </strong>
                        </td>
                        <td>
                          <span className={`status-badge ${l.status}`}>
                            {(l.status || 'new').replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          {bdm ? (
                            bdm.name
                          ) : (
                            <span style={{ color: 'var(--color-text-disabled)' }}>Unassigned</span>
                          )}
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          {l.next_followup_date || 'None scheduled'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Add Lead Drawer */}
      <QuickCreateDrawer
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Bulk Assign Modal */}
      {isBulkAssignOpen && (
        <BulkAssignModal
          isOpen={isBulkAssignOpen}
          selectedLeadIds={Array.from(selectedIds)}
          onClose={() => setIsBulkAssignOpen(false)}
          onSuccess={() => {
            setSelectedIds(new Set());
            refetch();
          }}
        />
      )}

      {/* CSV Import Modal */}
      {isCsvImportOpen && (
        <CsvImportModal
          isOpen={isCsvImportOpen}
          onClose={() => setIsCsvImportOpen(false)}
          onSuccess={() => refetch()}
        />
      )}
    </>
  );
}
