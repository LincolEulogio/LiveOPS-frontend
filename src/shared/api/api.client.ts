import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/features/auth/store/auth.store';

// Create a configured axios instance
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required to send HTTP-only cookies if we were using them
});

// Request interceptor: Attach JWT token from memory
apiClient.interceptors.request.use(
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

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: Handle global errors like 401 Unauthorized and attempt silent refresh
apiClient.interceptors.response.use(
  (response) => {
    return response.data; // simplify payload for callers
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Assume backend has a /auth/refresh endpoint that checks cookies/rotation
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = response.data.accessToken;

        // Update store
        useAuthStore.getState().setAuth(newToken, response.data.user);

        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth(); // Force logout
        // Optionally redirect to login via window.location if not handled by components
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize error shape to be consistent
    const errorData = error.response?.data as any;
    let message = errorData?.message || error.message;

    // Handle NestJS validation array messages
    if (Array.isArray(message)) {
      message = message.join(', ');
    } else if (typeof message === 'object' && message !== null) {
      message = JSON.stringify(message);
    }

    return Promise.reject(new Error(message));
  }
);
