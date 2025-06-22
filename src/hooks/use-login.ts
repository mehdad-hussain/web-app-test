import api from '@/lib/api'
import { useAuthActions } from '@/store/auth'
import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export const useLogin = () => {
  const { setAccessToken, setUser } = useAuthActions()
  const navigate = useNavigate()
  const location = useLocation()

  return useMutation({
    mutationFn: (data: any) => api.post('/auth/login', data),
    onSuccess: async (response: any) => {
      if (response && response.data) {
        setAccessToken({ accessToken: response.data.accessToken })
        const userProfile = await api.get('/auth/profile', {
          headers: {
            Authorization: `Bearer ${response.data.accessToken}`,
          },
        })
        setUser(userProfile.data)
        toast.success('Login successful!')
        
        // Navigate to the intended destination or fallback to dashboard
        const from = (location.state as any)?.from?.pathname || '/'
        navigate(from, { replace: true })
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'An error occurred'
      toast.error(message)
    },
  })
}
