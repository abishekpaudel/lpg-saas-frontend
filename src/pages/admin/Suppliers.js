import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import { supplierAPI, adminAPI } from '../../api';

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({ name:'', email:'', password:'', phone:'', business_name:'', city:'', address:'', latitude:'', longitude:'' });
  const limit = 15;

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, search: search || undefined };
      if (filter === 'approved') params.approved = true;
      if (filter === 'pending')  params.approved = false;
      const r = await supplierAPI.getAll(params);
      setSuppliers(r.data.data || []);
      setTotal(r.data.pagination?.total || 0);
    } catch {}
    finally { setLoading(false); }
  }, [page, search, filter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id, approve) => {
    try { await supplierAPI.approve(id, approve); flash(approve ? '✅ Supplier approved.' : '⛔ Supplier suspended.'); load(); }
    catch (e) { flash('Error: ' + (e.response?.data?.message || 'Failed')); }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await adminAPI.createSupplier(form);
      flash('✅ Supplier account created. They can now login.');
      setShowModal(false);
      setForm({ name:'', email:'', password:'', phone:'', business_name:'', city:'', address:'', latitude:'', longitude:'' });
      load();
    } catch (e) { flash('Error: ' + (e.response?.data?.message || 'Failed')); }
    finally { setSaving(false); }
  };

  const totalPages = Math.ceil(total / limit);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">{total} suppliers · Only admin can create supplier accounts</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-flame" onClick={() => setShowModal(true)}>+ Create Supplier</button>
        </div>
      </div>

      {msg && <div className="alert alert-info">{msg}</div>}

      <div className="card" style={{ marginBottom:16, padding:'14px 20px' }}>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <input className="form-input" style={{ flex:1, minWidth:200 }} placeholder="Search name or city…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <select className="form-select" style={{ width:160 }} value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Business</th><th>Owner</th><th>City</th><th>Rating</th><th>Deliveries</th><th>Status</th><th>Open</th><th>Actions</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={8} style={{ textAlign:'center',padding:30 }}><div className="spinner" style={{ margin:'0 auto' }} /></td></tr>}
              {!loading && suppliers.length === 0 && <tr><td colSpan={8} style={{ textAlign:'center',color:'var(--text-3)',padding:30 }}>No suppliers found</td></tr>}
              {!loading && suppliers.map(s => (
                <tr key={s.id}>
                  <td className="bold">{s.business_name}</td>
                  <td>{s.owner_name}</td>
                  <td>{s.city||'—'}</td>
                  <td><span style={{ color:'var(--flame-3)' }}>★</span> {Number(s.avg_rating||0).toFixed(1)} ({s.total_reviews})</td>
                  <td>{s.total_deliveries}</td>
                  <td>{s.is_approved ? <span className="badge badge-green">Approved</span> : <span className="badge badge-gold">Pending</span>}</td>
                  <td>{s.is_open ? <span className="badge badge-green">Open</span> : <span className="badge badge-red">Closed</span>}</td>
                  <td>
                    {!s.is_approved
                      ? <button className="btn btn-success btn-sm" onClick={() => handleApprove(s.id, true)}>Approve</button>
                      : <button className="btn btn-danger btn-sm" onClick={() => handleApprove(s.id, false)}>Suspend</button>
                    }
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth:560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Supplier Account</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="alert alert-info" style={{ marginBottom:16, fontSize:'0.82rem' }}>
              🔐 Supplier accounts can only be created by Super Admin. The supplier will login with the credentials you set here.
            </div>
            <form onSubmit={handleCreateSupplier}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Owner Name *</label>
                  <input className="form-input" value={form.name} onChange={e=>set('name',e.target.value)} required placeholder="Owner full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Name *</label>
                  <input className="form-input" value={form.business_name} onChange={e=>set('business_name',e.target.value)} placeholder="Agency name" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Default: Supplier@1234" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={e=>set('phone',e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={form.city} onChange={e=>set('city',e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" value={form.address} onChange={e=>set('address',e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input className="form-input" type="number" step="any" value={form.latitude} onChange={e=>set('latitude',e.target.value)} placeholder="27.7172" />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input className="form-input" type="number" step="any" value={form.longitude} onChange={e=>set('longitude',e.target.value)} placeholder="85.3240" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-flame" disabled={saving}>{saving ? 'Creating…' : '+ Create Supplier'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
