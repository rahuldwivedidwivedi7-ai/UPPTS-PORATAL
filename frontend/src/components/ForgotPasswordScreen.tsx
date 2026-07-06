import React, { useState } from 'react';
import { User, Lock, ArrowLeft, ArrowRight, AlertCircle, CheckCircle, Calendar } from 'lucide-react';

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    pno_number: '',
    dob: '',
    new_password: '',
    confirm_password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to reset password');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="bg-animation">
          <div className="glow-orb glow-orb-1"></div>
          <div className="glow-orb glow-orb-2"></div>
        </div>
        <div className="auth-card glass-panel text-center">
          <CheckCircle className="mx-auto text-green-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-white mb-2">Password Reset Successful</h2>
          <p className="text-gray-300 mb-6">Your password has been securely updated. You can now login.</p>
          <button onClick={onBackToLogin} className="btn-primary w-full flex items-center justify-center gap-2">
            Back to Login <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container" style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div className="bg-animation">
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
      </div>

      <div className="auth-card glass-panel" style={{ maxWidth: '400px', width: '100%' }}>
        <button 
          onClick={onBackToLogin}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-6"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ArrowLeft size={18} /> Back to Login
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-gray-400 text-sm">Verify your details to set a new password</p>
        </div>

        {error && (
          <div className="alert alert-error mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-snug">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="text-xs font-semibold text-gray-300 tracking-wider mb-2 block uppercase">PNO Number</label>
            <div className="input-with-icon">
              <User className="input-icon" size={18} />
              <input required type="text" name="pno_number" className="form-input" placeholder="e.g. 942050012" value={formData.pno_number} onChange={(e) => setFormData(prev => ({ ...prev, pno_number: e.target.value.replace(/\D/g, '') }))} />
            </div>
          </div>
          
          <div className="form-group">
            <label className="text-xs font-semibold text-gray-300 tracking-wider mb-2 block uppercase">Date of Birth</label>
            <div className="input-with-icon">
              <Calendar className="input-icon" size={18} />
              <input required type="date" name="dob" className="form-input" style={{ paddingLeft: '2.5rem' }} value={formData.dob} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="text-xs font-semibold text-gray-300 tracking-wider mb-2 block uppercase">New Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input required type="password" name="new_password" className="form-input" placeholder="Min 5 characters" value={formData.new_password} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="text-xs font-semibold text-gray-300 tracking-wider mb-2 block uppercase">Confirm New Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input required type="password" name="confirm_password" className="form-input" placeholder="Confirm password" value={formData.confirm_password} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full mt-6" disabled={loading}>
            {loading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
