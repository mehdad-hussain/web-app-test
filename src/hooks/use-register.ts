import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export const useRegister = () => {
  const navigate = useNavigate()
  const { setTokens } = useAuthStore((state) => state.actions)

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/register', data)
      return response.data
    },
    onSuccess: (data) => {
      setTokens(data)
      toast.success('Registration successful!')
      navigate('/')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'An error occurred'
      toast.error(message)
    },
  })
}
