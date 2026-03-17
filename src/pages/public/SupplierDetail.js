import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import Footer from '../../components/Footer';
import { supplierAPI, stockAPI, bookingAPI, queueAPI, reviewAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const Stars = ({ rating }) => (
  <div className="stars">
    {[1,2,3,4,5].map(n => <span key={n} className={`star${n <= rating ? ' filled' : ''}`}>★</span>)}
  </div>
);

export default function SupplierDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [queue, setQueue]       = useState({ queue: [], length: 0 });
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('info');
  const [bookModal, setBookModal] = useState(false);
  const [selStock, setSelStock]   = useState(null);
  const [qty, setQty]             = useState(1);
  const [address, setAddress]     = useState('');
  const [booking, setBooking]     = useState(false);
  const [bookMsg, setBookMsg]     = useState('');
  const [bookErr, setBookErr]     = useState('');

  const load = useCallback(async () => {
    try {
      const [supR, qR, revR] = await Promise.all([
        supplierAPI.getById(id),
        queueAPI.getSupplierQueue(id),
        reviewAPI.getSupplierReviews(id, { limit: 10 }),
      ]);
      setSupplier(supR.data.data.supplier);
      setQueue(qR.data.data);
      setReviews(revR.data.data || []);
    } catch { navigate('/suppliers'); }
    finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const handleBook = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!selStock) return;
    setBooking(true); setBookErr('');
    try {
      const r = await bookingAPI.create({ supplier_id: id, stock_id: selStock.id, quantity: qty, delivery_address: address || undefined });
      const b = r.data.data.booking;
      setBookModal(false);
      setBookMsg(`🎉 Booking confirmed! ${b.booking_number} — Queue position #${b.queue_position}`);
      load();
    } catch (e) { setBookErr(e.response?.data?.message || 'Booking failed.'); }
    finally { setBooking(false); }
  };

  if (loading) return (
    <div><PublicNav />
      <div className="loading-screen"><div className="spinner" /></div>
    </div>
  );
  if (!supplier) return null;

  const stock = supplier.stock || [];
  const available = stock.filter(s => (s.quantity_available - s.quantity_reserved) > 0);

  return (
    <div>
      <PublicNav />
      <div style={{ paddingTop: 68 }}>
        {/* Hero */}
        <div style={{ padding: '52px 40px 40px', background: 'linear-gradient(180deg,var(--ink-2),var(--ink))', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <Link to="/suppliers" style={{ color: 'var(--text-3)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>← Back to Suppliers</Link>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ width: 72, height: 72, borderRadius: 'var(--r-lg)', background: 'var(--flame-glow)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>🏪</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 700 }}>{supplier.business_name}</h1>
                  <span className={`supplier-open ${supplier.is_open ? 'open' : 'closed'}`}>{supplier.is_open ? '● Open' : '● Closed'}</span>
                </div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: 10 }}>
                  {supplier.city && <span>📍 {supplier.city}</span>}
                  {supplier.phone && <span>📞 {supplier.phone}</span>}
                  {supplier.opening_hours && <span>⏰ {supplier.opening_hours}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Stars rating={Math.round(supplier.avg_rating || 0)} />
                  <span style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{Number(supplier.avg_rating || 0).toFixed(1)} ({supplier.total_reviews} reviews)</span>
                  <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>· 🚚 {supplier.total_deliveries} deliveries</span>
                  <span style={{ color: 'var(--flame)', fontSize: '0.85rem', fontWeight: 600 }}>🔢 {queue.length} in queue</span>
                </div>
              </div>
              {available.length > 0 && supplier.is_open && (
                <button className="btn btn-flame btn-lg" onClick={() => { setSelStock(available[0]); setBookModal(true); }}>
                  🛒 Book Now
                </button>
              )}
            </div>
          </div>
        </div>

        {bookMsg && <div style={{ maxWidth: 900, margin: '16px auto', padding: '0 40px' }}><div className="alert alert-success">{bookMsg}</div></div>}

        {/* Tabs */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 40px' }}>
          <div className="tabs" style={{ marginTop: 24 }}>
            {['info','stock','queue','reviews'].map(t => (
              <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === 'info' && (
            <div className="card" style={{ marginBottom: 24 }}>
              {supplier.description && <p style={{ color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16 }}>{supplier.description}</p>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {supplier.address && <div><span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>ADDRESS</span><br /><span style={{ fontSize: '0.9rem' }}>{supplier.address}</span></div>}
                {supplier.phone && <div><span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>PHONE</span><br /><span style={{ fontSize: '0.9rem' }}>{supplier.phone}</span></div>}
                {supplier.email && <div><span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>EMAIL</span><br /><span style={{ fontSize: '0.9rem' }}>{supplier.email}</span></div>}
                {supplier.opening_hours && <div><span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>HOURS</span><br /><span style={{ fontSize: '0.9rem' }}>{supplier.opening_hours}</span></div>}
              </div>
            </div>
          )}

          {tab === 'stock' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16, marginBottom: 24 }}>
              {stock.length === 0 ? <div className="empty-state"><div className="empty-state-icon">📦</div><div className="empty-state-title">No stock listed</div></div> :
                stock.map(s => {
                  const avail = s.quantity_available - s.quantity_reserved;
                  return (
                    <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.product_name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{s.weight_kg} kg</div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--flame)' }}>NPR {Number(s.price_per_unit).toLocaleString()}</div>
                      </div>
                      <div className={`badge ${avail > 10 ? 'badge-green' : avail > 0 ? 'badge-gold' : 'badge-red'}`}>
                        {avail > 0 ? `${avail} available` : 'Out of stock'}
                      </div>
                      {avail > 0 && supplier.is_open && (
                        <button className="btn btn-flame btn-sm" onClick={() => { setSelStock(s); setBookModal(true); }}>Book This →</button>
                      )}
                    </div>
                  );
                })
              }
            </div>
          )}

          {tab === 'queue' && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 16, color: 'var(--text-2)', fontSize: '0.9rem' }}>🔢 {queue.length} customer{queue.length !== 1 ? 's' : ''} currently in queue</div>
              {queue.queue.length === 0 ? <div className="empty-state"><div className="empty-state-icon">🎉</div><div className="empty-state-title">Queue is empty!</div></div> :
                <div className="queue-list">
                  {queue.queue.map((item, i) => (
                    <div key={item.id} className="queue-item">
                      <div className={`queue-pos${i === 0 ? ' first' : ''}`}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.customer_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{item.product_name} × {item.quantity}</div>
                      </div>
                      <span className={`badge badge-${item.status === 'PROCESSING' ? 'flame' : item.status === 'DELIVERED' ? 'green' : 'blue'}`}>{item.status}</span>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          {tab === 'reviews' && (
            <div style={{ marginBottom: 24 }}>
              {reviews.length === 0 ? <div className="empty-state"><div className="empty-state-icon">⭐</div><div className="empty-state-title">No reviews yet</div></div> :
                reviews.map(r => (
                  <div key={r.id} className="card" style={{ marginBottom: 12 }}>
                    <div className="flex-between mb-1">
                      <div style={{ fontWeight: 600 }}>{r.customer_name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Stars rating={r.rating} />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {r.comment && <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', fontStyle: 'italic' }}>"{r.comment}"</p>}
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {bookModal && (
        <div className="modal-overlay" onClick={() => setBookModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Book LPG Cylinder</h3>
              <button className="modal-close" onClick={() => setBookModal(false)}>✕</button>
            </div>
            {bookErr && <div className="alert alert-error mb-2">{bookErr}</div>}
            <div className="form-group">
              <label className="form-label">Select Product</label>
              <select className="form-select" value={selStock?.id || ''} onChange={e => setSelStock(stock.find(s => s.id === e.target.value))}>
                {available.map(s => (
                  <option key={s.id} value={s.id}>{s.product_name} ({s.weight_kg}kg) — NPR {Number(s.price_per_unit).toLocaleString()}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--flame)', minWidth: 40, textAlign: 'center' }}>{qty}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setQty(q => q + 1)}>+</button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Delivery Address (optional)</label>
              <input className="form-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Your delivery address…" />
            </div>
            {selStock && (
              <div style={{ padding: '14px', background: 'var(--ink-3)', borderRadius: 'var(--r-md)', marginBottom: 16 }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-2)' }}>Total Amount</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--flame)' }}>
                    NPR {(Number(selStock.price_per_unit) * qty).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 6 }}>
                  🔢 You will join queue position #{queue.length + 1}
                </div>
              </div>
            )}
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setBookModal(false)}>Cancel</button>
              {!user ? (
                <Link to="/auth" className="btn btn-flame">Sign in to Book →</Link>
              ) : (
                <button className="btn btn-flame" onClick={handleBook} disabled={booking}>
                  {booking ? 'Booking…' : 'Confirm Booking →'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
