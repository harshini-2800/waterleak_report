import axios from 'axios';

// When deployed on Vercel, relative '/api' calls execute the serverless backend
const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// Interceptor to add admin token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wl_admin_token') || 'demo-admin-token';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const reportService = {
  // Public
  getReports: (params) => api.get('/reports', { params }),
  getReportByTrackId: (id) => api.get(`/reports/track/${id}`),
  createReport: (formData) => {
    // If formData is HTML5 FormData, convert to JSON object so serverless handles it with zero multipart errors
    if (formData instanceof FormData) {
      const obj = {};
      formData.forEach((value, key) => {
        if (key !== 'image') obj[key] = value;
      });
      return api.post('/reports', obj);
    }
    return api.post('/reports', formData);
  },
  getSystemStatus: () => api.get('/status'),

  // Admin
  login: (credentials) => api.post('/auth/login', credentials),
  getAllAdminReports: () => api.get('/admin/reports'),
  updateStatus: (reportId, status, note) => api.patch(`/admin/reports/${reportId}/status`, { status, note }),
  deleteReport: (reportId) => api.delete(`/admin/reports/${reportId}`),
  getAnalytics: () => api.get('/admin/analytics'),
  getNotifications: () => api.get('/admin/notifications'),
  markNotificationRead: (id) => api.patch(`/admin/notifications/${id}/read`),
  markAllNotificationsRead: () => api.patch('/admin/notifications/read-all'),

  // Demo Data Management
  seedDemoData: () => api.post('/admin/demo/seed'),
  cleanDemoData: () => api.post('/admin/demo/clean'),
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return imagePath;
};

export default api;
