import { type Murmur, createMurmur, deleteMurmur, getMurmurs, getTimeline, likeMurmur, unlikeMurmur } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UseMurmursOptions {
  type?: 'all' | 'timeline';
  initialPage?: number;
  limit?: number;
}

export function useMurmurs({ type = 'all', initialPage = 1, limit = 10 }: UseMurmursOptions = {}) {
  const [murmurs, setMurmurs] = useState<Murmur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const { status } = useAuthStore();

  const fetchMurmurs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = type === 'timeline' ? 
        await getTimeline(page, limit) : 
        await getMurmurs(page, limit);
      setMurmurs(response.murmurs);
      setTotalPages(response.pagination.pages);
    } catch (err) {
      setError('Failed to fetch murmurs');
      console.error('Error fetching murmurs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, type]);

  useEffect(() => {
    fetchMurmurs();
  }, [fetchMurmurs]);

  const create = async (content: string) => {
    try {
      const newMurmur = await createMurmur(content);
      setMurmurs(prev => [newMurmur, ...prev]);
      toast.success('Murmur created successfully!');
    } catch (err) {
      toast.error('Failed to create murmur');
      throw err;
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteMurmur(id);
      setMurmurs(prev => prev.filter(murmur => murmur.id !== id));
      toast.success('Murmur deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete murmur');
      throw err;
    }
  };

  const like = async (id: string) => {
    try {
      const updatedMurmur = await likeMurmur(id);
      setMurmurs(prev => prev.map(murmur => 
        murmur.id === id ? updatedMurmur : murmur
      ));
    } catch (err) {
      toast.error('Failed to like murmur');
      throw err;
    }
  };

  const unlike = async (id: string) => {
    try {
      const updatedMurmur = await unlikeMurmur(id);
      setMurmurs(prev => prev.map(murmur => 
        murmur.id === id ? updatedMurmur : murmur
      ));
    } catch (err) {
      toast.error('Failed to unlike murmur');
      throw err;
    }
  };

  const refresh = () => {
    fetchMurmurs();
  };

  return {
    murmurs,
    loading,
    error,
    page,
    totalPages,
    setPage,
    create,
    remove,
    like,
    unlike,
    refresh,
    isAuthenticated: status === 'authenticated'
  };
} 