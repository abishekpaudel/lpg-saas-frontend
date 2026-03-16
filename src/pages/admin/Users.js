import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import { userAPI } from '../../api';

export default function AdminUsers() {
  const [users, setUsers]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [role, setRole]     = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]       = useState('');
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await userAPI.getAll({ page, limit, role: role || undefined, search: search || undefined });
      setUsers(r.data.data || []);
      setTotal(r.data.pagination?.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, role, search]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id) => {
    try {
      const r = await userAPI.toggleActive(id);
      setMsg(r.data.message);
      setTimeout(() => setMsg(''), 3000);
      load();
    } catch (e) { setMsg('Error: ' + (e.response?.data?.message || 'Failed')); }
  };

  const totalPages = Math.ceil(total / limit);
  const roleBadge = (r) => {
    const map = { SUPER_ADMIN: 'badge-red', SUPPLIER: 'badge-blue', CUSTOMER: 'badge-green' };
    return <span className={`badge ${map[r] || 'badge-gray'}`}>{r?.replace('_', ' ')}</span>;
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{total} registered users</p>
        </div>
      </div>

      {msg && <div className="alert alert-info">{msg}</div>}

      <div className="card" style={{ marginBottom: 20, padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            className="form-input"
            style={{ flex: 1, minWidth: 180 }}
            placeholder="Search name or email…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className="form-select"
            style={{ width: 160 }}
            value={role}
            onChange={e => { setRole(e.target.value); setPage(1); }}
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="SUPPLIER">Supplier</option>
            <option value="CUSTOMER">Customer</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30 }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </td></tr>
              )}
              {!loading && users.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-3)', padding: 30 }}>No users found</td></tr>
              )}
              {!loading && users.map(u => (
                <tr key={u.id}>
                  <td className="bold">{u.name}</td>
                  <td className="text-mono" style={{ fontSize: '0.82rem' }}>{u.email}</td>
                  <td>{u.phone || '—'}</td>
                  <td>{roleBadge(u.role)}</td>
                  <td>
                    {u.is_active
                      ? <span className="badge badge-green">Active</span>
                      : <span className="badge badge-red">Inactive</span>
                    }
                  </td>
                  <td className="text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    {u.role !== 'SUPER_ADMIN' && (
                      <button
                        className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggle(u.id)}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
          </div>
        )}
      </div>
    </Layout>
  );
}
