import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AuthPage() {
  const [params]     = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') === 'register' ? 'register' : 'login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm]     = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'SUPER_ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'SUPPLIER') navigate('/supplier/dashboard');
      else navigate('/customer/dashboard');
    }
  }, [user, navigate]);

  const setL = (k, v) => setLoginForm(f => ({ ...f, [k]: v }));
  const setR = (k, v) => setRegForm(f => ({ ...f, [k]: v }));

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    if (regForm.password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
    try {
      await register(regForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const fillDemo = (role) => {
    const d = { admin: ['admin@gasqueue.com','Admin@1234'], supplier: ['himalayan@gasqueue.com','Supplier@1234'], customer: ['ram@example.com','Customer@1234'] };
    setLoginForm({ email: d[role][0], password: d[role][1] });
    setTab('login');
  };

  return (
    <div className="auth-wrap">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-bg" />
        <div className="auth-left-content">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48, textDecoration: 'none' }}>
            <div className="navbar-flame">🔥</div>
            <div className="navbar-logo-text">Gas<span>Queue</span></div>
          </Link>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Your LPG.<br />Your <span style={{ color: 'var(--flame)', fontStyle: 'italic' }}>Queue.</span><br />Your Control.
          </h2>
          <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 36, fontSize: '1rem' }}>
            Join thousands of customers and suppliers managing LPG distribution digitally across Nepal.
          </p>
          {[
            { icon: '⚡', text: 'Real-time queue tracking' },
            { icon: '🔒', text: 'Verified suppliers only' },
            { icon: '📊', text: 'Full booking history' },
          ].map(f => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', background: 'var(--flame-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.icon}</div>
              <span style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>{f.text}</span>
            </div>
          ))}

          {/* Demo credentials */}
          <div style={{ marginTop: 40, padding: '16px', background: 'rgba(249,115,22,0.08)', borderRadius: 'var(--r-lg)', border: '1px solid rgba(249,115,22,0.2)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--flame)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Demo Quick Login</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[['admin','👑 Admin'],['supplier','🏪 Supplier'],['customer','👤 Customer']].map(([role,label]) => (
                <button key={role} onClick={() => fillDemo(role)}
                  style={{ padding: '7px 12px', background: 'var(--ink-4)', border: '1px solid var(--border-2)', borderRadius: 'var(--r-sm)', color: 'var(--text-2)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.target.style.borderColor = 'var(--flame)'; e.target.style.color = 'var(--flame)'; }}
                  onMouseOut={e => { e.target.style.borderColor = 'var(--border-2)'; e.target.style.color = 'var(--text-2)'; }}
                >{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-logo">
            <div className="auth-logo-icon">🔥</div>
            <div className="auth-logo-text">Gas<span>Queue</span></div>
          </div>

          {/* Tab switcher */}
          <div className="auth-role-tabs">
            <button className={`auth-role-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>
              Sign In
            </button>
            <button className={`auth-role-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>
              Register
            </button>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          {tab === 'login' ? (
            <>
              <div className="auth-title">Welcome back</div>
              <div className="auth-subtitle">Sign in to your GasQueue account</div>
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" value={loginForm.email} onChange={e => setL('email', e.target.value)} placeholder="you@example.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" value={loginForm.password} onChange={e => setL('password', e.target.value)} placeholder="••••••••" required />
                </div>
                <button type="submit" className="btn btn-flame btn-block btn-lg" disabled={loading} style={{ marginTop: 8 }}>
                  {loading ? 'Signing in…' : 'Sign In →'}
                </button>
              </form>
              <div className="auth-footer">
                No account?{' '}
                <button onClick={() => setTab('register')} style={{ background: 'none', border: 'none', color: 'var(--flame)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600 }}>
                  Create one free
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="auth-title">Create Account</div>
              <div className="auth-subtitle">Register as a customer — free forever</div>
              <div style={{ padding: '10px 14px', background: 'var(--green-dim)', border: '1px solid var(--green)', borderRadius: 'var(--r-md)', fontSize: '0.82rem', color: 'var(--green)', marginBottom: 18 }}>
                ✅ Customer accounts are approved instantly. Supplier accounts are created by our admin team.
              </div>
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={regForm.name} onChange={e => setR('name', e.target.value)} placeholder="Ram Prasad Sharma" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" value={regForm.email} onChange={e => setR('email', e.target.value)} placeholder="you@example.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone (optional)</label>
                  <input className="form-input" value={regForm.phone} onChange={e => setR('phone', e.target.value)} placeholder="+977-98XXXXXXXX" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" value={regForm.password} onChange={e => setR('password', e.target.value)} placeholder="Min. 6 characters" required />
                </div>
                <button type="submit" className="btn btn-flame btn-block btn-lg" disabled={loading} style={{ marginTop: 8 }}>
                  {loading ? 'Creating account…' : 'Create Account →'}
                </button>
              </form>
              <div className="auth-footer">
                Already have an account?{' '}
                <button onClick={() => setTab('login')} style={{ background: 'none', border: 'none', color: 'var(--flame)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600 }}>
                  Sign in
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
