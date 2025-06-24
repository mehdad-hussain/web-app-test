import { env } from '@/lib/env'
import { useAuthStore } from '@/store/auth'
import axios, { type AxiosError } from 'axios'
import { toast } from 'sonner'
import { ApiErrorData } from './auth-types'

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

let isRefreshing = false
let failedQueue: {
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorData>) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && originalRequest) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = 'Bearer ' + token
            }
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      isRefreshing = true

      try {
        const { data } = await axios.post(
          `${env.VITE_API_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true },
        )

        useAuthStore.getState().actions.setAccessToken(data)
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] =
            `Bearer ${data.accessToken}`
        }
        processQueue(null, data.accessToken)
        return api(originalRequest)
      } catch (refreshError: unknown) {
        const axiosError = refreshError as AxiosError<{ message: string }>
        if (
          axiosError.response?.data?.message ===
          'Your session has expired. Please log in again.'
        ) {
          toast.error(axiosError.response.data.message)
        }

        processQueue(refreshError, null)
        useAuthStore.getState().actions.logout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      let message = 'An error occurred'

      if (data && typeof data.message === 'string') {
        message = data.message
      } else if (data && typeof data.message === 'object') {
        message = Object.values(data.message).flat().join('. ')
      }

      // Handle specific error cases
      switch (status) {
        case 401:
          if (message.includes('Session expired')) {
            toast.error('Session expired. Please log in again.')
            // Clear any auth state here if needed
          } else {
            toast.error(message)
          }
          break
        case 429:
          toast.error('Too many requests. Please try again later.')
          break
        case 404:
          // Don't toast 404s, let the error boundary handle them
          break
        default:
          if (status >= 500) {
            toast.error('Server error. Please try again later.')
          } else {
            toast.error(message)
          }
      }

      throw new Error(message)
    }

    if (error.request) {
      const message = 'No response from server. Please check your connection.'
      toast.error(message)
      throw new Error(message)
    }

    // Something happened in setting up the request
    toast.error('Failed to make request. Please try again.')
    throw new Error(error.message || 'Unknown error occurred')
  },
)

export const logout = async () => {
  try {
    await api.post('/auth/logout')
  } catch (error) {
    // The interceptor already handles errors and shows toasts, so we can ignore them here
    console.error('Logout failed:', error)
  }
}

export const getCurrentSession = async () => {
  const { data } = await api.get('/auth/sessions')
  return data
}

// Murmur API functions
export interface Murmur {
  id: string
  content: string
  authorId: string
  createdAt: string
  updatedAt: string
  likeCount: number
  author: {
    id: string
    name: string | null
    image: string | null
  }
  isLiked: boolean
}

export interface PaginatedResponse {
  murmurs: Murmur[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export const getMurmurs = async (page = 1, limit = 10) => {
  const { data } = await api.get<PaginatedResponse>(
    `/murmurs?page=${page}&limit=${limit}`,
  )
  return data
}

export const getTimeline = async (page = 1, limit = 10) => {
  const { data } = await api.get<PaginatedResponse>(
    `/me/timeline?page=${page}&limit=${limit}`,
  )
  return data
}

export const getUserMurmurs = async (userId: string, page = 1, limit = 10) => {
  const { data } = await api.get<PaginatedResponse>(
    `/users/${userId}/murmurs?page=${page}&limit=${limit}`,
  )
  return data
}

export const createMurmur = async (content: string) => {
  const { data } = await api.post<Murmur>('/me/murmurs', { content })
  return data
}

export const deleteMurmur = async (id: string) => {
  await api.delete(`/me/murmurs/${id}`)
}

export const likeMurmur = async (id: string) => {
  const { data } = await api.post<Murmur>(`/murmurs/${id}/like`)
  return data
}

export const unlikeMurmur = async (id: string) => {
  const { data } = await api.delete<Murmur>(`/murmurs/${id}/like`)
  return data
}

export const followUser = async (userId: string) => {
  await api.post(`/users/${userId}/follow`)
}

export const unfollowUser = async (userId: string) => {
  await api.delete(`/users/${userId}/follow`)
}

export const getFollowCounts = async (userId: string) => {
  const { data } = await api.get<{
    followersCount: number
    followingCount: number
  }>(`/users/${userId}/follow-counts`)
  return data
}

export const checkIsFollowing = async (userId: string) => {
  const { data } = await api.get<{
    isFollowing: boolean
  }>(`/users/${userId}/is-following`)
  return data
}

export default api
