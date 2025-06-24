import api from '@/lib/api'
import { ApiErrorData } from '@/lib/auth-types'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export const useVerifyEmail = () => {
  const navigate = useNavigate()

  return useMutation<unknown, AxiosError<ApiErrorData>, { token: string }>({
    mutationFn: async ({ token }) => {
      const response = await api.get(`/auth/verify-email?token=${token}`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Email verified successfully!')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    },
    onError: () => {
      // Do not show any toast here; api.ts interceptor already handles error toasts
    },
  })
}
