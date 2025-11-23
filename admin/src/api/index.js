import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  login: (phone, password) => api.post('/api/auth/login', { phone, password }),
  verifyOTP: (phone, otp) => api.post('/api/auth/verify-otp', { phone, otp }),
  logout: () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  },
}

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getUsers: () => api.get('/api/admin/users'),
  getSubmissions: () => api.get('/api/admin/submissions'),
  assignCard: (data) => api.post('/api/admin/assign-card', data),
  exportCSV: () => api.get('/api/admin/export-csv', { responseType: 'blob' }),
  getRebindRequests: () => api.get('/api/devices/rebind-requests'),
  approveRebind: (requestId) => api.post('/api/devices/approve-rebind', { request_id: requestId }),
}

export default api

