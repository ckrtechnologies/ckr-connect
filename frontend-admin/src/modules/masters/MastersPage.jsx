import React, { useState } from 'react';
import {
  useGetTagsQuery,
  useCreateTagMutation,
  useGetHolidaysQuery,
  useCreateHolidayMutation,
  useDeleteHolidayMutation,
} from '../../core/api/apiSlice.js';
import CommandBar from '../../core/layout/CommandBar.jsx';
import { useBootstrap } from '../../core/context/BootstrapContext.jsx';
import { toast } from '../../core/components/Toast.jsx';
import { Plus, Trash2, Tag, Calendar, RefreshCw } from 'lucide-react';

export default function MastersPage() {
  const { refreshBootstrap } = useBootstrap();
  const [activeTab, setActiveTab] = useState('TAGS');

  // Form states
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#0078D4');
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('');

  // RTK Query Hooks
  const { data: tagsRes, isLoading: tagsLoading, refetch: refetchTags } = useGetTagsQuery();
  const { data: holidaysRes, isLoading: holidaysLoading, refetch: refetchHolidays } = useGetHolidaysQuery({
    year: new Date().getFullYear(),
  });

  const [createTag, { isLoading: isAddingTag }] = useCreateTagMutation();
  const [createHoliday, { isLoading: isAddingHoliday }] = useCreateHolidayMutation();
  const [deleteHoliday] = useDeleteHolidayMutation();

  const tags = Array.isArray(tagsRes?.data?.tags)
    ? tagsRes.data.tags
    : (Array.isArray(tagsRes?.data) ? tagsRes.data : []);
  const holidays = Array.isArray(holidaysRes?.data?.holidays)
    ? holidaysRes.data.holidays
    : (Array.isArray(holidaysRes?.data) ? holidaysRes.data : []);
  const isLoading = activeTab === 'TAGS' ? tagsLoading : holidaysLoading;
  const refetch = activeTab === 'TAGS' ? refetchTags : refetchHolidays;

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      await createTag({
        name: newTagName.trim(),
        type: 'service',
      }).unwrap();
      toast.success('Service tag created');
      setNewTagName('');
      refreshBootstrap();
    } catch (err) {
      toast.error(err.data?.error || err.message || 'Failed to create tag');
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!newHolidayName.trim() || !newHolidayDate) return;

    try {
      await createHoliday({
        name: newHolidayName.trim(),
        date: newHolidayDate,
      }).unwrap();
      toast.success('Company holiday scheduled');
      setNewHolidayName('');
      setNewHolidayDate('');
      refreshBootstrap();
    } catch (err) {
      toast.error(err.data?.error || err.message || 'Failed to schedule holiday');
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm('Delete this scheduled company holiday?')) return;
    try {
      await deleteHoliday(id).unwrap();
      toast.success('Holiday removed');
      refreshBootstrap();
    } catch (err) {
      toast.error(err.data?.error || err.message || 'Failed to delete holiday');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <CommandBar
        title="Configuration & Masters"
        subtitle="Offering service tags and official company holidays"
        actions={[
          {
            label: 'Refresh',
            icon: <RefreshCw size={14} className={isLoading ? 'spin' : ''} />,
            onClick: refetch,
          },
        ]}
      />

      {/* Tabs Bar */}
      <div
        style={{
          padding: '0 20px',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          gap: '8px',
        }}
      >
        <button
          onClick={() => setActiveTab('TAGS')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'TAGS' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'TAGS' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === 'TAGS' ? 600 : 400,
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Tag size={14} />
          <span>Offering Service Tags</span>
        </button>

        <button
          onClick={() => setActiveTab('HOLIDAYS')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'HOLIDAYS' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'HOLIDAYS' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === 'HOLIDAYS' ? 600 : 400,
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Calendar size={14} />
          <span>Company Holiday Calendar</span>
        </button>
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {activeTab === 'TAGS' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', maxWidth: '1000px' }}>
            {/* Add Tag Form */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '20px',
                height: 'fit-content',
              }}
            >
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px' }}>
                Create Service Tag
              </h3>
              <form onSubmit={handleAddTag} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="fluent-label">Tag / Offering Name *</label>
                  <input
                    type="text"
                    required
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="e.g. AI Workflow Automation"
                    className="fluent-input"
                  />
                </div>

                <div>
                  <label className="fluent-label">Badge Color Accent</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      style={{ width: '36px', height: '32px', border: 'none', cursor: 'pointer', background: 'none' }}
                    />
                    <input
                      type="text"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="fluent-input"
                      style={{ width: '100px' }}
                    />
                    <div
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: `${newTagColor}20`,
                        color: newTagColor,
                        fontWeight: 600,
                        fontSize: '11px',
                        border: `1px solid ${newTagColor}40`,
                      }}
                    >
                      Preview
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAddingTag}
                  className="fluent-btn fluent-btn-primary"
                  style={{ marginTop: '8px' }}
                >
                  <Plus size={14} />
                  <span>{isAddingTag ? 'Creating...' : 'Save Tag'}</span>
                </button>
              </form>
            </div>

            {/* Tags Table */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 16px' }}>Service Offering Tag</th>
                    <th style={{ padding: '8px 16px' }}>Color Code</th>
                    <th style={{ padding: '8px 16px', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--color-border)', height: '40px' }}>
                      <td style={{ padding: '8px 16px' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: `${t.color || '#0078D4'}15`,
                            color: t.color || '#0078D4',
                            border: `1px solid ${t.color || '#0078D4'}40`,
                            fontWeight: 600,
                            fontSize: '11px',
                          }}
                        >
                          {t.name}
                        </span>
                      </td>
                      <td style={{ padding: '8px 16px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {t.color}
                      </td>
                      <td style={{ padding: '8px 16px', textAlign: 'right', color: 'var(--color-success)', fontWeight: 600, fontSize: '12px' }}>
                        Active
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', maxWidth: '1000px' }}>
            {/* Add Holiday Form */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '20px',
                height: 'fit-content',
              }}
            >
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px' }}>
                Schedule Holiday
              </h3>
              <form onSubmit={handleAddHoliday} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="fluent-label">Holiday Name *</label>
                  <input
                    type="text"
                    required
                    value={newHolidayName}
                    onChange={(e) => setNewHolidayName(e.target.value)}
                    placeholder="e.g. Diwali Festival"
                    className="fluent-input"
                  />
                </div>

                <div>
                  <label className="fluent-label">Holiday Date *</label>
                  <input
                    type="date"
                    required
                    value={newHolidayDate}
                    onChange={(e) => setNewHolidayDate(e.target.value)}
                    className="fluent-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAddingHoliday}
                  className="fluent-btn fluent-btn-primary"
                  style={{ marginTop: '8px' }}
                >
                  <Plus size={14} />
                  <span>{isAddingHoliday ? 'Scheduling...' : 'Add Holiday'}</span>
                </button>
              </form>
            </div>

            {/* Holidays Table */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 16px' }}>Date</th>
                    <th style={{ padding: '8px 16px' }}>Holiday Name</th>
                    <th style={{ padding: '8px 16px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                        No company holidays scheduled
                      </td>
                    </tr>
                  ) : (
                    holidays.map((h) => (
                      <tr key={h.id} style={{ borderBottom: '1px solid var(--color-border)', height: '40px' }}>
                        <td style={{ padding: '8px 16px', fontWeight: 600 }}>
                          {new Date(h.holiday_date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td style={{ padding: '8px 16px' }}>{h.name}</td>
                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteHoliday(h.id)}
                            className="fluent-btn-subtle"
                            style={{ color: 'var(--color-error)', padding: '4px', cursor: 'pointer', border: 'none' }}
                            title="Delete Holiday"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
