import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { mapMajors } from '../lib/majors'
import type { Senior } from '../types/index'

/**
 * 홈 '추천 선배' 카드용. 상담 가능한 졸업생 중 같은 학과를 우선해 추천한다.
 * 같은 학과가 부족하면 다른 학과 선배로 채운다.
 */
export function useRecommendedSeniors(limit = 5) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['recommended_seniors', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Senior[]> => {
      // 내 학과 (같은 학과 선배 우선순위용)
      const { data: major } = await supabase
        .from('user_majors')
        .select('department_id')
        .eq('user_id', user!.id)
        .eq('type', 'major')
        .maybeSingle()
      const myDept = major?.department_id as number | undefined

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, name, bio, job_title, company, is_available, skills,
          user_majors(type, graduation_year, department_id, departments(name))
        `)
        .eq('role', 'alumni')
        .eq('is_available', true)
        .neq('id', user!.id)
        .limit(20)
      if (error) throw error

      const seniors: (Senior & { _sameDept: boolean })[] = (data ?? []).map((row: any) => {
        const { departments, graduationYear } = mapMajors(row.user_majors)
        const deptIds: number[] = (Array.isArray(row.user_majors) ? row.user_majors : [row.user_majors])
          .filter(Boolean)
          .map((m: any) => m.department_id)
        return {
          id: row.id,
          name: row.name,
          departments,
          graduationYear,
          skills: (row.skills as string[] | null) ?? [],
          isAvailable: true,
          bio: row.bio ?? null,
          jobTitle: row.job_title ?? null,
          company: row.company ?? null,
          profileImage: null,
          _sameDept: myDept != null && deptIds.includes(myDept),
        }
      })

      // 같은 학과 우선 정렬
      seniors.sort((a, b) => Number(b._sameDept) - Number(a._sameDept))
      return seniors.slice(0, limit).map(({ _sameDept, ...s }) => s)
    },
  })
}
