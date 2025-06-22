import api from '@/lib/api'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom'

export const useVerifyEmail = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({ token }: { token: string }) => {
      const response = await api.get(`/auth/verify-email?token=${token}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Email verified successfully!");
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    },
    onError: (error: AxiosError) => {
      const message = (error.response?.data as any)?.message || "Failed to verify email.";
      toast.error(message);
    }
  })
} 