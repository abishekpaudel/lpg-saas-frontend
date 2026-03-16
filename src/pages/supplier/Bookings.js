import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import { bookingAPI } from '../../api';

const STATUS_COLORS = {
  PENDING: 'badge-yellow', QUEUED: 'badge-blue', PROCESSING: 'badge-orange',
  DELIVERED: 'badge-green', CANCELLED: 'badge-red',
};

export default function SupplierBookings() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [status, setStatus]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [actionId, setActionId] = useState('');
  const [msg, setMsg]           = useState('');
  const [error, setError]       = useState('');
  const limit = 20;

  const flash = (m, isErr = false) => {
    if (isErr) setError(m); else setMsg(m);
    setTimeout(() => { setMsg(''); setError(''); }, 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await bookingAPI.getSupplierBookings({ page, limit, status: status || undefined });
      setBookings(r.data.data || []);
      setTotal(r.data.pagination?.total || 0);
    } catch (e) { flash(e.response?.data?.message || 'Error loading', true); }
    finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const handleDeliver = async (id) => {
    setActionId(id);
    try {
      await bookingAPI.deliver(id);
      flash('✅ Booking marked as delivered!');
      load();
    } catch (e) { flash(e.response?.data?.message || 'Error', true); }
    finally { setActionId(''); }
  };

  const handleProcess = async (id) => {
    setActionId(id);
    try {
      await bookingAPI.process(id);
      flash('▶ Booking marked as processing.');
      load();
    } catch (e) { flash(e.response?.data?.message || 'Error', true); }
    finally { setActionId(''); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-subtitle">{total} total bookings</p>
        </div>
      </div>

      {msg   && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginBottom: 16, padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="text-muted" style={{ fontSize: '0.82rem' }}>Filter by status:</span>
          {['', 'QUEUED', 'PROCESSING', 'DELIVERED', 'CANCELLED'].map(s => (
            <button
              key={s}
              className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setStatus(s); setPage(1); }}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Queue Pos</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 30 }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </td></tr>
              )}
              {!loading && bookings.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-3)', padding: 30 }}>
                  No bookings found
                </td></tr>
              )}
              {!loading && bookings.map(b => (
                <tr key={b.id}>
                  <td className="bold text-mono">{b.booking_number}</td>
                  <td>{b.customer_name}</td>
                  <td className="text-muted">{b.customer_phone || '—'}</td>
                  <td>{b.product_name} ({b.weight_kg} kg)</td>
                  <td>{b.quantity}</td>
                  <td>NPR {Number(b.total_amount).toLocaleString()}</td>
                  <td>{b.queue_position || '—'}</td>
                  <td><span className={`badge ${STATUS_COLORS[b.status] || 'badge-gray'}`}>{b.status}</span></td>
                  <td className="text-muted">{new Date(b.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {b.status === 'QUEUED' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleProcess(b.id)}
                          disabled={actionId === b.id}
                        >▶</button>
                      )}
                      {(b.status === 'QUEUED' || b.status === 'PROCESSING') && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleDeliver(b.id)}
                          disabled={actionId === b.id}
                        >✓ Deliver</button>
                      )}
                    </div>
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
