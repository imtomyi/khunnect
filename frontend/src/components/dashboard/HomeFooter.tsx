import { Link } from '@tanstack/react-router'
import Logo from '../Logo'

// 푸터 정보 링크 — 실제 목적지로 연결 (죽은 링크 금지)
const FOOTER_LINKS: { label: string; to: string }[] = [
  { label: '서비스 소개', to: '/' },
  { label: '이용약관', to: '/terms' },
  { label: '개인정보처리방침', to: '/privacy' },
]

export default function HomeFooter() {
  return (
    <footer style={{
      borderTop: '1px solid #F0EDED',
      paddingTop: '32px',
      paddingBottom: '16px',
      marginTop: '8px',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Logo size={20} />
        <p style={{ fontSize: '12px', color: '#C4B5B5', margin: 0 }}>
          © 2026 khunnect. 경희대생을 위한 졸업 내비게이션 서비스
        </p>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {FOOTER_LINKS.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            style={{ fontSize: '12px', color: '#A8A29E', textDecoration: 'none', cursor: 'pointer' }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </footer>
  )
}
