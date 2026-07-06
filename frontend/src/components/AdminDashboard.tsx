import React, { useState } from 'react';
import AdminDashboardContent from './AdminDashboardContent';
import UserManagement from './admin/UserManagement';
import AuditLogs from './admin/AuditLogs';
import { UserProfile } from './profile/UserProfile';

interface AdminDashboardProps {
  token: string;
}


export const AdminDashboard: React.FC<AdminDashboardProps> = ({ token }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    localStorage.removeItem('upp_session_token');
    localStorage.removeItem('upp_session_user');
    window.location.reload();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'audit', label: 'Audit Logs', icon: '📝' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', margin: '-20px -20px -40px -20px' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '260px' : '80px',
        background: 'rgba(15, 23, 42, 0.95)',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }}>
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>UP</div>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'white' }}>ADMIN</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}>☰</button>
        </div>

        <nav style={{ flex: 1, padding: '20px 0', overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} style={{ padding: '0 12px' }}>
                  <button onClick={() => setActiveTab(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: isActive ? 'linear-gradient(90deg, rgba(88, 101, 242, 0.15), transparent)' : 'transparent', border: '1px solid', borderColor: isActive ? 'rgba(88, 101, 242, 0.3)' : 'transparent', color: isActive ? 'white' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
                    <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                    {sidebarOpen && <span style={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 400 }}>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center', gap: '12px', padding: '12px', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}>
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <header style={{ padding: '16px 32px', background: 'rgba(17, 25, 40, 0.75)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 90 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', margin: 0 }}>System Administrator</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>UP Police Transfer & Posting System</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: 500 }}>System Admin</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Administrator</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>AD</div>
          </div>
        </header>

        <div style={{ padding: '32px' }}>
          {activeTab === 'dashboard' && <AdminDashboardContent token={token} />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'audit' && <AuditLogs token={token} />}
          {activeTab === 'profile' && <UserProfile />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
