import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Pages
import LoginPage        from './pages/LoginPage';
import AdminDashboard   from './pages/admin/Dashboard';
import AdminSuppliers   from './pages/admin/Suppliers';
import AdminBookings    from './pages/admin/Bookings';
import AdminUsers       from './pages/admin/Users';
import SupplierDashboard from './pages/supplier/Dashboard';
import SupplierStock    from './pages/supplier/Stock';
import SupplierQueue    from './pages/supplier/Queue';
import SupplierBookings from './pages/supplier/Bookings';
import SupplierReviews  from './pages/supplier/Reviews';
import SupplierProfile  from './pages/supplier/Profile';

const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="spinner" />
    <span style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>Loading GasQueue…</span>
  </div>
);

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'SUPER_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'SUPPLIER')    return <Navigate to="/supplier/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['SUPER_ADMIN']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/suppliers" element={
            <ProtectedRoute roles={['SUPER_ADMIN']}><AdminSuppliers /></ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute roles={['SUPER_ADMIN']}><AdminBookings /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['SUPER_ADMIN']}><AdminUsers /></ProtectedRoute>
          } />

          {/* Supplier */}
          <Route path="/supplier/dashboard" element={
            <ProtectedRoute roles={['SUPPLIER']}><SupplierDashboard /></ProtectedRoute>
          } />
          <Route path="/supplier/stock" element={
            <ProtectedRoute roles={['SUPPLIER']}><SupplierStock /></ProtectedRoute>
          } />
          <Route path="/supplier/queue" element={
            <ProtectedRoute roles={['SUPPLIER']}><SupplierQueue /></ProtectedRoute>
          } />
          <Route path="/supplier/bookings" element={
            <ProtectedRoute roles={['SUPPLIER']}><SupplierBookings /></ProtectedRoute>
          } />
          <Route path="/supplier/reviews" element={
            <ProtectedRoute roles={['SUPPLIER']}><SupplierReviews /></ProtectedRoute>
          } />
          <Route path="/supplier/profile" element={
            <ProtectedRoute roles={['SUPPLIER']}><SupplierProfile /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
