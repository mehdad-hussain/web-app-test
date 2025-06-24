import {
  checkIsFollowing,
  followUser,
  getFollowCounts,
  unfollowUser,
} from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'sonner'

export function useFollow(userId: string) {
  const { status } = useAuthStore()
  const queryClient = useQueryClient()
  const isAuthenticated = status === 'authenticated'

  // Check if current user is following this user
  const { data: followStatus, isLoading: isLoadingFollowStatus } = useQuery({
    queryKey: ['is-following', userId],
    queryFn: () => checkIsFollowing(userId),
    enabled: isAuthenticated && !!userId,
  })

  // Get follow counts
  const { data: followCounts, isLoading: isLoadingCounts } = useQuery({
    queryKey: ['follow-counts', userId],
    queryFn: () => getFollowCounts(userId),
    enabled: !!userId,
  })

  const follow = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      await followUser(userId)

      // Invalidate and refetch related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['is-following', userId] }),
        queryClient.invalidateQueries({ queryKey: ['follow-counts', userId] }),
      ])

      toast.success('Successfully followed user!')
    } catch (error) {
      console.error('Failed to follow user:', error)
      // Do not show toast.error here; api.ts interceptor already handles error toasts
      throw error
    }
  }, [userId, isAuthenticated, queryClient])

  const unfollow = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      await unfollowUser(userId)

      // Invalidate and refetch related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['is-following', userId] }),
        queryClient.invalidateQueries({ queryKey: ['follow-counts', userId] }),
      ])

      toast.success('Successfully unfollowed user!')
    } catch (error) {
      console.error('Failed to unfollow user:', error)
      // Do not show toast.error here; api.ts interceptor already handles error toasts
      throw error
    }
  }, [userId, isAuthenticated, queryClient])

  const toggleFollow = useCallback(async () => {
    if (followStatus?.isFollowing) {
      await unfollow()
    } else {
      await follow()
    }
  }, [followStatus?.isFollowing, follow, unfollow])

  return {
    isFollowing: followStatus?.isFollowing ?? false,
    followersCount: followCounts?.followersCount ?? 0,
    followingCount: followCounts?.followingCount ?? 0,
    isLoading: isLoadingFollowStatus || isLoadingCounts,
    follow,
    unfollow,
    toggleFollow,
    isAuthenticated,
  }
}
