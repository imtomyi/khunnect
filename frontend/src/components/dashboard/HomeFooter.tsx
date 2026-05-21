import Logo from '../Logo'

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
        {['개인정보 처리방침', '이용 약관', '대학 파트너십', '채용 정보'].map((item) => (
          <span key={item} style={{ fontSize: '12px', color: '#A8A29E', cursor: 'pointer' }}>
            {item}
          </span>
        ))}
      </div>
    </footer>
  )
}
