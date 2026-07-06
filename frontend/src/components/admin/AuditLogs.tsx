import React, { useState, useEffect } from 'react';
import { Terminal, Search, RefreshCw, AlertCircle } from 'lucide-react';

interface AuditLogItem {
  log_id: string;
  user_id: string | null;
  username_display: string;
  role: string | null;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

interface AuditLogsProps {
  token: string;
}

const AuditLogs: React.FC<AuditLogsProps> = ({ token }) => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/admin/audit-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setLogs(result.data);
      } else {
        throw new Error(result.message || 'Failed to retrieve audit logs.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingLogs(false);
    }
  };

  const getFilteredLogs = () => {
    return logs.filter(log => {
      const matchSearch = 
        log.username_display.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchAction = actionFilter ? log.action === actionFilter : true;
      
      return matchSearch && matchAction;
    });
  };

  const getUniqueActionsList = () => {
    const actions = logs.map(log => log.action);
    return Array.from(new Set(actions));
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('SUCCESS')) return { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981' };
    if (action.includes('FAILED') || action.includes('LOCKED')) return { bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444' };
    if (action.includes('SUBMITTED')) return { bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6' };
    if (action.includes('APPROVE')) return { bg: 'rgba(16, 185, 129, 0.2)', text: '#059669' };
    if (action.includes('RETURN')) return { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b' };
    return { bg: 'rgba(148, 163, 184, 0.12)', text: '#94a3b8' };
  };

  return (
    <div>
      {error && (
        <div className="alert-box alert-error" style={{ marginBottom: '32px' }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '32px', flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={20} style={{ color: 'var(--accent-purple)' }} />
            System Audit Ledger
          </h3>
          
          <button 
            onClick={fetchLogs} 
            className="text-muted" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}
            disabled={loadingLogs}
          >
            <RefreshCw size={14} className={loadingLogs ? 'animate-spin' : ''} style={{ animation: loadingLogs ? 'spin 1s linear infinite' : 'none' }} />
            <span style={{ fontSize: '0.8rem' }}>Reload</span>
          </button>
        </div>

        {/* Filtering Controls */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <div className="input-wrapper" style={{ flexGrow: 1, minWidth: '200px' }}>
            <input
              type="text"
              className="form-input"
              style={{ padding: '10px 12px 10px 38px', fontSize: '0.85rem' }}
              placeholder="Search ledger logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="input-icon" size={14} style={{ left: '12px' }} />
          </div>

          <select
            className="form-input"
            style={{
              width: 'auto',
              minWidth: '180px',
              padding: '10px 16px',
              appearance: 'auto',
              background: 'var(--bg-input)',
              fontSize: '0.85rem'
            }}
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">-- All Actions --</option>
            {getUniqueActionsList().map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>

        {/* Ledger Table grid */}
        {loadingLogs ? (
          <div className="text-center text-muted" style={{ padding: '40px' }}>
            Querying audit database entries...
          </div>
        ) : getFilteredLogs().length === 0 ? (
          <div className="text-center text-muted" style={{ padding: '40px' }}>
            No audit logs match current filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 8px' }}>Timestamp</th>
                  <th style={{ padding: '12px 8px' }}>User</th>
                  <th style={{ padding: '12px 8px' }}>Action</th>
                  <th style={{ padding: '12px 8px' }}>Details</th>
                  <th style={{ padding: '12px 8px' }}>Client IP</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredLogs().map(log => {
                  const badge = getActionBadgeColor(log.action);
                  return (
                    <tr key={log.log_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--text-secondary)' }}>
                      <td style={{ padding: '12px 8px', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 8px', whiteSpace: 'nowrap', fontWeight: 600, color: 'white' }}>
                        {log.username_display}
                        {log.role && (
                          <span style={{
                            display: 'block',
                            fontSize: '0.65rem',
                            color: 'var(--primary)',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            marginTop: '2px'
                          }}>
                            {log.role.replace(/_/g, ' ')}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: badge.bg,
                          color: badge.text,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          letterSpacing: '0.02em'
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', minWidth: '220px', lineHeight: '1.4' }}>
                        {log.details}
                      </td>
                      <td style={{ padding: '12px 8px', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {log.ip_address}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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

export default AuditLogs;
