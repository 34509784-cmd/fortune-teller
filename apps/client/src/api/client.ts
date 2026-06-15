import axios from 'axios';

// Use env var in production, default to /api for dev (Vite proxy)
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fortune-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Ba Zi
export const baziApi = {
  calculate: (data: any) => api.post('/bazi/calculate', data),
  getReadings: (page = 1, limit = 10) =>
    api.get('/bazi/readings', { params: { page, limit } }),
  getReading: (id: string) => api.get(`/bazi/readings/${id}`),
  deleteReading: (id: string) => api.delete(`/bazi/readings/${id}`),
};

// Bagua
export const baguaApi = {
  divine: (data: { question: string; method: string; manualLines?: number[] }) =>
    api.post('/bagua/divine', data),
  getReadings: (page = 1, limit = 10) =>
    api.get('/bagua/readings', { params: { page, limit } }),
  getReading: (id: string) => api.get(`/bagua/readings/${id}`),
};

// Qi Men
export const qimenApi = {
  calculate: (data: { queryDateTime: string; method: string }) =>
    api.post('/qimen/calculate', data),
  getReadings: (page = 1, limit = 10) =>
    api.get('/qimen/readings', { params: { page, limit } }),
  getReading: (id: string) => api.get(`/qimen/readings/${id}`),
};

// Zodiac
export const zodiacApi = {
  chart: (data: { birthDateTime: string; longitude: number; latitude: number; houseSystem: string }) =>
    api.post('/zodiac/chart', data),
  getReadings: (page = 1, limit = 10) =>
    api.get('/zodiac/readings', { params: { page, limit } }),
  getReading: (id: string) => api.get(`/zodiac/readings/${id}`),
};

// History
export const historyApi = {
  getAll: (page = 1, limit = 20) =>
    api.get('/history', { params: { page, limit } }),
  getOne: (id: string) => api.get(`/history/${id}`),
};

export default api;
