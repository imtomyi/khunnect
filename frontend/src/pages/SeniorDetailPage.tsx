import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { CSSProperties } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import DashboardNav from '../components/dashboard/DashboardNav'
import HomeFooter from '../components/dashboard/HomeFooter'
import { AvatarIcon, getAvatarVariantForId } from '../lib/avatarVariants'
import { Route } from '../routes/seniors.$seniorId'

type SeniorProfile = {
  id: string
  name: string
  department?: string
  graduationYear?: number
}

const loadingStyle: CSSProperties = {
  padding: '60px',
  color: '#9CA3AF',
  fontSize: '15px',
  textAlign: 'center',
}

const pageLayoutStyle: CSSProperties = {
  fontFamily: 'var(--font-roboto), sans-serif',
  paddingTop: '49.54px',
  paddingBottom: '49.54px',
}

const cardStyle: CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '20px',
  padding: '40px 36px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  maxWidth: '480px',
  boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
}

const avatarWrapStyle = (bg: string): CSSProperties => ({
  width: '96px',
  height: '96px',
  borderRadius: '20px',
  backgroundColor: bg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const nameStyle: CSSProperties = {
  fontSize: '36px',
  fontWeight: 400,
  color: '#1F1A1A',
  margin: 0,
}

const deptStyle: CSSProperties = {
  fontSize: '16px',
  color: '#9A001F',
  margin: 0,
}

const connectBtnStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '16px 0',
  backgroundColor: '#9A001F',
  color: '#FFFFFF',
  borderRadius: '16px',
  fontSize: '15px',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  width: '100%',
  boxShadow: '0 4px 14px 0 rgba(154,0,31,0.35)',
}

const comingSoonStyle: CSSProperties = {
  backgroundColor: '#FFF8F7',
  borderRadius: '16px',
  padding: '40px',
  textAlign: 'center',
  marginTop: '32px',
}

export default function SeniorDetailPage() {
  const { seniorId } = Route.useParams()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [senior, setSenior] = useState<SeniorProfile | null>(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) navigate({ to: '/login' })
  }, [user, loading, navigate])

  useEffect(() => {
    if (!user || !seniorId) return
    setFetching(true)
    supabase
      .from('profiles')
      .select(`
        id, name,
        user_majors(graduation_year, departments(name))
      `)
      .eq('id', seniorId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setFetching(false); return }
        const row = data as any
        const majorInfo = Array.isArray(row.user_majors) ? row.user_majors[0] : row.user_majors
        setSenior({
          id: row.id,
          name: row.name,
          department: majorInfo?.departments?.name,
          graduationYear: majorInfo?.graduation_year,
        })
        setFetching(false)
      })
  }, [user, seniorId])

  if (loading || !user) return null

  const avatarVariant = senior ? getAvatarVariantForId(senior.id) : null

  return (
    <div style={{ fontFamily: 'var(--font-roboto)', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <DashboardNav />

      <main>
        <div
          className="max-w-[1280px] mx-auto w-full px-6"
          style={pageLayoutStyle}
        >
          {fetching ? (
            <div style={loadingStyle}>불러오는 중...</div>
          ) : !senior ? (
            <div style={loadingStyle}>선배 정보를 찾을 수 없습니다.</div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                {/* 프로필 카드 */}
                <div style={cardStyle}>
                  <div style={avatarWrapStyle(avatarVariant!.bg)}>
                    <AvatarIcon
                      fill={avatarVariant!.fill}
                      bodyPath={avatarVariant!.bodyPath}
                      size={80}
                    />
                  </div>
                  <div>
                    <p style={nameStyle}>{senior.name}</p>
                    <p style={deptStyle}>
                      {[senior.department, senior.graduationYear ? `${senior.graduationYear}년 졸업` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <button style={connectBtnStyle}>
                    선배와 연결하기
                  </button>
                </div>

                {/* 상세 정보 — 추후 구현 */}
                <div style={{ flex: 1 }}>
                  <div style={comingSoonStyle}>
                    <p style={{ fontSize: '20px', fontWeight: 600, color: '#1F1A1A', marginBottom: '8px' }}>
                      학업 여정 & 멘토링 일정
                    </p>
                    <p style={{ fontSize: '14px', color: '#78716C', margin: 0 }}>
                      Phase 4에서 상세 프로필 기능이 추가될 예정입니다.
                    </p>
                  </div>
                </div>
              </div>

              <HomeFooter />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
