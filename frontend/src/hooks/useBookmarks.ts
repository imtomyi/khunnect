import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

/** 현재 사용자가 북마크한 선배 ID 목록 */
export function useBookmarks() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['bookmarks', user?.id],
    queryFn: async (): Promise<string[]> => {
      if (!user) return []
      const { data, error } = await supabase
        .from('bookmarks')
        .select('senior_id')
        .eq('user_id', user.id)
      if (error) throw error
      return (data ?? []).map((r: { senior_id: string }) => r.senior_id)
    },
    enabled: !!user,
  })
}

/** 북마크 토글 — 낙관적 업데이트 후 백그라운드 동기화 */
export function useToggleBookmark() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['bookmarks', user?.id]

  return useMutation({
    mutationFn: async ({ seniorId, isBookmarked }: { seniorId: string; isBookmarked: boolean }) => {
      if (!user) throw new Error('로그인이 필요합니다')
      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('senior_id', seniorId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({ user_id: user.id, senior_id: seniorId })
        if (error) throw error
      }
    },
    onMutate: async ({ seniorId, isBookmarked }) => {
      await queryClient.cancelQueries({ queryKey })
      const prev = queryClient.getQueryData<string[]>(queryKey)
      queryClient.setQueryData<string[]>(queryKey, (old = []) =>
        isBookmarked ? old.filter((id) => id !== seniorId) : [...old, seniorId],
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKey, ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}
