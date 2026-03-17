import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import Footer from '../../components/Footer';
import { supplierAPI } from '../../api';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const limit = 12;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await supplierAPI.getAll({ page, limit, approved: true, search: search || undefined });
      setSuppliers(r.data.data || []);
      setTotal(r.data.pagination?.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <PublicNav />
      <div style={{ paddingTop: 68 }}>
        {/* Page hero */}
        <div style={{ padding: '60px 40px 48px', background: 'linear-gradient(180deg,var(--ink-2),var(--ink))', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="section-eyebrow">LPG Suppliers</div>
            <h1 className="section-title">Find Gas Near You</h1>
            <p className="section-subtitle" style={{ marginBottom: 28 }}>Browse {total} verified LPG suppliers. View stock, prices, and real-time queue info.</p>
            <div style={{ display: 'flex', gap: 12, maxWidth: 480 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0 14px' }}>
                <span style={{ marginRight: 8 }}>🔍</span>
                <input
                  className="form-input"
                  style={{ border: 'none', background: 'transparent', padding: '11px 0' }}
                  placeholder="Search by name or city…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px' }}>
          {loading ? (
            <div className="flex-center" style={{ height: 300 }}><div className="spinner" /></div>
          ) : suppliers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏪</div>
              <div className="empty-state-title">No suppliers found</div>
              <div className="empty-state-text">{search ? `No results for "${search}"` : 'No approved suppliers yet'}</div>
            </div>
          ) : (
            <div className="suppliers-grid">
              {suppliers.map(s => (
                <Link to={`/suppliers/${s.id}`} className="supplier-card" key={s.id}>
                  <div className="supplier-card-header">
                    <div className="supplier-icon">🏪</div>
                    <div style={{ flex: 1 }}>
                      <div className="supplier-name">{s.business_name}</div>
                      <div className="supplier-city">📍 {s.city || 'Nepal'}</div>
                    </div>
                    <div className={`supplier-open ${s.is_open ? 'open' : 'closed'}`}>
                      {s.is_open ? '● Open' : '● Closed'}
                    </div>
                  </div>
                  <div className="supplier-card-body">
                    <div className="supplier-meta">
                      <div className="supplier-meta-item">⭐ {Number(s.avg_rating || 0).toFixed(1)} ({s.total_reviews})</div>
                      <div className="supplier-meta-item">🚚 {s.total_deliveries} done</div>
                    </div>
                  </div>
                  <div className="supplier-card-footer">
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>⏰ {s.opening_hours || '08:00–18:00'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--flame)', fontWeight: 600 }}>Book Now →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
      </div>
      <Footer />
    </div>
  );
}
