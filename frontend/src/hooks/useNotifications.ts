import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { AppNotification } from '../types/index'

function mapRow(r: any, names: Record<string, string>): AppNotification {
  return {
    id: r.id,
    type: r.type,
    actorId: r.actor_id ?? null,
    actorName: r.actor_id ? names[r.actor_id] : undefined,
    coffeeChatId: r.coffee_chat_id ?? null,
    isRead: r.is_read,
    createdAt: r.created_at,
  }
}

/** 내 알림 목록 + 실시간 구독. 새 알림은 즉시 목록 맨 앞에 반영된다. */
export function useNotifications() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const key = ['notifications', user?.id]

  const query = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async (): Promise<AppNotification[]> => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, type, actor_id, coffee_chat_id, is_read, created_at')
        .order('created_at', { ascending: false })
        .limit(30)
      if (error) throw error
      const rows = data ?? []
      // 유발자 이름 한 번에 조회
      const ids = [...new Set(rows.map((r: any) => r.actor_id).filter(Boolean))]
      let names: Record<string, string> = {}
      if (ids.length) {
        const { data: profs } = await supabase.from('profiles').select('id, name').in('id', ids)
        names = Object.fromEntries((profs ?? []).map((p: any) => [p.id, p.name]))
      }
      return rows.map((r: any) => mapRow(r, names))
    },
  })

  // 실시간: 내 앞으로 오는 새 알림 구독
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => {
          // 새 알림 도착 → 목록 무효화(유발자 이름 조회 위해 refetch)
          queryClient.invalidateQueries({ queryKey: key })
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  return query
}

/** 안읽음 개수 (목록에서 파생) */
export function useUnreadCount() {
  const { data = [] } = useNotifications()
  return data.filter((n) => !n.isRead).length
}

/** 알림 읽음 처리 */
export function useMarkNotificationsRead() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: number[]) => {
      if (ids.length === 0) return
      const { error } = await supabase.from('notifications').update({ is_read: true }).in('id', ids)
      if (error) throw error
    },
    onMutate: async (ids) => {
      const key = ['notifications', user?.id]
      await queryClient.cancelQueries({ queryKey: key })
      const prev = queryClient.getQueryData<AppNotification[]>(key)
      queryClient.setQueryData<AppNotification[]>(key, (list = []) =>
        list.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n)),
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['notifications', user?.id], ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] }),
  })
}
