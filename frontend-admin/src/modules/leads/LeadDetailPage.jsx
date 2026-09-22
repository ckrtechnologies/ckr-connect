import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import leadsApi from './api.js';
import CommandBar from '../../core/layout/CommandBar.jsx';
import ProcessFlowBar from '../../core/components/ProcessFlowBar.jsx';
import StatusBadge from '../../core/components/StatusBadge.jsx';
import LeadStatusModal from './components/LeadStatusModal.jsx';
import AddInteractionModal from './components/AddInteractionModal.jsx';
import { toast } from '../../core/components/Toast.jsx';
import {
  ArrowLeft,
  Phone,
  Mail,
  Building,
  Calendar,
  Clock,
  User,
  FileText,
  Plus,
  RefreshCw,
  Edit,
  ExternalLink,
} from 'lucide-react';

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [history, setHistory] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState(null);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);

  const fetchLeadDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await leadsApi.getLead(id);
      if (res?.data) {
        setLead(res.data.lead || res.data);
        setHistory(res.data.history || []);
        setInteractions(res.data.interactions || []);
      }
    } catch (err) {
      toast.error('Failed to load lead details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLeadDetails();
  }, [fetchLeadDetails]);

  const handleStageClick = (stageId) => {
    setTargetStatus(stageId);
    setIsStatusModalOpen(true);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Loading opportunity details...
      </div>
    );
  }

  if (!lead) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-error)' }}>Opportunity not found</p>
        <button
          onClick={() => navigate('/leads')}
          className="fluent-btn fluent-btn-secondary"
          style={{ marginTop: '16px' }}
        >
          Back to Pipeline
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <CommandBar
        title={lead.company_name}
        subtitle={lead.title}
        actions={[
          {
            label: 'Back to Pipeline',
            icon: <ArrowLeft size={14} />,
            onClick: () => navigate('/leads'),
          },
          {
            label: 'Change Stage',
            primary: true,
            icon: <Edit size={14} />,
            onClick: () => {
              setTargetStatus(lead.status);
              setIsStatusModalOpen(true);
            },
          },
          {
            label: 'Log Activity',
            icon: <Plus size={14} />,
            onClick: () => setIsInteractionModalOpen(true),
          },
          {
            label: 'Refresh',
            icon: <RefreshCw size={14} className={isLoading ? 'spin' : ''} />,
            onClick: fetchLeadDetails,
          },
        ]}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Business Process Flow Bar */}
        <ProcessFlowBar
          currentStatus={lead.status}
          onStageClick={handleStageClick}
        />

        {/* 360° Lead View Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          {/* Main Info Columns */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Account & Deal Overview Card */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '20px',
                boxShadow: 'var(--shadow-level1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 className="text-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building size={18} color="var(--color-primary)" />
                  <span>General Information</span>
                </h2>
                <StatusBadge status={lead.status} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                <div>
                  <div className="fluent-label">Company / Account</div>
                  <div style={{ fontWeight: 600 }}>{lead.company_name}</div>
                </div>

                <div>
                  <div className="fluent-label">Opportunity Requirement</div>
                  <div style={{ fontWeight: 600 }}>{lead.title}</div>
                </div>

                <div>
                  <div className="fluent-label">Expected Deal Value</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '15px' }}>
                    {formatCurrency(lead.expected_value)}
                  </div>
                </div>

                {lead.status === 'WON' && (
                  <div>
                    <div className="fluent-label">Actual Won Amount</div>
                    <div style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: '16px' }}>
                      {formatCurrency(lead.won_amount)}
                    </div>
                  </div>
                )}

                {lead.status === 'LOST' && (
                  <div>
                    <div className="fluent-label">Lost Reason</div>
                    <div style={{ color: 'var(--color-error)', fontWeight: 500 }}>
                      {lead.lost_reason || 'Not specified'}
                    </div>
                  </div>
                )}

                <div>
                  <div className="fluent-label">Service Offering Tag</div>
                  <div>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: `${lead.tag_color || '#0078D4'}15`,
                        color: lead.tag_color || '#0078D4',
                        border: `1px solid ${lead.tag_color || '#0078D4'}40`,
                        fontWeight: 600,
                        fontSize: '11px',
                      }}
                    >
                      {lead.tag_name || 'General Tag'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="fluent-label">Assigned Sales Rep (BDM)</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <User size={14} color="var(--color-text-secondary)" />
                    <span>{lead.assigned_name || 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              {lead.notes && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                  <div className="fluent-label">Initial Requirements & Notes</div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap' }}>
                    {lead.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Primary Contact Person Card */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '20px',
                boxShadow: 'var(--shadow-level1)',
              }}
            >
              <h2 className="text-subtitle" style={{ marginBottom: '14px' }}>
                Primary Contact Details
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '13px' }}>
                <div>
                  <div className="fluent-label">Contact Name</div>
                  <div style={{ fontWeight: 600 }}>{lead.contact_name || '—'}</div>
                </div>

                <div>
                  <div className="fluent-label">Phone Number</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} color="var(--color-primary)" />
                    {lead.contact_phone ? (
                      <a href={`tel:${lead.contact_phone}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                        {lead.contact_phone}
                      </a>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>

                <div>
                  <div className="fluent-label">Email Address</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={13} color="var(--color-primary)" />
                    {lead.contact_email ? (
                      <a href={`mailto:${lead.contact_email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                        {lead.contact_email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* BRD Documents Card */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '20px',
                boxShadow: 'var(--shadow-level1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h2 className="text-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="var(--color-primary)" />
                  <span>Business Requirements Document (BRD)</span>
                </h2>
              </div>

              {lead.brd_url ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: 'var(--color-surface-alt)',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={24} color="var(--color-primary)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>Uploaded Client BRD Specification</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                        Stored securely on CKR CDN
                      </div>
                    </div>
                  </div>
                  <a
                    href={`/api/v1/media/${lead.brd_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="fluent-btn fluent-btn-secondary"
                    style={{ fontSize: '12px' }}
                  >
                    <ExternalLink size={13} />
                    <span>View / Download</span>
                  </a>
                </div>
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                  No BRD uploaded yet. The assigned BDM can upload specs directly via the BDM mobile app.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interaction & Stage Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Interactions Timeline */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                boxShadow: 'var(--shadow-level1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 className="text-subtitle" style={{ fontSize: '14px' }}>
                  Interaction Activity
                </h3>
                <button
                  onClick={() => setIsInteractionModalOpen(true)}
                  className="fluent-btn-subtle"
                  style={{ fontSize: '11px', padding: '3px 8px', color: 'var(--color-primary)', cursor: 'pointer' }}
                >
                  + Add Log
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                {interactions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                    No interactions logged yet
                  </div>
                ) : (
                  interactions.map((act) => (
                    <div
                      key={act.id}
                      style={{
                        padding: '10px',
                        backgroundColor: 'var(--color-surface-alt)',
                        borderRadius: 'var(--radius-xs)',
                        borderLeft: '3px solid var(--color-primary)',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                          {act.interaction_type}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                          {new Date(act.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap', margin: '4px 0' }}>
                        {act.notes}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        <span>By {act.bdm_name}</span>
                        {act.duration_minutes > 0 && <span>{act.duration_minutes} mins</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Audit History Timeline */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                boxShadow: 'var(--shadow-level1)',
              }}
            >
              <h3 className="text-subtitle" style={{ fontSize: '14px', marginBottom: '12px' }}>
                Stage Progression Audit
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                {history.length === 0 ? (
                  <div style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '12px 0' }}>
                    Created at current stage
                  </div>
                ) : (
                  history.map((h, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Clock size={14} color="var(--color-text-secondary)" style={{ marginTop: '2px' }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {h.old_status} → {h.new_status}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                          {new Date(h.changed_at).toLocaleString()} by {h.changed_by_name || 'System'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Change Modal */}
      <LeadStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        lead={lead}
        targetStatus={targetStatus}
        onSuccess={fetchLeadDetails}
      />

      {/* Add Interaction Modal */}
      <AddInteractionModal
        isOpen={isInteractionModalOpen}
        onClose={() => setIsInteractionModalOpen(false)}
        lead={lead}
        onSuccess={fetchLeadDetails}
      />
    </div>
  );
}
