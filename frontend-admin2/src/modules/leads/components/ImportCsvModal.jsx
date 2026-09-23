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
    <div
      className="fluent-dialog-backdrop open"
      onClick={onClose}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}
    >
      <div
        className="fluent-dialog-box"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '500px', maxWidth: '92vw', padding: '20px' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '12px',
            marginBottom: '16px',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
            Bulk Import Leads
          </h2>
          <button className="icon-btn-utility" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="fluent-form">
          <div className="fluent-modal-body">
            <p style={{ marginBottom: '16px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
              Upload a CSV file containing your leads. Make sure your file matches the required column structure.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <a 
                href={`${import.meta.env.BASE_URL}sample_leads_import.csv`}
                download="sample_leads_import.csv"
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

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '14px',
              marginTop: '16px',
            }}
          >
            <button type="button" className="fluent-btn fluent-btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="fluent-btn fluent-btn-primary" disabled={isLoading || !file}>
              {isLoading ? 'Importing...' : 'Upload & Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
