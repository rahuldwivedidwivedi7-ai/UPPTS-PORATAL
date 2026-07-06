import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen.js';
import { RegisterScreen } from './components/RegisterScreen.js';
import { ForgotPasswordScreen } from './components/ForgotPasswordScreen.js';
import { OperatorDashboard } from './components/OperatorDashboard.js';
import { ReviewerDashboard } from './components/ReviewerDashboard.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import SuperAdminDashboard from './components/admin/SuperAdminDashboard.js';
import { LogOut, User } from 'lucide-react';

interface UserSession {
  user_id: string;
  username: string;
  role: string;
  name: string;
  district_id: string | null;
}

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserSession | null>(null);

  // Check localStorage on application startup
  useEffect(() => {
    const savedToken = localStorage.getItem('upp_session_token');
    const savedUser = localStorage.getItem('upp_session_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Handle complete successful login
  const handleLoginSuccess = (newToken: string, newUser: UserSession) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('upp_session_token', newToken);
    localStorage.setItem('upp_session_user', JSON.stringify(newUser));
  };

  // Handle Logout
  const handleLogout = async () => {
    // Attempt backend logout to invalidate session
    if (token) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
      } catch (e) {
        console.error('Logout sync error:', e);
      }
    }

    // Clear local cache session state
    setToken(null);
    setUser(null);
    localStorage.removeItem('upp_session_token');
    localStorage.removeItem('upp_session_user');
  };

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'>('LOGIN');

  // If user is not authenticated, render Auth screens
  if (!token || !user) {
    if (authMode === 'REGISTER') {
      return <RegisterScreen onBackToLogin={() => setAuthMode('LOGIN')} />;
    }
    
    if (authMode === 'FORGOT_PASSWORD') {
      return <ForgotPasswordScreen onBackToLogin={() => setAuthMode('LOGIN')} />;
    }

    return (
      <LoginScreen 
        onLoginSuccess={handleLoginSuccess} 
        onNavigateRegister={() => setAuthMode('REGISTER')}
        onNavigateForgotPassword={() => setAuthMode('FORGOT_PASSWORD')}
      />
    );
  }

  // Render respective dashboards based on role
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#070a12', color: '#f8fafc', position: 'relative' }}>
      {/* Background glow effects */}
      <div className="background-glow">
        <div className="glow-orb glow-orb-1" style={{ width: '400px', height: '400px', opacity: 0.35 }}></div>
        <div className="glow-orb glow-orb-2" style={{ width: '400px', height: '400px', opacity: 0.35 }}></div>
      </div>

      {/* Main Header Navigation Bar */}
      {user.role !== 'SUPER_ADMIN' && (
        <header className="glass-panel" style={{
        margin: '20px',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 'var(--border-radius-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src="/assets/logo.png" 
              alt="UP Police Logo" 
              style={{ width: '40px', height: 'auto', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', lineHeight: '1.2' }}>UPP TS</h1>
            <p className="text-muted" style={{ fontSize: '0.675rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Transfer Portal
            </p>
          </div>
        </div>

        {/* User Info Header Widgets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}>
              <User size={18} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</div>
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                marginTop: '1px'
              }}>
                {user.username}
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="text-muted" style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s',
            color: '#ef4444'
          }} title="Logout Session">
            <LogOut size={20} />
          </button>
        </div>
      </header>
      )}

      {/* Main Workspace Frame */}
      {user.role === 'SUPER_ADMIN' ? (
        <SuperAdminDashboard />
      ) : (
        <main style={{ padding: '0 20px 40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          {user.role === 'COMPUTER_OPERATOR' ? (
            <OperatorDashboard token={token} />
          ) : user.role === 'ADMIN' ? (
            <AdminDashboard token={token} />
          ) : (
            <ReviewerDashboard token={token} role={user.role} />
          )}
        </main>
      )}
    </div>
  );
};
export default App;
