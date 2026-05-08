import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medicare_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('medicare_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API helpers
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const dashboardAPI = {
  getAdminStats: () => api.get('/dashboard/admin'),
  getPatientStats: () => api.get('/dashboard/patient'),
  getDoctorStats: () => api.get('/dashboard/doctor'),
};

export const doctorsAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
};

export const appointmentsAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  updateStatus: (id, data) => api.put(`/appointments/${id}/status`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
  getSlots: (params) => api.get('/appointments/slots', { params }),
};

export const patientsAPI = {
  getAll: (params) => api.get('/patients', { params }),
  getById: (id) => api.get(`/patients/${id}`),
  update: (id, data) => api.put(`/patients/${id}`, data),
};

export const departmentsAPI = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

export const prescriptionsAPI = {
  getAll: () => api.get('/prescriptions'),
  create: (data) => api.post('/prescriptions', data),
};

export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  updateStatus: (id, data) => api.put(`/payments/${id}`, data),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};
