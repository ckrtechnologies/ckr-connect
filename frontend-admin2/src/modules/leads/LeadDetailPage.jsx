import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetLeadDetailQuery, useGetAccountsQuery } from '../../core/api/apiSlice.js';
import { useBootstrap } from '../../core/context/BootstrapContext.jsx';
import leadsApi from './api.js';
import BpfChevronBar from './components/BpfChevronBar.jsx';
import WonDealModal from './components/WonDealModal.jsx';
import BulkAssignModal from './components/BulkAssignModal.jsx';
import LogInteractionModal from './components/LogInteractionModal.jsx';
import MarkLostModal from './components/MarkLostModal.jsx';
import DeleteLeadModal from './components/DeleteLeadModal.jsx';
import UserAvatarMenu from '../../core/components/UserAvatarMenu.jsx';
import { toast } from '../../core/components/Toast.jsx';
import MultiSelectDropdown from '../../core/components/MultiSelectDropdown.jsx';
import DateTimePicker from '../../core/components/DateTimePicker.jsx';

const STAGE_PROBABILITIES = {
  new: 10,
  contacted: 20,
  follow_up: 40,
  proposal: 60,
  negotiation: 60,
  won: 100,
  lost: 0,
  invalid: 0,
};

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { data: resData, isLoading, refetch } = useGetLeadDetailQuery(id);
  const { bdms = [], tags = [] } = useBootstrap() || {};
  const { data: accountsRes } = useGetAccountsQuery();
  const accountsList = accountsRes?.data?.items || accountsRes?.data || [];

  // Active Tab: 'summary' | 'details' | 'related'
  const [activeTab, setActiveTab] = useState('summary');

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isMarkLostOpen, setIsMarkLostOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isWonModalOpen, setIsWonModalOpen] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState(null);
  const [isUploadingBrd, setIsUploadingBrd] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const rawData = resData?.data;
  const lead = rawData?.lead || rawData;
  const interactions = rawData?.interactions || [];
  const assignedBdm = Array.isArray(bdms) ? bdms.find((u) => u.id === lead?.assigned_to) : null;
  const leadTags = lead?.tags || [];
  const account = Array.isArray(accountsList) ? accountsList.find((a) => a.id === lead?.account_id) : null;

  const leadDocuments = Array.isArray(lead?.documents)
    ? lead.documents
    : lead?.brd_url
    ? [{ id: 'legacy-brd', name: lead.brd_url.split('/').pop(), file_name: lead.brd_url.split('/').pop(), url: lead.brd_url }]
    : [];

  // Editable Form State
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    phone: '',
    email: '',
    state: '',
    city: '',
    tag_ids: [],
    deal_type: 'new_business',
    expected_value: 0,
    won_amount: 0,
    sub_requirement: '',
    next_followup_date: '',
  });

  useEffect(() => {
    if (lead) {
      const toLocalDatetimeString = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const tzOffset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      };

      setFormData({
        name: lead.name || '',
        company_name: lead.company_name || '',
        phone: lead.phone || '',
        email: lead.email || '',
        state: lead.state || '',
        city: lead.city || '',
        tag_ids: lead.tags?.map(t => t.id) || [],
        deal_type: lead.deal_type || 'new_business',
        expected_value: lead.expected_value || lead.budget || 0,
        won_amount: lead.won_amount || 0,
        sub_requirement: lead.sub_requirement || lead.notes || '',
        next_followup_date: toLocalDatetimeString(lead.next_followup_date),
      });
    }
  }, [lead, tags]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveLead = async () => {
    try {
      setIsSaving(true);
      const payload = {
        ...formData,
        next_followup_date: formData.next_followup_date ? new Date(formData.next_followup_date).toISOString() : null,
      };
      await leadsApi.updateLead(lead.id, payload);
      toast.success('Lead details saved successfully');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to save lead');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStageAdvance = async (newStage) => {
    try {
      if (newStage === 'won') {
        setIsWonModalOpen(true);
        return;
      }
      const terminalStages = ['won', 'lost', 'invalid'];
      if (!terminalStages.includes(newStage) && !formData.next_followup_date) {
        toast.error('Please set and save a Next Follow-up Date/Time before advancing to this stage');
        return;
      }
      await leadsApi.updateLeadStatus(lead.id, {
        status: newStage,
        remarks: `Stage advanced to ${newStage.replace('_', ' ')}`,
      });
      toast.success(`Stage advanced to ${newStage.replace('_', ' ')}`);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to advance stage');
    }
  };

  const handleBrdUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    try {
      setIsUploadingBrd(true);
      await leadsApi.uploadBrd(lead.id, data);
      toast.success('Document uploaded successfully to VPS disk');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to upload document');
    } finally {
      setIsUploadingBrd(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadDoc = async (doc) => {
    try {
      const res = await leadsApi.downloadBrd(lead.id, doc?.id);
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc?.name || doc?.file_name || `Doc_${lead.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Document downloaded');
    } catch (err) {
      toast.error(err.message || 'Failed to download document');
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document attachment?')) {
      return;
    }
    try {
      setDeletingDocId(docId);
      await leadsApi.deleteDocument(lead.id, docId);
      toast.success('Document removed successfully');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to remove document');
    } finally {
      setDeletingDocId(null);
    }
  };

  if (isLoading) {
    return <div style={{ padding: '32px', textAlign: 'center' }}>Loading Lead Opportunity...</div>;
  }

  if (!lead) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <h3>Lead not found or has been removed</h3>
        <button
          className="fluent-btn fluent-btn-secondary"
          style={{ marginTop: '16px' }}
          onClick={() => navigate('/leads')}
        >
          Back to Leads
        </button>
      </div>
    );
  }

  const stageProbability = STAGE_PROBABILITIES[lead.status] ?? 10;

  return (
    <>
      {/* Dynamics Command Bar (Screen A-04) */}
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
              <span className="breadcrumb-link" onClick={() => navigate('/leads')} style={{ cursor: 'pointer' }}>
                Leads
              </span>
              <span className="breadcrumb-sep" style={{ color: 'var(--color-text-secondary)', margin: '0 4px' }}>
                ›
              </span>
              <span className="breadcrumb-current" style={{ color: 'var(--color-text-secondary)' }}>
                {lead.name}
              </span>
            </div>
            <div className="command-bar-page-title" style={{ fontSize: '15px', fontWeight: 600 }}>
              {lead.name} · {lead.company_name || 'Individual Lead'}
            </div>
          </div>

          <div className="command-bar-actions">
            <button className="fluent-btn-command" onClick={() => navigate('/leads')}>
              ← Back to Leads
            </button>
            <button
              className="fluent-btn-command primary-cmd"
              onClick={handleSaveLead}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save & Close'}
            </button>
            {lead.status !== 'won' && (
              <button
                className="fluent-btn-command"
                style={{ color: 'var(--color-success)', fontWeight: 600 }}
                onClick={() => setIsWonModalOpen(true)}
              >
                🏆 Close as Won
              </button>
            )}
            <button className="fluent-btn-command" onClick={() => setIsAssignModalOpen(true)}>
              Assign
            </button>
            <button
              className="fluent-btn-command"
              style={{ color: 'var(--color-error)' }}
              onClick={() => setIsDeleteModalOpen(true)}
              title="Delete this lead"
            >
              Delete Lead
            </button>
          </div>
        </div>

        <div className="command-bar-right">
          <UserAvatarMenu />
        </div>
      </header>

      {/* Main Form Workspace (Screen A-04 layout) */}
      <div className="admin-content-area" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div className="dynamics-form-container">
          {/* Lead Header Card */}
          <div className="form-header-card">
            <div className="form-title-group">
              <h1>
                <span>{lead.name}</span>
                <span className={`status-badge ${lead.status}`}>
                  {(lead.status || 'new').replace('_', ' ')}
                </span>
              </h1>
              <div className="form-meta-row">
                <span>
                  <strong>Company:</strong> {lead.company_name || 'Individual'}
                </span>
                <span>
                  <strong>Phone:</strong> {lead.phone}
                </span>
                <span>
                  <strong>Owner:</strong> {assignedBdm ? assignedBdm.name : 'Unassigned'}
                </span>
                <span>
                  <strong>Deal Type:</strong> {(lead.deal_type || 'NEW_BUSINESS').toUpperCase()}
                </span>
                <span>
                  <strong>Forecast:</strong> ₹{(lead.expected_value || lead.budget || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="fluent-btn fluent-btn-primary"
                onClick={handleSaveLead}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                className="fluent-btn fluent-btn-secondary"
                onClick={() => setIsAssignModalOpen(true)}
              >
                Reassign
              </button>
            </div>
          </div>

          {/* Business Process Flow Chevron Stepper (Screen A-04) */}
          <BpfChevronBar
            currentStatus={lead.status}
            onStageClick={handleStageAdvance}
            onDropoffClick={() => setIsMarkLostOpen(true)}
          />

          {/* Dynamics Classic Tabs: Summary / Requirement Details / Related History & Accounts */}
          <div className="dynamics-tabs-header">
            <button
              type="button"
              className={`fluent-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              Summary
            </button>
            <button
              type="button"
              className={`fluent-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Requirement Details
            </button>
            <button
              type="button"
              className={`fluent-tab-btn ${activeTab === 'related' ? 'active' : ''}`}
              onClick={() => setActiveTab('related')}
            >
              Related History & Accounts
            </button>
          </div>

          {/* Two Column Layout: Main Form + Docked Activity Timeline */}
          <div className="form-two-column-layout">
            {/* Left Column: Form Tab Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeTab === 'summary' && (
                <>
                  {/* General Lead Information Card */}
                  <div className="form-section-card">
                    <div className="form-section-title">General Lead Information</div>
                    <div className="form-fields-grid">
                      <div className="form-field-group">
                        <label className="form-field-label">Contact Person</label>
                        <input
                          type="text"
                          className="form-field-input"
                          value={formData.name}
                          onChange={(e) => handleFieldChange('name', e.target.value)}
                        />
                      </div>
                      <div className="form-field-group">
                        <label className="form-field-label">Company Name</label>
                        <input
                          type="text"
                          className="form-field-input"
                          value={formData.company_name}
                          onChange={(e) => handleFieldChange('company_name', e.target.value)}
                        />
                      </div>
                      <div className="form-field-group">
                        <label className="form-field-label">Phone Number</label>
                        <input
                          type="text"
                          className="form-field-input"
                          value={formData.phone}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                        />
                      </div>
                      <div className="form-field-group">
                        <label className="form-field-label">Email Address</label>
                        <input
                          type="email"
                          className="form-field-input"
                          value={formData.email}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                        />
                      </div>
                      <div className="form-field-group">
                        <label className="form-field-label">State</label>
                        <input
                          type="text"
                          className="form-field-input"
                          value={formData.state}
                          onChange={(e) => handleFieldChange('state', e.target.value)}
                        />
                      </div>
                      <div className="form-field-group">
                        <label className="form-field-label">City</label>
                        <input
                          type="text"
                          className="form-field-input"
                          value={formData.city}
                          onChange={(e) => handleFieldChange('city', e.target.value)}
                        />
                      </div>
                      <div className="form-field-group">
                        <label className="form-field-label">Next Follow-up Date/Time</label>
                        <DateTimePicker
                          value={formData.next_followup_date}
                          onChange={(val) => handleFieldChange('next_followup_date', val)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Deal Forecasting & Commercials Card */}
                  <div className="form-section-card">
                    <div className="form-section-title">Deal Forecasting & Commercials</div>
                    <div className="form-fields-grid">
                      <div className="form-field-group">
                        <label className="form-field-label">Product / Service Offering</label>
                        <MultiSelectDropdown 
                          options={(tags || []).map(t => ({ label: t.name, value: t.id }))}
                          value={formData.tag_ids || []}
                          onChange={(values) => handleFieldChange('tag_ids', values)}
                          placeholder="Select tags..."
                        />
                      </div>
                      <div className="form-field-group">
                        <label className="form-field-label">Deal Type</label>
                        <select
                          className="form-field-select"
                          value={formData.deal_type}
                          onChange={(e) => handleFieldChange('deal_type', e.target.value)}
                        >
                          <option value="new_business">New Business</option>
                          <option value="upsell">Upsell</option>
                          <option value="resell">Resell / Renewal</option>
                        </select>
                      </div>
                      <div className="form-field-group">
                        <label className="form-field-label">Expected Value (₹ Forecast)</label>
                        <input
                          type="number"
                          className="form-field-input"
                          value={formData.expected_value}
                          onChange={(e) =>
                            handleFieldChange('expected_value', parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="form-field-group">
                        <label className="form-field-label">Stage Probability (%)</label>
                        <input
                          type="text"
                          className="form-field-input"
                          value={`${stageProbability}%`}
                          disabled
                          style={{ background: 'var(--color-surface-alt)', cursor: 'not-allowed' }}
                        />
                      </div>

                      {lead.status === 'won' && (
                        <div className="form-field-group full-width">
                          <label className="form-field-label" style={{ color: 'var(--color-success)' }}>
                            Closed Won Amount (₹ Mandatory)
                          </label>
                          <input
                            type="number"
                            className="form-field-input"
                            value={formData.won_amount}
                            onChange={(e) =>
                              handleFieldChange('won_amount', parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'details' && (
                <div className="form-section-card">
                  <div className="form-section-title">Technical & Custom Requirements</div>
                  <div className="form-field-group">
                    <label className="form-field-label">Sub-Requirement Summary</label>
                    <textarea
                      className="form-field-textarea"
                      rows={5}
                      placeholder="Outline specific business and technical requirements, deliverables, milestones..."
                      value={formData.sub_requirement}
                      onChange={(e) => handleFieldChange('sub_requirement', e.target.value)}
                    />
                  </div>

                  <div className="form-field-group" style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label className="form-field-label" style={{ fontWeight: 600, fontSize: '13px', margin: 0 }}>
                        Attached Documents & BRDs ({leadDocuments.length})
                      </label>
                      <button
                        type="button"
                        className="fluent-btn fluent-btn-primary"
                        style={{ height: '30px', fontSize: '12px', padding: '0 12px' }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingBrd}
                      >
                        {isUploadingBrd ? 'Uploading...' : '+ Attach Document'}
                      </button>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx,.xlsx,.txt,.csv,.png,.jpg,.jpeg"
                      onChange={handleBrdUpload}
                    />

                    {leadDocuments.length === 0 ? (
                      <div
                        style={{
                          padding: '24px',
                          textAlign: 'center',
                          background: 'var(--color-surface-alt)',
                          border: '1px dashed var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--color-text-secondary)',
                          fontSize: '13px',
                        }}
                      >
                        No documents attached yet. Click &quot;+ Attach Document&quot; to upload BRDs, proposals, or specs.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {leadDocuments.map((doc, idx) => {
                          const docName = doc.name || doc.file_name || `Document_${idx + 1}`;
                          const ext = docName.split('.').pop().toLowerCase();
                          const icon = ext === 'pdf' ? '📕' : ['xls', 'xlsx', 'csv'].includes(ext) ? '📊' : ['doc', 'docx'].includes(ext) ? '📘' : ['png', 'jpg', 'jpeg'].includes(ext) ? '🖼️' : '📄';
                          const formattedSize = doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : '';

                          return (
                            <div
                              key={doc.id || idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                background: 'var(--color-surface-alt)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-sm)',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                                <span style={{ fontSize: '20px' }}>{icon}</span>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div
                                    style={{
                                      fontSize: '13px',
                                      fontWeight: 600,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                    title={docName}
                                  >
                                    {docName}
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                    {formattedSize ? `${formattedSize} · ` : ''}
                                    Uploaded {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'recently'}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  className="fluent-btn fluent-btn-secondary"
                                  style={{ height: '28px', fontSize: '12px', padding: '0 10px' }}
                                  onClick={() => handleDownloadDoc(doc)}
                                >
                                  Download
                                </button>
                                <button
                                  type="button"
                                  className="fluent-btn fluent-btn-secondary"
                                  style={{ height: '28px', fontSize: '12px', padding: '0 8px', color: 'var(--color-error)' }}
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  disabled={deletingDocId === doc.id}
                                  title="Delete document attachment"
                                >
                                  {deletingDocId === doc.id ? '...' : '✕'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'related' && (
                <div className="form-section-card">
                  <div className="form-section-title">Parent Company Account Link</div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                    Accounts allow repeat business, upselling, and reselling to be tracked under a single unified company history.
                  </p>
                  {account ? (
                    <div
                      style={{
                        background: 'var(--color-surface-alt)',
                        padding: '16px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <h4 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 6px 0' }}>{account.name}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 8px 0' }}>
                        Lifetime Won Revenue: ₹{(account.lifetime_revenue || 0).toLocaleString('en-IN')}
                      </p>
                      <button
                        type="button"
                        className="fluent-btn fluent-btn-secondary"
                        style={{ height: '28px', fontSize: '12px' }}
                        onClick={() => navigate(`/accounts/${account.id}`)}
                      >
                        View Account History ›
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      No Account currently linked to this lead.{' '}
                      <button
                        type="button"
                        className="fluent-btn fluent-btn-secondary"
                        style={{ height: '28px', marginLeft: '8px' }}
                        onClick={() => toast.info('Auto-account creation triggers upon closing deal as Won')}
                      >
                        Link to Account
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Docked Activity Timeline Pane (Screen A-04) */}
            <div className="timeline-card">
              <div className="timeline-header">
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Activity Timeline</span>
                <button
                  type="button"
                  className="fluent-btn fluent-btn-secondary"
                  style={{ height: '26px', fontSize: '11px', padding: '0 8px' }}
                  onClick={() => setIsLogModalOpen(true)}
                >
                  + Log Call/Note
                </button>
              </div>

              <div className="timeline-list">
                {interactions.length === 0 ? (
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px', padding: '24px 0', textAlign: 'center' }}>
                    No activities logged yet. Click &quot;+ Log Call/Note&quot; above to log calls, WhatsApp, or meetings.
                  </div>
                ) : (
                  interactions.map((i) => {
                    const icon =
                      i.type === 'call' ? '📞' : i.type === 'whatsapp' ? '💬' : i.type === 'meeting' ? '👥' : '🏢';

                    return (
                      <div key={i.id} className="timeline-item">
                        <div className="timeline-icon">{icon}</div>
                        <div className="timeline-body">
                          <div className="timeline-top">
                            <span className="timeline-author">
                              {(i.type || 'CALL').toUpperCase()}
                              {i.call_result && (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 400,
                                    color: 'var(--color-text-secondary)',
                                    marginLeft: '6px',
                                  }}
                                >
                                  ({i.call_result})
                                </span>
                              )}
                            </span>
                            <span className="timeline-time">
                              {i.created_at ? i.created_at.slice(0, 10) : ''}
                            </span>
                          </div>
                          <div className="timeline-notes">{i.notes}</div>
                          {i.next_action && (
                            <div className="timeline-action">Next Action: {i.next_action}</div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isAssignModalOpen && (
        <BulkAssignModal
          isOpen={isAssignModalOpen}
          selectedLeadIds={[lead.id]}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={refetch}
        />
      )}

      {isLogModalOpen && (
        <LogInteractionModal
          isOpen={isLogModalOpen}
          leadId={lead.id}
          leadName={lead.name}
          onClose={() => setIsLogModalOpen(false)}
          onSuccess={refetch}
        />
      )}

      {isMarkLostOpen && (
        <MarkLostModal
          isOpen={isMarkLostOpen}
          leadId={lead.id}
          leadName={lead.name}
          onClose={() => setIsMarkLostOpen(false)}
          onSuccess={refetch}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteLeadModal
          isOpen={isDeleteModalOpen}
          leadIds={[lead.id]}
          leadNames={lead.name}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={() => {
            navigate('/leads');
          }}
        />
      )}

      {isWonModalOpen && (
        <WonDealModal
          isOpen={isWonModalOpen}
          lead={lead}
          accounts={accountsList}
          onClose={() => setIsWonModalOpen(false)}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
    </>
  );
}
