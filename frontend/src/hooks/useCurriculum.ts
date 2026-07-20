import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type {
  CatalogCourse,
  CourseType,
  VersionRequirement,
  ExtraRequirement,
} from '../types/index'

export type CurriculumData = {
  versionId: number
  totalCredits: number | null
  note: string | null
  courses: CatalogCourse[]
  requirement: VersionRequirement | null
  extras: ExtraRequirement[]
}

/**
 * 로그인 유저의 (학과 × 입학년도)에 맞는 교육과정 버전을 찾아
 * 과목·졸업요건·부가조건을 한 번에 가져온다.
 *
 * 버전이 없으면(아직 시드 안 된 학과) null → 화면은 "교육과정 준비 중"을 띄운다.
 */
export function useCurriculum() {
  const { user } = useAuth()

  return useQuery<CurriculumData | null>({
    queryKey: ['curriculum', user?.id],
    enabled: !!user,
    queryFn: async () => {
      // 1) 내 주전공 학과 + 입학년도
      const { data: major } = await supabase
        .from('user_majors')
        .select('department_id, admission_year')
        .eq('user_id', user!.id)
        .eq('type', 'major')
        .single()
      if (!major?.department_id) return null

      // 2) 입학년도로 버전 매칭 (year_start <= admission <= year_end, year_end NULL=현행)
      //    입학년도가 없으면 가장 최근(year_start 최대) 버전으로 대체
      const admission = major.admission_year as number | null
      let vq = supabase
        .from('curriculum_versions')
        .select('id, total_credits, note, year_start, year_end')
        .eq('department_id', major.department_id)
        .order('year_start', { ascending: false })
      const { data: versions } = await vq
      if (!versions || versions.length === 0) return null

      const version =
        (admission != null &&
          versions.find(
            (v: any) =>
              v.year_start <= admission && (v.year_end == null || v.year_end >= admission),
          )) ||
        versions[0] // 매칭 실패 시 최신 버전

      // 3) 과목 · 요건(single) · 부가조건을 병렬 조회
      const [coursesRes, reqRes, extraRes] = await Promise.all([
        supabase
          .from('course_catalog')
          .select('id, name, type, credits, code, year, semester')
          .eq('version_id', version.id)
          .order('year', { ascending: true }),
        supabase
          .from('curriculum_version_requirements')
          .select('basic_credits, required_credits, industry_credits, elective_credits')
          .eq('version_id', version.id)
          .eq('track', 'single')
          .maybeSingle(),
        supabase
          .from('curriculum_extra_requirements')
          .select('id, kind, label, count_required, applies_from')
          .eq('version_id', version.id),
      ])

      const courses: CatalogCourse[] = (coursesRes.data ?? []).map((c: any) => ({
        id: String(c.id),
        name: c.name as string,
        type: c.type as CourseType,
        credits: Number(c.credits),
        code: (c.code ?? c.id) as string,
      }))

      const requirement: VersionRequirement | null = reqRes.data
        ? {
            basicCredits: reqRes.data.basic_credits,
            requiredCredits: reqRes.data.required_credits,
            industryCredits: reqRes.data.industry_credits,
            electiveCredits: reqRes.data.elective_credits,
          }
        : null

      // 부가조건은 입학년도 조건(applies_from)에 맞는 것만 노출
      const extras: ExtraRequirement[] = (extraRes.data ?? [])
        .filter((e: any) => e.applies_from == null || admission == null || admission >= e.applies_from)
        .map((e: any) => ({
          id: e.id,
          kind: e.kind,
          label: e.label as string,
          countRequired: e.count_required,
          appliesFrom: e.applies_from,
        }))

      return {
        versionId: version.id,
        totalCredits: version.total_credits ?? null,
        note: version.note ?? null,
        courses,
        requirement,
        extras,
      }
    },
  })
}
