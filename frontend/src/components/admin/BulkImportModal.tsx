import React, { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle, AlertTriangle } from 'lucide-react';

interface BulkImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [report, setReport] = useState<{
    total: number;
    validCount: number;
    invalidCount: number;
    validRecords: any[];
    invalidRecords: any[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem('upp_session_token');
      const response = await fetch('http://localhost:5000/api/v1/users/import/template', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to download template');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'user_import_template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert('Error downloading template');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx')) {
        setError('Please upload a valid .xlsx Excel file');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handlePreview = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      const token = localStorage.getItem('upp_session_token');
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:5000/api/v1/users/import/preview', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setReport(data.data);
        setStep(2);
      } else {
        setError(data.message || 'Failed to parse Excel file');
      }
    } catch (err) {
      setError('Network error occurred while uploading file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!report || report.validCount === 0) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      const token = localStorage.getItem('upp_session_token');
      
      const response = await fetch('http://localhost:5000/api/v1/users/import/confirm', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ validRecords: report.validRecords })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStep(3);
      } else {
        setError(data.message || 'Import failed');
      }
    } catch (err) {
      setError('Network error occurred during import');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 
    }}>
      <div className="glass-panel" style={{ padding: '32px', width: '700px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ color: 'white', margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileSpreadsheet /> Bulk User Import
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* STEP 1: Upload File */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#3b82f6' }}>Step 1: Download Template</h4>
              <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Download the required Excel format. Fill your data without modifying the column headers.
              </p>
              <button onClick={handleDownloadTemplate} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Download Template
              </button>
            </div>

            <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px dashed var(--border-color)', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 16px 0', color: 'white' }}>Step 2: Upload Data</h4>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept=".xlsx" 
                style={{ display: 'none' }} 
              />
              
              {!file ? (
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', 
                    color: 'white', padding: '16px 24px', borderRadius: '8px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', margin: '0 auto'
                  }}
                >
                  <Upload size={32} color="var(--text-secondary)" />
                  <span>Click to browse for .xlsx file</span>
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '12px 24px', borderRadius: '8px' }}>
                    <FileSpreadsheet size={20} />
                    <span>{file.name}</span>
                  </div>
                  <button onClick={() => setFile(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
                </div>
              )}
            </div>

            {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button 
                onClick={handlePreview} 
                disabled={!file || isProcessing} 
                className="btn-primary"
                style={{ opacity: !file || isProcessing ? 0.5 : 1 }}
              >
                {isProcessing ? 'Processing...' : 'Upload & Preview'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Validation Report */}
        {step === 2 && report && (
          <div>
            <h4 style={{ color: 'white', marginBottom: '16px' }}>Validation Report</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '8px' }}>
                <div style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold' }}>{report.validCount}</div>
                <div style={{ color: 'var(--text-secondary)' }}>Valid Records Ready to Import</div>
              </div>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '8px' }}>
                <div style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 'bold' }}>{report.invalidCount}</div>
                <div style={{ color: 'var(--text-secondary)' }}>Invalid Records (Will be skipped)</div>
              </div>
            </div>

            {report.invalidCount > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ color: 'white', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} color="#ef4444" /> Review Errors
                </h5>
                <div style={{ maxHeight: '250px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '12px' }}>
                  {report.invalidRecords.map((record, idx) => (
                    <div key={idx} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ color: 'white', fontSize: '0.9rem', marginBottom: '4px' }}>
                        <strong>Row {record.row}</strong>: {record.username || 'No Username'} ({record.full_name || 'No Name'})
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#ef4444', fontSize: '0.85rem' }}>
                        {record.errors.map((err: string, i: number) => <li key={i}>{err}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setStep(1)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Back to Upload</button>
              
              <button 
                onClick={handleConfirmImport} 
                disabled={report.validCount === 0 || isProcessing} 
                className="btn-primary"
                style={{ opacity: report.validCount === 0 || isProcessing ? 0.5 : 1 }}
              >
                {isProcessing ? 'Importing...' : `Confirm Import (${report.validCount} records)`}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Success */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <CheckCircle size={64} color="#10b981" style={{ marginBottom: '24px' }} />
            <h3 style={{ color: 'white', marginBottom: '12px' }}>Import Successful!</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
              Successfully imported {report?.validCount} user records into the system. The roles and reporting hierarchies have been mapped automatically.
            </p>
            <button onClick={() => {
              onSuccess();
              onClose();
            }} className="btn-primary" style={{ padding: '12px 32px' }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
