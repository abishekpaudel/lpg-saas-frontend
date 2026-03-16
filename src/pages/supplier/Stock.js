import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import { stockAPI } from '../../api';

export default function SupplierStock() {
  const [stock, setStock]       = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [form, setForm]         = useState({ product_id: '', quantity_available: '', price_per_unit: '' });
  const [addQty, setAddQty]     = useState('');
  const [msg, setMsg]           = useState('');
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);

  const flash = (m, isErr = false) => {
    if (isErr) setError(m); else setMsg(m);
    setTimeout(() => { setMsg(''); setError(''); }, 4000);
  };

  const loadData = useCallback(async () => {
    try {
      const [stockRes, prodRes] = await Promise.all([stockAPI.getMyStock(), stockAPI.getProducts()]);
      setStock(stockRes.data.data.stock);
      setProducts(prodRes.data.data.products);
    } catch (e) { flash(e.response?.data?.message || 'Failed to load', true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await stockAPI.upsert({
        product_id: form.product_id,
        quantity_available: parseInt(form.quantity_available),
        price_per_unit: parseFloat(form.price_per_unit),
      });
      flash('✅ Stock updated successfully.');
      setShowModal(false);
      setForm({ product_id: '', quantity_available: '', price_per_unit: '' });
      loadData();
    } catch (e) { flash(e.response?.data?.message || 'Failed to save', true); }
    finally { setSaving(false); }
  };

  const handleAddQty = async (e) => {
    e.preventDefault();
    if (!selectedStock) return;
    setSaving(true);
    try {
      await stockAPI.addQuantity(selectedStock.id, parseInt(addQty));
      flash(`✅ Added ${addQty} units to ${selectedStock.product_name}`);
      setShowAddModal(false);
      setAddQty('');
      loadData();
    } catch (e) { flash(e.response?.data?.message || 'Failed', true); }
    finally { setSaving(false); }
  };

  const openAdd = (s) => { setSelectedStock(s); setAddQty(''); setShowAddModal(true); };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Management</h1>
          <p className="page-subtitle">Manage your LPG cylinder inventory</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add / Update Stock</button>
        </div>
      </div>

      {msg   && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="flex-center" style={{ height: '40vh' }}><div className="spinner" /></div>
      ) : stock.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-title">No stock added yet</div>
            <div className="empty-state-text">Click "Add / Update Stock" to add your first product</div>
            <button className="btn btn-primary mt-2" onClick={() => setShowModal(true)}>+ Add Stock</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {stock.map(s => {
            const available = s.quantity_available - s.quantity_reserved;
            const pct = s.quantity_available > 0 ? (available / s.quantity_available) * 100 : 0;
            const barColor = pct > 50 ? 'var(--green)' : pct > 20 ? 'var(--yellow)' : 'var(--red)';

            return (
              <div className="card" key={s.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{s.product_name}</div>
                    <div className="text-muted">{s.weight_kg} kg cylinder</div>
                  </div>
                  <span style={{
                    background: 'var(--accent-dim)', color: 'var(--accent)',
                    padding: '4px 10px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                  }}>
                    NPR {Number(s.price_per_unit).toLocaleString()}
                  </span>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Available Stock</span>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: barColor }}>
                      {available} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-3)' }}>/ {s.quantity_available}</span>
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-3)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: 14 }}>
                  <span>🔒 Reserved: {s.quantity_reserved}</span>
                  <span>·</span>
                  <span>📅 {s.last_restocked_at ? new Date(s.last_restocked_at).toLocaleDateString() : 'Not restocked'}</span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => openAdd(s)}>
                    + Add Stock
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setForm({ product_id: s.product_id, quantity_available: s.quantity_available, price_per_unit: s.price_per_unit });
                      setShowModal(true);
                    }}
                  >✏️ Edit</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Update Stock Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add / Update Stock</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Product</label>
                <select
                  className="form-select"
                  value={form.product_id}
                  onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}
                  required
                >
                  <option value="">Select a product…</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.weight_kg} kg)</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Total Quantity</label>
                  <input
                    className="form-input"
                    type="number" min="0"
                    value={form.quantity_available}
                    onChange={e => setForm(f => ({ ...f, quantity_available: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Price per Unit (NPR)</label>
                  <input
                    className="form-input"
                    type="number" min="0" step="0.01"
                    value={form.price_per_unit}
                    onChange={e => setForm(f => ({ ...f, price_per_unit: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Quantity Modal */}
      {showAddModal && selectedStock && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Stock</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <p className="text-muted mb-2">Adding to: <strong style={{ color: 'var(--text)' }}>{selectedStock.product_name}</strong></p>
            <p className="text-muted mb-2">Current stock: <strong style={{ color: 'var(--text)' }}>{selectedStock.quantity_available}</strong></p>
            <form onSubmit={handleAddQty}>
              <div className="form-group">
                <label className="form-label">Quantity to Add</label>
                <input
                  className="form-input"
                  type="number" min="1"
                  value={addQty}
                  onChange={e => setAddQty(e.target.value)}
                  required autoFocus
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Adding…' : '+ Add Cylinders'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
