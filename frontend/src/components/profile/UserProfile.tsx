import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, Mail, MapPin, Briefcase, FileText, Upload, Camera, Edit2, Check, X, AlertCircle } from 'lucide-react';
import { getProfile, updateProfile, uploadProfilePhoto, getDocuments, uploadDocument } from '../../services/profile.service';
import type { UserProfile as UserProfileType, UserDocument } from '../../services/profile.service';

export const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'SERVICE' | 'DOCUMENTS'>('PERSONAL');
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    mobile_number: '',
    email: '',
    address: '',
    emergency_contact: ''
  });
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [uploadingDocType, setUploadingDocType] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('upp_session_token');
      if (!token) {
        setError('No active session found. Please return to login.');
        return;
      }
      const [profileData, docsData] = await Promise.all([
        getProfile(token),
        getDocuments(token)
      ]);
      setProfile(profileData);
      setDocuments(docsData);
      setEditForm({
        mobile_number: profileData.mobile_number || '',
        email: profileData.email || '',
        address: profileData.address || '',
        emergency_contact: profileData.emergency_contact || ''
      });
    } catch (error: any) {
      console.error('Failed to load profile', error);
      setError(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('upp_session_token');
      if (!token) return;
      const updated = await updateProfile(token, editForm);
      setProfile(updated);
      setIsEditing(false);
      showNotification('success', 'Profile updated successfully');
    } catch (error) {
      showNotification('error', 'Failed to update profile');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      const token = localStorage.getItem('upp_session_token');
      if (!token) return;
      const updated = await uploadProfilePhoto(token, e.target.files[0]);
      setProfile(updated);
      showNotification('success', 'Profile photo updated');
    } catch (error) {
      showNotification('error', 'Failed to upload photo');
    }
  };

  const handleDocUploadClick = (type: string) => {
    setUploadingDocType(type);
    if (docInputRef.current) docInputRef.current.click();
  };

  const handleDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !uploadingDocType) return;
    try {
      const token = localStorage.getItem('upp_session_token');
      if (!token) return;
      const updatedDocs = await uploadDocument(token, uploadingDocType, e.target.files[0]);
      setDocuments(updatedDocs);
      showNotification('success', 'Document uploaded successfully');
    } catch (error) {
      showNotification('error', 'Failed to upload document');
    } finally {
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>Loading profile...</div>;
  }
  
  if (error) {
    return (
      <div style={{ color: 'var(--accent-red)', padding: '40px', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.8 }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Error Loading Profile</h3>
        <p>{error}</p>
        <button 
          className="btn-primary" 
          style={{ marginTop: '24px' }}
          onClick={() => {
            localStorage.removeItem('upp_session_token');
            localStorage.removeItem('upp_session_user');
            window.location.reload();
          }}
        >
          Return to Login
        </button>
      </div>
    );
  }

  if (!profile) return null;

  const docTypes = [
    { id: 'AADHAAR', label: 'Aadhaar Card' },
    { id: 'SERVICE_CERTIFICATE', label: 'Service Certificate' },
    { id: 'MEDICAL_CERTIFICATE', label: 'Medical Certificate' },
    { id: 'SPOUSE_POSTING', label: 'Spouse Posting Certificate' },
    { id: 'DISABILITY', label: 'Disability Certificate' },
    { id: 'OTHER', label: 'Other Supporting Documents' }
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      {notification && (
        <div className={`alert-box ${notification.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '24px' }}>
          {notification.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Profile Header */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent-blue)' }}>
            {profile.profile_photo_url ? (
              <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${profile.profile_photo_url}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={40} color="rgba(255,255,255,0.5)" />
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'var(--primary)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Camera size={16} color="white" />
          </button>
          <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} style={{ display: 'none' }} accept="image/*" />
        </div>
        
        <div>
          <h2 style={{ fontSize: '1.75rem', color: 'white', marginBottom: '4px' }}>{profile.full_name}</h2>
          <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <span><span style={{ color: 'var(--text-muted)' }}>PNO:</span> {profile.pno_number}</span>
            <span>&bull;</span>
            <span><span style={{ color: 'var(--text-muted)' }}>Rank:</span> {profile.rank}</span>
            <span>&bull;</span>
            <span><span style={{ color: 'var(--text-muted)' }}>Posting:</span> {profile.posting_district}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button className={activeTab === 'PERSONAL' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 24px', borderRadius: '20px' }} onClick={() => setActiveTab('PERSONAL')}>
          <User size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> Personal Information
        </button>
        <button className={activeTab === 'SERVICE' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 24px', borderRadius: '20px' }} onClick={() => setActiveTab('SERVICE')}>
          <Briefcase size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> Service Information
        </button>
        <button className={activeTab === 'DOCUMENTS' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 24px', borderRadius: '20px' }} onClick={() => setActiveTab('DOCUMENTS')}>
          <FileText size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> Documents
        </button>
      </div>

      {/* Tab Content */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        {activeTab === 'PERSONAL' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'white' }}>Personal Details</h3>
              {!isEditing ? (
                <button className="btn-secondary" onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px' }}>
                  <Edit2 size={14} /> Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-secondary" onClick={() => setIsEditing(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'transparent' }}>
                    <X size={14} /> Cancel
                  </button>
                  <button className="btn-primary" onClick={handleSaveProfile} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', backgroundColor: 'var(--accent-green)' }}>
                    <Check size={14} /> Save Changes
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="form-group">
                <label className="text-xs text-gray-400 block uppercase mb-1">PNO Number</label>
                <div style={{ color: 'white', fontWeight: 500 }}>{profile.pno_number}</div>
              </div>
              <div className="form-group">
                <label className="text-xs text-gray-400 block uppercase mb-1">Aadhaar Number</label>
                <div style={{ color: 'white', fontWeight: 500 }}>{profile.aadhaar_number || <span style={{color: '#9ca3af', fontStyle: 'italic'}}>Not provided</span>}</div>
              </div>
              <div className="form-group">
                <label className="text-xs text-gray-400 block uppercase mb-1">Full Name</label>
                <div style={{ color: 'white', fontWeight: 500 }}>{profile.full_name}</div>
              </div>
              <div className="form-group">
                <label className="text-xs text-gray-400 block uppercase mb-1">Father's Name</label>
                <div style={{ color: 'white', fontWeight: 500 }}>{profile.father_name}</div>
              </div>
              <div className="form-group">
                <label className="text-xs text-gray-400 block uppercase mb-1">Date of Birth</label>
                <div style={{ color: 'white', fontWeight: 500 }}>{new Date(profile.dob).toLocaleDateString()}</div>
              </div>
              <div className="form-group">
                <label className="text-xs text-gray-400 block uppercase mb-1">Gender</label>
                <div style={{ color: 'white', fontWeight: 500 }}>{profile.gender}</div>
              </div>

              <div className="form-group">
                <label className="text-xs text-gray-400 block uppercase mb-1">Mobile Number</label>
                {isEditing ? (
                  <div className="input-with-icon">
                    <Phone className="input-icon" size={16} />
                    <input type="text" className="form-input" value={editForm.mobile_number} onChange={(e) => setEditForm({...editForm, mobile_number: e.target.value})} />
                  </div>
                ) : (
                  <div style={{ color: 'white', fontWeight: 500 }}>{profile.mobile_number}</div>
                )}
              </div>
              
              <div className="form-group">
                <label className="text-xs text-gray-400 block uppercase mb-1">Email Address</label>
                {isEditing ? (
                  <div className="input-with-icon">
                    <Mail className="input-icon" size={16} />
                    <input type="email" className="form-input" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
                  </div>
                ) : (
                  <div style={{ color: 'white', fontWeight: 500 }}>{profile.email}</div>
                )}
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="text-xs text-gray-400 block uppercase mb-1">Address</label>
                {isEditing ? (
                  <div className="input-with-icon">
                    <MapPin className="input-icon" size={16} />
                    <input type="text" className="form-input" value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} />
                  </div>
                ) : (
                  <div style={{ color: 'white', fontWeight: 500 }}>{profile.address || <span style={{color: '#9ca3af', fontStyle: 'italic'}}>Not specified</span>}</div>
                )}
              </div>

              <div className="form-group">
                <label className="text-xs text-gray-400 block uppercase mb-1">Emergency Contact</label>
                {isEditing ? (
                  <div className="input-with-icon">
                    <Phone className="input-icon" size={16} />
                    <input type="text" className="form-input" value={editForm.emergency_contact} onChange={(e) => setEditForm({...editForm, emergency_contact: e.target.value})} />
                  </div>
                ) : (
                  <div style={{ color: 'white', fontWeight: 500 }}>{profile.emergency_contact || <span style={{color: '#9ca3af', fontStyle: 'italic'}}>Not specified</span>}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'SERVICE' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'white' }}>Service Details</h3>
            </div>
            
            <div className="alert-box" style={{ marginBottom: '24px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#93c5fd' }}>
              <AlertCircle size={20} />
              <span>Data will be updated by Administrator.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="form-group">
                <label className="text-xs text-gray-400 block uppercase mb-1">Rank</label>
                <div style={{ color: 'white', fontWeight: 500 }}>{profile.rank || 'Not Available'}</div>
              </div>
              <div className="form-group">
                <label className="text-xs text-gray-400 block uppercase mb-1">Grade</label>
                <div style={{ color: 'white', fontWeight: 500 }}>{profile.grade || 'Not Available'}</div>
              </div>
              <div className="form-group">
                <label className="text-xs text-gray-400 block uppercase mb-1">Designation</label>
                <div style={{ color: 'white', fontWeight: 500 }}>{profile.designation || 'Not Available'}</div>
              </div>
              <div className="form-group">
                <label className="text-xs text-gray-400 block uppercase mb-1">Current District / Posting</label>
                <div style={{ color: 'white', fontWeight: 500 }}>{profile.posting_district || 'Not Available'}</div>
              </div>
              <div className="form-group">
                <label className="text-xs text-gray-400 block uppercase mb-1">Home District</label>
                <div style={{ color: 'white', fontWeight: 500 }}>{profile.home_district_id || 'Not Available'}</div>
              </div>
              <div className="form-group">
                <label className="text-xs text-gray-400 block uppercase mb-1">Date of Joining</label>
                <div style={{ color: 'white', fontWeight: 500 }}>{profile.joining_date ? new Date(profile.joining_date).toLocaleDateString() : 'Not Available'}</div>
              </div>
              <div className="form-group">
                <label className="text-xs text-gray-400 block uppercase mb-1">Total Service Duration</label>
                <div style={{ color: 'white', fontWeight: 500 }}>Not Available</div>
              </div>
              <div className="form-group">
                <label className="text-xs text-gray-400 block uppercase mb-1">Batch Year</label>
                <div style={{ color: 'white', fontWeight: 500 }}>{profile.batch_year || 'Not Available'}</div>
              </div>
              <div className="form-group">
                <label className="text-xs text-gray-400 block uppercase mb-1">Current Posting Date</label>
                <div style={{ color: 'white', fontWeight: 500 }}>{profile.current_posting_date ? new Date(profile.current_posting_date).toLocaleDateString() : 'Not Available'}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'DOCUMENTS' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '8px' }}>My Documents</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Upload supporting documents for your service record. Maximum file size: 5MB.</p>
            </div>
            
            <input type="file" ref={docInputRef} onChange={handleDocFileChange} style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {docTypes.map(type => {
                const doc = documents.find(d => d.document_type === type.id);
                return (
                  <div key={type.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={20} color={doc ? 'var(--accent-green)' : 'var(--text-muted)'} />
                      </div>
                      <div>
                        <div style={{ color: 'white', fontWeight: 500, fontSize: '0.95rem' }}>{type.label}</div>
                        {doc && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {doc.file_name} &bull; Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                            {doc.is_verified && <span style={{ marginLeft: '8px', color: 'var(--accent-green)' }}><Check size={12} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> Verified</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {doc ? (
                        <>
                          <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${doc.file_path}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
                            View
                          </a>
                          <button className="btn-secondary" onClick={() => handleDocUploadClick(type.id)} style={{ padding: '6px 16px', fontSize: '0.85rem', backgroundColor: 'transparent' }}>
                            Replace
                          </button>
                        </>
                      ) : (
                        <button className="btn-secondary" onClick={() => handleDocUploadClick(type.id)} style={{ padding: '6px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Upload size={14} /> Upload
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
