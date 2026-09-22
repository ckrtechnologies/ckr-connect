import React, { useState, useEffect, useCallback } from 'react';
import interactionsApi from './api.js';
import CommandBar from '../../core/layout/CommandBar.jsx';
import DataGrid from '../../core/components/DataGrid.jsx';
import { useBootstrap } from '../../core/context/BootstrapContext.jsx';
import { toast } from '../../core/components/Toast.jsx';
import { RefreshCw, Phone, Calendar, Clock, User } from 'lucide-react';

export default function ReportsPage() {
  const { bdms } = useBootstrap();
  const [activeTab, setActiveTab] = useState('LEDGER');
  const [selectedBdm, setSelectedBdm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const [interactions, setInteractions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      if (activeTab === 'LEDGER') {
        const params = {};
        if (selectedBdm) params.user_id = selectedBdm;
        if (selectedDate) params.date = selectedDate;
        const res = await interactionsApi.listInteractions(params);
        if (res?.data) {
          setInteractions(res.data.interactions || res.data || []);
        }
      } else {
        const res = await interactionsApi.getDailySummary({ date: selectedDate });
        if (res?.data) {
          setSummary(res.data.summary || res.data || []);
        }
      }
    } catch (err) {
      toast.error('Failed to load activity reports');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedBdm, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>,
    },
    {
      field: 'call_count',
      header: 'Phone Calls',
      render: (val) => <span style={{ fontWeight: 600 }}>{val || 0}</span>,
    },
    {
      field: 'meeting_count',
      header: 'Client Meetings',
      render: (val) => <span style={{ fontWeight: 600 }}>{val || 0}</span>,
    },
    {
      field: 'total_minutes',
      header: 'Total Talk Time',
      render: (val) => <span>{val || 0} mins</span>,
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
            onClick: fetchData,
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
          keyField="id"
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
