import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/admin/suppliers', icon: '🏪', label: 'Suppliers' },
  { to: '/admin/bookings',  icon: '📋', label: 'Bookings' },
  { to: '/admin/users',     icon: '👥', label: 'Users' },
  { to: '/admin/blogs',     icon: '✍️',  label: 'Blog Posts' },
];
const supplierLinks = [
  { to: '/supplier/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/supplier/queue',     icon: '🔢', label: 'Live Queue' },
  { to: '/supplier/bookings',  icon: '📋', label: 'Bookings' },
  { to: '/supplier/stock',     icon: '📦', label: 'Stock' },
  { to: '/supplier/reviews',   icon: '⭐', label: 'Reviews' },
  { to: '/supplier/profile',   icon: '⚙️',  label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'SUPER_ADMIN' ? adminLinks : supplierLinks;
  const section = user?.role === 'SUPER_ADMIN' ? 'Admin Panel' : 'Supplier Panel';
  const initials = user?.name ? user.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-flame">🔥</div>
        <div className="sidebar-brand">Gas<span>Queue</span></div>
      </div>
      <div className="sidebar-section">{section}</div>
      {links.map(l => (
        <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="nav-icon">{l.icon}</span>{l.label}
        </NavLink>
      ))}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role?.replace('_',' ')}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:6, marginTop:10 }}>
          <NavLink to="/" style={{ flex:1 }} className="btn btn-ghost btn-sm" style={{ flex:1, textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'7px 10px', background:'transparent', color:'var(--text-3)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', fontSize:'0.78rem', fontWeight:500 }}>🌐 Site</NavLink>
          <button onClick={() => { logout(); navigate('/'); }} className="btn btn-ghost btn-sm" style={{ flex:1 }}>Sign Out</button>
        </div>
      </div>
    </aside>
  );
}
