import React, { useState } from 'react';
import { toast } from '../../../core/components/Toast.jsx';
import { useImportLeadsCsvMutation } from '../../../core/api/apiSlice.js';

export default function ImportCsvModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [importCsv, { isLoading }] = useImportLeadsCsvMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a CSV file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await importCsv(formData).unwrap();
      toast.success(res.message || 'Successfully imported leads from CSV');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to import CSV');
    }
  };

  return (
    <div className="fluent-modal-overlay">
      <div className="fluent-modal-container" style={{ maxWidth: '500px' }}>
        <div className="fluent-modal-header">
          <h2 className="fluent-modal-title">Bulk Import Leads</h2>
          <button type="button" className="fluent-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="fluent-form">
          <div className="fluent-modal-body">
            <p style={{ marginBottom: '16px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
              Upload a CSV file containing your leads. Make sure your file matches the required column structure.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <a 
                href="/sample_leads_import.csv" 
                download 
                style={{ color: 'var(--color-brand-primary)', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'text-bottom', marginRight: '4px' }}>
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                </svg>
                Download Sample CSV Template
              </a>
            </div>

            <div className="fluent-input-group">
              <label>Select CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
                required
                style={{ padding: '8px 0' }}
              />
            </div>
          </div>

          <div className="fluent-modal-footer">
            <button type="button" className="fluent-btn-default" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="fluent-btn-primary" disabled={isLoading || !file}>
              {isLoading ? 'Importing...' : 'Upload & Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
