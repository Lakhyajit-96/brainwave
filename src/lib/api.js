import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  verify: () => api.get('/auth/verify'),
  googleLogin: () => window.location.href = `${API_URL}/api/auth/google`
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  deleteAccount: () => api.delete('/user/account')
};

// Subscription API
export const subscriptionAPI = {
  getPlans: () => api.get('/subscription/plans'),
  getCurrent: () => api.get('/subscription/current'),
  update: (plan) => api.post('/subscription/update', { plan }),
  cancel: () => api.post('/subscription/cancel')
};

// Payment API
export const paymentAPI = {
  createOrder: (data) => api.post('/payment/create-order', data),
  captureOrder: (data) => api.post('/payment/capture-order', data),
  getHistory: () => api.get('/payment/history')
};

// AI API
export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  getHistory: (params) => api.get('/ai/history', { params }),
  deleteChat: (id) => api.delete(`/ai/history/${id}`),
  generateImage: (data) => api.post('/ai/generate-image', data)
};

// Contact API
export const contactAPI = {
  submit: (data) => api.post('/contact/submit', data),
  getMySubmissions: () => api.get('/contact/my-submissions')
};

// Waitlist API
export const waitlistAPI = {
  join: (data) => api.post('/waitlist/join', data),
  getCount: () => api.get('/waitlist/count')
};

// Analytics API
export const analyticsAPI = {
  track: (data) => api.post('/analytics/track', data),
  getUserAnalytics: (params) => api.get('/analytics/user', { params })
};

// Content API
export const contentAPI = {
  getAll: (params) => api.get('/content', { params }),
  getByType: (type) => api.get(`/content/type/${type}`)
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getContacts: (params) => api.get('/admin/contacts', { params }),
  updateContact: (id, data) => api.patch(`/admin/contacts/${id}`, data),
  getWaitlist: (params) => api.get('/admin/waitlist', { params }),
  getContent: () => api.get('/admin/content'),
  createContent: (data) => api.post('/admin/content', data),
  updateContent: (id, data) => api.put(`/admin/content/${id}`, data),
  deleteContent: (id) => api.delete(`/admin/content/${id}`)
};
