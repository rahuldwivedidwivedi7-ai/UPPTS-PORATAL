import React, { useState } from 'react';

interface AuditLog {
  log_id: number;
  user_id: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
  username?: string;
  role?: string;
}

const AuditLedger: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setShowLogs(true);
    setError('');
    try {
      const token = localStorage.getItem('upp_session_token') || localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/v1/admin/audit-logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      } else {
        setError(data.message || 'Failed to fetch audit logs');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!showLogs ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
          <button 
            onClick={fetchLogs} 
            className="btn-primary" 
            style={{ padding: '16px 32px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <span>📜</span>
            View System Audit Ledger
          </button>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: 'white', margin: 0 }}>System Audit Ledger</h2>
            <button 
              onClick={() => setShowLogs(false)} 
              style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
            >
              Hide Ledger
            </button>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading audit logs...</p>
          ) : error ? (
            <p style={{ color: '#ef4444' }}>{error}</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 500 }}>Timestamp</th>
                    <th style={{ padding: '12px 16px', fontWeight: 500 }}>User / Role</th>
                    <th style={{ padding: '12px 16px', fontWeight: 500 }}>Action</th>
                    <th style={{ padding: '12px 16px', fontWeight: 500 }}>Details</th>
                    <th style={{ padding: '12px 16px', fontWeight: 500 }}>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No audit logs found.</td>
                    </tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log.log_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 16px', color: 'white', fontSize: '0.85rem' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ color: 'white', fontWeight: 500 }}>{log.username || 'System'}</div>
                          <div style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>{log.role || 'N/A'}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ 
                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                            background: 'rgba(88, 101, 242, 0.1)', color: 'var(--primary)' 
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {log.details}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {log.ip_address}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLedger;
