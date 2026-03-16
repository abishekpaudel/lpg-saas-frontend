import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { supplierAPI } from '../../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#ef4444', '#eab308'];

const fmt = (n) => Number(n || 0).toLocaleString();
const fmtMoney = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    supplierAPI.adminAnalytics()
      .then(r => setData(r.data.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout>
      <div className="flex-center" style={{ height: '60vh' }}><div className="spinner" /></div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="alert alert-error">{error}</div>
    </Layout>
  );

  const { summary, recent_bookings = [], top_suppliers = [], bookings_by_status = [] } = data || {};

  const pieData = bookings_by_status.map(b => ({ name: b.status, value: Number(b.count) }));

  const statusBadge = (s) => {
    const map = {
      PENDING: 'badge-yellow', QUEUED: 'badge-blue', PROCESSING: 'badge-orange',
      DELIVERED: 'badge-green', CANCELLED: 'badge-red',
    };
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Overview</h1>
          <p className="page-subtitle">Real-time analytics across all suppliers and customers</p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { icon: '👥', label: 'Total Customers', value: fmt(summary?.total_customers), color: 'var(--blue-dim)', iconColor: 'var(--blue)' },
          { icon: '🏪', label: 'Active Suppliers', value: fmt(summary?.total_suppliers), color: 'var(--green-dim)', iconColor: 'var(--green)' },
          { icon: '⏳', label: 'Pending Approval', value: fmt(summary?.pending_suppliers), color: 'var(--yellow-dim)', iconColor: 'var(--yellow)' },
          { icon: '📋', label: 'Total Bookings', value: fmt(summary?.total_bookings), color: 'var(--accent-dim)', iconColor: 'var(--accent)' },
          { icon: '✅', label: 'Delivered', value: fmt(summary?.delivered_bookings), color: 'var(--green-dim)', iconColor: 'var(--green)' },
          { icon: '💰', label: 'Total Revenue', value: fmtMoney(summary?.total_revenue), color: 'var(--accent-dim)', iconColor: 'var(--accent)' },
          { icon: '📅', label: "Today's Bookings", value: fmt(summary?.today_bookings), color: 'var(--blue-dim)', iconColor: 'var(--blue)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-icon" style={{ background: s.color }}>
              <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
            </div>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value" style={{ color: s.iconColor }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Bookings by Status Pie */}
        <div className="card">
          <div className="card-title">Bookings by Status</div>
          <div className="card-subtitle">Distribution across all states</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Suppliers */}
        <div className="card">
          <div className="card-title">Top Suppliers</div>
          <div className="card-subtitle">By completed deliveries</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={top_suppliers} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis dataKey="business_name" tick={{ fontSize: 10, fill: 'var(--text-3)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="total_bookings" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="flex-between mb-2">
          <div>
            <div className="card-title">Recent Bookings</div>
            <div className="card-subtitle">Latest 10 across platform</div>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Customer</th>
                <th>Supplier</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recent_bookings.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-3)', padding: 30 }}>No bookings yet</td></tr>
              )}
              {recent_bookings.map(b => (
                <tr key={b.id}>
                  <td className="bold text-mono">{b.booking_number}</td>
                  <td>{b.customer_name}</td>
                  <td>{b.supplier_name}</td>
                  <td>{b.product_name}</td>
                  <td>NPR {Number(b.total_amount).toLocaleString()}</td>
                  <td>{statusBadge(b.status)}</td>
                  <td className="text-muted">{new Date(b.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
