import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import { queueAPI, bookingAPI } from '../../api';

const STATUS_COLORS = {
  QUEUED: 'badge-blue', PROCESSING: 'badge-orange',
  DELIVERED: 'badge-green', CANCELLED: 'badge-red',
};

export default function SupplierQueue() {
  const [queue, setQueue]     = useState({ queue: [], length: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [msg, setMsg]         = useState('');
  const [error, setError]     = useState('');

  const loadQueue = useCallback(async () => {
    try {
      const r = await queueAPI.getMyQueue();
      setQueue(r.data.data);
    } catch (e) { setError(e.response?.data?.message || 'Failed to load queue'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadQueue();
    const iv = setInterval(loadQueue, 8000);
    return () => clearInterval(iv);
  }, [loadQueue]);

  const flash = (message, isError = false) => {
    if (isError) setError(message); else setMsg(message);
    setTimeout(() => { setMsg(''); setError(''); }, 4000);
  };

  const handleProcess = async (bookingId) => {
    setActionLoading(bookingId + '_process');
    try {
      await bookingAPI.process(bookingId);
      flash('✅ Marked as Processing');
      loadQueue();
    } catch (e) { flash(e.response?.data?.message || 'Error', true); }
    finally { setActionLoading(''); }
  };

  const handleDeliver = async (bookingId) => {
    setActionLoading(bookingId + '_deliver');
    try {
      await bookingAPI.deliver(bookingId);
      flash('🎉 Delivery confirmed! Next customer advanced.');
      loadQueue();
    } catch (e) { flash(e.response?.data?.message || 'Error', true); }
    finally { setActionLoading(''); }
  };

  const handleClearQueue = async () => {
    if (!window.confirm('Clear the entire queue? All waiting customers will be marked as cancelled.')) return;
    try {
      await queueAPI.clearQueue();
      flash('Queue cleared.');
      loadQueue();
    } catch (e) { flash(e.response?.data?.message || 'Error', true); }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Live Queue</h1>
          <p className="page-subtitle">
            {queue.length} customer{queue.length !== 1 ? 's' : ''} currently in queue
            {' · '}
            <span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>Auto-refreshes every 8 seconds</span>
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={loadQueue}>⟳ Refresh</button>
          {queue.length > 0 && (
            <button className="btn btn-danger btn-sm" onClick={handleClearQueue}>🗑 Clear Queue</button>
          )}
        </div>
      </div>

      {msg   && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="flex-center" style={{ height: '40vh' }}><div className="spinner" /></div>
      ) : queue.queue.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <div className="empty-state-title">Queue is empty!</div>
            <div className="empty-state-text">No customers are currently waiting. Great work!</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {queue.queue.map((item, idx) => (
            <div
              key={item.id}
              className="card"
              style={{
                border: idx === 0 ? '1px solid var(--accent)' : '1px solid var(--border)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {idx === 0 && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: 3, background: 'var(--accent)',
                }} />
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                {/* Position badge */}
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                  background: idx === 0 ? 'var(--accent)' : 'var(--accent-dim)',
                  color: idx === 0 ? '#fff' : 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '1.4rem',
                }}>
                  {item.live_position}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{item.customer_name}</span>
                    <span className={`badge ${STATUS_COLORS[item.status] || 'badge-gray'}`}>{item.status}</span>
                    {idx === 0 && <span className="badge badge-orange">▶ UP NEXT</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-2)' }}>
                    <span>📦 {item.product_name} × {item.quantity}</span>
                    <span>💰 NPR {Number(item.total_amount).toLocaleString()}</span>
                    <span className="text-mono">#{item.booking_number}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {item.status === 'QUEUED' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleProcess(item.id)}
                      disabled={actionLoading === item.id + '_process'}
                    >
                      {actionLoading === item.id + '_process' ? '…' : '▶ Process'}
                    </button>
                  )}
                  {(item.status === 'QUEUED' || item.status === 'PROCESSING') && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleDeliver(item.id)}
                      disabled={actionLoading === item.id + '_deliver'}
                    >
                      {actionLoading === item.id + '_deliver' ? '…' : '✓ Deliver'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
