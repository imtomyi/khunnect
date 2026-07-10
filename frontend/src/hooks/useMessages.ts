import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Message } from '../types/index'

function mapMsg(r: any): Message {
  return {
    id: r.id,
    coffeeChatId: r.coffee_chat_id,
    senderId: r.sender_id,
    content: r.content,
    createdAt: r.created_at,
  }
}

/** 커피챗 메시지 목록 + 실시간 구독 */
export function useMessages(coffeeChatId: number | null) {
  const queryClient = useQueryClient()
  const key = ['messages', coffeeChatId]

  const query = useQuery({
    queryKey: key,
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('coffee_chat_id', coffeeChatId!)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []).map(mapMsg)
    },
    enabled: coffeeChatId != null,
  })

  useEffect(() => {
    if (coffeeChatId == null) return
    const channel = supabase
      .channel(`messages:${coffeeChatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `coffee_chat_id=eq.${coffeeChatId}` },
        (payload) => {
          const m = mapMsg(payload.new)
          queryClient.setQueryData<Message[]>(key, (prev = []) =>
            prev.some((x) => x.id === m.id) ? prev : [...prev, m],
          )
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coffeeChatId])

  return query
}

/** 메시지 전송 — 삽입된 행은 실시간 구독으로 목록에 반영됨 */
export function useSendMessage() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({ coffeeChatId, content }: { coffeeChatId: number; content: string }) => {
      if (!user) throw new Error('로그인이 필요합니다')
      const trimmed = content.trim()
      if (!trimmed) return
      const { error } = await supabase.from('messages').insert({
        coffee_chat_id: coffeeChatId,
        sender_id: user.id,
        content: trimmed,
      })
      if (error) throw error
    },
  })
}
