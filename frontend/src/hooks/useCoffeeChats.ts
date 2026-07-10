import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { CoffeeChat, CoffeeChatStatus } from '../types/index'

function mapRow(r: any, counterpartName?: string): CoffeeChat {
  return {
    id: r.id,
    studentId: r.student_id,
    seniorId: r.senior_id,
    message: r.message ?? null,
    status: r.status,
    createdAt: r.created_at,
    counterpartName,
  }
}

/** 여러 신청 행의 상대방(counterpart) 이름을 한 번에 조회 */
async function fetchNames(rows: any[], key: 'student_id' | 'senior_id'): Promise<Record<string, string>> {
  const ids = [...new Set(rows.map((r) => r[key] as string))]
  if (ids.length === 0) return {}
  const { data } = await supabase.from('profiles').select('id, name').in('id', ids)
  return Object.fromEntries((data ?? []).map((p: any) => [p.id as string, p.name as string]))
}

/** 특정 선배에 대한 내 최근 신청 (상세 페이지 버튼 상태용) */
export function useCoffeeChatWith(seniorId: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['coffee_chat_with', user?.id, seniorId],
    queryFn: async (): Promise<CoffeeChat | null> => {
      const { data, error } = await supabase
        .from('coffee_chats')
        .select('*')
        .eq('student_id', user!.id)
        .eq('senior_id', seniorId)
        .order('created_at', { ascending: false })
        .limit(1)
      if (error) throw error
      const r = (data ?? [])[0]
      return r ? mapRow(r) : null
    },
    enabled: !!user,
  })
}

/** 내가 보낸/받은 커피챗 신청 (마이페이지) */
export function useMyCoffeeChats() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['coffee_chats', user?.id],
    queryFn: async (): Promise<{ sent: CoffeeChat[]; received: CoffeeChat[] }> => {
      const { data, error } = await supabase
        .from('coffee_chats')
        .select('*')
        .or(`student_id.eq.${user!.id},senior_id.eq.${user!.id}`)
        .order('created_at', { ascending: false })
      if (error) throw error
      const rows = data ?? []
      const sent = rows.filter((r: any) => r.student_id === user!.id)
      const received = rows.filter((r: any) => r.senior_id === user!.id)
      const seniorNames = await fetchNames(sent, 'senior_id')
      const studentNames = await fetchNames(received, 'student_id')
      return {
        sent: sent.map((r: any) => mapRow(r, seniorNames[r.senior_id])),
        received: received.map((r: any) => mapRow(r, studentNames[r.student_id])),
      }
    },
    enabled: !!user,
  })
}

/** 커피챗 신청 (학생 → 선배) */
export function useRequestCoffeeChat() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ seniorId, message }: { seniorId: string; message: string }) => {
      if (!user) throw new Error('로그인이 필요합니다')
      const { error } = await supabase.from('coffee_chats').insert({
        student_id: user.id,
        senior_id: seniorId,
        message: message.trim() || null,
      })
      if (error) throw error
    },
    onSuccess: (_d, v) => {
      queryClient.invalidateQueries({ queryKey: ['coffee_chat_with', user?.id, v.seniorId] })
      queryClient.invalidateQueries({ queryKey: ['coffee_chats', user?.id] })
    },
  })
}

/** 커피챗 상태 변경 (선배: 수락/거절, 학생: 취소) */
export function useRespondCoffeeChat() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: CoffeeChatStatus }) => {
      const { error } = await supabase
        .from('coffee_chats')
        .update({ status, responded_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coffee_chats', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['coffee_chat_with'] })
    },
  })
}
