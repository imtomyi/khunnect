import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { CSSProperties } from 'react'
import { supabase } from '../lib/supabase'
import type { Senior } from '../types/index'
import DashboardNav from '../components/dashboard/DashboardNav'
import HomeFooter from '../components/dashboard/HomeFooter'
import { AvatarIcon, getAvatarVariantForId } from '../lib/avatarVariants'
import { useCoffeeChatWith, useRequestCoffeeChat } from '../hooks/useCoffeeChats'
import { useUserRoadmap } from '../hooks/useRoadmap'
import RoadmapTimeline from '../components/roadmap/RoadmapTimeline'
import { Route } from '../routes/seniors.$seniorId'

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

const panelStyle: CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '16px',
  padding: '24px 28px',
  boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
  border: '1px solid #F3F4F6',
}

const panelLabelStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#916F6E',
  letterSpacing: '1.2px',
  textTransform: 'uppercase',
  margin: '0 0 12px',
}

const skillTagStyle: CSSProperties = {
  padding: '8px 16px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 500,
  backgroundColor: '#F6EBEB',
  color: '#5C3F3F',
}

const badgeStyle = (available: boolean): CSSProperties => ({
  alignSelf: 'flex-start',
  padding: '6px 16px',
  borderRadius: '9999px',
  fontSize: '13px',
  fontWeight: 500,
  backgroundColor: available ? '#2E67934D' : '#FCF1F1',
  color: available ? '#094F7A' : '#5C3F3F',
})

const overlayStyle: CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }
const modalStyle: CSSProperties = { backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '32px', width: '440px', display: 'flex', flexDirection: 'column', gap: '16px' }
const modalInputStyle: CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #E6BDBB', fontSize: '15px', fontFamily: 'var(--font-roboto)', outline: 'none', boxSizing: 'border-box', minHeight: '110px', resize: 'vertical' }

function RequestModal({ seniorName, onClose, onSubmit }: { seniorName: string; onClose: () => void; onSubmit: (message: string) => Promise<void> }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const handleSubmit = async () => {
    setSending(true)
    try {
      await onSubmit(message)
      onClose()
    } catch (e: any) {
      alert(e?.message?.includes('duplicate') ? '이미 신청한 선배입니다.' : '신청에 실패했습니다.')
    } finally {
      setSending(false)
    }
  }
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <p style={{ fontSize: '20px', fontWeight: 700, color: '#1F1A1A', margin: 0 }}>{seniorName} 선배에게 커피챗 신청</p>
        <p style={{ fontSize: '14px', color: '#78716C', margin: 0 }}>어떤 이야기를 나누고 싶은지 간단히 남겨주세요.</p>
        <textarea style={modalInputStyle} value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder="예: 데이터 직무 준비 과정이 궁금합니다. 커피챗 부탁드려요!" autoFocus />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ ...connectBtnStyle, backgroundColor: 'transparent', color: '#78716C', border: '1px solid #E5E7EB', boxShadow: 'none' }} onClick={onClose}>취소</button>
          <button style={connectBtnStyle} onClick={handleSubmit} disabled={sending}>{sending ? '신청 중...' : '신청 보내기'}</button>
        </div>
      </div>
    </div>
  )
}

