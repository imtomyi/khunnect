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
        .select('admission_year')
        .eq('user_id', user!.id)
        .eq('type', 'major')
        .single()
      return data
    },
    enabled: !!user,
  })

  if (loading || !user) return null

  const admissionYear = (userMajor as any)?.admission_year
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const semester = currentMonth >= 3 && currentMonth <= 8 ? '1학기' : '2학기'
  const grade = admissionYear
    ? `${currentYear - admissionYear + 1}학년 ${semester}`
    : semester

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
                현재 전공 과정을 0% 달성하셨네요!
              </p>
            </section>

            {/* ── 메인 카드 3개 ── */}
            <section className="flex flex-wrap" style={{ gap: '33.02px' }}>
              <AcademicStatusCard status={null} overallPct={0} isZeroState={true} />
              <PriorityCoursesCard isZeroState={true} checkedCourses={[]} />
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
