import { env } from '@/lib/env'
import { useAuthStore } from '@/store/auth'
import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

const api = axios.create({
  baseURL: `${env.VITE_API_URL}/api/v1`,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const retryingRequests = new WeakSet<AxiosRequestConfig>()

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !retryingRequests.has(originalRequest)
    ) {
      retryingRequests.add(originalRequest)
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        const { data } = await axios.post(
          `${env.VITE_API_URL}/api/v1/refresh`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } },
        )
        useAuthStore.getState().actions.setTokens(data)
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        }
        return api(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().actions.logout()
      } finally {
        retryingRequests.delete(originalRequest)
      }
    }
    return Promise.reject(error)
  },
)

export default api
