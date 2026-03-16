import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import { bookingAPI } from '../../api';

const STATUS_COLORS = {
  PENDING: 'badge-yellow', QUEUED: 'badge-blue', PROCESSING: 'badge-orange',
  DELIVERED: 'badge-green', CANCELLED: 'badge-red',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [status, setStatus]     = useState('');
  const [loading, setLoading]   = useState(false);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await bookingAPI.adminAll({ page, limit, status: status || undefined });
      setBookings(r.data.data || []);
      setTotal(r.data.pagination?.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">All Bookings</h1>
          <p className="page-subtitle">{total.toLocaleString()} total bookings on platform</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20, padding: '14px 20px' }}>
        <select
          className="form-select"
          style={{ width: 200 }}
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          {['PENDING','QUEUED','PROCESSING','DELIVERED','CANCELLED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Customer</th>
                <th>Supplier</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Queue Pos</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30 }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </td></tr>
              )}
              {!loading && bookings.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-3)', padding: 30 }}>
                  No bookings found
                </td></tr>
              )}
              {!loading && bookings.map(b => (
                <tr key={b.id}>
                  <td className="bold text-mono">{b.booking_number}</td>
                  <td>{b.customer_name}</td>
                  <td>{b.supplier_name}</td>
                  <td>{b.product_name}</td>
                  <td>{b.quantity}</td>
                  <td>NPR {Number(b.total_amount).toLocaleString()}</td>
                  <td><span className={`badge ${STATUS_COLORS[b.status] || 'badge-gray'}`}>{b.status}</span></td>
                  <td>{b.queue_position || '—'}</td>
                  <td className="text-muted">{new Date(b.created_at).toLocaleDateString()}</td>
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
