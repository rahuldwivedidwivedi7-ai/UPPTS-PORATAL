import React, { useState, useEffect } from 'react';
import { 
  User, History, AlertCircle, 
  Upload, Send, PlusCircle, Download, Edit2, CheckCircle,
  LayoutDashboard, FilePlus, List, Navigation
} from 'lucide-react';
import { ApplicationWorkflowTracker } from './ApplicationWorkflowTracker';
import { UserProfile } from './profile/UserProfile';

interface OperatorDashboardProps {
  token: string;
}

import type { UserProfile as PersonnelProfile } from '../services/profile.service';

interface District {
  district_id: string;
  district_name: string;
  district_code: string;
}

interface DocumentRow {
  document_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
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

interface TransferRequest {
  request_id: string;
  personnel_id: string;
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

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ token }) => {
  // Profile and Reference Data
  const [profile, setProfile] = useState<PersonnelProfile | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [requests, setRequests] = useState<TransferRequest[]>([]);
  
  // Selection / Detailed views
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'NEW_APPLICATION' | 'APPLICATIONS' | 'TRACK_APPLICATION' | 'PROFILE'>('DASHBOARD');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editRequestId, setEditRequestId] = useState<string | null>(null);

  // Form Inputs State
  const [pref1, setPref1] = useState('');
  const [pref2, setPref2] = useState('');
  const [pref3, setPref3] = useState('');
  const [transferCategory, setTransferCategory] = useState('MEDICAL');
  const [reason, setReason] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Status flags
  const [loading, setLoading] = useState(false);
  const [fetchingRequests, setFetchingRequests] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 1. Initial Load: Profile, Districts, and Requests
  useEffect(() => {
    fetchProfile();
    fetchDistricts();
    fetchRequests();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/profile/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setProfile(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch profile.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchDistricts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/districts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setDistricts(result.data);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    setFetchingRequests(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/transfer-requests/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setRequests(result.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setFetchingRequests(false);
    }
  };

  // Fetch detailed application including timeline/documents
  const fetchRequestDetails = async (requestId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/transfer-requests/${requestId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSelectedRequest(result.data);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

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

  // Handle Create or Update submission
  const handleSubmit = async (action: 'DRAFT' | 'SUBMIT') => {
    if (!pref1) {
      setError('Please select Preference 1.');
      return;
    }
    const prefs = [pref1, pref2, pref3].filter(Boolean);
    if (new Set(prefs).size !== prefs.length) {
      setError('Please select unique districts for each preference.');
      return;
    }
    if (reason.trim().length < 30) {
      setError('Please provide a detailed reason (minimum 30 characters).');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let requestId = editRequestId;
      const url = isEditing && editRequestId
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/transfer-requests/${editRequestId}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/transfer-requests`;
      const method = isEditing ? 'PUT' : 'POST';

      // 1. Save or Update request details
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          preference_1_district_id: pref1,
          preference_2_district_id: pref2 || null,
          preference_3_district_id: pref3 || null,
          transfer_category: transferCategory,
          reason,
          action
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to process request.');
      }

      requestId = result.data.request_id;

      // 2. Upload document if selected
      if (selectedFile && requestId) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/transfer-requests/${requestId}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok || !uploadResult.success) {
          throw new Error(uploadResult.message || 'Request created, but document upload failed.');
        }
      }

      setSuccess(action === 'SUBMIT' 
        ? 'Transfer request submitted successfully.' 
        : 'Transfer request draft saved successfully.'
      );
      
      // Reset form fields
      resetForm();
      fetchRequests();
      if (requestId) fetchRequestDetails(requestId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit existing draft application directly
  const handleSubmitExistingDraft = async (requestId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/transfer-requests/${requestId}/submit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSuccess('Application submitted successfully.');
        fetchRequests();
        fetchRequestDetails(requestId);
      } else {
        throw new Error(result.message || 'Submission failed.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load details into edit form state
  const handleStartEdit = (req: TransferRequest) => {
    setIsEditing(true);
    setEditRequestId(req.request_id);
    setPref1(req.preference_1_district_id);
    setPref2(req.preference_2_district_id || '');
    setPref3(req.preference_3_district_id || '');
    setTransferCategory(req.transfer_category);
    setReason(req.reason);
    setSelectedFile(null);
    setSelectedRequest(null); // Hide details panel while editing
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditRequestId(null);
    setPref1('');
    setPref2('');
    setPref3('');
    setTransferCategory('MEDICAL');
    setReason('');
    setSelectedFile(null);
  };

  // Filter districts list based on rules: Excludes current posting and home districts
  const getFilteredDistricts = () => {
    if (!profile) return districts;
    return districts.filter(d => 
      d.district_id !== profile.district_id && 
      d.district_id !== profile.home_district_id
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#070a12', color: '#f8fafc', paddingBottom: '60px' }}>
      <div className="background-glow">
        <div className="glow-orb glow-orb-1" style={{ width: '400px', height: '400px', opacity: 0.25 }}></div>
        <div className="glow-orb glow-orb-2" style={{ width: '400px', height: '400px', opacity: 0.25 }}></div>
      </div>

      
      {/* Workspace Wrapper */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '32px' }}>
        
        {/* Sidebar */}
        <div style={{ width: '220px', flexShrink: 0 }}>
          <div className="glass-panel" style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h4 className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '12px' }}>Menu</h4>
            
            <button 
              onClick={() => setActiveTab('DASHBOARD')}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px',
                backgroundColor: activeTab === 'DASHBOARD' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === 'DASHBOARD' ? 'white' : 'var(--text-secondary)',
                border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: activeTab === 'DASHBOARD' ? 600 : 400,
                textAlign: 'left', width: '100%', transition: 'all 0.2s'
              }}
            >
              <LayoutDashboard size={18} style={{ color: activeTab === 'DASHBOARD' ? 'var(--primary)' : 'inherit' }} />
              Dashboard
            </button>

            <button 
              onClick={() => setActiveTab('NEW_APPLICATION')}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px',
                backgroundColor: activeTab === 'NEW_APPLICATION' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === 'NEW_APPLICATION' ? 'white' : 'var(--text-secondary)',
                border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: activeTab === 'NEW_APPLICATION' ? 600 : 400,
                textAlign: 'left', width: '100%', transition: 'all 0.2s'
              }}
            >
              <FilePlus size={18} style={{ color: activeTab === 'NEW_APPLICATION' ? 'var(--primary)' : 'inherit' }} />
              New Application
            </button>

            <button 
              onClick={() => { setActiveTab('APPLICATIONS'); setSelectedRequest(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px',
                backgroundColor: activeTab === 'APPLICATIONS' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === 'APPLICATIONS' ? 'white' : 'var(--text-secondary)',
                border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: activeTab === 'APPLICATIONS' ? 600 : 400,
                textAlign: 'left', width: '100%', transition: 'all 0.2s'
              }}
            >
              <List size={18} style={{ color: activeTab === 'APPLICATIONS' ? 'var(--primary)' : 'inherit' }} />
              Applications
            </button>

            <div 
              className={`menu-item ${activeTab === 'TRACK_APPLICATION' ? 'active' : ''}`}
              onClick={() => setActiveTab('TRACK_APPLICATION')}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px',
                backgroundColor: activeTab === 'TRACK_APPLICATION' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === 'TRACK_APPLICATION' ? 'white' : 'var(--text-secondary)',
                border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: activeTab === 'TRACK_APPLICATION' ? 600 : 400,
                textAlign: 'left', width: '100%', transition: 'all 0.2s'
              }}
            >
              <Navigation size={18} style={{ color: activeTab === 'TRACK_APPLICATION' ? 'var(--primary)' : 'inherit' }} />
              Track Application
            </div>
            
            <div 
              className={`menu-item ${activeTab === 'PROFILE' ? 'active' : ''}`}
              onClick={() => setActiveTab('PROFILE')}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px',
                backgroundColor: activeTab === 'PROFILE' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === 'PROFILE' ? 'white' : 'var(--text-secondary)',
                border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: activeTab === 'PROFILE' ? 600 : 400,
                textAlign: 'left', width: '100%', transition: 'all 0.2s'
              }}
            >
              <User size={18} style={{ color: activeTab === 'PROFILE' ? 'var(--primary)' : 'inherit' }} />
              My Profile
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, minWidth: 0 }}>

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

          {activeTab === 'DASHBOARD' && (
            <div>

              {/* Dashboard Statistics Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{requests.length}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Apps</div>
          </div>
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderBottom: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{requests.filter(r => r.status === 'PENDING').length}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Pending</div>
          </div>
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderBottom: '4px solid #10b981' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{requests.filter(r => r.status === 'APPROVED').length}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Approved</div>
          </div>
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderBottom: '4px solid #ef4444' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{requests.filter(r => r.status === 'REJECTED').length}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Rejected</div>
          </div>
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderBottom: '4px solid #f59e0b' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{requests.filter(r => r.status === 'RETURNED').length}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Returned</div>
          </div>
        </div>
            </div>
          )}

          {activeTab === 'PROFILE' && (
            <div className="tab-pane active fade-in">
              <UserProfile />
            </div>
          )}

          {activeTab === 'NEW_APPLICATION' && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              {/* Column 1: Submission Form (Left) */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={20} style={{ color: 'var(--primary)' }} />
                {isEditing ? 'Modify Request' : 'Create Application'}
              </h3>
              {isEditing && (
                <button 
                  onClick={resetForm} 
                  className="text-muted"
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.8rem',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Preference 1 (Required)</label>
              <select 
                className="form-input" 
                style={{ paddingLeft: '16px', appearance: 'auto', background: 'var(--bg-input)' }}
                value={pref1}
                onChange={(e) => setPref1(e.target.value)}
                disabled={loading}
              >
                <option value="">-- Select Preference 1 --</option>
                {getFilteredDistricts().map(d => (
                  <option key={d.district_id} value={d.district_id} disabled={d.district_id === pref2 || d.district_id === pref3}>
                    {d.district_name} ({d.district_code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Preference 2 (Optional)</label>
              <select 
                className="form-input" 
                style={{ paddingLeft: '16px', appearance: 'auto', background: 'var(--bg-input)' }}
                value={pref2}
                onChange={(e) => setPref2(e.target.value)}
                disabled={loading}
              >
                <option value="">-- Select Preference 2 --</option>
                {getFilteredDistricts().map(d => (
                  <option key={d.district_id} value={d.district_id} disabled={d.district_id === pref1 || d.district_id === pref3}>
                    {d.district_name} ({d.district_code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Preference 3 (Optional)</label>
              <select 
                className="form-input" 
                style={{ paddingLeft: '16px', appearance: 'auto', background: 'var(--bg-input)' }}
                value={pref3}
                onChange={(e) => setPref3(e.target.value)}
                disabled={loading}
              >
                <option value="">-- Select Preference 3 --</option>
                {getFilteredDistricts().map(d => (
                  <option key={d.district_id} value={d.district_id} disabled={d.district_id === pref1 || d.district_id === pref2}>
                    {d.district_name} ({d.district_code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Transfer Category</label>
              <select
                className="form-input"
                style={{ paddingLeft: '16px', appearance: 'auto', background: 'var(--bg-input)' }}
                value={transferCategory}
                onChange={(e) => setTransferCategory(e.target.value)}
                disabled={loading}
              >
                <option value="MEDICAL">Medical Ground</option>
                <option value="COMPASSIONATE">Compassionate Ground</option>
                <option value="SPOUSE_CASE">Spouse Case</option>
                <option value="MUTUAL_TRANSFER">Mutual Transfer</option>
                <option value="OTHER">Other Personal Reasons</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Reason (Min 30 chars)</label>
              <textarea
                className="form-input"
                style={{ paddingLeft: '16px', minHeight: '120px', resize: 'vertical' }}
                placeholder="Explain the background medical or personal reasons requiring the transfer. Must contain at least 30 characters..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group mb-6">
              <label className="form-label">Supporting Document (PDF/JPG, Max 5MB)</label>
              <div style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                cursor: 'pointer',
                position: 'relative'
              }}>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  disabled={loading}
                />
                <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                  {selectedFile ? selectedFile.name : 'Click to select file'}
                </div>
                <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: '4px' }}>
                  Only PDF or Image files are allowed.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                type="button" 
                onClick={() => handleSubmit('DRAFT')} 
                className="btn-secondary" 
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-md)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                disabled={loading}
              >
                Save Draft
              </button>
              
              <button
                type="button"
                onClick={() => handleSubmit('SUBMIT')}
                className="btn-primary"
                style={{ flex: 1 }}
                disabled={loading}
              >
                <Send size={16} />
                <span>{isEditing ? 'Submit Edit' : 'Submit'}</span>
              </button>
            </div>
          </div>
            </div>
          )}

          {activeTab === 'APPLICATIONS' && (
            <div>
              {!selectedRequest ? (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                  {/* Column 2: Applications History List (Right) */}
          
            
            {/* History List */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={20} style={{ color: 'var(--accent-purple)' }} />
                My Requests History
              </h3>

              {fetchingRequests ? (
                <div className="text-center text-muted" style={{ padding: '20px' }}>
                  Loading applications history...
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center text-muted" style={{ padding: '40px' }}>
                  No transfer requests found. Fill the form on the left to submit.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '420px', overflowY: 'auto', paddingRight: '8px' }}>
                  {requests.map(req => {
                    const statusConfig = getStatusStyle(req.status);
                    return (
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
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                            {req.transfer_category.replace(/_/g, ' ')}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.text,
                            textTransform: 'uppercase'
                          }}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: 600, marginBottom: '4px' }}>
                          Origin: {req.source_district_name} &rarr; Prefs: {req.preference_1_district_name}{req.preference_2_district_name ? `, ${req.preference_2_district_name}` : ''}{req.preference_3_district_name ? `, ${req.preference_3_district_name}` : ''}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Saved: {new Date(req.created_at).toLocaleDateString()}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedRequest(req); }}
                            className="btn-primary"
                            style={{ flex: 1, padding: '8px', fontSize: '0.8rem', borderRadius: '6px' }}
                          >
                            View Details
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedRequest(req); setActiveTab('TRACK_APPLICATION'); }}
                            className="btn-secondary"
                            style={{ flex: 1, padding: '8px', fontSize: '0.8rem', borderRadius: '6px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'white' }}
                          >
                            Track
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            
                </div>
                </div>
              ) : (
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                  <button 
                    onClick={() => setSelectedRequest(null)}
                    style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    ← Back to Applications List
                  </button>
                  {/* Selected Request Detail Panel */}
            {selectedRequest && (
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
                        APP ID: {String(selectedRequest.request_id).padStart(5, '0')}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Action: Submit Draft */}
                    {selectedRequest.status === 'DRAFT' && (
                      <button
                        onClick={() => handleSubmitExistingDraft(selectedRequest.request_id)}
                        className="btn-primary"
                        style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', gap: '6px' }}
                        disabled={loading}
                      >
                        <Send size={12} />
                        <span>Submit Draft</span>
                      </button>
                    )}

                    {/* Action: Edit Returned/Draft */}
                    {(selectedRequest.status === 'RETURNED' || selectedRequest.status === 'DRAFT') && (
                      <button
                        onClick={() => handleStartEdit(selectedRequest)}
                        className="text-muted"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          border: '1px solid var(--border-color)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.02)',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit2 size={12} />
                        <span>Edit Application</span>
                      </button>
                    )}
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
                    <strong style={{ color: 'white', display: 'block', marginTop: '4px', fontSize: '0.9rem' }}>{profile?.full_name || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-muted" style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PNO Number</span>
                    <strong style={{ color: 'white', display: 'block', marginTop: '4px', fontSize: '0.9rem' }}>{profile?.pno_number || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-muted" style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rank / Designation</span>
                    <strong style={{ color: 'white', display: 'block', marginTop: '4px', fontSize: '0.9rem' }}>{profile?.rank || 'N/A'}</strong>
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
                        {selectedRequest.documents.map((doc: any) => (
                          <a
                            key={doc.document_id}
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${doc.file_path}`}
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
              </div>
            )}
          </div>
              )}
            </div>
          )}

          {activeTab === 'TRACK_APPLICATION' && (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '16px' }}>Select Application to Track</h3>
                <select 
                  className="form-input" 
                  style={{ paddingLeft: '16px', appearance: 'auto', background: 'var(--bg-input)' }}
                  value={selectedRequest?.request_id || ''}
                  onChange={(e) => {
                    const req = requests.find(r => String(r.request_id) === e.target.value);
                    if (req) setSelectedRequest(req);
                  }}
                >
                  <option value="">-- Select an Application --</option>
                  {requests.map(req => (
                    <option key={req.request_id} value={req.request_id}>
                      APP-{String(req.request_id).padStart(5, '0')} - {req.transfer_category.replace(/_/g, ' ')} ({new Date(req.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              {selectedRequest ? (
                <div className="glass-panel" style={{ padding: '32px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '4px' }}>Workflow Timeline</h3>
                        <p className="text-muted" style={{ fontSize: '0.85rem' }}>Tracking Application: APP-{String(selectedRequest.request_id).padStart(5, '0')}</p>
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
                <div className="glass-panel text-center" style={{ padding: '60px 40px', color: 'var(--text-muted)' }}>
                  <Navigation size={40} style={{ margin: '0 auto 16px auto', display: 'block', opacity: 0.5 }} />
                  <span>Select an application from the dropdown above to view its workflow tracking timeline.</span>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
export default OperatorDashboard;
