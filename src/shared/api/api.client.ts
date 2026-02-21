import axios, { AxiosError } from 'axios';

// Create a configured axios instance
export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send cookies if using them, or needed for CORS
});

// Request interceptor: Attach JWT token if stored in memory/localStorage (Note: in-memory is safer for XSS, but localStorage is simpler for MVP. Adjust as needed based on auth strategy).
apiClient.interceptors.request.use(
    (config) => {
        // In a real app with pure JWT, you might grab the token from Zustand store here.
        // Since we'll implement auth in Phase 1, we set up the skeleton.

        // Example:
        // const token = useAuthStore.getState().token;
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: Handle global errors like 401 Unauthorized
apiClient.interceptors.response.use(
    (response) => {
        return response.data; // simplify payload for callers
    },
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Handle Unauthorized logic here: dispatch logout to Zustand or redirect to /login
            console.warn('Unauthorized request, handle session expiration');
            // e.g., useAuthStore.getState().logout();
        }

        // Normalize error shape to be consistent
        const message = (error.response?.data as any)?.message || error.message;
        return Promise.reject(new Error(message));
    }
);
