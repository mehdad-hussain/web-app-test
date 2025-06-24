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
    onError: () => {
      // Do not show any toast here; api.ts interceptor already handles error toasts
    },
  })
}
