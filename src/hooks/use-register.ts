import api from '@/lib/api'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/auth/register', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Registration successful!', {
        description: 'Please check your email to verify your account.',
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'An error occurred'
      toast.error(message)
    },
  })
}
