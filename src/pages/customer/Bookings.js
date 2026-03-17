import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import Footer from '../../components/Footer';
import { bookingAPI, reviewAPI } from '../../api';

const STATUS_COLORS = { PENDING:'badge-gold',QUEUED:'badge-blue',PROCESSING:'badge-flame',DELIVERED:'badge-green',CANCELLED:'badge-red' };

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [status, setStatus]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [revBooking, setRevBooking]   = useState(null);
  const [rating, setRating]     = useState(5);
  const [comment, setComment]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]           = useState('');
  const limit = 15;

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await bookingAPI.getMyBookings({ page, limit, status: status || undefined });
      setBookings(r.data.data || []);
      setTotal(r.data.pagination?.total || 0);
    } catch {}
    finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try { await bookingAPI.cancel(id); flash('Booking cancelled.'); load(); }
    catch (e) { flash('Error: ' + (e.response?.data?.message || 'Failed')); }
  };

  const handleReview = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await reviewAPI.create({ booking_id: revBooking.id, rating, comment });
      flash('⭐ Review submitted. Thank you!');
      setReviewModal(false);
    } catch (e) { flash('Error: ' + (e.response?.data?.message || 'Failed')); }
    finally { setSubmitting(false); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <PublicNav />
      <div style={{ paddingTop: 68 }}>
        <div style={{ padding: '44px 40px 32px', background: 'linear-gradient(180deg,var(--ink-2),var(--ink))', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700 }}>My Bookings</h1>
              <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginTop: 4 }}>{total} total bookings</p>
            </div>
            <Link to="/suppliers" className="btn btn-flame">+ Book New LPG</Link>
          </div>
        </div>

        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 40px' }}>
          {msg && <div className="alert alert-success">{msg}</div>}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {['','QUEUED','PROCESSING','DELIVERED','CANCELLED'].map(s => (
              <button key={s} className={`btn btn-sm ${status===s?'btn-flame':'btn-ghost'}`} onClick={() => { setStatus(s); setPage(1); }}>
                {s || 'All'}
              </button>
            ))}
          </div>
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Booking #</th><th>Supplier</th><th>Product</th><th>Qty</th><th>Amount</th><th>Queue</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {loading && <tr><td colSpan={9} style={{ textAlign:'center',padding:30 }}><div className="spinner" style={{ margin:'0 auto' }} /></td></tr>}
                  {!loading && bookings.length === 0 && <tr><td colSpan={9} style={{ textAlign:'center',color:'var(--text-3)',padding:30 }}>No bookings found</td></tr>}
                  {!loading && bookings.map(b => (
                    <tr key={b.id}>
                      <td className="bold text-mono">{b.booking_number}</td>
                      <td>{b.supplier_name}</td>
                      <td>{b.product_name}</td>
                      <td>{b.quantity}</td>
                      <td>NPR {Number(b.total_amount).toLocaleString()}</td>
                      <td>{['QUEUED','PROCESSING'].includes(b.status) ? <span style={{ color:'var(--flame)',fontWeight:700 }}>#{b.queue_position}</span> : '—'}</td>
                      <td><span className={`badge ${STATUS_COLORS[b.status]||'badge-gray'}`}>{b.status}</span></td>
                      <td className="text-muted">{new Date(b.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          {['QUEUED','PENDING'].includes(b.status) && <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>Cancel</button>}
                          {b.status === 'DELIVERED' && <button className="btn btn-sm btn-outline-flame" onClick={() => { setRevBooking(b); setRating(5); setComment(''); setReviewModal(true); }}>⭐ Review</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" onClick={() => setPage(p=>p-1)} disabled={page===1}>‹</button>
                {Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1).map(p=>(
                  <button key={p} className={`page-btn${p===page?' active':''}`} onClick={()=>setPage(p)}>{p}</button>
                ))}
                <button className="page-btn" onClick={() => setPage(p=>p+1)} disabled={page===totalPages}>›</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Leave a Review</h3>
              <button className="modal-close" onClick={() => setReviewModal(false)}>✕</button>
            </div>
            <p style={{ color:'var(--text-2)',fontSize:'0.875rem',marginBottom:20 }}>{revBooking?.supplier_name}</p>
            <form onSubmit={handleReview}>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div style={{ display:'flex',gap:8 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setRating(n)} style={{ background:'none',border:'none',cursor:'pointer',fontSize:'2rem',color:n<=rating?'var(--flame-3)':'var(--border)',transition:'color 0.15s' }}>★</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Comment (optional)</label>
                <textarea className="form-textarea" value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience…" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setReviewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-flame" disabled={submitting}>{submitting?'Submitting…':'Submit Review'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
