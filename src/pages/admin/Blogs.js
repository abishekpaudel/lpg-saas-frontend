import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { blogAPI } from '../../api';

export default function AdminBlogs() {
  const [posts, setPosts]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');
  const [form, setForm]         = useState({ title:'', excerpt:'', content:'', category:'General', tags:'', is_published:false });
  const limit = 15;

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await blogAPI.adminGetAll({ page, limit });
      setPosts(r.data.data || []);
      setTotal(r.data.pagination?.total || 0);
    } catch {}
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ title:'', excerpt:'', content:'', category:'General', tags:'', is_published:false });
    setShowModal(true);
  };

  const openEdit = (post) => {
    setEditing(post);
    setForm({ title: post.title, excerpt: post.excerpt||'', content: post.content||'', category: post.category||'General', tags: post.tags||'', is_published: !!post.is_published });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await blogAPI.update(editing.id, form);
      else await blogAPI.create(form);
      flash(editing ? '✅ Post updated.' : '✅ Post created.');
      setShowModal(false); load();
    } catch (err) { flash('Error: ' + (err.response?.data?.message || 'Failed')); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    try { await blogAPI.togglePublish(id); flash('✅ Status updated.'); load(); }
    catch (err) { flash('Error: ' + (err.response?.data?.message || 'Failed')); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try { await blogAPI.remove(id); flash('🗑 Post deleted.'); load(); }
    catch (err) { flash('Error: ' + (err.response?.data?.message || 'Failed')); }
  };

  // Simple formatting helpers for the textarea
  const insertTag = (open, close) => {
    const ta = document.getElementById('blog-content-area');
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const selected = form.content.substring(s, e);
    const newVal = form.content.substring(0, s) + open + selected + close + form.content.substring(e);
    setForm(f => ({ ...f, content: newVal }));
    setTimeout(() => { ta.focus(); ta.selectionStart = s + open.length; ta.selectionEnd = s + open.length + selected.length; }, 0);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Blog Posts</h1>
          <p className="page-subtitle">{total} posts · Manage your LPG insights and news</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-flame" onClick={openNew}>✍️ New Post</button>
        </div>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Title</th><th>Category</th><th>Status</th><th>Views</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} style={{ textAlign:'center', padding:30 }}><div className="spinner" style={{ margin:'0 auto' }} /></td></tr>}
              {!loading && posts.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text-3)', padding:30 }}>No posts yet. Click "New Post" to write your first one.</td></tr>}
              {!loading && posts.map(p => (
                <tr key={p.id}>
                  <td className="bold" style={{ maxWidth: 280 }}>
                    <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-3)', fontFamily:'var(--font-mono)', marginTop:2 }}>{p.slug}</div>
                  </td>
                  <td><span className="badge badge-flame">{p.category}</span></td>
                  <td>{p.is_published ? <span className="badge badge-green">Published</span> : <span className="badge badge-gray">Draft</span>}</td>
                  <td>{p.views}</td>
                  <td className="text-muted">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(p)}>✏️ Edit</button>
                      <button className={`btn btn-sm ${p.is_published ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggle(p.id)}>
                        {p.is_published ? 'Unpublish' : '▶ Publish'}
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => p-1)} disabled={page===1}>‹</button>
            {Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1).map(p=>(
              <button key={p} className={`page-btn${p===page?' active':''}`} onClick={()=>setPage(p)}>{p}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => p+1)} disabled={page===totalPages}>›</button>
          </div>
        )}
      </div>

      {/* Post Editor Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 720, width: '95vw' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Post' : 'New Blog Post'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))} placeholder="An insightful post title…" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(f => ({...f, category:e.target.value}))}>
                    {['General','Safety & Tips','Company News','Industry'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input className="form-input" value={form.tags} onChange={e => setForm(f => ({...f, tags:e.target.value}))} placeholder="LPG, safety, Nepal" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Excerpt / Summary</label>
                <textarea className="form-textarea" rows={2} value={form.excerpt} onChange={e => setForm(f => ({...f, excerpt:e.target.value}))} placeholder="A brief summary shown in cards and listings…" />
              </div>
              <div className="form-group">
                <label className="form-label">Content (HTML supported)</label>
                {/* Mini toolbar */}
                <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:6 }}>
                  {[
                    ['B','<strong>','</strong>'],['I','<em>','</em>'],['H2','<h2>','</h2>'],
                    ['H3','<h3>','</h3>'],['P','<p>','</p>'],['UL','<ul>\n<li>','</li>\n</ul>'],
                  ].map(([label,open,close]) => (
                    <button key={label} type="button" onClick={() => insertTag(open,close)}
                      style={{ padding:'4px 10px', borderRadius:6, border:'1px solid var(--border)', background:'var(--ink-4)', color:'var(--text-2)', fontSize:'0.78rem', cursor:'pointer', fontFamily:'var(--font-mono)' }}>
                      {label}
                    </button>
                  ))}
                </div>
                <textarea
                  id="blog-content-area"
                  className="form-textarea"
                  rows={12}
                  value={form.content}
                  onChange={e => setForm(f => ({...f, content:e.target.value}))}
                  placeholder="<p>Write your post content here. HTML tags are supported.</p>"
                  required
                  style={{ fontFamily:'var(--font-mono)', fontSize:'0.82rem' }}
                />
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                <input type="checkbox" id="publish-check" checked={form.is_published} onChange={e => setForm(f => ({...f, is_published:e.target.checked}))} style={{ accentColor:'var(--flame)', width:16, height:16 }} />
                <label htmlFor="publish-check" style={{ fontSize:'0.875rem', color:'var(--text-2)', cursor:'pointer' }}>Publish immediately (visible to all visitors)</label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-flame" disabled={saving}>{saving ? 'Saving…' : editing ? '✓ Update Post' : '✍️ Create Post'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
