import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import Footer from '../../components/Footer';
import { blogAPI } from '../../api';

const ICONS = { 'General':'📰','Safety & Tips':'🛡️','Company News':'📣','Industry':'🏭' };

export default function BlogPage() {
  const [posts, setPosts]     = useState([]);
  const [cats, setCats]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [cat, setCat]         = useState('');
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 9;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await blogAPI.getPublished({ page, limit, category: cat || undefined, search: search || undefined });
      setPosts(r.data.data || []);
      setTotal(r.data.pagination?.total || 0);
    } catch {}
    finally { setLoading(false); }
  }, [page, cat, search]);

  useEffect(() => { blogAPI.getCategories().then(r => setCats(r.data.data.categories || [])).catch(()=>{}); }, []);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <PublicNav />
      <div style={{ paddingTop: 68 }}>
        <div style={{ padding: '60px 40px 48px', background: 'linear-gradient(180deg,var(--ink-2),var(--ink))', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="section-eyebrow">Blog</div>
            <h1 className="section-title">LPG Insights & News</h1>
            <p className="section-subtitle">Safety tips, industry updates, and platform news from the GasQueue team.</p>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px' }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 36, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0 14px', flex: 1, maxWidth: 320 }}>
              <span style={{ marginRight: 8 }}>🔍</span>
              <input className="form-input" style={{ border: 'none', background: 'transparent', padding: '10px 0' }} placeholder="Search posts…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className={`btn btn-sm${cat === '' ? ' btn-flame' : ' btn-ghost'}`} onClick={() => { setCat(''); setPage(1); }}>All</button>
              {cats.map(c => (
                <button key={c.category} className={`btn btn-sm${cat === c.category ? ' btn-flame' : ' btn-ghost'}`} onClick={() => { setCat(c.category); setPage(1); }}>
                  {ICONS[c.category] || '📰'} {c.category} ({c.count})
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex-center" style={{ height: 300 }}><div className="spinner" /></div>
          ) : posts.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📝</div><div className="empty-state-title">No posts found</div></div>
          ) : (
            <div className="blog-grid">
              {posts.map(b => (
                <Link to={`/blog/${b.slug}`} className="blog-card" key={b.id}>
                  <div className="blog-card-cover">
                    <span>{ICONS[b.category] || '📰'}</span>
                    <div className="blog-card-cover-overlay" />
                    <div className="blog-card-category">{b.category}</div>
                  </div>
                  <div className="blog-card-body">
                    <div className="blog-card-title">{b.title}</div>
                    <div className="blog-card-excerpt">{b.excerpt}</div>
                  </div>
                  <div className="blog-card-footer">
                    <span className="blog-card-author">By {b.author_name} · {new Date(b.created_at).toLocaleDateString()}</span>
                    <span className="blog-card-read">Read →</span>
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
