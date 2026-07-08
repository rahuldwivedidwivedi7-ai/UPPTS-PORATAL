import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Download, Upload } from 'lucide-react';
import { BulkImportModal } from './BulkImportModal';

interface User {
  user_id: string;
  username: string;
  full_name: string;
  pno_number: string;
  role: string;
  status: string;
  district_id: string | null;
  email: string | null;
  mobile_number: string | null;
  reporting_authority_user_id: string | null;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Modals & Forms state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    full_name: '', pno_number: '', username: '', password: '', 
    email: '', mobile_number: '', designation: '', role: 'SUPERVISOR', 
    district_id: '', reporting_authority_user_id: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('upp_session_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const availableRoles = useMemo(() => {
    const roles = new Set(users.map(u => u.role));
    // Ensure the requested roles are always available as options, even if no user currently has them
    ['SUPER_ADMIN', 'SUPERVISOR', 'IG', 'HQ', 'COMPUTER_OPERATOR'].forEach(r => roles.add(r));
    return Array.from(roles).sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery || 
        (user.full_name?.toLowerCase().includes(q)) ||
        (user.username?.toLowerCase().includes(q)) ||
        (user.pno_number?.toLowerCase().includes(q));

      const matchesRole = !roleFilter || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('upp_session_token');
      const url = editingUser 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/users/${editingUser.user_id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/users`;
      const method = editingUser ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchUsers(); // Refresh list
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      full_name: '', pno_number: '', username: '', password: '', 
      email: '', mobile_number: '', designation: '', role: 'SUPERVISOR', 
      district_id: '', reporting_authority_user_id: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || '', 
      pno_number: user.pno_number || '', 
      username: user.username, 
      password: '', // blank for edit
      email: user.email || '', 
      mobile_number: user.mobile_number || '', 
      designation: '', 
      role: user.role, 
      district_id: user.district_id || '', 
      reporting_authority_user_id: user.reporting_authority_user_id || ''
    });
    setIsModalOpen(true);
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('upp_session_token');
      // Build query string based on current filters
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter) params.append('role', roleFilter);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/users/export?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to export data');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users_export.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert('Error exporting users');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: 'white', margin: 0 }}>User & Authority Management</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setIsBulkImportOpen(true)} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={16} /> Import
          </button>
          <button onClick={handleExport} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> Export
          </button>
          <button className="btn-primary" onClick={openAddModal}>
            + Create Authority
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {[
          { label: 'Total Users', value: users.length, icon: '👥', color: 'var(--primary)' },
          { label: 'Active Authorities', value: users.filter(u => u.status === 'ACTIVE').length, icon: '✅', color: '#10b981' },
          { label: 'Pending Approvals', value: '14', icon: '⏳', color: '#f59e0b' },
          { label: 'Locked Accounts', value: users.filter(u => u.status === 'LOCKED').length, icon: '🔒', color: '#ef4444' }
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{stat.value}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'result' : 'results'}
      </div>

      {/* Data Grid */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by name, username, or PNO..." 
              style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px' }} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              className="form-input" 
              style={{ width: '180px' }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {availableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading users...</p>
        ) : error ? (
          <p style={{ color: '#ef4444' }}>{error}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Name / PNO</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Username</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Role</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user.user_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ color: 'white', fontWeight: 500 }}>{user.full_name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{user.pno_number}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'white' }}>{user.username}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          background: 'rgba(88, 101, 242, 0.1)', color: 'var(--primary)' 
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          background: user.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                          color: user.status === 'ACTIVE' ? '#10b981' : '#ef4444' 
                        }}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button onClick={() => openEditModal(user)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginRight: '12px' }}>Edit</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 
        }}>
          <div className="glass-panel" style={{ padding: '32px', width: '600px', maxWidth: '90%' }}>
            <h3 style={{ color: 'white', marginTop: 0, marginBottom: '24px', fontSize: '1.5rem' }}>
              {editingUser ? 'Edit Authority' : 'Create New Authority'}
            </h3>
            
            <form onSubmit={handleSaveUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Designation Title</label>
                <input type="text" name="full_name" className="form-input" value={formData.full_name} onChange={handleInputChange} placeholder="e.g. SP Lucknow, ADG Tech Services" required />
              </div>
              
              <div>
                <label className="form-label">System Username</label>
                <input type="text" name="username" className="form-input" value={formData.username} onChange={handleInputChange} disabled={!!editingUser} required />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>e.g. sp_lucknow, hq_admin</span>
              </div>
              
              <div>
                <label className="form-label">{editingUser ? 'New Password (leave blank to keep)' : 'Password'}</label>
                <input type="password" name="password" className="form-input" value={formData.password} onChange={handleInputChange} required={!editingUser} />
              </div>
              
              <div>
                <label className="form-label">Role</label>
                <select name="role" className="form-input" value={formData.role} onChange={handleInputChange} required>
                  <option value="DISTRICT_ADMIN">District Admin</option>
                  <option value="DISTRICT_SP">SP (Current District)</option>
                  <option value="TS_UPCC_ADMIN">TS/UPCC Admin</option>
                  <option value="TS_UPCC_SP">TS/UPCC SP</option>
                  <option value="TS_DIG_IG">DIG/IG</option>
                  <option value="TSHQ_ADMIN">TSHQ Admin</option>
                  <option value="ADG_TS">ADG Technical Services</option>
                </select>
              </div>

              <div>
                <label className="form-label">Rank</label>
                <input type="text" name="rank" className="form-input" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} placeholder="e.g. IPS, PPS" required />
              </div>

              <div>
                <label className="form-label">District Name</label>
                <select 
                  name="district_id"
                  className="form-input" 
                  value={formData.district_id}
                  onChange={handleInputChange}
                >
                  <option value="">Select District (or HQ)</option>
                  <option value="e7d3b10b-0dbd-43cf-bc8b-cf4a85208f2a">Lucknow</option>
                  <option value="a4a9db98-0f0e-4ab8-9104-9444bb21f37e">Kanpur Nagar</option>
                  <option value="f4534f3b-fa0c-4fa8-bc1c-cfdf47ea87c0">Gorakhpur</option>
                  <option value="b45efba3-a4c0-482a-a92c-15a452ef72cd">Varanasi</option>
                  <option value="c89dfae2-402a-43df-bc7a-594248ef72ba">Prayagraj</option>
                  <option value="d78cfba1-8f0a-429a-9e12-429a98ef72be">Ghaziabad</option>
                  <option value="">Headquarters (All UP)</option>
                </select>
              </div>

              <div>
                <label className="form-label">District Code</label>
                <input type="text" name="district_id" className="form-input" value={formData.district_id} readOnly style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }} />
              </div>

              <div>
                <label className="form-label">CUG Mobile Number</label>
                <input type="text" name="mobile_number" className="form-input" value={formData.mobile_number} onChange={handleInputChange} placeholder="e.g. 9454400000" required />
              </div>

              <div>
                <label className="form-label">Official Email</label>
                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} placeholder="e.g. sp.lko@uppolice.gov.in" required />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'white' }}>Cancel</button>
                <button type="submit" className="btn-primary">Save Authority</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkImportOpen && (
        <BulkImportModal 
          onClose={() => setIsBulkImportOpen(false)} 
          onSuccess={() => {
            fetchUsers();
          }} 
        />
      )}
    </div>
  );
};

export default UserManagement;
