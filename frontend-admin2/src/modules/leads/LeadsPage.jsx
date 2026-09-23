import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetLeadsQuery, useGetStaffQuery, useGetTagsQuery } from '../../core/api/apiSlice.js';
import { useAuth } from '../../core/context/AuthContext.jsx';
import leadsApi from './api.js';
import DateSlicePicker from '../../core/layout/DateSlicePicker.jsx';
import QuickCreateDrawer from './components/QuickCreateDrawer.jsx';
import ImportCsvModal from './components/ImportCsvModal.jsx';
import BulkAssignModal from './components/BulkAssignModal.jsx';
import BulkTagModal from './components/BulkTagModal.jsx';
import DeleteLeadModal from './components/DeleteLeadModal.jsx';
import LeadFilterPanel from './components/LeadFilterPanel.jsx';
import UserAvatarMenu from '../../core/components/UserAvatarMenu.jsx';
import { toast } from '../../core/components/Toast.jsx';

export default function LeadsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { logout } = useAuth();

  // Modal states
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [isBulkTagOpen, setIsBulkTagOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Filters initialized from URL search params
  const initialStatus = searchParams.get('status') || searchParams.get('stage') || searchParams.get('filter') || '';
  const initialBdm = searchParams.get('bdm') || searchParams.get('assigned_to') || '';
  const initialSearch = searchParams.get('q') || searchParams.get('search') || '';

  const [bdmFilter, setBdmFilter] = useState(initialBdm);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [advancedFilters, setAdvancedFilters] = useState({ search: searchQuery, status: statusFilter, assigned_to: bdmFilter, tag_ids: [] });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    const s = searchParams.get('status') || searchParams.get('stage') || searchParams.get('filter');
    const b = searchParams.get('bdm') || searchParams.get('assigned_to');
    const q = searchParams.get('q') || searchParams.get('search');
    if (s !== null && s !== undefined) setStatusFilter(s);
    if (b !== null && b !== undefined) setBdmFilter(b);
    if (q !== null && q !== undefined) setSearchQuery(q);
  }, [searchParams]);

  // Backend queries
  const { data: leadsData, isLoading: leadsLoading, refetch } = useGetLeadsQuery({ limit: 100000 });
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
      if (statusFilter === 'active') {
        if (['won', 'lost', 'invalid'].includes(l.status)) return false;
      } else if (statusFilter && l.status !== statusFilter) {
        return false;
      }
      if (advancedFilters.tag_ids && advancedFilters.tag_ids.length > 0) {
        if (!l.tags || l.tags.length === 0) return false;
        const leadTagIds = l.tags.map(t => t.id);
        const hasAllTags = advancedFilters.tag_ids.every(id => leadTagIds.includes(id));
        if (!hasAllTags) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (l.name || '').toLowerCase().includes(q);
        const matchComp = (l.company_name || '').toLowerCase().includes(q);
        const matchCity = (l.city || '').toLowerCase().includes(q);
        if (!matchName && !matchComp && !matchCity) return false;
      }
      return true;
    });
  }, [allLeads, bdmFilter, statusFilter, searchQuery, advancedFilters.tag_ids]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [bdmFilter, statusFilter, searchQuery, advancedFilters]);

  // Paginate leads
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

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
      {/* Dynamics Command Bar (Approved Prototype Screen A-03) */}
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



            {selectedIds.size > 0 && (
              <>
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
                <button
                  className="fluent-btn-command"
                  id="cmd-manage-tags"
                  onClick={() => setIsBulkTagOpen(true)}
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2.5 1A1.5 1.5 0 0 0 1 2.5v3.172a1.5 1.5 0 0 0 .44 1.06l6.828 6.829a1.5 1.5 0 0 0 2.122 0l3.172-3.172a1.5 1.5 0 0 0 0-2.122L6.732 1.44A1.5 1.5 0 0 0 5.672 1H2.5zM3.5 4a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1z" />
                  </svg>
                  Manage Tags ({selectedIds.size})
                </button>
                <button
                  className="fluent-btn-command"
                  style={{ color: 'var(--color-error)' }}
                  id="cmd-delete-selected"
                  onClick={() => setIsBulkDeleteOpen(true)}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                  Delete ({selectedIds.size})
                </button>
              </>
            )}


            <button
              className="fluent-btn-command"
              id="cmd-import-leads"
              onClick={() => setIsImportOpen(true)}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'text-bottom', marginRight: '4px' }}>
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
              </svg>
              Bulk Import
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
          <UserAvatarMenu />
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
                  onChange={(e) => {
                    const val = e.target.value;
                    setBdmFilter(val);
                    const params = new URLSearchParams(searchParams);
                    if (val) params.set('bdm', val);
                    else params.delete('bdm');
                    setSearchParams(params, { replace: true });
                  }}
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
                  onChange={(e) => {
                    const val = e.target.value;
                    setStatusFilter(val);
                    const params = new URLSearchParams(searchParams);
                    if (val) params.set('status', val);
                    else params.delete('status');
                    setSearchParams(params, { replace: true });
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="active">All Active Leads (Pipeline)</option>
                  <option value="new">New (10%)</option>
                  <option value="contacted">Contacted (20%)</option>
                  <option value="follow_up">Follow-up (40%)</option>
                  <option value="proposal">Proposal (60%)</option>
                  <option value="won">Won Deals (100%)</option>
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

              
              <button
                className="fluent-btn fluent-btn-secondary"
                style={{ height: '28px', fontSize: '11px', padding: '0 8px', marginLeft: '8px' }}
                onClick={() => setIsFilterPanelOpen(true)}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: '4px' }}>
                  <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z"/>
                </svg>
                Advanced Filter
              </button>
              
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

          {/* Dense Table with Hairline Dividers (40px row height matching Image 1) */}
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
                  <th style={{ width: '48px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td
                      colSpan="11"
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
                  paginatedLeads.map((l) => {
                    const isChecked = selectedIds.has(l.id);
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
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {l.tags && l.tags.length > 0 ? (
                              l.tags.map(t => (
                                <span key={t.id} style={{ fontSize: '11px', background: t.color_hex ? `${t.color_hex}22` : '#eee', color: t.color_hex || '#333', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                                  {t.name}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>—</span>
                            )}
                          </div>
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
                        <td
                          style={{ textAlign: 'center' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLeadToDelete(l);
                          }}
                        >
                          <button
                            type="button"
                            className="icon-btn-utility"
                            title={`Delete lead ${l.name}`}
                            style={{ color: 'var(--color-error)', padding: '4px' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {filteredLeads.length > 0 && (
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length} leads
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select 
                  className="form-field-select" 
                  style={{ height: '28px', fontSize: '12px', padding: '0 8px', minWidth: '70px' }}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
                <button 
                  className="fluent-btn-icon" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  style={{ padding: '4px 8px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  Prev
                </button>
                <span style={{ fontSize: '12px' }}>Page {currentPage} of {Math.ceil(filteredLeads.length / pageSize)}</span>
                <button 
                  className="fluent-btn-icon" 
                  disabled={currentPage === Math.ceil(filteredLeads.length / pageSize)}
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredLeads.length / pageSize), p + 1))}
                  style={{ padding: '4px 8px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: currentPage === Math.ceil(filteredLeads.length / pageSize) ? 'not-allowed' : 'pointer' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Lead Drawer */}
      <QuickCreateDrawer
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        onSuccess={() => refetch()}
      />

      <ImportCsvModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
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

      {/* Bulk Tag Modal */}
      {isBulkTagOpen && (
        <BulkTagModal
          isOpen={isBulkTagOpen}
          selectedLeadIds={Array.from(selectedIds)}
          onClose={() => setIsBulkTagOpen(false)}
          onSuccess={() => {
            setSelectedIds(new Set());
            refetch();
          }}
        />
      )}

      {/* Single Lead Delete Modal */}
      {leadToDelete && (
        <DeleteLeadModal
          isOpen={!!leadToDelete}
          leadIds={[leadToDelete.id]}
          leadNames={leadToDelete.name}
          onClose={() => setLeadToDelete(null)}
          onSuccess={() => {
            setLeadToDelete(null);
            refetch();
          }}
        />
      )}

      {/* Bulk Leads Delete Modal */}
      {isBulkDeleteOpen && (
        <DeleteLeadModal
          isOpen={isBulkDeleteOpen}
          leadIds={Array.from(selectedIds)}
          leadNames={`${selectedIds.size} selected leads`}
          onClose={() => setIsBulkDeleteOpen(false)}
          onSuccess={() => {
            setSelectedIds(new Set());
            setIsBulkDeleteOpen(false);
            refetch();
          }}
        />
      )}
    
      {/* Advanced Filter Panel */}
      <LeadFilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        filters={advancedFilters}
        setFilters={setAdvancedFilters}
        onApply={(f) => {
          setBdmFilter(f.assigned_to);
          setStatusFilter(f.status);
          setSearchQuery(f.search);
          const params = new URLSearchParams();
          if (f.assigned_to) params.set('bdm', f.assigned_to);
          if (f.status) params.set('status', f.status);
          if (f.search) params.set('q', f.search);
          if (f.tag_ids?.length) params.set('tags', f.tag_ids.join(','));
          setSearchParams(params, { replace: true });
        }}
      />
    </>
  );
}
