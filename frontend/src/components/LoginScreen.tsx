import React, { useState } from 'react';
import { User, ArrowRight, AlertCircle, CheckCircle, Lock, Eye, EyeOff, Shield } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (token: string, user: {
    user_id: string;
    username: string;
    role: string;
    name: string;
    district_id: string | null;
  }) => void;
  onNavigateRegister?: () => void;
  onNavigateForgotPassword?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onNavigateRegister, onNavigateForgotPassword }) => {
  // Credentials Inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // State Management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Handle Credentials submission
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in both Username and Password.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Login failed. Please check your credentials.');
      }

      setSuccessMsg('Authentication successful. Redirecting...');
      
      // Small delay for UI feedback
      setTimeout(() => {
        onLoginSuccess(result.data.token, result.data.user);
      }, 500);

    } catch (err: any) {
      setError(err.message || 'Unable to connect to the backend server. Please verify it is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Dynamic Background Elements */}
      <div className="bg-animation">
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
      </div>

      <div className="auth-card glass-panel">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
            <img 
              src="/assets/logo.png" 
              alt="UP Police Logo" 
              style={{ height: '90px', width: 'auto', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}
            />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px', color: '#ffffff' }}>
            UP POLICE
          </h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.08em', color: '#7A85FF' }}>
            TECHNICAL SERVICES HQ
          </p>
          <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
            Personnel Transfer & Posting Management System
          </p>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="alert alert-error mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-snug">{error}</p>
          </div>
        )}
        
        {successMsg && (
          <div className="alert alert-success mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-snug">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleCredentialsSubmit} className="auth-form space-y-5">
          <div className="form-group">
            <label className="text-xs font-semibold text-gray-300 tracking-wider mb-2 block uppercase">
              Username / PNO Number
            </label>
            <div className="input-with-icon">
              <User className="input-icon" size={20} />
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 942050012 or super_admin"
                value={username}
                onChange={(e) => {
                  setError(null);
                  setUsername(e.target.value);
                }}
                disabled={loading}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="text-xs font-semibold text-gray-300 tracking-wider mb-2 block uppercase">
              Password
            </label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setError(null);
                  setPassword(e.target.value);
                }}
                disabled={loading}
                autoComplete="current-password"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-10px' }}>
            <button 
              type="button"
              onClick={onNavigateForgotPassword}
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || !username || !password}
            style={{ marginTop: '16px' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="loading-spinner w-5 h-5 border-2"></div>
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Login <ArrowRight size={20} />
              </span>
            )}
          </button>
        </form>

        <div className="text-center" style={{ marginTop: '24px', marginBottom: '24px' }}>
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <button 
              type="button"
              onClick={onNavigateRegister}
              className="font-semibold transition-colors hover:opacity-80"
              style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Register New Account
            </button>
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 font-medium flex items-center justify-center gap-2 opacity-70">
            <Shield size={14} /> Service • Security • Dedication
          </p>
        </div>
      </div>
    </div>
  );
};
