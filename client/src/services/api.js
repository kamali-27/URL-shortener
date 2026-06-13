import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token to headers if it exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to auto-logout on token expiration (401 status)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on authentication pages
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/signup'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    return response.data;
  },
  signup: async (name, email, password) => {
    const response = await API.post('/auth/signup', { name, email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  }
};

export const urlService = {
  getUrls: async () => {
    const response = await API.get('/urls');
    return response.data;
  },
  shortenUrl: async (longUrl, customAlias = '', expiresAt = '') => {
    const payload = { longUrl };
    if (customAlias) payload.customAlias = customAlias;
    if (expiresAt) payload.expiresAt = expiresAt;
    const response = await API.post('/shorten', payload);
    return response.data;
  },
  deleteUrl: async (id) => {
    const response = await API.delete(`/urls/${id}`);
    return response.data;
  },
  getUrlAnalytics: async (id) => {
    const response = await API.get(`/urls/${id}/analytics`);
    return response.data;
  }
};

export default API;
