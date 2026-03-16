import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/admin/suppliers', icon: '🏪', label: 'Suppliers' },
  { to: '/admin/bookings',  icon: '📋', label: 'Bookings' },
  { to: '/admin/users',     icon: '👥', label: 'Users' },
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
  const section = user?.role === 'SUPER_ADMIN' ? 'Admin' : 'Supplier';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🔥</div>
        <div className="logo-text">Gas<span>Queue</span></div>
      </div>

      <div className="sidebar-section">{section}</div>

      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{link.icon}</span>
          {link.label}
        </NavLink>
      ))}

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
        <button
          className="btn btn-secondary btn-sm btn-block"
          style={{ marginTop: 10 }}
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
