import { getCurrentSession } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export const useCurrentSession = () => {
  return useQuery({
    queryKey: ['current-session'],
    queryFn: getCurrentSession,
  });
};
