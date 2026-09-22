import React, { useState } from 'react';
import Modal from '../../../core/components/Modal.jsx';
import leadsApi from '../api.js';
import { toast } from '../../../core/components/Toast.jsx';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';

export default function CsvImportModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await leadsApi.importCsv(formData);
      setImportResult(res.data);
      toast.success('CSV import completed');
      onSuccess && onSuccess();
    } catch (err) {
      toast.error(err.message || 'CSV Import failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Leads from CSV"
      subtitle="Bulk upload opportunities using standard CSV column mapping"
      footer={
        importResult ? (
          <button
            type="button"
            onClick={onClose}
            className="fluent-btn fluent-btn-primary"
          >
            Done
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onClose}
              className="fluent-btn fluent-btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="fluent-btn fluent-btn-primary"
              disabled={isSubmitting || !file}
            >
              {isSubmitting ? 'Uploading & Parsing...' : 'Import Records'}
            </button>
          </>
        )
      }
    >
      {importResult ? (
        <div style={{ textAlign: 'center', padding: '16px' }}>
          <CheckCircle2 size={40} color="var(--color-success)" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: '16px', fontWeight: 600 }}>Import Finished</h4>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Successfully processed: <strong>{importResult.imported_count || importResult.imported || 0}</strong> record(s).
          </p>
          {importResult.errors?.length > 0 && (
            <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--color-error)' }}>
              {importResult.errors.length} rows had formatting errors and were skipped.
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              border: '2px dashed var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '28px',
              textAlign: 'center',
              backgroundColor: 'var(--color-surface-alt)',
              cursor: 'pointer',
            }}
            onClick={() => document.getElementById('csv-file-input')?.click()}
          >
            <Upload size={32} color="var(--color-primary)" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, fontSize: '13px' }}>
              {file ? file.name : 'Click to browse or drag and drop CSV file'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Supported columns: company_name, contact_name, contact_phone, contact_email, title, expected_value
            </div>
            <input
              id="csv-file-input"
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xs)',
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--color-text-primary)' }}>
              CSV Format Guidelines:
            </div>
            <p>1. Must contain header line with column names.</p>
            <p>2. `company_name` and `title` are required.</p>
            <p>3. Expected value should be numeric without currency symbols.</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
