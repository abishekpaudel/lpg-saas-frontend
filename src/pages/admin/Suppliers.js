import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import { supplierAPI } from '../../api';

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState('');
  const limit = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, search: search || undefined };
      if (filter === 'approved') params.approved = true;
      if (filter === 'pending')  params.approved = false;
      const r = await supplierAPI.getAll(params);
      setSuppliers(r.data.data || []);
      setTotal(r.data.pagination?.total || 0);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }, [page, search, filter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id, approve) => {
    try {
      await supplierAPI.approve(id, approve);
      setMsg(approve ? '✅ Supplier approved.' : '⛔ Supplier suspended.');
      setTimeout(() => setMsg(''), 3000);
      load();
    } catch (e) {
      setMsg('Error: ' + (e.response?.data?.message || 'Failed'));
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">{total} supplier{total !== 1 ? 's' : ''} registered</p>
        </div>
      </div>

      {msg && <div className="alert alert-info">{msg}</div>}

      <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            className="form-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Search name or city…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className="form-select"
            style={{ width: 160 }}
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Business</th>
                <th>Owner</th>
                <th>City</th>
                <th>Rating</th>
                <th>Deliveries</th>
                <th>Status</th>
                <th>Open</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30 }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </td></tr>
              )}
              {!loading && suppliers.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-3)', padding: 30 }}>
                  No suppliers found
                </td></tr>
              )}
              {!loading && suppliers.map(s => (
                <tr key={s.id}>
                  <td className="bold">{s.business_name}</td>
                  <td>{s.owner_name}</td>
                  <td>{s.city || '—'}</td>
                  <td>
                    <span style={{ color: 'var(--yellow)' }}>★</span>{' '}
                    {Number(s.avg_rating || 0).toFixed(1)} ({s.total_reviews})
                  </td>
                  <td>{s.total_deliveries}</td>
                  <td>
                    {s.is_approved
                      ? <span className="badge badge-green">Approved</span>
                      : <span className="badge badge-yellow">Pending</span>
                    }
                  </td>
                  <td>
                    {s.is_open
                      ? <span className="badge badge-green">Open</span>
                      : <span className="badge badge-red">Closed</span>
                    }
                  </td>
                  <td>
                    {!s.is_approved ? (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleApprove(s.id, true)}
                      >Approve</button>
                    ) : (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleApprove(s.id, false)}
                      >Suspend</button>
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
              <button
                key={p}
                className={`page-btn${p === page ? ' active' : ''}`}
                onClick={() => setPage(p)}
              >{p}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
          </div>
        )}
      </div>
    </Layout>
  );
}
