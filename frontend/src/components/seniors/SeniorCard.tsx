import { Link } from '@tanstack/react-router'
import { getAvatarVariantForId, AvatarIcon } from '../../lib/avatarVariants'

export type Senior = {
  id: string
  name: string
  department?: string
  graduationYear?: number
  skills: string[]
  isAvailable: boolean
  profileImage?: string | null
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '20px',
  padding: '32px 36px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  width: '340px',
  height: '450px',
  transition: 'transform 200ms ease, box-shadow 200ms ease',
  cursor: 'pointer',
}

const topRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
}

const avatarWrapStyle = (bg: string): React.CSSProperties => ({
  width: '76px',
  height: '76px',
  borderRadius: '14px',
  backgroundColor: bg,
  overflow: 'hidden',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const avatarImgStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}

const badgeStyle = (isAvailable: boolean): React.CSSProperties => ({
  display: 'flex',
  padding: '6px 16px',
  flexDirection: 'column',
  alignItems: 'flex-start',
  borderRadius: '9999px',
  fontSize: '12px',
  fontWeight: 400,
  backgroundColor: isAvailable ? '#2E67934D' : '#FCF1F1',
  color: isAvailable ? '#094F7A' : '#5C3F3F',
})

const nameStyle: React.CSSProperties = {
  fontSize: '30px',
  fontWeight: 400,
  color: '#1F1A1A',
  lineHeight: '36px',
  fontFamily: 'var(--font-roboto), sans-serif',
}

const deptStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 400,
  color: '#9A001F',
  lineHeight: '24px',
  fontFamily: 'var(--font-roboto), sans-serif',
  marginTop: '-8px',
}

const skillSectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginTop: '12px',
}

const skillLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 400,
  color: '#916F6E',
  lineHeight: '16px',
  fontFamily: 'var(--font-roboto), sans-serif',
  letterSpacing: '1.2px',
  textTransform: 'uppercase',
}

const skillListStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
}

const skillTagStyle: React.CSSProperties = {
  display: 'flex',
  height: '36px',
  padding: '8px 16px',
  flexDirection: 'column',
  alignItems: 'flex-start',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 500,
  backgroundColor: '#F6EBEB',
  color: '#5C3F3F',
  boxSizing: 'border-box',
}

const profileLinkStyle: React.CSSProperties = {
  display: 'flex',
  width: '100%',
  padding: '20px 0',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 'auto',
  backgroundColor: '#9A001F',
  color: '#FFFFFF',
  borderRadius: '16px',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
}

export default function SeniorCard({ senior }: { senior: Senior }) {
  const avatarVariant = getAvatarVariantForId(senior.id)
  const avatarBg = senior.profileImage ? '#00000033' : avatarVariant.bg

  return (
    <div
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.03)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'
      }}
    >
      <div style={topRowStyle}>
        <div style={avatarWrapStyle(avatarBg)}>
          {senior.profileImage ? (
            <img src={senior.profileImage} alt={senior.name} style={avatarImgStyle} />
          ) : (
            <AvatarIcon fill={avatarVariant.fill} bodyPath={avatarVariant.bodyPath} size={70} />
          )}
        </div>
        <span style={badgeStyle(senior.isAvailable)}>
          {senior.isAvailable ? '상담 가능' : '상담 중'}
        </span>
      </div>

      <p style={nameStyle}>{senior.name}</p>

      <p style={deptStyle}>
        {[senior.department, senior.graduationYear ? `${senior.graduationYear}년 졸업` : null]
          .filter(Boolean)
          .join(' · ')}
      </p>

      <div style={skillSectionStyle}>
        <p style={skillLabelStyle}>전문 분야</p>
        <div style={skillListStyle}>
          {senior.skills.length > 0 ? (
            senior.skills.map((skill) => (
              <span key={skill} style={skillTagStyle}>{skill}</span>
            ))
          ) : (
            <span style={{ fontSize: '13px', color: '#A8A29E' }}>정보 없음</span>
          )}
        </div>
      </div>

      <Link to="/seniors/$seniorId" params={{ seniorId: senior.id }} style={profileLinkStyle}>
        프로필 보기
      </Link>
    </div>
  )
}
