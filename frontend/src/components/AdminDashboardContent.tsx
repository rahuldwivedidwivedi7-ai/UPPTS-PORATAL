import React, { useState, useEffect } from 'react';
import { 
  Activity, Users, FileText, 
  AlertCircle, FileCheck
} from 'lucide-react';

interface AdminDashboardProps {
  token: string;
}

interface StatsBreakdown {
  DRAFT: number;
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
  RETURNED: number;
}

interface AdminStats {
  total_operators: number;
  total_requests: number;
  total_orders: number;
  status_breakdown: StatsBreakdown;
}


const AdminDashboardContent: React.FC<AdminDashboardProps> = ({ token }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  
  // Search and filters

  // Status flags
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setStats(result.data);
      } else {
        throw new Error(result.message || 'Failed to retrieve stats.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };






  return (
    <div style={{ position: 'relative' }}>
      
      {/* Notifications */}
      {error && (
        <div className="alert-box alert-error" style={{ marginBottom: '32px' }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row panel */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Card 1: Operators */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#3b82f6'
            }}>
              <Users size={28} />
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Operators
              </div>
              <strong style={{ fontSize: '1.75rem', color: 'white', display: 'block', marginTop: '2px' }}>
                {stats.total_operators}
              </strong>
            </div>
          </div>

          {/* Card 2: Requests */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(157, 78, 221, 0.15)',
              color: '#9d4edd'
            }}>
              <FileText size={28} />
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Requests
              </div>
              <strong style={{ fontSize: '1.75rem', color: 'white', display: 'block', marginTop: '2px' }}>
                {stats.total_requests}
              </strong>
            </div>
          </div>

          {/* Card 3: Orders */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981'
            }}>
              <FileCheck size={28} />
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Signed Orders
              </div>
              <strong style={{ fontSize: '1.75rem', color: 'white', display: 'block', marginTop: '2px' }}>
                {stats.total_orders}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Workflow statuses breakdown and Audit Logs Ledger */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '32px',
        alignItems: 'start'
      }}>
        
        {/* Status Breakdown Sidebar panel */}
        {stats && (
          <div className="glass-panel" style={{ padding: '32px', width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} style={{ color: 'var(--primary)' }} />
              Workflow Statuses
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></span>
                  Pending Review
                </span>
                <strong style={{ color: 'white' }}>{stats.status_breakdown.PENDING}</strong>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                  Approved
                </span>
                <strong style={{ color: 'white' }}>{stats.status_breakdown.APPROVED}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                  Rejected
                </span>
                <strong style={{ color: 'white' }}>{stats.status_breakdown.REJECTED}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
                  Returned
                </span>
                <strong style={{ color: 'white' }}>{stats.status_breakdown.RETURNED}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
                <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94a3b8' }}></span>
                  Draft Applications
                </span>
                <strong style={{ color: 'white' }}>{stats.status_breakdown.DRAFT}</strong>
              </div>
            </div>
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
export default AdminDashboardContent;
