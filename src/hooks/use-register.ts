import api from '@/lib/api'
import { ApiErrorData, RegisterData } from '@/lib/auth-types'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

export const useRegister = () => {
  return useMutation<unknown, AxiosError<ApiErrorData>, RegisterData>({
    mutationFn: async (data) => {
      const response = await api.post('/auth/register', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Registration successful!', {
        description: 'Please check your email to verify your account.',
      })
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
