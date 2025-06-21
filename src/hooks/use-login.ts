import api from '@/lib/api'
import { useAuthActions } from '@/store/auth'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export const useLogin = () => {
  const { setTokens, setUser } = useAuthActions()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: any) => api.post('/login', data),
    onSuccess: async (response: any) => {
      if (response && response.data) {
        setTokens(response.data)
        const userProfile = await api.get('/profile')
        setUser(userProfile.data)
        toast.success('Login successful!')
        navigate('/')
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'An error occurred'
      toast.error(message)
    },
  })
}
