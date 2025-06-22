import api from '@/lib/api'
import {
  ApiErrorData,
  LoginData,
  LoginResponse,
  UserProfile,
} from '@/lib/auth-types'
import { useAuthActions } from '@/store/auth'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export const useLogin = () => {
  const { setAccessToken, setUser } = useAuthActions()
  const navigate = useNavigate()
  const location = useLocation()

  return useMutation<LoginResponse, AxiosError<ApiErrorData>, LoginData>({
    mutationFn: (data) => api.post('/auth/login', data).then((res) => res.data),
    onSuccess: async (data) => {
      setAccessToken({ accessToken: data.accessToken })
      const userProfile = await api.get<UserProfile>('/auth/profile', {
        headers: {
          Authorization: `Bearer ${data.accessToken}`,
        },
      })
      setUser(userProfile.data)
      toast.success('Login successful!')

      // Navigate to the intended destination or fallback to dashboard
      const from =
        (location.state as { from: { pathname: string } })?.from?.pathname ||
        '/'
      navigate(from, { replace: true })
    },
    onError: (error) => {
      const errorData = error.response?.data
      if (errorData) {
        if (typeof errorData.message === 'string') {
          toast.error(errorData.message)
        } else if (typeof errorData.message === 'object') {
          const messages = Object.values(errorData.message).flat()
          toast.error(messages.join('. '))
        } else {
          toast.error('An unknown error occurred.')
        }
      } else {
        toast.error('An error occurred')
      }
    },
  })
}
