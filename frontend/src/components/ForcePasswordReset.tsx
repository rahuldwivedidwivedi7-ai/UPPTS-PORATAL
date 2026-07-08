import React, { useState } from 'react';
import { Shield, CheckCircle, ArrowRight } from 'lucide-react';

interface ForcePasswordResetProps {
  user: {
    username: string;
    name: string;
  };
  token: string;
  onComplete: () => void;
}

const ForcePasswordReset: React.FC<ForcePasswordResetProps> = ({ user, token, onComplete }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_password: newPassword })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err: any) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#070a12' }}>
        <div className="glass-panel text-center" style={{ padding: '40px', maxWidth: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: '#10b981' }}>
            <CheckCircle size={64} />
          </div>
          <h2 style={{ color: 'white', marginBottom: '16px' }}>Password Updated!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Your account is now secure. You can proceed to your dashboard.</p>
          <button onClick={onComplete} className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            Continue to Dashboard <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#070a12' }}>
      <div className="glass-panel" style={{ padding: '40px', maxWidth: '450px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: '#f59e0b' }}>
          <Shield size={48} />
        </div>
        <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '8px' }}>Security Requirement</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '32px', fontSize: '0.9rem' }}>
          Welcome, {user.name}. As this is your first time logging in (or your password was reset by an admin), you must set a new password before proceeding.
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ color: 'var(--text-secondary)' }}>New Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          
          <div style={{ marginBottom: '32px' }}>
            <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForcePasswordReset;
