import { Link } from '@tanstack/react-router'
import type { CSSProperties } from 'react'
import { AvatarIcon, AVATAR_VARIANTS } from '../../lib/avatarVariants'

type ProfileSectionProps = {
  name: string
  deptName: string
  grade: string
  interestedFieldNames: string[]
}

const cardStyle: CSSProperties = {
  width: '400px',
  flexShrink: 0,
  backgroundColor: '#FFFFFF',
  borderRadius: '20px',
  padding: '28px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
}

const avatarWrapStyle: CSSProperties = {
  width: '72px',
  height: '72px',
  borderRadius: '20px',
  backgroundColor: AVATAR_VARIANTS[3].bg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const nameStyle: CSSProperties = {
  fontSize: '28px',
  fontWeight: 400,
  color: '#1F1A1A',
  marginBottom: '4px',
}

const subTextStyle: CSSProperties = {
  fontSize: '13px',
  color: '#9CA3AF',
}

const editButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  width: '50%',
  padding: '8px',
  backgroundColor: '#9A001F',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
}

const fieldLabelStyle: CSSProperties = {
  fontSize: '12px',
  color: '#5C3F3F',
  fontWeight: 500,
  marginBottom: '8px',
}

const tagsWrapStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
}

const tagStyle: CSSProperties = {
  padding: '6px 14px',
  backgroundColor: '#FCF1F1',
  color: '#9A001F',
  borderRadius: '9999px',
  fontSize: '12px',
  fontWeight: 500,
  border: '1px solid rgba(230, 189, 187, 0.30)',
}

export default function ProfileSection({
  name,
  deptName,
  grade,
  interestedFieldNames,
}: ProfileSectionProps) {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingTop: '4px' }}>
        <div style={avatarWrapStyle}>
          <AvatarIcon fill={AVATAR_VARIANTS[3].fill} bodyPath={AVATAR_VARIANTS[3].bodyPath} size={60} />
        </div>
        <div>
          <p style={nameStyle}>{name}</p>
          <p style={subTextStyle}>경희대학교 {deptName} {grade}</p>
        </div>
      </div>

      <Link to="/my" style={editButtonStyle}>
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="16" viewBox="0 0 15 16" fill="none">
          <path d="M1.5 15.0188C1.0875 15.0188 0.734375 14.8719 0.440625 14.5781C0.146875 14.2844 0 13.9313 0 13.5188V3.01875C0 2.60625 0.146875 2.25312 0.440625 1.95938C0.734375 1.66563 1.0875 1.51875 1.5 1.51875H8.19375L6.69375 3.01875H1.5V13.5188H12V8.30625L13.5 6.80625V13.5188C13.5 13.9313 13.3531 14.2844 13.0594 14.5781C12.7656 14.8719 12.4125 15.0188 12 15.0188H1.5ZM4.5 10.5188V7.33125L11.3813 0.45C11.5312 0.3 11.7 0.1875 11.8875 0.1125C12.075 0.0375 12.2625 0 12.45 0C12.65 0 12.8406 0.0375 13.0219 0.1125C13.2031 0.1875 13.3688 0.3 13.5188 0.45L14.5688 1.51875C14.7063 1.66875 14.8125 1.83438 14.8875 2.01562C14.9625 2.19688 15 2.38125 15 2.56875C15 2.75625 14.9656 2.94062 14.8969 3.12188C14.8281 3.30313 14.7188 3.46875 14.5688 3.61875L7.6875 10.5188H4.5ZM13.5188 2.56875L12.4688 1.51875L13.5188 2.56875ZM6 9.01875H7.05L11.4 4.66875L10.875 4.14375L10.3313 3.61875L6 7.95V9.01875ZM10.875 4.14375L10.3313 3.61875L10.875 4.14375L11.4 4.66875L10.875 4.14375Z" fill="white"/>
        </svg>
        프로필 수정
      </Link>

      <div>
        <p style={fieldLabelStyle}>관심 분야</p>
        <div style={tagsWrapStyle}>
          {interestedFieldNames.length > 0 ? (
            interestedFieldNames.map((fieldName) => (
              <span key={fieldName} style={tagStyle}>{fieldName}</span>
            ))
          ) : (
            <span style={subTextStyle}>관심 분야를 선택해보세요.</span>
          )}
        </div>
      </div>
    </div>
  )
}
