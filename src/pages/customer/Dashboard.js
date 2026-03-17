import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import Footer from '../../components/Footer';
import { queueAPI, bookingAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS = { PENDING:'badge-gold',QUEUED:'badge-blue',PROCESSING:'badge-flame',DELIVERED:'badge-green',CANCELLED:'badge-red' };

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [queues, setQueues]     = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    try {
      const [qR, bR] = await Promise.all([
        queueAPI.getMyActiveQueues(),
        bookingAPI.getMyBookings({ limit: 5 }),
      ]);
      setQueues(qR.data.data.queues || []);
      setBookings(bR.data.data || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const iv = setInterval(load, 15000); return () => clearInterval(iv); }, [load]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div>
      <PublicNav />
      <div style={{ paddingTop: 68 }}>
        <div style={{ padding: '44px 40px 32px', background: 'linear-gradient(180deg,var(--ink-2),var(--ink))', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: 4 }}>Welcome back</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{user?.name}</h1>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginTop: 4 }}>{user?.email}</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/suppliers" className="btn btn-flame">🔍 Book LPG</Link>
              <Link to="/customer/bookings" className="btn btn-ghost">View All Bookings</Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign Out</button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 40px' }}>
          {loading ? (
            <div className="flex-center" style={{ height: 200 }}><div className="spinner" /></div>
          ) : (
            <>
              {/* Active Queue */}
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>
                  🔢 Active Queue Positions {queues.length > 0 && <span className="badge badge-flame" style={{ marginLeft: 8 }}>{queues.length}</span>}
                </h2>
                {queues.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎯</div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>No active bookings</div>
                    <div style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginBottom: 20 }}>Find a supplier and book LPG to see your queue position here.</div>
                    <Link to="/suppliers" className="btn btn-flame">Find Suppliers →</Link>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
                    {queues.map(q => (
                      <div key={q.id} className="card" style={{ border: q.live_position === 1 ? '1px solid var(--flame)' : '1px solid var(--border)' }}>
                        {q.live_position === 1 && <div style={{ background: 'var(--flame)', margin: '-24px -24px 16px', padding: '8px', textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#fff', borderRadius: '18px 18px 0 0' }}>▶ YOU'RE UP NEXT!</div>}
                        <div className="flex-between mb-2">
                          <div style={{ fontWeight: 600 }}>{q.business_name}</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: 'var(--flame)', lineHeight: 1 }}>#{q.live_position}</div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: 12 }}>📍 {q.address || 'Address not set'}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--ink-3)', borderRadius: 'var(--r-md)', padding: '10px 14px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Position</div>
                            <div style={{ fontWeight: 700, color: 'var(--flame)' }}>{q.live_position}/{q.total_in_queue}</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ahead</div>
                            <div style={{ fontWeight: 700 }}>{Math.max(0, q.live_position - 1)}</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Booking</div>
                            <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{q.booking_number?.slice(-6)}</div>
                          </div>
                        </div>
                        <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginTop: 12 }}>
                          <div style={{ height: '100%', width: `${((q.total_in_queue - q.live_position + 1) / q.total_in_queue) * 100}%`, background: 'var(--flame)', borderRadius: 3, transition: 'width 0.5s' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Bookings */}
              <div>
                <div className="flex-between mb-2">
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>📋 Recent Bookings</h2>
                  <Link to="/customer/bookings" className="btn btn-ghost btn-sm">View All</Link>
                </div>
                <div className="card">
                  {bookings.length === 0 ? (
                    <div className="empty-state" style={{ padding: '32px 0' }}>
                      <div className="empty-state-icon">📋</div>
                      <div className="empty-state-title">No bookings yet</div>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead><tr><th>Booking #</th><th>Supplier</th><th>Product</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                        <tbody>
                          {bookings.map(b => (
                            <tr key={b.id}>
                              <td className="bold text-mono">{b.booking_number}</td>
                              <td>{b.supplier_name}</td>
                              <td>{b.product_name}</td>
                              <td>NPR {Number(b.total_amount).toLocaleString()}</td>
                              <td><span className={`badge ${STATUS_COLORS[b.status]||'badge-gray'}`}>{b.status}</span></td>
                              <td className="text-muted">{new Date(b.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
