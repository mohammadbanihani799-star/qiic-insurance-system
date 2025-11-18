import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Customer API
export const customerAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  searchByQatarId: (qatarId) => api.get(`/customers/search/qatarid/${qatarId}`),
};

// Vehicle API
export const vehicleAPI = {
  getAll: () => api.get('/vehicles'),
  getById: (id) => api.get(`/vehicles/${id}`),
  getByCustomer: (customerId) => api.get(`/vehicles/customer/${customerId}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
  searchByPlate: (plateNumber) => api.get(`/vehicles/search/plate/${plateNumber}`),
};

// Policy API
export const policyAPI = {
  getAll: () => api.get('/policies'),
  getById: (id) => api.get(`/policies/${id}`),
  getByCustomer: (customerId) => api.get(`/policies/customer/${customerId}`),
  create: (data) => api.post('/policies', data),
  update: (id, data) => api.put(`/policies/${id}`, data),
  calculatePremium: (data) => api.post('/policies/calculate-premium', data),
  getActive: () => api.get('/policies/status/active'),
};

// Claim API
export const claimAPI = {
  getAll: () => api.get('/claims'),
  getById: (id) => api.get(`/claims/${id}`),
  getByPolicy: (policyId) => api.get(`/claims/policy/${policyId}`),
  getByCustomer: (customerId) => api.get(`/claims/customer/${customerId}`),
  create: (data) => api.post('/claims', data),
  updateStatus: (id, data) => api.patch(`/claims/${id}/status`, data),
  calculateSettlement: (data) => api.post('/claims/calculate-settlement', data),
  getByStatus: (status) => api.get(`/claims/status/${status}`),
};

export default api;
