import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'SUPER_ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'SUPPLIER') navigate('/supplier/dashboard');
      else setError('This portal is for Admins and Suppliers only.');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      admin:    { email: 'admin@gasqueue.com',       password: 'Admin@1234' },
      supplier: { email: 'himalayan@gasqueue.com',   password: 'Supplier@1234' },
    };
    setForm(creds[role]);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🔥</div>
          <div className="auth-logo-title">Gas<span>Queue</span></div>
          <div className="auth-logo-sub">LPG Management Platform</div>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@gasqueue.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? 'Signing in…' : '→ Sign In'}
          </button>
        </form>

        <div className="divider" />
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <span className="text-muted" style={{ fontSize: '0.78rem' }}>DEMO QUICK LOGIN</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => fillDemo('admin')}>
            👑 Super Admin
          </button>
          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => fillDemo('supplier')}>
            🏪 Supplier
          </button>
        </div>

        <div className="auth-footer">
          Customer access via mobile app
        </div>
      </div>
    </div>
  );
}
