import type { CSSProperties } from 'react'

const heroStyle: CSSProperties = {
  backgroundColor: '#FFF8F7',
  padding: '80px 0 150px',
  textAlign: 'center',
  marginBottom: '60px',
  marginLeft: 'calc(-50vw + 50%)',
  marginTop: 'calc(-49.54px)',
  width: '100vw',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}

const headingStyle: CSSProperties = {
  fontSize: '36px',
  fontWeight: 700,
  color: '#1F1A1A',
  marginBottom: '16px',
}

const subTextStyle: CSSProperties = {
  fontSize: '15px',
  color: '#5C3F3F',
  fontWeight: 400,
}

export default function SeniorsHero() {
  return (
    <div style={heroStyle}>
      <h1 style={headingStyle}>선배 디렉토리</h1>
      <p style={subTextStyle}>
        당신이 가고자 하는 길을 먼저 성공적으로 걸어간 학업 베테랑들을 만나보세요.
      </p>
    </div>
  )
}
