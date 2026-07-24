import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from '@tanstack/react-router'
import { useRecommendedSeniors } from '../../hooks/useRecommendedSeniors'
import { getAvatarVariantForId, AvatarIcon } from '../../lib/avatarVariants'
import { formatDepartments } from '../../lib/majors'

const cardStyle = (isZeroState?: boolean): CSSProperties => ({
  backgroundColor: '#FCF1F1',
  minHeight: isZeroState ? '450px' : '540px',
  borderRadius: '32px',
  padding: '41.281px',
  gap: '24px',
  boxShadow: '0 1.032px 2.064px 0 rgba(0,0,0,0.05)',
})

const titleTextStyle: CSSProperties = {
  color: '#5C3F3F',
  fontFamily: 'Roboto',
  fontSize: '22px',
  fontWeight: 700,
  lineHeight: '100%',
}

const zeroStateIconWrapStyle: CSSProperties = {
  width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#FFFFFF',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const outlineBtnStyle: CSSProperties = {
  width: '100%', border: '2px solid rgba(154,0,31,0.15)', borderRadius: '16px', height: '56px',
  fontSize: '14px', fontWeight: 700, color: '#9A001F', backgroundColor: 'transparent',
  cursor: 'pointer', transition: 'background-color 150ms ease, color 150ms ease',
  fontFamily: 'Roboto, system-ui, sans-serif',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none',
}

const connectBtnStyle: CSSProperties = {
  width: '100%', border: 'none', borderRadius: '16px', height: '52px',
  fontSize: '14px', fontWeight: 700, color: '#FFFFFF', backgroundColor: '#9A001F',
  cursor: 'pointer', fontFamily: 'Roboto, system-ui, sans-serif',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  textDecoration: 'none', boxShadow: '0 4px 14px 0 rgba(154,0,31,0.35)',
}

const skillTagStyle: CSSProperties = {
  padding: '5px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500,
  backgroundColor: '#FFFFFF', color: '#5C3F3F',
}

function handleBtnEnter(e: React.MouseEvent<HTMLElement>) {
  e.currentTarget.style.backgroundColor = '#9A001F'
  e.currentTarget.style.color = '#FFFFFF'
}
function handleBtnLeave(e: React.MouseEvent<HTMLElement>) {
  e.currentTarget.style.backgroundColor = 'transparent'
  e.currentTarget.style.color = '#9A001F'
}

const TitleHeader = () => (
  <div className="flex items-center gap-2 font-semibold">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M10.1875 19.44L16.6562 12H11.6562L12.5625 5.19L6.78125 13.2H11.125L10.1875 19.44ZM7 24L8.25 15.6H2L13.25 0H15.75L14.5 9.6H22L9.5 24H7Z" fill="#094F7A"/>
    </svg>
    <span style={titleTextStyle}>추천 선배</span>
  </div>
)

export default function RecommendedSeniorCard() {
  const { data: seniors = [], isLoading } = useRecommendedSeniors()
  const [idx, setIdx] = useState(0)

  // 상담 가능한 선배가 없으면 zero-state
  if (!isLoading && seniors.length === 0) {
    return (
      <div className="flex-1 flex flex-col" style={cardStyle(true)}>
        <TitleHeader />
        <div className="flex flex-col items-center flex-1 justify-center gap-4 text-center">
          <div style={zeroStateIconWrapStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 34 22" fill="none">
              <path d="M11.431 10.5368C9.95967 10.5368 8.70275 10.022 7.66028 8.99247C6.61782 7.96291 6.09659 6.72156 6.09659 5.2684C6.09659 3.81525 6.61782 2.57389 7.66028 1.54434C8.70275 0.514779 9.95967 0 11.431 0C12.9024 0 14.1593 0.514779 15.2018 1.54434C16.2443 2.57389 16.7655 3.81525 16.7655 5.2684C16.7655 6.72156 16.2443 7.96291 15.2018 8.99247C14.1593 10.022 12.9024 10.5368 11.431 10.5368ZM0 22V18.6537C0 17.9165 0.20273 17.2339 0.608189 16.6057C1.01365 15.9776 1.5554 15.4946 2.23345 15.1569C3.74 14.4274 5.25974 13.8803 6.79268 13.5156C8.32561 13.1508 9.87173 12.9685 11.431 12.9685C12.9904 12.9685 14.5365 13.1508 16.0694 13.5156C17.6023 13.8803 19.1221 14.4274 20.6286 15.1569C21.3067 15.4946 21.8484 15.9776 22.2539 16.6057C22.6594 17.2339 22.8621 17.9165 22.8621 18.6537V22H0Z" fill="#C7002B"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#1F1A1A', marginBottom: '8px' }}>선배한테 도움 요청</p>
            <p style={{ fontSize: '13px', color: '#916F6E', lineHeight: 1.6 }}>
              나와 같은 고민을 했던 선배들은<br />어떤 길을 걸었을까요?
            </p>
          </div>
        </div>
        <Link to="/explore" search={{ dept: undefined }} style={outlineBtnStyle} onMouseEnter={handleBtnEnter} onMouseLeave={handleBtnLeave}>
          선배 찾기
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col" style={cardStyle()}>
        <TitleHeader />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: '#B89B9B', fontSize: '13px' }}>추천 선배를 찾는 중…</p>
        </div>
      </div>
    )
  }

  const senior = seniors[Math.min(idx, seniors.length - 1)]
  const v = getAvatarVariantForId(senior.id)
  const sub = [formatDepartments(senior.departments), senior.graduationYear ? `${senior.graduationYear}년 졸업` : null]
    .filter(Boolean).join(' · ')
  const role = [senior.jobTitle, senior.company].filter(Boolean).join(' · ')

  return (
    <div className="flex-1 flex flex-col" style={cardStyle()}>
      <TitleHeader />

      <div className="flex-1 flex flex-col items-center text-center" style={{ gap: '14px', marginTop: '8px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '20px', backgroundColor: v.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AvatarIcon fill={v.fill} bodyPath={v.bodyPath} size={56} />
        </div>
        <div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#1F1A1A', margin: 0 }}>{senior.name}</p>
          {sub && <p style={{ fontSize: '13px', color: '#9A001F', margin: '4px 0 0' }}>{sub}</p>}
          {role && <p style={{ fontSize: '13px', color: '#5C3F3F', margin: '4px 0 0' }}>{role}</p>}
        </div>
        {senior.skills.length > 0 && (
          <div className="flex flex-wrap justify-center" style={{ gap: '6px' }}>
            {senior.skills.slice(0, 3).map((s) => <span key={s} style={skillTagStyle}>{s}</span>)}
          </div>
        )}
      </div>

      {/* 캐러셀 점 (추천 선배 여러 명일 때) */}
      {seniors.length > 1 && (
        <div className="flex justify-center" style={{ gap: '6px' }}>
          {seniors.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIdx(i)}
              aria-label={`추천 선배 ${i + 1}`}
              style={{
                width: i === idx ? '20px' : '7px', height: '7px', borderRadius: '9999px',
                border: 'none', cursor: 'pointer', padding: 0,
                backgroundColor: i === idx ? '#9A001F' : '#E6BDBB', transition: 'width .15s ease',
              }}
            />
          ))}
        </div>
      )}

      <Link to="/seniors/$seniorId" params={{ seniorId: senior.id }} style={connectBtnStyle}>
        지금 연결하기
      </Link>
    </div>
  )
}
