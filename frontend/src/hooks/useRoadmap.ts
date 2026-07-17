import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { mapMajors } from '../lib/majors'
import { useAuth } from './useAuth'
import type {
  Roadmap,
  RoadmapItem,
  RoadmapItemType,
  RoadmapItemStatus,
  PublicRoadmap,
} from '../types/index'

function mapItem(r: any): RoadmapItem {
  return {
    id: r.id,
    roadmapId: r.roadmap_id,
    year: r.year,
    semester: r.semester,
    type: r.type,
    title: r.title,
    description: r.description ?? null,
    status: r.status,
  }
}

/** 로드맵 + 항목을 한 번에 조회. 없으면 null. */
async function fetchRoadmapBy(column: 'user_id' | 'id', value: string | number): Promise<Roadmap | null> {
  const { data, error } = await supabase
    .from('roadmaps')
    .select('*, roadmap_items(*)')
    .eq(column, value)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const items = ((data as any).roadmap_items ?? []).map(mapItem)
  items.sort(
    (a: RoadmapItem, b: RoadmapItem) => a.year - b.year || a.semester - b.semester || a.id - b.id,
  )
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    summary: data.summary ?? null,
    isPublic: data.is_public,
    items,
  }
}

/** 내 로드맵 (편집용). 아직 만들지 않았으면 null. */
export function useMyRoadmap() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['roadmap', user?.id],
    queryFn: () => fetchRoadmapBy('user_id', user!.id),
    enabled: !!user,
  })
}

/**
 * 공개 로드맵 목록 (탐색 화면).
 * is_public 필터를 걸지만, 걸지 않아도 RLS가 비공개를 내려주지 않는다 —
 * 즉 클라이언트 필터에 의존하지 않는다(0005 정책, test:db에서 검증).
 */
export function usePublicRoadmaps() {
  return useQuery({
    queryKey: ['public_roadmaps'],
    queryFn: async (): Promise<PublicRoadmap[]> => {
      const { data, error } = await supabase
        .from('roadmaps')
        .select(`
          id, user_id, title, summary, is_public,
          roadmap_items(*),
          profiles!inner(
            name, role, job_title, company,
            user_majors(type, graduation_year, departments(name))
          )
        `)
        .eq('is_public', true)
        .order('updated_at', { ascending: false })
      if (error) throw error

      return (data ?? []).map((r: any): PublicRoadmap => {
        const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
        const { departments, graduationYear } = mapMajors(p?.user_majors)
        const items = (r.roadmap_items ?? []).map(mapItem)
        items.sort(
          (a: RoadmapItem, b: RoadmapItem) =>
            a.year - b.year || a.semester - b.semester || a.id - b.id,
        )
        return {
          id: r.id,
          userId: r.user_id,
          title: r.title,
          summary: r.summary ?? null,
          isPublic: r.is_public,
          items,
          ownerName: p?.name ?? '이름 없음',
          ownerRole: p?.role ?? 'student',
          ownerDepartments: departments,
          ownerGraduationYear: graduationYear,
          ownerJobTitle: p?.job_title ?? null,
          ownerCompany: p?.company ?? null,
        }
      })
    },
  })
}

/** 특정 선배의 로드맵 (열람용). 비공개면 RLS가 걸러 null이 된다. */
export function useUserRoadmap(userId: string | undefined) {
  return useQuery({
    queryKey: ['roadmap', userId],
    queryFn: () => fetchRoadmapBy('user_id', userId!),
    enabled: !!userId,
  })
}

/** 로드맵이 없을 때 최초 생성 */
export function useCreateRoadmap() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('로그인이 필요합니다')
      const { error } = await supabase.from('roadmaps').insert({ user_id: user.id })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roadmap', user?.id] }),
  })
}

/** 로드맵 제목·소개·공개여부 수정 */
export function useUpdateRoadmap() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (patch: { id: number; title?: string; summary?: string | null; isPublic?: boolean }) => {
      const body: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (patch.title !== undefined) body.title = patch.title
      if (patch.summary !== undefined) body.summary = patch.summary
      if (patch.isPublic !== undefined) body.is_public = patch.isPublic
      const { error } = await supabase.from('roadmaps').update(body).eq('id', patch.id)
      if (error) throw error
    },
    // 공개 토글은 즉시 반영되어야 체감이 좋다 — 낙관적 업데이트
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: ['roadmap', user?.id] })
      const prev = queryClient.getQueryData<Roadmap | null>(['roadmap', user?.id])
      queryClient.setQueryData<Roadmap | null>(['roadmap', user?.id], (r) =>
        r
          ? {
              ...r,
              title: patch.title ?? r.title,
              summary: patch.summary !== undefined ? patch.summary : r.summary,
              isPublic: patch.isPublic ?? r.isPublic,
            }
          : r,
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev !== undefined) queryClient.setQueryData(['roadmap', user?.id], ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['roadmap', user?.id] }),
  })
}

export type RoadmapItemInput = {
  year: number
  semester: 1 | 2
  type: RoadmapItemType
  title: string
  description?: string | null
  status: RoadmapItemStatus
}

/** 항목 추가 */
export function useAddRoadmapItem() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ roadmapId, item }: { roadmapId: number; item: RoadmapItemInput }) => {
      const { error } = await supabase.from('roadmap_items').insert({
        roadmap_id: roadmapId,
        year: item.year,
        semester: item.semester,
        type: item.type,
        title: item.title.trim(),
        description: item.description?.trim() || null,
        status: item.status,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roadmap', user?.id] }),
  })
}

/** 항목 수정 (상태 토글·내용 편집) */
export function useUpdateRoadmapItem() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: number; patch: Partial<RoadmapItemInput> }) => {
      const body: Record<string, unknown> = {}
      if (patch.year !== undefined) body.year = patch.year
      if (patch.semester !== undefined) body.semester = patch.semester
      if (patch.type !== undefined) body.type = patch.type
      if (patch.title !== undefined) body.title = patch.title.trim()
      if (patch.description !== undefined) body.description = patch.description?.trim() || null
      if (patch.status !== undefined) body.status = patch.status
      const { error } = await supabase.from('roadmap_items').update(body).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roadmap', user?.id] }),
  })
}

/** 항목 삭제 */
export function useDeleteRoadmapItem() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('roadmap_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roadmap', user?.id] }),
  })
}
