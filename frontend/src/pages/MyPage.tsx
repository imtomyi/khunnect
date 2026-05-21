import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { CSSProperties } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import DashboardNav from '../components/dashboard/DashboardNav'
import HomeFooter from '../components/dashboard/HomeFooter'
import ProfileSection from '../components/mypage/ProfileSection'
import ScrapbookSection from '../components/mypage/ScrapbookSection'

const pageStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  fontFamily: 'var(--font-roboto), sans-serif',
}

const titleStyle: CSSProperties = {
  fontSize: '32px',
  fontWeight: 700,
  color: '#1F1A1A',
  margin: 0,
}

const topRowStyle: CSSProperties = {
  display: 'flex',
  gap: '24px',
  alignItems: 'stretch',
}

// 달력 자리 대신 보여줄 플레이스홀더 카드
const calendarPlaceholderStyle: CSSProperties = {
  flex: 1,
  backgroundColor: '#FFFFFF',
  borderRadius: '20px',
  padding: '28px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '200px',
}

export default function MyPage() {
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

  const { data: majorInfo } = useQuery({
    queryKey: ['user_major_full', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_majors')
        .select('admission_year, graduation_year, departments(name)')
        .eq('user_id', user!.id)
        .eq('type', 'major')
        .single()
      return data as any
    },
    enabled: !!user,
  })

  if (loading || !user) return null

  const name = (profile as any)?.name ?? '...'
  const deptName = (majorInfo as any)?.departments?.name ?? '학과 정보 없음'
  const admissionYear = (majorInfo as any)?.admission_year as number | undefined
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
          <div style={pageStyle}>
            <h1 style={titleStyle}>마이페이지</h1>

            {/* 상단 행: 프로필 카드(좌) + 달력 플레이스홀더(우) */}
            <div style={topRowStyle}>
              <ProfileSection
                name={name}
                deptName={deptName}
                grade={grade}
                interestedFieldNames={[]}
              />
              <div style={calendarPlaceholderStyle}>
                <p style={{ fontSize: '14px', color: '#A8A29E' }}>
                  캘린더 기능은 준비 중입니다.
                </p>
              </div>
            </div>

            {/* 스크랩북 섹션 */}
            <ScrapbookSection scrapedSeniors={[]} />

            <HomeFooter />
          </div>
        </div>
      </main>
    </div>
  )
}
