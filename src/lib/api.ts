import { env } from '@/lib/env'
import { useAuthStore } from '@/store/auth'
import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import { toast } from 'sonner'

const api = axios.create({
  baseURL: `${env.VITE_API_URL}/api/v1`,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

interface ErrorResponse {
  message: string;
  statusCode?: number;
}

// Custom error class for API errors
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
          }
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${env.VITE_API_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        useAuthStore.getState().actions.setAccessToken(data);
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        }
        processQueue(null, data.accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        const axiosError = refreshError as AxiosError<{ message: string }>;
        if (axiosError.response?.data?.message === "Your session has expired. Please log in again.") {
          toast.error(axiosError.response.data.message);
        }

        processQueue(refreshError, null);
        useAuthStore.getState().actions.logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'An error occurred';

      // Handle specific error cases
      switch (status) {
        case 401:
          if (message.includes('Session expired')) {
            toast.error('Session expired. Please log in again.');
            // Clear any auth state here if needed
          } else {
            toast.error(message);
          }
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 404:
          // Don't toast 404s, let the error boundary handle them
          break;
        default:
          if (status >= 500) {
            toast.error('Server error. Please try again later.');
          } else {
            toast.error(message);
          }
      }

      throw new APIError(message, status);
    }

    if (error.request) {
      const message = 'No response from server. Please check your connection.';
      toast.error(message);
      throw new APIError(message);
    }

    // Something happened in setting up the request
    toast.error('Failed to make request. Please try again.');
    throw new APIError(error.message || 'Unknown error occurred');
  },
)

export default api
