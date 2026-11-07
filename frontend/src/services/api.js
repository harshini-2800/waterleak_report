import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://brave-bananas-search.loca.lt/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'bypass-tunnel-reminder': 'true'
  }
});

// Interceptor to add admin token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wl_admin_token') || 'demo-admin-token';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['bypass-tunnel-reminder'] = 'true';
  return config;
});

export const reportService = {
  // Public
  getReports: (params) => api.get('/reports', { params }),
  getReportByTrackId: (id) => api.get(`/reports/track/${id}`),
  createReport: (formData) => api.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data', 'bypass-tunnel-reminder': 'true' }
  }),
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
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const backendBase = API_BASE.replace('/api', '');
  return `${backendBase}${imagePath}`;
};

export default api;
