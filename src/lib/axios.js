import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import { storage } from './storage';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.clear();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const unwrap = (response) => response.data?.data ?? response.data;

export const unwrapList = (response) => ({
  data: response.data?.data ?? [],
  meta: response.data?.meta ?? null,
  message: response.data?.message,
});
