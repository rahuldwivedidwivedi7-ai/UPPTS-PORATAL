import React, { useState, useEffect } from 'react';
import { 
  Shield, FileText, AlertCircle, 
  RefreshCw, FileCheck, CheckCircle, XCircle, Undo2, Award, Download
} from 'lucide-react';
import { ApplicationWorkflowTracker } from './ApplicationWorkflowTracker';

interface ReviewerDashboardProps {
  token: string;
  role: string;
}

interface HistoryRow {
  approval_id: string;
  action_by_name: string;
  action_by_role: string;
  action: string;
  from_stage: string;
  to_stage: string;
  remarks: string | null;
  action_date: string;
}

interface DocumentRow {
  document_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
}

interface PendingRequest {
  request_id: string;
  personnel_id: string;
  operator_name: string;
  operator_pno: string;
  operator_grade: string;
  operator_designation: string;
  source_district_id: string;
  source_district_name: string;
  preference_1_district_id: string;
  preference_1_district_name: string;
  preference_2_district_id: string | null;
  preference_2_district_name: string | null;
  preference_3_district_id: string | null;
  preference_3_district_name: string | null;
  transfer_category: string;
  reason: string;
  current_stage: string;
  status: string;
  application_date: string | null;
  created_at: string;
  history?: HistoryRow[];
  documents?: DocumentRow[];
}

