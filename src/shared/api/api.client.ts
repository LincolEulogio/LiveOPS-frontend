import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/store/auth.store';

// Extension to handle custom _retry flag in Axios config
interface CustomInternalConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface CustomAxiosInstance extends AxiosInstance {
  get<T = unknown, R = T, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  post<T = unknown, R = T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  put<T = unknown, R = T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  patch<T = unknown, R = T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  delete<T = unknown, R = T, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
}

// Create a configured axios instance
const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor: Attach JWT token from memory
instance.interceptors.request.use(
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

interface FailedRequest {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
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
instance.interceptors.response.use(
  (response) => {
    return response.data; // simplify payload for callers
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomInternalConfig;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return instance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${instance.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = response.data.accessToken;

        // Update store
        useAuthStore.getState().setAuth(newToken, response.data.user);

        processQueue(null, newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth(); // Force logout
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize error shape to be consistent
    const errorData = error.response?.data as { message?: string | string[] };
    let message = errorData?.message || error.message;

    // Handle NestJS validation array messages
    if (Array.isArray(message)) {
      message = message.join(', ');
    } else if (typeof message === 'object' && message !== null) {
      message = JSON.stringify(message);
    }

    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)));
  }
);

export const apiClient = instance as CustomAxiosInstance;
