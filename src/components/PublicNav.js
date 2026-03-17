import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const getDashLink = () => {
    if (!user) return '/auth';
    if (user.role === 'SUPER_ADMIN') return '/admin/dashboard';
    if (user.role === 'SUPPLIER')    return '/supplier/dashboard';
    return '/customer/dashboard';
  };

  return (
    <nav className="navbar" style={{ background: scrolled ? 'rgba(14,13,11,0.95)' : 'rgba(14,13,11,0.7)' }}>
      <Link to="/" className="navbar-brand">
        <div className="navbar-flame">🔥</div>
        <div className="navbar-logo-text">Gas<span>Queue</span></div>
      </Link>
      <div className="navbar-links">
        <NavLink to="/suppliers" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Find Gas</NavLink>
        <NavLink to="/blog"      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Blog</NavLink>
        {user ? (
          <>
            <Link to={getDashLink()} className="nav-link">Dashboard</Link>
            <button
              onClick={handleLogout}
              style={{ background:'none',border:'1px solid var(--border-2)',color:'var(--text-2)',
                       padding:'8px 14px',borderRadius:'var(--r-sm)',cursor:'pointer',
                       fontFamily:'var(--font-body)',fontSize:'0.875rem',transition:'all var(--transition)' }}
              onMouseOver={e=>{e.target.style.borderColor='var(--flame)';e.target.style.color='var(--flame)'}}
              onMouseOut={e=>{e.target.style.borderColor='var(--border-2)';e.target.style.color='var(--text-2)'}}
            >Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/auth" className="nav-link">Sign In</Link>
            <Link to="/auth?tab=register" className="navbar-cta">Get Started →</Link>
          </>
        )}
      </div>
    </nav>
  );
}