export const ReviewerDashboard: React.FC<ReviewerDashboardProps> = ({ token, role }) => {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  
  // Helper: Get status badge styles
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', label: 'Approved' };
      case 'REJECTED': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', label: 'Rejected' };
      case 'RETURNED': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', label: 'Returned' };
      case 'PENDING': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', label: 'Pending review' };
      default: return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', label: 'Draft' };
    }
  };
  
  // Action inputs state
  const [remarks, setRemarks] = useState('');
  
  // Status flags
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Success Transfer Order Popup State (ADG final approval)
  const [generatedOrderNumber, setGeneratedOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setFetching(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/v1/approvals/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setPendingRequests(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch pending reviews.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  // Fetch full details of selected request (timeline + attachments)
  const fetchRequestDetails = async (requestId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/transfer-requests/${requestId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSelectedRequest(result.data);
      }
    } catch (err: any) {
      console.error('Error fetching request details:', err);
    }
  };

  // Submit action (Recommend, Verify, Approve, Reject, Return)
  const handleAction = async (action: 'RECOMMEND' | 'VERIFY' | 'APPROVE' | 'REJECT' | 'RETURN') => {
    if (!selectedRequest) return;
    
    if (remarks.trim().length < 10) {
      setError('Please provide comments/remarks (minimum 10 characters).');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setGeneratedOrderNumber(null);

    try {
      const response = await fetch(`http://localhost:5000/api/v1/approvals/${selectedRequest.request_id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, remarks }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Workflow action failed.');
      }

      setSuccess(`Application has been successfully marked as ${action === 'RETURN' ? 'RETURNED' : action + 'D'}.`);
      
      // If ADG approved and order was generated
      if (action === 'APPROVE' && result.data.order_number) {
        setGeneratedOrderNumber(result.data.order_number);
      }

      // Reset selection details and reload list
      setSelectedRequest(null);
      setRemarks('');
      fetchPendingRequests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get label translation for action buttons
  const getActionLabels = () => {
    if (role === 'ADMIN') {
      return { approveAction: 'VERIFY' as const, approveText: 'Verify Application', approveIcon: <FileCheck size={16} /> };
    }
    if (role === 'DISTRICT_SP') {
      return { approveAction: 'RECOMMEND' as const, approveText: 'Recommend Transfer', approveIcon: <FileCheck size={16} /> };
    }
    if (role === 'SP_COMPUTER_CENTRE') {
      return { approveAction: 'RECOMMEND' as const, approveText: 'Verify & Forward (SP)', approveIcon: <FileCheck size={16} /> };
    }
    if (role === 'IG_TECHNICAL_SERVICES') {
      return { approveAction: 'RECOMMEND' as const, approveText: 'Verify & Forward (IG)', approveIcon: <FileCheck size={16} /> };
    }
    if (role === 'HQ_REVIEWER') {
      return { approveAction: 'RECOMMEND' as const, approveText: 'Recommend for Approval (HQ)', approveIcon: <FileCheck size={16} /> };
    }
    // ADG TS final role
    return { approveAction: 'APPROVE' as const, approveText: 'Final Approve', approveIcon: <Award size={16} /> };
  };

  const actions = getActionLabels();

  return (
    <div style={{ minHeight: '80vh', position: 'relative' }}>
      
      {/* Transfer Order success pop-up modal overlay */}
      {generatedOrderNumber && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="glass-panel text-center" style={{
            maxWidth: '500px',
            padding: '40px',
            border: '1px solid var(--success)',
            boxShadow: '0 0 30px var(--success-glow)'
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '16px',
              borderRadius: '50%',
              backgroundColor: 'var(--success-glow)',
              color: 'var(--success)',
              marginBottom: '20px'
            }}>
              <CheckCircle size={40} />
            </div>
            
            <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '8px' }}>
              Transfer Approved
            </h3>
            
            <p className="text-secondary" style={{ fontSize: '0.925rem', marginBottom: '24px', lineHeight: '1.4' }}>
              The application has been finalized. A official Transfer Order has been signed and recorded.
            </p>

            <div style={{
              backgroundColor: 'rgba(15,23,42,0.6)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              marginBottom: '32px'
            }}>
              <div className="text-muted" style={{ fontSize: '0.675rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Generated Order Number
              </div>
              <strong style={{ fontSize: '1.2rem', color: 'var(--accent-blue)', display: 'block', marginTop: '4px' }}>
                {generatedOrderNumber}
              </strong>
            </div>

            <button 
              onClick={() => setGeneratedOrderNumber(null)} 
              className="btn-primary"
              style={{ padding: '12px 30px', margin: '0 auto', maxWidth: '200px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Global Notifications */}
      {error && (
        <div className="alert-box alert-error" style={{ marginBottom: '32px' }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert-box alert-success" style={{ marginBottom: '32px' }}>
          <CheckCircle size={20} style={{ flexShrink: 0 }} />
          <span>{success}</span>
        </div>
      )}

      {/* Grid Layout: Pending queue and Detailed inspect panels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '32px',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Pending Reviews Queue */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} style={{ color: 'var(--primary)' }} />
              Pending Actions Queue
            </h3>
            <button 
              onClick={fetchPendingRequests} 
              className="text-muted" 
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              title="Refresh List"
            >
              <RefreshCw size={16} className={fetching ? 'animate-spin' : ''} style={{ animation: fetching ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>

          {fetching ? (
            <div className="text-center text-muted" style={{ padding: '20px' }}>
              Loading pending requests...
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '40px' }}>
              No pending applications in your review stage pipeline.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
              {pendingRequests.map(req => (
                <div 
                  key={req.request_id}
                  className="glass-panel"
                  style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    border: selectedRequest?.request_id === req.request_id 
                      ? '1px solid var(--primary)' 
                      : '1px solid var(--border-color)',
                    transition: 'all 0.2s',
                    backgroundColor: selectedRequest?.request_id === req.request_id
                      ? 'rgba(88, 101, 242, 0.05)'
                      : 'rgba(17, 25, 40, 0.45)'
                  }}
                  onClick={() => fetchRequestDetails(req.request_id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-blue)' }}>
                      {req.transfer_category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                      {req.application_date ? new Date(req.application_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '0.925rem', color: 'white', fontWeight: 600, marginBottom: '4px' }}>
                    {req.operator_name} ({req.operator_grade.replace(/_/g, ' ')})
                  </div>
                  
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Origin: {req.source_district_name} &rarr; Prefs: {req.preference_1_district_name}{req.preference_2_district_name ? `, ${req.preference_2_district_name}` : ''}{req.preference_3_district_name ? `, ${req.preference_3_district_name}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Inspector Details and Actions Panel */}
        <div>
          {selectedRequest ? (
            <div className="glass-panel" style={{ padding: '32px', animation: 'slideIn 0.3s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Application Details
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor: getStatusStyle(selectedRequest.status).bg,
                        color: getStatusStyle(selectedRequest.status).text,
                        border: `1px solid ${getStatusStyle(selectedRequest.status).text}`
                      }}>
                        {getStatusStyle(selectedRequest.status).label}
                      </span>
                    </h3>
                    <p className="text-muted" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                      APP ID: APP-{String(selectedRequest.request_id).padStart(5, '0')}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)',
                marginBottom: '24px'
              }}>
                {/* Applicant Details */}
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applicant Name</span>
                  <strong style={{ color: 'white', display: 'block', marginTop: '4px', fontSize: '0.9rem' }}>{selectedRequest.operator_name || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PNO Number</span>
                  <strong style={{ color: 'white', display: 'block', marginTop: '4px', fontSize: '0.9rem' }}>{selectedRequest.operator_pno || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rank / Designation</span>
                  <strong style={{ color: 'white', display: 'block', marginTop: '4px', fontSize: '0.9rem' }}>{selectedRequest.operator_designation || 'N/A'}</strong>
                </div>
                
                {/* Posting Details */}
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Posting District</span>
                  <strong style={{ color: 'white', display: 'block', marginTop: '4px', fontSize: '0.9rem' }}>{selectedRequest.source_district_name}</strong>
                </div>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Unit / Office</span>
                  <strong style={{ color: 'white', display: 'block', marginTop: '4px', fontSize: '0.9rem' }}>N/A</strong>
                </div>
                
                {/* Service Details */}
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date of Joining</span>
                  <strong style={{ color: 'white', display: 'block', marginTop: '4px', fontSize: '0.9rem' }}>N/A</strong>
                </div>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Service Duration</span>
                  <strong style={{ color: 'white', display: 'block', marginTop: '4px', fontSize: '0.9rem' }}>N/A</strong>
                </div>
                
                {/* Application Details */}
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date of Application</span>
                  <strong style={{ color: 'white', display: 'block', marginTop: '4px', fontSize: '0.9rem' }}>
                    {selectedRequest.application_date ? new Date(selectedRequest.application_date).toLocaleDateString() : 'N/A'}
                  </strong>
                </div>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transfer Category</span>
                  <strong style={{ color: 'var(--primary)', display: 'block', marginTop: '4px', fontSize: '0.9rem' }}>
                    {selectedRequest.transfer_category.replace(/_/g, ' ')}
                  </strong>
                </div>
              </div>

              <div style={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <span className="text-muted" style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Reason for Transfer</span>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--border-color)' }}>
                      {selectedRequest.reason}
                    </p>
                  </div>

                  <div style={{ minWidth: '200px' }}>
                    <span className="text-muted" style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Preferred Posting Districts</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>1</span>
                        <strong style={{ color: 'var(--accent-blue)', fontSize: '0.9rem' }}>{selectedRequest.preference_1_district_name}</strong>
                      </div>
                      {selectedRequest.preference_2_district_name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>2</span>
                          <strong style={{ color: 'var(--accent-purple)', fontSize: '0.9rem' }}>{selectedRequest.preference_2_district_name}</strong>
                        </div>
                      )}
                      {selectedRequest.preference_3_district_name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>3</span>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{selectedRequest.preference_3_district_name}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Supporting Attachments */}
                {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                  <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                    <span className="text-muted" style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                      Supporting Documents
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedRequest.documents.map(doc => (
                        <a
                          key={doc.document_id}
                          href={`http://localhost:5000${doc.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            backgroundColor: 'rgba(255,255,255,0.02)',
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                            {doc.file_name}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}>
                            <Download size={14} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Download</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Form: Remarks and Decision Buttons */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label">Review comments / Remarks (Min 10 chars)</label>
                  <textarea
                    className="form-input"
                    style={{ paddingLeft: '16px', minHeight: '80px', resize: 'vertical' }}
                    placeholder="Provide detailed feedback, recommendations, or justification notes..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Action 1: Role specific forward actions (Recommend / Verify / Approve) */}
                  <button
                    onClick={() => handleAction(actions.approveAction)}
                    className="btn-primary"
                    disabled={loading || remarks.trim().length < 10}
                  >
                    {loading ? (
                      <RefreshCw className="animate-spin" size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      actions.approveIcon
                    )}
                    <span>{actions.approveText}</span>
                  </button>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    {/* Action 2: Return for correction */}
                    <button
                      onClick={() => handleAction('RETURN')}
                      className="btn-secondary"
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--border-radius-md)',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '0.875rem'
                      }}
                      disabled={loading || remarks.trim().length < 10}
                    >
                      <Undo2 size={14} style={{ color: 'var(--warning)' }} />
                      <span>Return</span>
                    </button>

                    {/* Action 3: Rejection */}
                    <button
                      onClick={() => handleAction('REJECT')}
                      className="btn-secondary"
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--border-radius-md)',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '0.875rem'
                      }}
                      disabled={loading || remarks.trim().length < 10}
                    >
                      <XCircle size={14} style={{ color: 'var(--error)' }} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Workflow Tracker (Visual Pipeline) */}
              <ApplicationWorkflowTracker 
                currentStage={selectedRequest.current_stage} 
                status={selectedRequest.status}
                applicationDate={selectedRequest.application_date}
                history={selectedRequest.history}
              />
            </div>
          ) : (
            <div className="glass-panel text-center" style={{ padding: '80px 40px', color: 'var(--text-muted)' }}>
              <FileText size={40} style={{ margin: '0 auto 16px auto', display: 'block', opacity: 0.5 }} />
              <span>Select an application from the queue to start review.</span>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};
export default ReviewerDashboard;
