import React, { useState, useEffect } from 'react';
import { useBootstrap } from '../../../core/context/BootstrapContext.jsx';
import MultiSelectDropdown from '../../../core/components/MultiSelectDropdown.jsx';

export default function LeadFilterPanel({ isOpen, onClose, filters, setFilters, onApply }) {
  const { bdms, tags } = useBootstrap();

  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    setFilters(localFilters);
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters = { search: '', status: '', tag_ids: [], assigned_to: '' };
    setLocalFilters(defaultFilters);
    setFilters(defaultFilters);
    onApply(defaultFilters);
    onClose();
  };

  return (
    <div className="quick-create-overlay dock-right open" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="quick-create-panel" onClick={(e) => e.stopPropagation()}>
        <div className="quick-create-header">
          <h2 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔍 Advanced Filters</span>
          </h2>
          <button className="icon-btn-utility" onClick={onClose}>✕</button>
        </div>
        
        <div className="quick-create-body">
          <div className="form-field-group">
            <label className="form-field-label">Search</label>
            <input
              type="text"
              className="form-field-input"
              placeholder="Name, email, phone, city..."
              value={localFilters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
            />
          </div>

          <div className="form-field-group" style={{ marginTop: '16px' }}>
            <label className="form-field-label">Stage</label>
            <select
              className="form-field-select"
              value={localFilters.status || ''}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="">All Stages</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="follow_up">Follow Up</option>
              <option value="proposal">Proposal</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="invalid">Invalid</option>
            </select>
          </div>

          <div className="form-field-group" style={{ marginTop: '16px' }}>
            <label className="form-field-label">Tags (Products/Services)</label>
            <MultiSelectDropdown 
              options={(tags || []).map(t => ({ label: t.name, value: t.id }))}
              value={localFilters.tag_ids || []}
              onChange={(values) => handleChange('tag_ids', values)}
              placeholder="Select tags to filter..."
            />
          </div>

          <div className="form-field-group" style={{ marginTop: '16px' }}>
            <label className="form-field-label">Assigned BDM</label>
            <select
              className="form-field-select"
              value={localFilters.assigned_to || ''}
              onChange={(e) => handleChange('assigned_to', e.target.value)}
            >
              <option value="">Any BDM</option>
              <option value="unassigned">Unassigned Pool</option>
              {(bdms || []).map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="quick-create-footer">
          <button className="fluent-btn fluent-btn-secondary" onClick={handleReset}>
            Reset
          </button>
          <button className="fluent-btn primary-cmd" onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
