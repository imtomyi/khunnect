import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { CSSProperties } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import DashboardNav from '../components/dashboard/DashboardNav'
import HomeFooter from '../components/dashboard/HomeFooter'
import SeniorsHero from '../components/seniors/SeniorsHero'
import SeniorCard, { type Senior } from '../components/seniors/SeniorCard'

type ExplorePageProps = {
  dept?: string
}

const headingStyle: CSSProperties = {
  fontSize: '28px',
  fontWeight: 700,
  color: '#1F1A1A',
  marginBottom: '20px',
}

const emptyTextStyle: CSSProperties = {
  color: '#9CA3AF',
  fontSize: '15px',
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '24px',
}

export default function ExplorePage({ dept }: ExplorePageProps) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [seniors, setSeniors] = useState<Senior[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) navigate({ to: '/login' })
  }, [user, loading, navigate])

  useEffect(() => {
    if (!user) return
    setIsLoading(true)

    const fetchSeniors = async () => {
      try {
        // profiles 테이블에서 alumni 조회 + user_majors join으로 학과/졸업연도 가져오기
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            name,
            user_majors(graduation_year, departments(name))
          `)
          .eq('role', 'alumni')

        if (error) throw error

        const mapped: Senior[] = (data || []).map((row: any) => {
          const majorInfo = Array.isArray(row.user_majors) ? row.user_majors[0] : row.user_majors
          const deptName = majorInfo?.departments?.name as string | undefined
          const gradYear = majorInfo?.graduation_year as number | undefined

          return {
            id: row.id as string,
            name: row.name as string,
            department: deptName,
            graduationYear: gradYear,
            skills: [],
            isAvailable: true,
            profileImage: null,
          }
        })

        // dept 필터: 쿼리 파라미터로 학과 이름이 전달된 경우 필터링
        const filtered = dept
          ? mapped.filter(s => s.department === dept)
          : mapped

        setSeniors(filtered)
      } catch (err) {
        console.error('선배 목록 조회 에러:', err)
        setSeniors([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSeniors()
  }, [user, dept])

  if (loading || !user) return null

  return (
    <div style={{ fontFamily: 'var(--font-roboto)', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <DashboardNav />

      <main className="flex-1">
        <div
          className="max-w-[1280px] mx-auto w-full px-6"
          style={{ paddingTop: '49.54px', paddingBottom: '49.54px' }}
        >
          {/* 히어로 배너 — 전폭, Navbar 아래 밀착 */}
          <SeniorsHero />

          {/* 본문 */}
          <h2 style={headingStyle}>
            {dept ?? '전체 선배'}
          </h2>

          {isLoading ? (
            <p style={emptyTextStyle}>불러오는 중...</p>
          ) : seniors.length === 0 ? (
            <p style={emptyTextStyle}>조건에 맞는 선배가 없습니다.</p>
          ) : (
            <div style={gridStyle}>
              {seniors.map((senior) => (
                <SeniorCard key={senior.id} senior={senior} />
              ))}
            </div>
          )}

          <HomeFooter />
        </div>
      </main>
    </div>
  )
}
