import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@/config/env';
import { ROUTES } from '@/config/routes';

// Create axios instance
export const api = axios.create({
  baseURL: ENV.API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const authStorage = localStorage.getItem('auth-storage');

    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        const token = state?.token;

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth storage
      localStorage.removeItem('auth-storage');

      // Redirect to login if not already there
      if (window.location.pathname !== ROUTES.LOGIN) {
        window.location.href = ROUTES.LOGIN;
      }
    }

    return Promise.reject(error);
  }
);
