import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import LandingPage      from './pages/public/LandingPage';
import SuppliersPage    from './pages/public/SuppliersPage';
import SupplierDetail   from './pages/public/SupplierDetail';
import BlogPage         from './pages/public/BlogPage';
import BlogPost         from './pages/public/BlogPost';
import AuthPage         from './pages/public/AuthPage';

// Admin pages
import AdminDashboard   from './pages/admin/Dashboard';
import AdminSuppliers   from './pages/admin/Suppliers';
import AdminBookings    from './pages/admin/Bookings';
import AdminUsers       from './pages/admin/Users';
import AdminBlogs       from './pages/admin/Blogs';

// Supplier pages
import SupplierDashboard from './pages/supplier/Dashboard';
import SupplierStock    from './pages/supplier/Stock';
import SupplierQueue    from './pages/supplier/Queue';
import SupplierBookings from './pages/supplier/Bookings';
import SupplierReviews  from './pages/supplier/Reviews';
import SupplierProfile  from './pages/supplier/Profile';

// Customer pages
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerBookings  from './pages/customer/Bookings';

const Loading = () => (
  <div className="loading-screen">
    <div className="spinner" />
    <span style={{color:'var(--text-3)',fontSize:'0.9rem'}}>Loading GasQueue…</span>
  </div>
);

const Protected = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/auth" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const RoleHome = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'SUPER_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'SUPPLIER')    return <Navigate to="/supplier/dashboard" replace />;
  if (user.role === 'CUSTOMER')    return <Navigate to="/customer/dashboard" replace />;
  return <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"              element={<LandingPage />} />
          <Route path="/suppliers"     element={<SuppliersPage />} />
          <Route path="/suppliers/:id" element={<SupplierDetail />} />
          <Route path="/blog"          element={<BlogPage />} />
          <Route path="/blog/:slug"    element={<BlogPost />} />
          <Route path="/auth"          element={<AuthPage />} />
          <Route path="/dashboard"     element={<Protected><RoleHome /></Protected>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<Protected roles={['SUPER_ADMIN']}><AdminDashboard /></Protected>} />
          <Route path="/admin/suppliers" element={<Protected roles={['SUPER_ADMIN']}><AdminSuppliers /></Protected>} />
          <Route path="/admin/bookings"  element={<Protected roles={['SUPER_ADMIN']}><AdminBookings /></Protected>} />
          <Route path="/admin/users"     element={<Protected roles={['SUPER_ADMIN']}><AdminUsers /></Protected>} />
          <Route path="/admin/blogs"     element={<Protected roles={['SUPER_ADMIN']}><AdminBlogs /></Protected>} />

          {/* Supplier */}
          <Route path="/supplier/dashboard" element={<Protected roles={['SUPPLIER']}><SupplierDashboard /></Protected>} />
          <Route path="/supplier/queue"     element={<Protected roles={['SUPPLIER']}><SupplierQueue /></Protected>} />
          <Route path="/supplier/bookings"  element={<Protected roles={['SUPPLIER']}><SupplierBookings /></Protected>} />
          <Route path="/supplier/stock"     element={<Protected roles={['SUPPLIER']}><SupplierStock /></Protected>} />
          <Route path="/supplier/reviews"   element={<Protected roles={['SUPPLIER']}><SupplierReviews /></Protected>} />
          <Route path="/supplier/profile"   element={<Protected roles={['SUPPLIER']}><SupplierProfile /></Protected>} />

          {/* Customer */}
          <Route path="/customer/dashboard" element={<Protected roles={['CUSTOMER']}><CustomerDashboard /></Protected>} />
          <Route path="/customer/bookings"  element={<Protected roles={['CUSTOMER']}><CustomerBookings /></Protected>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
