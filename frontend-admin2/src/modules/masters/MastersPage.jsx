import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTagsQuery, useCreateTagMutation, useUpdateTagMutation, useDeleteTagMutation, useGetHolidaysQuery, useCreateHolidayMutation, useDeleteHolidayMutation } from '../../core/api/apiSlice.js';
import { toast } from '../../core/components/Toast.jsx';
import UserAvatarMenu from '../../core/components/UserAvatarMenu.jsx';

export default function MastersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tags'); // 'tags' | 'holidays'

  // Tags
  const { data: tagsRes, refetch: refetchTags } = useGetTagsQuery();
  const [createTag] = useCreateTagMutation();
  const [updateTag] = useUpdateTagMutation();
  const [deleteTag] = useDeleteTagMutation();
  const [editingTagId, setEditingTagId] = useState(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagType, setNewTagType] = useState('service');
  const [newTagColor, setNewTagColor] = useState('#0078D4');

  // Holidays
  const { data: holidaysRes, refetch: refetchHolidays } = useGetHolidaysQuery();
  const [createHoliday] = useCreateHolidayMutation();
  const [deleteHoliday] = useDeleteHolidayMutation();
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState(() => new Date().toISOString().split('T')[0]);

  const tags = Array.isArray(tagsRes?.data?.data) ? tagsRes.data.data : Array.isArray(tagsRes?.data?.tags) ? tagsRes.data.tags : Array.isArray(tagsRes?.data) ? tagsRes.data : [];
  const holidays = Array.isArray(holidaysRes?.data?.data) ? holidaysRes.data.data : Array.isArray(holidaysRes?.data?.holidays) ? holidaysRes.data.holidays : Array.isArray(holidaysRes?.data) ? holidaysRes.data : [];

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      if (editingTagId) {
        await updateTag({ id: editingTagId, name: newTagName.trim(), type: newTagType, color_hex: newTagColor }).unwrap();
        toast.success('Offering Tag updated');
      } else {
        await createTag({ name: newTagName.trim(), type: newTagType, color_hex: newTagColor }).unwrap();
        toast.success('Offering Tag registered');
      }
      handleCancelEdit();
      refetchTags();
    } catch (err) {
      toast.error(err.message || 'Failed to save tag');
    }
  };

  const handleEditTag = (t) => {
    setEditingTagId(t.id);
    setNewTagName(t.name);
    setNewTagType(t.type);
    setNewTagColor(t.color_hex || '#0078D4');
  };

  const handleCancelEdit = () => {
    setEditingTagId(null);
    setNewTagName('');
    setNewTagType('service');
    setNewTagColor('#0078D4');
  };

  const handleDeleteTag = async (id) => {
    try {
      await deleteTag(id).unwrap();
      toast.success('Tag deleted');
      refetchTags();
    } catch (err) {
      toast.error(err.message || 'Failed to delete tag');
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!newHolidayName.trim()) return;
    try {
      await createHoliday({ name: newHolidayName.trim(), date: newHolidayDate, is_optional: false }).unwrap();
      toast.success('Holiday registered');
      setNewHolidayName('');
      refetchHolidays();
    } catch (err) {
      toast.error(err.message || 'Failed to add holiday');
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      await deleteHoliday(id).unwrap();
      toast.success('Holiday deleted');
      refetchHolidays();
    } catch (err) {
      toast.error(err.message || 'Failed to delete holiday');
    }
  };

  return (
    <>
      {/* Dynamics Command Bar (Screen A-10) */}
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
                Masters
              </span>
            </div>
            <div className="command-bar-page-title" style={{ fontSize: '15px', fontWeight: 600 }}>
              Configuration Masters (Tags & Holidays)
            </div>
          </div>
        </div>

        <div className="command-bar-right">
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className={`fluent-btn ${activeTab === 'tags' ? 'fluent-btn-primary' : 'fluent-btn-secondary'}`}
              onClick={() => setActiveTab('tags')}
              style={{ height: '28px', fontSize: '12px' }}
            >
              🏷️ Offering Tags ({tags.length})
            </button>
            <button
              className={`fluent-btn ${activeTab === 'holidays' ? 'fluent-btn-primary' : 'fluent-btn-secondary'}`}
              onClick={() => setActiveTab('holidays')}
              style={{ height: '28px', fontSize: '12px' }}
            >
              📅 Holidays ({holidays.length})
            </button>
          </div>
          <UserAvatarMenu />
        </div>
      </header>

      {/* Main Masters Area (Screen A-10) */}
      <div className="admin-content-area" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {activeTab === 'tags' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            {/* Tags Table */}
            <div className="fluent-grid-container">
              <div className="fluent-grid-toolbar">
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Registered Service & Solution Tags</span>
              </div>
              <table className="fluent-grid-table">
                <thead>
                  <tr>
                    <th>Tag Name</th>
                    <th>Type</th>
                    <th>Color Chip</th>
                    <th>Active Leads</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.map((t) => (
                    <tr key={t.id}>
                      <td><strong>{t.name}</strong></td>
                      <td><span style={{ fontSize: '11px', textTransform: 'uppercase' }}>{t.type}</span></td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            width: '18px',
                            height: '18px',
                            borderRadius: '3px',
                            backgroundColor: t.color_hex || '#0078D4',
                          }}
                        />
                      </td>
                      <td>{t.leads_count ?? t.usage_count ?? 0}</td>
                      <td style={{ display: 'flex', gap: '4px' }}>
                        <button
                          className="fluent-btn fluent-btn-secondary"
                          style={{ height: '22px', fontSize: '10px' }}
                          onClick={() => handleEditTag(t)}
                        >
                          ✎ Edit
                        </button>
                        <button
                          className="fluent-btn fluent-btn-secondary"
                          style={{ height: '22px', fontSize: '10px', color: 'var(--color-error)' }}
                          onClick={() => handleDeleteTag(t.id)}
                        >
                          ✕ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Tag Form */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px' }}>
                {editingTagId ? '✏️ Edit Offering Tag' : '➕ Register New Offering Tag'}
              </h3>
              <form onSubmit={handleAddTag} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-field-group">
                  <label className="form-field-label">Tag Name *</label>
                  <input
                    type="text"
                    className="form-field-input"
                    placeholder="Enter tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-field-label">Offering Category</label>
                  <select
                    className="form-field-select"
                    value={newTagType}
                    onChange={(e) => setNewTagType(e.target.value)}
                  >
                    <option value="service">Service (Consulting & Custom Dev)</option>
                    <option value="product">Product (Packaged Software & Solutions)</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-field-label">Color Accent</label>
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    style={{ height: '36px', width: '100%', cursor: 'pointer', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button type="submit" className="fluent-btn fluent-btn-primary" style={{ flex: 1 }}>
                    {editingTagId ? 'Update Tag' : 'Register Offering Tag'}
                  </button>
                  {editingTagId && (
                    <button type="button" className="fluent-btn fluent-btn-secondary" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            {/* Holidays Table */}
            <div className="fluent-grid-container">
              <div className="fluent-grid-toolbar">
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Corporate Holiday Calendar</span>
              </div>
              <table className="fluent-grid-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Holiday Title</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.map((h) => (
                    <tr key={h.id}>
                      <td><strong>{h.date}</strong></td>
                      <td>{h.name}</td>
                      <td>
                        <button
                          className="fluent-btn fluent-btn-secondary"
                          style={{ height: '22px', fontSize: '10px', color: 'var(--color-error)' }}
                          onClick={() => handleDeleteHoliday(h.id)}
                        >
                          ✕ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Holiday Form */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px' }}>➕ Add Company Holiday</h3>
              <form onSubmit={handleAddHoliday} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-field-group">
                  <label className="form-field-label">Holiday Title *</label>
                  <input
                    type="text"
                    className="form-field-input"
                    placeholder="Enter holiday name"
                    value={newHolidayName}
                    onChange={(e) => setNewHolidayName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-field-label">Holiday Date *</label>
                  <input
                    type="date"
                    className="form-field-input"
                    value={newHolidayDate}
                    onChange={(e) => setNewHolidayDate(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="fluent-btn fluent-btn-primary" style={{ marginTop: '8px' }}>
                  Add Holiday
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
