import React, { useState } from 'react';
import { useGetInteractionsQuery, useGetDailySummaryQuery } from '../../core/api/apiSlice.js';
import CommandBar from '../../core/layout/CommandBar.jsx';
import DataGrid from '../../core/components/DataGrid.jsx';
import { useBootstrap } from '../../core/context/BootstrapContext.jsx';
import { RefreshCw } from 'lucide-react';

export default function ReportsPage() {
  const { bdms } = useBootstrap();
  const [activeTab, setActiveTab] = useState('LEDGER');
  const [selectedBdm, setSelectedBdm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const ledgerParams = {};
  if (selectedBdm) ledgerParams.bdm_id = selectedBdm;
  if (selectedDate) {
    ledgerParams.start_date = selectedDate;
    ledgerParams.end_date = selectedDate;
  }

  const { data: ledgerRes, isLoading: ledgerLoading, refetch: refetchLedger } = useGetInteractionsQuery(ledgerParams);
  const { data: summaryRes, isLoading: summaryLoading, refetch: refetchSummary } = useGetDailySummaryQuery({ date: selectedDate });

  const interactions = Array.isArray(ledgerRes?.data?.items)
    ? ledgerRes.data.items
    : (Array.isArray(ledgerRes?.data) ? ledgerRes.data : []);
  const summary = Array.isArray(summaryRes?.data)
    ? summaryRes.data
    : (Array.isArray(summaryRes?.data?.summary) ? summaryRes.data.summary : []);
  const isLoading = activeTab === 'LEDGER' ? ledgerLoading : summaryLoading;
  const refetch = activeTab === 'LEDGER' ? refetchLedger : refetchSummary;

  const ledgerColumns = [
    {
      field: 'company_name',
      header: 'Company / Lead',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{val || row.lead_title}</div>
          {row.contact_person && (
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              Spoke with: {row.contact_person}
            </div>
          )}
        </div>
      ),
    },
    {
      field: 'interaction_type',
      header: 'Channel',
      render: (val) => (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--color-surface-alt)',
            border: '1px solid var(--color-border)',
            fontWeight: 700,
            fontSize: '11px',
          }}
        >
          {val}
        </span>
      ),
    },
    {
      field: 'notes',
      header: 'Discussion Notes & Action Items',
      render: (val) => (
        <div style={{ maxWidth: '420px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {val}
        </div>
      ),
    },
    {
      field: 'duration_minutes',
      header: 'Duration',
      render: (val) => <span>{val > 0 ? `${val} mins` : '—'}</span>,
    },
    {
      field: 'bdm_name',
      header: 'Logged By',
      render: (val) => <span style={{ fontWeight: 500 }}>{val}</span>,
    },
    {
      field: 'created_at',
      header: 'Timestamp',
      render: (val) => (
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
          {new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
  ];

  const summaryColumns = [
    {
      field: 'bdm_name',
      header: 'Sales Representative',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{val}</span>
          {row.employee_id && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginLeft: '6px' }}>
              ({row.employee_id})
            </span>
          )}
        </div>
      ),
    },
    {
      field: 'total_calls',
      header: 'Total Calls',
      render: (val, row) => <span style={{ fontWeight: 600 }}>{val ?? row.call_count ?? 0}</span>,
    },
    {
      field: 'connected_calls',
      header: 'Connected Calls',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>{val ?? 0}</span>,
    },
    {
      field: 'meetings',
      header: 'Client Meetings',
      render: (val, row) => <span style={{ fontWeight: 600 }}>{val ?? row.meeting_count ?? 0}</span>,
    },
    {
      field: 'total_interactions',
      header: 'Total Interactions',
      render: (val) => (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            fontWeight: 700,
            fontSize: '11px',
          }}
        >
          {val ?? 0}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <CommandBar
        title="Telecalling & Productivity"
        subtitle="Interaction audit ledger & daily rep performance"
        actions={[
          {
            label: 'Refresh',
            icon: <RefreshCw size={14} className={isLoading ? 'spin' : ''} />,
            onClick: refetch,
          },
        ]}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="fluent-input"
              style={{ width: '130px', height: '28px', fontSize: '12px' }}
            />
          </div>

          {activeTab === 'LEDGER' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Rep:</span>
              <select
                value={selectedBdm}
                onChange={(e) => setSelectedBdm(e.target.value)}
                className="fluent-select"
                style={{ width: '150px', height: '28px', fontSize: '12px' }}
              >
                <option value="">All Representatives</option>
                {bdms.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </CommandBar>

      <div style={{ flex: 1, padding: '20px', overflow: 'hidden' }}>
        <DataGrid
          columns={activeTab === 'LEDGER' ? ledgerColumns : summaryColumns}
          data={activeTab === 'LEDGER' ? interactions : summary}
          keyField={activeTab === 'LEDGER' ? 'id' : 'bdm_id'}
          isLoading={isLoading}
          filterTabs={[
            { id: 'LEDGER', label: 'Detailed Call Ledger' },
            { id: 'SUMMARY', label: 'Daily Rep Summary' },
          ]}
          activeFilterTab={activeTab}
          onFilterTabChange={setActiveTab}
          searchPlaceholder="Filter telecalling logs..."
        />
      </div>
    </div>
  );
}
