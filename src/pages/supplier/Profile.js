import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { supplierAPI } from '../../api';

export default function SupplierProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm]       = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');
  const [error, setError]     = useState('');
  const [toggling, setToggling] = useState(false);

  const flash = (m, isErr = false) => {
    if (isErr) setError(m); else setMsg(m);
    setTimeout(() => { setMsg(''); setError(''); }, 4000);
  };

  useEffect(() => {
    supplierAPI.getMyProfile()
      .then(r => {
        const s = r.data.data.supplier;
        setProfile(s);
        setForm({
          business_name: s.business_name || '',
          description: s.description || '',
          address: s.address || '',
          city: s.city || '',
          state: s.state || '',
          phone: s.phone || '',
          email: s.email || '',
          opening_hours: s.opening_hours || '',
          latitude: s.latitude || '',
          longitude: s.longitude || '',
        });
      })
      .catch(e => flash(e.response?.data?.message || 'Failed to load profile', true))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await supplierAPI.updateProfile(form);
      flash('✅ Profile updated successfully.');
    } catch (e) { flash(e.response?.data?.message || 'Failed to save', true); }
    finally { setSaving(false); }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      const r = await supplierAPI.toggleOpen();
      const isOpen = r.data.data.is_open;
      setProfile(p => ({ ...p, is_open: isOpen }));
      flash(isOpen ? '🟢 You are now OPEN for business!' : '🔴 You are now CLOSED.');
    } catch (e) { flash(e.response?.data?.message || 'Error', true); }
    finally { setToggling(false); }
  };

  if (loading) return (
    <Layout>
      <div className="flex-center" style={{ height: '40vh' }}><div className="spinner" /></div>
    </Layout>
  );

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Business Profile</h1>
          <p className="page-subtitle">Manage your supplier details</p>
        </div>
        <div className="page-actions">
          <button
            className={`btn btn-lg ${profile?.is_open ? 'btn-danger' : 'btn-success'}`}
            onClick={handleToggle}
            disabled={toggling}
          >
            {toggling ? '…' : profile?.is_open ? '🔴 Close Shop' : '🟢 Open Shop'}
          </button>
        </div>
      </div>

      {msg   && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!profile?.is_approved && (
        <div className="alert alert-warn">
          ⚠️ Your supplier account is pending approval from the platform admin.
          You can set up your profile now, but customers won't see you until approved.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">Status</div>
            <div className="card-subtitle mb-2">Your current visibility</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, padding: '14px', background: 'var(--bg-3)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: 4 }}>APPROVAL</div>
                {profile?.is_approved
                  ? <span className="badge badge-green" style={{ fontSize: '0.85rem' }}>✓ Approved</span>
                  : <span className="badge badge-yellow" style={{ fontSize: '0.85rem' }}>⏳ Pending</span>
                }
              </div>
              <div style={{ flex: 1, padding: '14px', background: 'var(--bg-3)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: 4 }}>SHOP STATUS</div>
                {profile?.is_open
                  ? <span className="badge badge-green" style={{ fontSize: '0.85rem' }}>🟢 Open</span>
                  : <span className="badge badge-red" style={{ fontSize: '0.85rem' }}>🔴 Closed</span>
                }
              </div>
              <div style={{ flex: 1, padding: '14px', background: 'var(--bg-3)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: 4 }}>RATING</div>
                <span style={{ color: 'var(--yellow)', fontWeight: 700 }}>
                  ★ {Number(profile?.avg_rating || 0).toFixed(1)}
                </span>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}> ({profile?.total_reviews})</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title mb-2">Location</div>
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input className="form-input" name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} placeholder="27.7172" />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input className="form-input" name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} placeholder="85.3240" />
            </div>
            <p className="text-muted" style={{ fontSize: '0.78rem' }}>
              Your coordinates help customers find you nearby. Use Google Maps to find your exact location.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-title mb-2">Business Information</div>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Business Name *</label>
              <input className="form-input" name="business_name" value={form.business_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Tell customers about your business…" />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" name="address" value={form.address} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" name="city" value={form.city} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-input" name="state" value={form.state} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Opening Hours</label>
              <input className="form-input" name="opening_hours" value={form.opening_hours} onChange={handleChange} placeholder="08:00-18:00" />
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={saving}>
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
