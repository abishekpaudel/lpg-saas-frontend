import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { reviewAPI } from '../../api';

const Stars = ({ rating }) => (
  <div className="stars">
    {[1,2,3,4,5].map(n => (
      <span key={n} className={`star${n <= rating ? ' filled' : ''}`}>★</span>
    ))}
  </div>
);

export default function SupplierReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewAPI.getMyReviews()
      .then(r => setReviews(r.data.data.reviews || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  const dist = [5,4,3,2,1].map(n => ({
    star: n,
    count: reviews.filter(r => r.rating === n).length,
    pct: reviews.length ? (reviews.filter(r => r.rating === n).length / reviews.length) * 100 : 0,
  }));

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reviews</h1>
          <p className="page-subtitle">{reviews.length} customer review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {reviews.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, marginBottom: 24 }}>
          <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--yellow)', lineHeight: 1 }}>{avgRating}</div>
            <Stars rating={Math.round(avgRating)} />
            <div className="text-muted">{reviews.length} reviews</div>
          </div>
          <div className="card">
            {dist.map(d => (
              <div key={d.star} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ color: 'var(--yellow)', width: 20 }}>{d.star}★</span>
                <div style={{ flex: 1, height: 8, background: 'var(--bg-3)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${d.pct}%`, background: 'var(--yellow)', borderRadius: 4, transition: 'width 0.5s' }} />
                </div>
                <span className="text-muted" style={{ width: 24, textAlign: 'right', fontSize: '0.8rem' }}>{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="flex-center" style={{ height: '40vh' }}><div className="spinner" /></div>
        ) : reviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⭐</div>
            <div className="empty-state-title">No reviews yet</div>
            <div className="empty-state-text">Reviews will appear here after customers receive their deliveries</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {reviews.map((r, idx) => (
              <div
                key={r.id}
                style={{
                  padding: '18px 0',
                  borderBottom: idx < reviews.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'var(--bg-3)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, color: 'var(--accent)',
                    }}>
                      {r.customer_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.customer_name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Booking: {r.booking_number}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Stars rating={r.rating} />
                    <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: 3 }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {r.comment && (
                  <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', lineHeight: 1.6, paddingLeft: 46 }}>
                    "{r.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
