import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { API_BASE_URL } from '../constants/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (error.config && !error.config.url?.includes('/api/login')) {
        useAuthStore.getState().logout();
        window.location.href = '/admin-login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
