import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import leadsApi from './api.js';
import CommandBar from '../../core/layout/CommandBar.jsx';
import DataGrid from '../../core/components/DataGrid.jsx';
import StatusBadge from '../../core/components/StatusBadge.jsx';
import QuickCreateDrawer from './components/QuickCreateDrawer.jsx';
import BulkAssignModal from './components/BulkAssignModal.jsx';
import CsvImportModal from './components/CsvImportModal.jsx';
import { toast } from '../../core/components/Toast.jsx';
import { Plus, UserCheck, Upload, Download, RefreshCw } from 'lucide-react';

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export default function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');

  // Modals & Drawers state
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (activeTab !== 'ALL') {
        params.status = activeTab;
      }
      const res = await leadsApi.listLeads(params);
      if (res?.data) {
        setLeads(res.data.leads || res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load leads roster');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleExportCsv = async () => {
    try {
      toast.info('Generating CSV export...');
      const blob = await leadsApi.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('CSV downloaded successfully');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  const columns = [
    {
      field: 'company_name',
      header: 'Company / Account',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{val}</span>
          {row.contact_name && (
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              {row.contact_name} {row.contact_phone ? `· ${row.contact_phone}` : ''}
            </div>
          )}
        </div>
      ),
    },
    {
      field: 'title',
      header: 'Opportunity Title',
      render: (val) => <span style={{ fontWeight: 500 }}>{val}</span>,
    },
    {
      field: 'tag_name',
      header: 'Service Tag',
      render: (val, row) =>
        val ? (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: `${row.tag_color || '#0078D4'}15`,
              color: row.tag_color || '#0078D4',
              border: `1px solid ${row.tag_color || '#0078D4'}40`,
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            {val}
          </span>
        ) : (
          '—'
        ),
    },
    {
      field: 'status',
      header: 'Stage',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      field: 'expected_value',
      header: 'Value',
      render: (val, row) => (
        <span style={{ fontWeight: 600, color: row.status === 'WON' ? 'var(--color-success)' : 'inherit' }}>
          {row.status === 'WON' && row.won_amount
            ? formatCurrency(row.won_amount)
            : formatCurrency(val)}
        </span>
      ),
    },
    {
      field: 'assigned_name',
      header: 'Assigned BDM',
      render: (val) =>
        val ? (
          <span style={{ fontWeight: 500 }}>{val}</span>
        ) : (
          <span style={{ color: 'var(--color-text-disabled)', fontStyle: 'italic' }}>Unassigned</span>
        ),
    },
    {
      field: 'updated_at',
      header: 'Last Activity',
      render: (val) => (
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
          {val ? new Date(val).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ];

  const filterTabs = [
    { id: 'ALL', label: 'All Opportunities' },
    { id: 'NEW', label: 'New' },
    { id: 'CONTACTED', label: 'Contacted' },
    { id: 'FOLLOW_UP', label: 'Follow Up' },
    { id: 'NEGOTIATION', label: 'Negotiation' },
    { id: 'WON', label: 'Won' },
    { id: 'LOST', label: 'Lost' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <CommandBar
        title="Opportunities"
        subtitle="Enterprise Sales Pipeline & Accounts"
        actions={[
          {
            label: 'New Lead',
            primary: true,
            icon: <Plus size={14} />,
            onClick: () => setIsQuickCreateOpen(true),
          },
          {
            label: 'Assign Rep',
            disabled: selectedIds.length === 0,
            icon: <UserCheck size={14} />,
            onClick: () => setIsBulkAssignOpen(true),
          },
          {
            label: 'Import CSV',
            icon: <Upload size={14} />,
            onClick: () => setIsCsvImportOpen(true),
          },
          {
            label: 'Export CSV',
            icon: <Download size={14} />,
            onClick: handleExportCsv,
          },
          {
            label: 'Refresh',
            icon: <RefreshCw size={14} className={isLoading ? 'spin' : ''} />,
            onClick: fetchLeads,
          },
        ]}
      />

      <div style={{ flex: 1, padding: '20px', overflow: 'hidden' }}>
        <DataGrid
          columns={columns}
          data={leads}
          keyField="id"
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={(row) => navigate(`/leads/${row.id}`)}
          isLoading={isLoading}
          filterTabs={filterTabs}
          activeFilterTab={activeTab}
          onFilterTabChange={setActiveTab}
          searchPlaceholder="Search by company, contact, or title..."
        />
      </div>

      {/* Quick Create Drawer */}
      <QuickCreateDrawer
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        onSuccess={fetchLeads}
      />

      {/* Bulk Assign Modal */}
      <BulkAssignModal
        isOpen={isBulkAssignOpen}
        onClose={() => setIsBulkAssignOpen(false)}
        selectedLeadIds={selectedIds}
        onSuccess={() => {
          setSelectedIds([]);
          fetchLeads();
        }}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onSuccess={fetchLeads}
      />
    </div>
  );
}
