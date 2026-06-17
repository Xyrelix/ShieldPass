import axios from 'axios';
import { API_BASE_URL } from '../../utils/constant';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('shieldpass_jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('shieldpass_jwt');
    }
    return Promise.reject(err);
  }
);
