import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:          (data) => api.post('/auth/login', data),
  register:       (data) => api.post('/auth/register', data),
  me:             ()     => api.get('/auth/me'),
  changePassword: (data) => api.patch('/auth/change-password', data),
};

// ── Suppliers ─────────────────────────────────────────────────────────────────
export const supplierAPI = {
  getAll:        (params) => api.get('/suppliers', { params }),
  getById:       (id)     => api.get(`/suppliers/${id}`),
  getMyProfile:  ()       => api.get('/suppliers/me/profile'),
  updateProfile: (data)   => api.put('/suppliers/me/profile', data),
  toggleOpen:    ()       => api.patch('/suppliers/me/toggle-open'),
  getAnalytics:  ()       => api.get('/suppliers/me/analytics'),
  approve:       (id, is_approved) => api.patch(`/suppliers/${id}/approve`, { is_approved }),
  adminAnalytics: ()      => api.get('/suppliers/admin/analytics'),
};

// ── Stock ─────────────────────────────────────────────────────────────────────
export const stockAPI = {
  getProducts:       ()           => api.get('/stock/products'),
  getMyStock:        ()           => api.get('/stock/me'),
  getSupplierStock:  (supplierId) => api.get(`/stock/supplier/${supplierId}`),
  upsert:            (data)       => api.post('/stock/me', data),
  addQuantity:       (stockId, quantity) => api.patch(`/stock/me/${stockId}/add-quantity`, { quantity }),
};

// ── Bookings ──────────────────────────────────────────────────────────────────
export const bookingAPI = {
  create:           (data)   => api.post('/bookings', data),
  getById:          (id)     => api.get(`/bookings/${id}`),
  getMyBookings:    (params) => api.get('/bookings/my', { params }),
  getSupplierBookings: (params) => api.get('/bookings/supplier', { params }),
  deliver:          (id)     => api.patch(`/bookings/${id}/deliver`),
  cancel:           (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  process:          (id)     => api.patch(`/bookings/${id}/process`),
  adminAll:         (params) => api.get('/bookings/admin/all', { params }),
};

// ── Queue ─────────────────────────────────────────────────────────────────────
export const queueAPI = {
  getSupplierQueue:  (supplierId) => api.get(`/queue/${supplierId}`),
  getMyQueue:        ()           => api.get('/queue/me/live'),
  getPosition:       (supplierId, bookingId) => api.get(`/queue/${supplierId}/booking/${bookingId}/position`),
  getMyActiveQueues: ()           => api.get('/queue/my/active'),
  clearQueue:        ()           => api.delete('/queue/me/clear'),
};

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewAPI = {
  getSupplierReviews: (supplierId, params) => api.get(`/reviews/supplier/${supplierId}`, { params }),
  create:             (data)               => api.post('/reviews', data),
  getMyReviews:       ()                   => api.get('/reviews/my'),
};

// ── Users (Admin) ─────────────────────────────────────────────────────────────
export const userAPI = {
  getAll:         (params) => api.get('/users', { params }),
  getById:        (id)     => api.get(`/users/${id}`),
  toggleActive:   (id)     => api.patch(`/users/${id}/toggle-active`),
  updateProfile:  (data)   => api.patch('/users/me/profile', data),
};

export default api;

// ── Blog ──────────────────────────────────────────────────────────────────────
export const blogAPI = {
  getPublished:   (params) => api.get('/blogs', { params }),
  getBySlug:      (slug)   => api.get(`/blogs/${slug}`),
  getCategories:  ()       => api.get('/blogs/categories'),
  adminGetAll:    (params) => api.get('/blogs/admin/all', { params }),
  create:         (data)   => api.post('/blogs', data),
  update:         (id, data) => api.put(`/blogs/${id}`, data),
  remove:         (id)     => api.delete(`/blogs/${id}`),
  togglePublish:  (id)     => api.patch(`/blogs/${id}/toggle-publish`),
};

export const adminAPI = {
  createSupplier: (data) => api.post('/auth/create-supplier', data),
};
