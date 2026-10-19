import axios from 'axios';
import { API_BASE_URL } from '@/constants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('aparaitech_admin_jwt');
    if (!token) {
      const session = localStorage.getItem('aparaitech_admin_session');
      if (session) {
        try {
          const user = JSON.parse(session);
          if (user?.token) {
            token = user.token;
          }
        } catch {
          // ignore parse errors
        }
      }
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('aparaitech_admin_session');
      localStorage.removeItem('aparaitech_admin_jwt');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
