import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import DashboardNav from '../components/dashboard/DashboardNav'
import AcademicStatusCard from '../components/dashboard/AcademicStatusCard'
import PriorityCoursesCard from '../components/dashboard/PriorityCoursesCard'
import RecommendedSeniorCard from '../components/dashboard/RecommendedSeniorCard'
import RecentActivities from '../components/dashboard/RecentActivities'
import HomeFooter from '../components/dashboard/HomeFooter'

type ProgressData = {
  basic:    { completed: number; total: number }
  required: { completed: number; total: number }
  elective: { completed: number; total: number }
  overallPct: number
  recentCourses: { id: string; name: string; code: string; credits: number; type: '전공필수' | '전공기초' | '전공선택' }[]
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate({ to: '/login' })
  }, [user, loading, navigate])

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', user!.id)
        .single()
      return data
    },
    enabled: !!user,
  })

  const { data: userMajor } = useQuery({
    queryKey: ['user_major', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_majors')
        .select('admission_year, department_id')
        .eq('user_id', user!.id)
        .eq('type', 'major')
        .single()
      return data as any
    },
    enabled: !!user,
  })

  const { data: progress } = useQuery<ProgressData>({
    queryKey: ['progress', user?.id, userMajor?.department_id],
    queryFn: async () => {
      const deptId = userMajor?.department_id

      // 졸업 요건 + 체크된 과목 병렬 조회
      const [reqRes, checkedRes] = await Promise.all([
        deptId
          ? supabase
              .from('curriculum_requirements')
              .select('basic_credits, required_credits, elective_credits')
              .eq('department_id', deptId)
              .single()
          : Promise.resolve({ data: null }),
        supabase
          .from('checked_courses')
          .select('course_catalog(id, name, code, credits, type)')
          .eq('user_id', user!.id),
      ])

      const req = reqRes.data as any
      const basic    = { completed: 0, total: req?.basic_credits    ?? 0 }
      const required = { completed: 0, total: req?.required_credits  ?? 0 }
      const elective = { completed: 0, total: req?.elective_credits  ?? 0 }
      const recentCourses: ProgressData['recentCourses'] = []

      for (const row of (checkedRes.data || [])) {
        const c = (row as any).course_catalog
        if (!c) continue
        recentCourses.push({ id: c.id, name: c.name, code: c.code ?? c.id, credits: c.credits, type: c.type })
        if (c.type === '전공기초')  basic.completed    += c.credits
        if (c.type === '전공필수')  required.completed  += c.credits
        if (c.type === '전공선택')  elective.completed  += c.credits
      }

      const totalReq  = basic.total + required.total + elective.total
      const totalDone = basic.completed + required.completed + elective.completed
      const overallPct = totalReq > 0 ? Math.round((totalDone / totalReq) * 100) : 0

      return { basic, required, elective, overallPct, recentCourses }
    },
    enabled: !!user && userMajor !== undefined,
  })

  if (loading || !user) return null

  const admissionYear = userMajor?.admission_year
  const currentYear  = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const semester = currentMonth >= 3 && currentMonth <= 8 ? '1학기' : '2학기'
  const grade = admissionYear
    ? `${currentYear - admissionYear + 1}학년 ${semester}`
    : semester

  const overallPct    = progress?.overallPct ?? 0
  const hasData       = overallPct > 0
  const status        = progress && hasData
    ? { basic: progress.basic, required: progress.required, elective: progress.elective }
    : null

  return (
    <div style={{ fontFamily: 'var(--font-roboto)', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <DashboardNav />

      <main className="flex-1">
        <div
          className="max-w-[1280px] mx-auto w-full px-6"
          style={{ paddingTop: '49.54px', paddingBottom: '49.54px' }}
        >
          <div className="flex flex-col gap-[49.54px]">

            {/* ── 인사말 ── */}
            <section>
              <div className="flex items-center gap-3 mb-2">
                <h1 style={{
                  fontSize: '49.54px',
                  fontWeight: 600,
                  letterSpacing: '-2.48px',
                  lineHeight: '100%',
                  color: '#1F1A1A',
                  fontFamily: 'var(--font-roboto)',
                  margin: 0,
                }}>
                  반가워요, {profile?.name ?? '...'}님.
                </h1>
                <span
                  className="shrink-0"
                  style={{
                    backgroundColor: '#FFF8F7',
                    color: '#5C3F3F',
                    borderRadius: '9999px',
                    fontSize: '14px',
                    padding: '4px 12px',
                    fontFamily: 'var(--font-roboto)',
                  }}
                >
                  {grade}
                </span>
              </div>
              <p style={{
                fontSize: '18.58px',
                lineHeight: '28.9px',
                color: '#5C3F3F',
                fontFamily: 'var(--font-roboto)',
                margin: 0,
              }}>
                현재 전공 과정을 {overallPct}% 달성하셨네요!
              </p>
            </section>

            {/* ── 메인 카드 3개 ── */}
            <section className="flex flex-wrap" style={{ gap: '33.02px' }}>
              <AcademicStatusCard
                status={status}
                overallPct={overallPct}
                isZeroState={!hasData}
              />
              <PriorityCoursesCard
                isZeroState={!hasData}
                checkedCourses={progress?.recentCourses ?? []}
              />
              <RecommendedSeniorCard isZeroState={true} />
            </section>

            {/* ── 최근 활동 ── */}
            <RecentActivities />

            {/* ── 홈 푸터 ── */}
            <HomeFooter />

          </div>
        </div>
      </main>
    </div>
  )
}
