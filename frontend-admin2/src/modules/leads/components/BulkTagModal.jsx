import React, { useState } from 'react';
import { useBulkTagLeadsMutation, useGetTagsQuery } from '../../../core/api/apiSlice.js';
import { toast } from '../../../core/components/Toast.jsx';
import MultiSelectDropdown from '../../../core/components/MultiSelectDropdown.jsx';

export default function BulkTagModal({ isOpen, selectedLeadIds, onClose, onSuccess }) {
  const [tagsToAdd, setTagsToAdd] = useState([]);
  const [tagsToRemove, setTagsToRemove] = useState([]);
  const [bulkTagLeads, { isLoading }] = useBulkTagLeadsMutation();
  const { data: tagsData } = useGetTagsQuery();

  const tags = Array.isArray(tagsData?.data) ? tagsData.data : [];
  const tagOptions = tags.map(t => ({ label: t.name, value: t.id }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tagsToAdd.length === 0 && tagsToRemove.length === 0) {
      toast.error('Please select at least one tag to add or remove.');
      return;
    }

    try {
      await bulkTagLeads({ 
        lead_ids: selectedLeadIds, 
        tags_to_add: tagsToAdd,
        tags_to_remove: tagsToRemove
      }).unwrap();
      toast.success(`Successfully updated tags for ${selectedLeadIds.length} leads`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to update tags');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '400px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          🏷 Manage Tags for {selectedLeadIds.length} Leads
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field-group" style={{ marginBottom: '16px' }}>
            <label className="form-field-label">Tags to Add</label>
            <MultiSelectDropdown 
              options={tagOptions}
              value={tagsToAdd}
              onChange={setTagsToAdd}
              placeholder="Select tags to add..."
            />
          </div>
          
          <div className="form-field-group" style={{ marginBottom: '24px' }}>
            <label className="form-field-label">Tags to Remove</label>
            <MultiSelectDropdown 
              options={tagOptions}
              value={tagsToRemove}
              onChange={setTagsToRemove}
              placeholder="Select tags to remove..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              className="fluent-btn fluent-btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="fluent-btn primary-cmd"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Tags'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
