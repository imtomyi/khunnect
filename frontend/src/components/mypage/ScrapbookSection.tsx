import { Link } from '@tanstack/react-router'
import type { CSSProperties } from 'react'
import { formatDepartments } from '../../lib/majors'

type ScrapedSenior = {
  id: string
  name: string
  departments: string[]
  graduationYear?: number
}

type ScrapbookSectionProps = {
  scrapedSeniors: ScrapedSenior[]
}

const MOCK_ROADMAPS = [
  { id: 'ux-ui',    title: 'UX 리서처가 되는 길',       bgColor: '#C8A882' },
  { id: 'mobility', title: '모빌리티 디자이너가 되는 길', bgColor: '#4A5568' },
]

const cardStyle: CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '20px',
  padding: '32px',
}

const titleStyle: CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#1F1A1A',
  marginBottom: '24px',
}

const twoColStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '40px',
}

const colLabelStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#5C3F3F',
  marginBottom: '12px',
}

const seniorItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#FCF1F1',
  borderRadius: '12px',
  padding: '12px 16px',
  marginBottom: '8px',
}

const seniorNameStyle: CSSProperties = {
  fontSize: '14px',
  fontWeight: 400,
  color: '#1F1A1A',
}

const seniorSubStyle: CSSProperties = {
  fontSize: '12px',
  color: '#5C3F3F',
  marginTop: '2px',
}

const roadmapCardStyle: CSSProperties = {
  borderRadius: '12px',
  overflow: 'hidden',
  height: '80px',
  position: 'relative',
  marginBottom: '8px',
  cursor: 'pointer',
}

const roadmapLabelStyle: CSSProperties = {
  position: 'absolute',
  bottom: '12px',
  left: '14px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#FFFFFF',
}

export default function ScrapbookSection({ scrapedSeniors }: ScrapbookSectionProps) {
  return (
    <div style={cardStyle}>
      <p style={titleStyle}>스크랩북</p>

      <div style={twoColStyle}>
        {/* 좌측: 친한 선배 목록 */}
        <div>
          <div style={colLabelStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
              <path d="M5.8225 12.4842L8.5 10.8842L11.1775 12.5053L10.4762 9.47369L12.835 7.45263L9.7325 7.17895L8.5 4.31579L7.2675 7.1579L4.165 7.43158L6.52375 9.47369L5.8225 12.4842ZM3.25125 16L4.6325 10.0842L0 6.10526L6.12 5.57895L8.5 0L10.88 5.57895L17 6.10526L12.3675 10.0842L13.7487 16L8.5 12.8632L3.25125 16Z" fill="#9A001F"/>
            </svg>
            친한 선배
          </div>
          {scrapedSeniors.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#9CA3AF' }}>저장한 선배가 없습니다.</p>
          ) : (
            scrapedSeniors.map((senior) => (
              <Link
                key={senior.id}
                to="/seniors/$seniorId"
                params={{ seniorId: senior.id }}
                style={{ textDecoration: 'none' }}
              >
                <div style={seniorItemStyle}>
                  <div>
                    <p style={seniorNameStyle}>{senior.name} 선배님</p>
                    <p style={seniorSubStyle}>
                      {[
                        formatDepartments(senior.departments),
                        senior.graduationYear ? `${senior.graduationYear}년 졸업` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10319.28px',
                    backgroundColor: '#C7002B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                      <path d="M5.8225 12.4842L8.5 10.8842L11.1775 12.5053L10.4762 9.47369L12.835 7.45263L9.7325 7.17895L8.5 4.31579L7.2675 7.1579L4.165 7.43158L6.52375 9.47369L5.8225 12.4842ZM3.25125 16L4.6325 10.0842L0 6.10526L6.12 5.57895L8.5 0L10.88 5.57895L17 6.10526L12.3675 10.0842L13.7487 16L8.5 12.8632L3.25125 16Z" fill="#FFD5D4"/>
                    </svg>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* 우측: 저장한 로드맵 */}
        <div>
          <div style={colLabelStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4.5 13.5C3.675 13.5 2.96875 13.2062 2.38125 12.6187C1.79375 12.0312 1.5 11.325 1.5 10.5V4.36875C1.0625 4.20625 0.703125 3.93437 0.421875 3.55312C0.140625 3.17188 0 2.7375 0 2.25C0 1.625 0.21875 1.09375 0.65625 0.65625C1.09375 0.21875 1.625 0 2.25 0C2.875 0 3.40625 0.21875 3.84375 0.65625C4.28125 1.09375 4.5 1.625 4.5 2.25C4.5 2.7375 4.35938 3.17188 4.07812 3.55312C3.79688 3.93437 3.4375 4.20625 3 4.36875V10.5C3 10.9125 3.14687 11.2656 3.44062 11.5594C3.73438 11.8531 4.0875 12 4.5 12C4.9125 12 5.26562 11.8531 5.55937 11.5594C5.85312 11.2656 6 10.9125 6 10.5V3C6 2.175 6.29375 1.46875 6.88125 0.88125C7.46875 0.29375 8.175 0 9 0C9.825 0 10.5312 0.29375 11.1187 0.88125C11.7062 1.46875 12 2.175 12 3V9.13125C12.4375 9.29375 12.7969 9.56562 13.0781 9.94687C13.3594 10.3281 13.5 10.7625 13.5 11.25C13.5 11.875 13.2812 12.4062 12.8438 12.8438C12.4062 13.2812 11.875 13.5 11.25 13.5C10.625 13.5 10.0938 13.2812 9.65625 12.8438C9.21875 12.4062 9 11.875 9 11.25C9 10.7625 9.14062 10.325 9.42188 9.9375C9.70312 9.55 10.0625 9.28125 10.5 9.13125V3C10.5 2.5875 10.3531 2.23438 10.0594 1.94062C9.76562 1.64687 9.4125 1.5 9 1.5C8.5875 1.5 8.23438 1.64687 7.94063 1.94062C7.64688 2.23438 7.5 2.5875 7.5 3V10.5C7.5 11.325 7.20625 12.0312 6.61875 12.6187C6.03125 13.2062 5.325 13.5 4.5 13.5ZM2.25 3C2.4625 3 2.64062 2.92812 2.78437 2.78437C2.92812 2.64062 3 2.4625 3 2.25C3 2.0375 2.92812 1.85938 2.78437 1.71563C2.64062 1.57188 2.4625 1.5 2.25 1.5C2.0375 1.5 1.85938 1.57188 1.71563 1.71563C1.57188 1.85938 1.5 2.0375 1.5 2.25C1.5 2.4625 1.57188 2.64062 1.71563 2.78437C1.85938 2.92812 2.0375 3 2.25 3ZM11.25 12C11.4625 12 11.6406 11.9281 11.7844 11.7844C11.9281 11.6406 12 11.4625 12 11.25C12 11.0375 11.9281 10.8594 11.7844 10.7156C11.6406 10.5719 11.4625 10.5 11.25 10.5C11.0375 10.5 10.8594 10.5719 10.7156 10.7156C10.5719 10.8594 10.5 11.0375 10.5 11.25C10.5 11.4625 10.5719 11.6406 10.7156 11.7844C10.8594 11.9281 11.0375 12 11.25 12Z" fill="#5C3F3F"/>
            </svg>
            저장한 로드맵
          </div>
          {MOCK_ROADMAPS.map((roadmap) => (
            <div key={roadmap.id} style={{ ...roadmapCardStyle, backgroundColor: roadmap.bgColor }}>
              <p style={roadmapLabelStyle}>{roadmap.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
