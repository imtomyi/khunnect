import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { CSSProperties } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useBookmarks } from '../hooks/useBookmarks'
import DashboardNav from '../components/dashboard/DashboardNav'
import HomeFooter from '../components/dashboard/HomeFooter'
import ProfileSection from '../components/mypage/ProfileSection'
import SeniorProfileSection from '../components/mypage/SeniorProfileSection'
import CoffeeChatSection from '../components/mypage/CoffeeChatSection'
import ScrapbookSection from '../components/mypage/ScrapbookSection'

// ── 프로필 수정 모달 ──────────────────────────────────────────────────

const overlayStyle: CSSProperties = {
  position: 'fixed', inset: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 100,
}

const modalStyle: CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '20px',
  padding: '36px 32px',
  width: '420px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
}

const modalTitleStyle: CSSProperties = {
  fontSize: '20px', fontWeight: 700, color: '#1F1A1A', margin: 0,
}

const labelStyle: CSSProperties = {
  fontSize: '13px', fontWeight: 500, color: '#5C3F3F', marginBottom: '6px',
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1.5px solid #E6BDBB',
  fontSize: '15px',
  fontFamily: 'var(--font-roboto)',
  outline: 'none',
  boxSizing: 'border-box',
}

const saveBtnStyle: CSSProperties = {
  padding: '12px 0',
  backgroundColor: '#9A001F',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  width: '100%',
}

const cancelBtnStyle: CSSProperties = {
  padding: '12px 0',
  backgroundColor: 'transparent',
  color: '#78716C',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: 500,
  cursor: 'pointer',
  width: '100%',
}

function EditProfileModal({
  currentName,
  onClose,
  onSave,
}: {
  currentName: string
  onClose: () => void
  onSave: (name: string) => Promise<void>
}) {
  const [name, setName] = useState(currentName)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onSave(name.trim())
    setSaving(false)
    onClose()
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <p style={modalTitleStyle}>프로필 수정</p>

        <div>
          <p style={labelStyle}>이름</p>
          <input
            style={inputStyle}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={cancelBtnStyle} onClick={onClose}>취소</button>
          <button style={saveBtnStyle} onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 페이지 ──────────────────────────────────────────────────────────

const pageStyle: CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '24px',
  fontFamily: 'var(--font-roboto), sans-serif',
}

const titleStyle: CSSProperties = {
  fontSize: '32px', fontWeight: 700, color: '#1F1A1A', margin: 0,
}

const topRowStyle: CSSProperties = {
  display: 'flex', gap: '24px', alignItems: 'stretch',
}

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
  const queryClient = useQueryClient()
  const [showEditModal, setShowEditModal] = useState(false)

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

  const { data: bookmarkIds = [] } = useBookmarks()
  const { data: scrapedSeniors = [] } = useQuery({
    queryKey: ['scrapbook_seniors', bookmarkIds],
    queryFn: async () => {
      if (bookmarkIds.length === 0) return []
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, user_majors(graduation_year, departments(name))')
        .in('id', bookmarkIds)
      if (error) throw error
      return (data ?? []).map((row: any) => {
        const major = Array.isArray(row.user_majors) ? row.user_majors[0] : row.user_majors
        return {
          id: row.id as string,
          name: row.name as string,
          department: major?.departments?.name as string | undefined,
          graduationYear: major?.graduation_year as number | undefined,
        }
      })
    },
    enabled: !!user,
  })

  if (loading || !user) return null

  const name     = (profile as any)?.name ?? '...'
  const deptName = (majorInfo as any)?.departments?.name ?? '학과 정보 없음'
  const admissionYear = (majorInfo as any)?.admission_year as number | undefined
  const currentYear   = new Date().getFullYear()
  const currentMonth  = new Date().getMonth() + 1
  const semester = currentMonth >= 3 && currentMonth <= 8 ? '1학기' : '2학기'
  const grade = admissionYear
    ? `${currentYear - admissionYear + 1}학년 ${semester}`
    : semester

  const handleSaveName = async (newName: string) => {
    await supabase
      .from('profiles')
      .update({ name: newName })
      .eq('id', user.id)
    // 캐시 갱신 — 홈/마이페이지 모두 반영
    queryClient.invalidateQueries({ queryKey: ['profile', user.id] })
  }

  return (
    <>
      {showEditModal && (
        <EditProfileModal
          currentName={name}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveName}
        />
      )}

      <div style={{ fontFamily: 'var(--font-roboto)', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
        <DashboardNav />

        <main className="flex-1">
          <div
            className="max-w-[1280px] mx-auto w-full px-6"
            style={{ paddingTop: '49.54px', paddingBottom: '49.54px' }}
          >
            <div style={pageStyle}>
              <h1 style={titleStyle}>마이페이지</h1>

              <div style={topRowStyle}>
                <ProfileSection
                  name={name}
                  deptName={deptName}
                  grade={grade}
                  interestedFieldNames={[]}
                  onEditClick={() => setShowEditModal(true)}
                />
                <div style={calendarPlaceholderStyle}>
                  <p style={{ fontSize: '14px', color: '#A8A29E' }}>
                    캘린더 기능은 준비 중입니다.
                  </p>
                </div>
              </div>

              <SeniorProfileSection role={(profile as any)?.role} />

              <CoffeeChatSection />

              <ScrapbookSection scrapedSeniors={scrapedSeniors} />

              <HomeFooter />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
