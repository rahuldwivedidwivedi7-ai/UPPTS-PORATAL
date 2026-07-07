import React, { useState } from 'react';
import { User, Lock, ArrowLeft, ArrowRight, AlertCircle, CheckCircle, Smartphone, Mail, Calendar, MapPin, Navigation, Tag } from 'lucide-react';

interface RegisterScreenProps {
  onBackToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    pno_number: '',
    full_name: '',
    father_name: '',
    dob: '',
    mobile_number: '',
    email: '',
    gender: 'MALE',
    rank: '',
    home_district: '',
    posting_district: '',
    password: '',
    confirm_password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Registration failed');
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
          <h2 className="text-2xl font-bold text-white mb-2">Registration Successful</h2>
          <p className="text-gray-300 mb-6">Your account has been created successfully. You can now login using your PNO and password.</p>
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

      <div className="auth-card glass-panel" style={{ maxWidth: '600px', width: '100%' }}>
        <button 
          onClick={onBackToLogin}
          className="flex items-center gap-2 mb-6"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#cbd5e1' }}
        >
          <ArrowLeft size={18} /> Back to Login
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Register New Account</h2>
          <p className="text-gray-400 text-sm">Personnel Transfer & Posting Management System</p>
        </div>

        {error && (
          <div className="alert alert-error mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-snug">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="text-xs font-semibold text-gray-300 tracking-wider mb-2 block uppercase">PNO Number</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input required type="text" name="pno_number" className="form-input" placeholder="e.g. 942050012" value={formData.pno_number} onChange={(e) => setFormData(prev => ({ ...prev, pno_number: e.target.value.replace(/\D/g, '') }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="text-xs font-semibold text-gray-300 tracking-wider mb-2 block uppercase">Full Name</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input required type="text" name="full_name" className="form-input" placeholder="Your full name" value={formData.full_name} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="text-xs font-semibold text-gray-300 tracking-wider mb-2 block uppercase">Father's Name</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input required type="text" name="father_name" className="form-input" placeholder="Father's name" value={formData.father_name} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="text-xs font-semibold text-gray-300 tracking-wider mb-2 block uppercase">Date of Birth</label>
              <div className="input-with-icon">
                <Calendar className="input-icon" size={18} />
                <input required type="date" name="dob" className="form-input" style={{ paddingLeft: '2.5rem' }} value={formData.dob} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="text-xs font-semibold text-gray-300 tracking-wider mb-2 block uppercase">Mobile Number</label>
              <div className="input-with-icon">
                <Smartphone className="input-icon" size={18} />
                <input required type="text" name="mobile_number" className="form-input" placeholder="10 digit number" maxLength={10} value={formData.mobile_number} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="text-xs font-semibold text-gray-300 tracking-wider mb-2 block uppercase">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input required type="email" name="email" className="form-input" placeholder="email@uppolice.gov.in" value={formData.email} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="text-xs font-semibold text-gray-300 tracking-wider mb-2 block uppercase">Gender</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <select required name="gender" className="form-input" style={{ appearance: 'none', paddingLeft: '2.5rem' }} value={formData.gender} onChange={handleChange}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="text-xs font-semibold text-gray-300 tracking-wider mb-2 block uppercase">Rank</label>
              <div className="input-with-icon">
                <Tag className="input-icon" size={18} />
                <input required type="text" name="rank" className="form-input" placeholder="e.g. Constable, SI" value={formData.rank} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="text-xs font-semibold text-gray-300 tracking-wider mb-2 block uppercase">Home District</label>
              <div className="input-with-icon">
                <MapPin className="input-icon" size={18} />
                <input required type="text" name="home_district" className="form-input" placeholder="e.g. Lucknow" value={formData.home_district} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="text-xs font-semibold text-gray-300 tracking-wider mb-2 block uppercase">Posting District</label>
              <div className="input-with-icon">
                <Navigation className="input-icon" size={18} />
                <input required type="text" name="posting_district" className="form-input" placeholder="e.g. Kanpur" value={formData.posting_district} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="text-xs font-semibold text-gray-300 tracking-wider mb-2 block uppercase">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input required type="password" name="password" className="form-input" placeholder="Min 5 characters" value={formData.password} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="text-xs font-semibold text-gray-300 tracking-wider mb-2 block uppercase">Confirm Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input required type="password" name="confirm_password" className="form-input" placeholder="Confirm password" value={formData.confirm_password} onChange={handleChange} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full mt-6" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
