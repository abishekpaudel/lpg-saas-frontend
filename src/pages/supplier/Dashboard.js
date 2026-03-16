import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { supplierAPI, queueAPI } from '../../api';

const STATUS_COLORS = {
  PENDING: 'badge-yellow', QUEUED: 'badge-blue', PROCESSING: 'badge-orange',
  DELIVERED: 'badge-green', CANCELLED: 'badge-red',
};

export default function SupplierDashboard() {
  const [data, setData]         = useState(null);
  const [queue, setQueue]       = useState({ queue: [], length: 0 });
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      const [analyticsRes, queueRes] = await Promise.all([
        supplierAPI.getAnalytics(),
        queueAPI.getMyQueue(),
      ]);
      setData(analyticsRes.data.data);
      setQueue(queueRes.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadDashboard(); }, []);

  // Auto-refresh queue every 15s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const r = await queueAPI.getMyQueue();
        setQueue(r.data.data);
      } catch {}
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => { setRefreshing(true); loadDashboard(); };

  if (loading) return (
    <Layout>
      <div className="flex-center" style={{ height: '60vh' }}><div className="spinner" /></div>
    </Layout>
  );

  const { stock = [], booking_stats = [], today_bookings = 0, recent_bookings = [], total_revenue = 0 } = data || {};
  const statsMap = {};
  booking_stats.forEach(b => { statsMap[b.status] = Number(b.count); });

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Supplier Dashboard</h1>
          <p className="page-subtitle">Your operations at a glance</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? '⟳ Refreshing…' : '⟳ Refresh'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { icon: '📅', label: "Today's Bookings",  value: today_bookings,              color: 'var(--blue-dim)',   vColor: 'var(--blue)' },
          { icon: '🔢', label: 'In Queue Now',       value: queue.length,               color: 'var(--accent-dim)', vColor: 'var(--accent)' },
          { icon: '✅', label: 'Delivered',          value: statsMap.DELIVERED || 0,    color: 'var(--green-dim)',  vColor: 'var(--green)' },
          { icon: '💰', label: 'Total Revenue',      value: `NPR ${Number(total_revenue).toLocaleString()}`, color: 'var(--accent-dim)', vColor: 'var(--accent)' },
          { icon: '⏳', label: 'Pending',            value: (statsMap.QUEUED || 0) + (statsMap.PROCESSING || 0), color: 'var(--yellow-dim)', vColor: 'var(--yellow)' },
          { icon: '❌', label: 'Cancelled',          value: statsMap.CANCELLED || 0,    color: 'var(--red-dim)',    vColor: 'var(--red)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-icon" style={{ background: s.color }}>
              <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
            </div>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value" style={{ color: s.vColor }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Live Queue */}
        <div className="card">
          <div className="flex-between mb-2">
            <div>
              <div className="card-title">Live Queue</div>
              <div className="card-subtitle">{queue.length} customer{queue.length !== 1 ? 's' : ''} waiting</div>
            </div>
            <span className="badge badge-orange">{queue.length} in queue</span>
          </div>

          {queue.queue.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-icon">🎉</div>
              <div className="empty-state-title">Queue is empty</div>
              <div className="empty-state-text">No customers waiting</div>
            </div>
          ) : (
            <div className="queue-list">
              {queue.queue.slice(0, 6).map((item, idx) => (
                <div className="queue-item" key={item.id}>
                  <div className={`queue-position${idx === 0 ? ' first' : ''}`}>{idx + 1}</div>
                  <div className="queue-info">
                    <div className="queue-name">{item.customer_name}</div>
                    <div className="queue-meta">{item.product_name} × {item.quantity} — {item.booking_number}</div>
                  </div>
                  <span className={`badge ${STATUS_COLORS[item.status] || 'badge-gray'}`}>{item.status}</span>
                </div>
              ))}
              {queue.queue.length > 6 && (
                <div className="text-muted" style={{ textAlign: 'center', paddingTop: 8 }}>
                  +{queue.queue.length - 6} more in queue
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stock Summary */}
        <div className="card">
          <div className="card-title mb-2">Stock Levels</div>
          {stock.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-title">No stock added</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stock.map(s => {
                const available = s.quantity_available - s.quantity_reserved;
                const pct = s.quantity_available > 0 ? (available / s.quantity_available) * 100 : 0;
                const barColor = pct > 50 ? 'var(--green)' : pct > 20 ? 'var(--yellow)' : 'var(--red)';
                return (
                  <div key={s.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div className="flex-between mb-1">
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.product_name}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem', color: 'var(--text-3)' }}>
                        {available}/{s.quantity_available}
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 3, transition: 'width 0.5s' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {s.quantity_reserved} reserved
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
                        NPR {Number(s.price_per_unit).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="card-title mb-2">Recent Bookings</div>
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
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recent_bookings.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-3)', padding: 24 }}>No bookings yet</td></tr>
              )}
              {recent_bookings.map(b => (
                <tr key={b.id}>
                  <td className="bold text-mono">{b.booking_number}</td>
                  <td>{b.customer_name}</td>
                  <td className="text-muted">{b.customer_phone || '—'}</td>
                  <td>{b.product_name}</td>
                  <td>{b.quantity}</td>
                  <td>NPR {Number(b.total_amount).toLocaleString()}</td>
                  <td><span className={`badge ${STATUS_COLORS[b.status] || 'badge-gray'}`}>{b.status}</span></td>
                  <td className="text-muted">{new Date(b.created_at).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