async function fetchSeniorDetail(seniorId: string): Promise<Senior> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, name, bio, job_title, company, is_available, skills,
      user_majors(graduation_year, departments(name))
    `)
    .eq('id', seniorId)
    .single()

  if (error || !data) throw error ?? new Error('선배 정보를 찾을 수 없습니다.')

  const row = data as any
  const majorInfo = Array.isArray(row.user_majors) ? row.user_majors[0] : row.user_majors
  return {
    id: row.id as string,
    name: row.name as string,
    department: majorInfo?.departments?.name as string | undefined,
    graduationYear: majorInfo?.graduation_year as number | undefined,
    skills: (row.skills as string[] | null) ?? [],
    isAvailable: (row.is_available as boolean | null) ?? true,
    bio: row.bio as string | null,
    jobTitle: row.job_title as string | null,
    company: row.company as string | null,
    profileImage: null,
  }
}

export default function SeniorDetailPage() {
  const { seniorId } = Route.useParams()

  const { data: senior, isLoading: fetching } = useQuery({
    queryKey: ['senior', seniorId],
    queryFn: () => fetchSeniorDetail(seniorId),
  })

  const { data: existingChat } = useCoffeeChatWith(seniorId)
  const requestChat = useRequestCoffeeChat()
  const [showModal, setShowModal] = useState(false)

  // 공개된 로드맵만 RLS를 통과해 내려온다 (비공개면 null)
  const { data: roadmap } = useUserRoadmap(seniorId)

  const avatarVariant = senior ? getAvatarVariantForId(senior.id) : null

  // 커피챗 버튼 상태 결정
  const chatStatus = existingChat?.status
  let btnLabel = '선배와 연결하기'
  let btnDisabled = false
  if (senior && !senior.isAvailable) { btnLabel = '현재 상담 중'; btnDisabled = true }
  else if (chatStatus === 'pending') { btnLabel = '신청 완료 · 응답 대기중'; btnDisabled = true }
  else if (chatStatus === 'accepted') { btnLabel = '커피챗 수락됨 ✓'; btnDisabled = true }
  else if (chatStatus === 'declined') { btnLabel = '다시 신청하기' }

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
                  <span style={badgeStyle(senior.isAvailable)}>
                    {senior.isAvailable ? '상담 가능' : '상담 중'}
                  </span>
                  <button
                    style={{ ...connectBtnStyle, opacity: btnDisabled ? 0.5 : 1 }}
                    disabled={btnDisabled}
                    onClick={() => setShowModal(true)}
                  >
                    {btnLabel}
                  </button>
                </div>

                {/* 상세 정보 */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {(senior.jobTitle || senior.company) && (
                    <div style={panelStyle}>
                      <p style={panelLabelStyle}>현재</p>
                      <p style={{ fontSize: '18px', fontWeight: 600, color: '#1F1A1A', margin: 0 }}>
                        {[senior.jobTitle, senior.company].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  )}

                  <div style={panelStyle}>
                    <p style={panelLabelStyle}>소개</p>
                    <p style={{ fontSize: '15px', color: '#5C3F3F', lineHeight: 1.7, margin: 0 }}>
                      {senior.bio || '아직 작성된 소개가 없습니다.'}
                    </p>
                  </div>

                  <div style={panelStyle}>
                    <p style={panelLabelStyle}>전문 분야</p>
                    {senior.skills.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {senior.skills.map((s) => (
                          <span key={s} style={skillTagStyle}>{s}</span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '14px', color: '#A8A29E', margin: 0 }}>
                        등록된 전문 분야가 없습니다.
                      </p>
                    )}
                  </div>

                  {/* 커리어 로드맵 — 이 플랫폼의 핵심. 선배가 공개한 경우에만 표시된다. */}
                  {roadmap && roadmap.items.length > 0 && (
                    <div style={panelStyle}>
                      <p style={panelLabelStyle}>커리어 로드맵</p>
                      <p style={{ fontSize: '18px', fontWeight: 600, color: '#1F1A1A', margin: '0 0 4px' }}>
                        {roadmap.title}
                      </p>
                      {roadmap.summary && (
                        <p style={{ fontSize: '14px', color: '#5C3F3F', margin: '0 0 20px', lineHeight: 1.6 }}>
                          {roadmap.summary}
                        </p>
                      )}
                      <div style={{ marginTop: roadmap.summary ? 0 : '16px' }}>
                        <RoadmapTimeline items={roadmap.items} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <HomeFooter />

              {showModal && (
                <RequestModal
                  seniorName={senior.name}
                  onClose={() => setShowModal(false)}
                  onSubmit={(message) => requestChat.mutateAsync({ seniorId, message })}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
