import { Link, useNavigate } from '@tanstack/react-router'
import Logo from '../Logo'
import { useAuth } from '../../hooks/useAuth'

export default function DashboardNav() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate({ to: '/login' })
  }

  return (
    <nav
      className="sticky top-0 z-50 bg-white"
      style={{
        borderBottom: '1.5px solid rgba(241,245,249,0.5)',
        boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)',
      }}
    >
      <div className="relative w-full h-[64px] flex items-center">

        {/* 로고 — 절대 좌측 고정 */}
        <div className="absolute left-6">
          <Link to="/home" style={{ textDecoration: 'none' }}>
            <Logo size={22} />
          </Link>
        </div>

        {/* 중앙 메뉴 — 본문과 동일한 max-w 정렬 */}
        <div className="max-w-[1280px] mx-auto w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-[50px] ml-[100px]">
            {([
              { label: '커리큘럼 계산기', to: '/curriculum' },
              { label: '선배와의 연결',   to: '/explore'    },
              { label: '커리어 로드맵',   to: '/roadmap'    },
            ] as const).map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                style={{
                  textDecoration: 'none',
                  fontFamily: 'var(--font-roboto)',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#64748B',
                  padding: '6px 12px',
                  borderRadius: '6px',
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* 우측 액션 */}
        <div className="flex items-center gap-3 mr-6">
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              width: '78px',
              height: '34.5px',
              flexDirection: 'column',
              justifyContent: 'center',
              color: '#64748B',
              textAlign: 'center',
              fontFamily: 'var(--font-roboto)',
              fontSize: '14px',
              fontWeight: 500,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            로그아웃
          </button>

          <button
            style={{
              display: 'flex',
              padding: '8px 20px',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '14998.5px',
              background: '#9A001F',
              color: '#FFFFFF',
              fontFamily: 'var(--font-roboto)',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px 0 rgba(154,0,31,0.35)',
              whiteSpace: 'nowrap',
            }}
          >
            메시지함
          </button>

          <div style={{ width: '1.5px', height: '36px', flexShrink: 0, background: '#E2E8F0', margin: '0 4px' }} />

          <Link to="/my" style={{ textDecoration: 'none' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#FCF1F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '16px',
            }}>
              👤
            </div>
          </Link>
        </div>

      </div>
    </nav>
  )
}
