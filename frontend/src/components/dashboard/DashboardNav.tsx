import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import Logo from '../Logo'
import { useAuth } from '../../hooks/useAuth'

type NavChild = { label: string; to: string; desc: string }
type NavItem = { label: string; to: string; children?: NavChild[] }

// 로드맵/선배는 하위 메뉴로 묶어 호버 드롭다운으로 노출한다 (피그마 nav)
const NAV: NavItem[] = [
  { label: '커리큘럼 계산기', to: '/curriculum' },
  {
    label: '선배와의 연결',
    to: '/explore',
    children: [
      { label: '선배 탐색', to: '/explore', desc: '학과별 선배를 찾아보세요' },
      { label: '커피챗 관리', to: '/my', desc: '보낸·받은 커피챗 확인' },
    ],
  },
  {
    label: '커리어 로드맵',
    to: '/roadmaps',
    children: [
      { label: '로드맵 탐색', to: '/roadmaps', desc: '선배들이 걸어온 경로 둘러보기' },
      { label: '내 로드맵', to: '/roadmap', desc: '내 학기별 경로 기록·공개' },
    ],
  },
]

const linkStyle: CSSProperties = {
  textDecoration: 'none',
  fontFamily: 'var(--font-roboto)',
  fontSize: '16px',
  fontWeight: 500,
  color: '#64748B',
  padding: '6px 12px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  cursor: 'pointer',
  transition: 'color 0.15s ease',
}

const dropdownPanelStyle: CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  paddingTop: '10px', // 트리거와 패널 사이 마우스 이동용 브리지 (틈 없이)
  zIndex: 60,
}

const dropdownInnerStyle: CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '14px',
  boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
  border: '1px solid #F3E8E8',
  padding: '8px',
  minWidth: '240px',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 12 12"
      style={{ transition: 'transform 0.18s ease', transform: open ? 'rotate(180deg)' : 'none' }}
    >
      <path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DropdownItem({ child, onNavigate }: { child: NavChild; onNavigate: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <Link
      to={child.to}
      onClick={onNavigate}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textDecoration: 'none',
        display: 'block',
        padding: '10px 12px',
        borderRadius: '10px',
        backgroundColor: hover ? '#FFF8F7' : 'transparent',
        transition: 'background-color 0.12s ease',
      }}
    >
      <div style={{ fontSize: '14px', fontWeight: 600, color: hover ? '#9A001F' : '#1F1A1A' }}>
        {child.label}
      </div>
      <div style={{ fontSize: '12px', color: '#78716C', marginTop: '2px' }}>{child.desc}</div>
    </Link>
  )
}

export default function DashboardNav() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const handleSignOut = async () => {
    await signOut()
    navigate({ to: '/login' })
  }

  return (
    <nav
      className="sticky top-0 z-50 bg-white"
      style={{ borderBottom: '1.5px solid rgba(241,245,249,0.5)', boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)' }}
    >
      <div className="relative w-full h-[64px] flex items-center">

        {/* 로고 — 절대 좌측 고정 */}
        <div className="absolute left-6">
          <Link to="/home" style={{ textDecoration: 'none' }}>
            <Logo size={22} />
          </Link>
        </div>

        {/* 중앙 메뉴 */}
        <div className="max-w-[1280px] mx-auto w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-[40px] ml-[100px]">
            {NAV.map((item) => {
              const isOpen = openMenu === item.label
              if (!item.children) {
                return (
                  <Link key={item.label} to={item.to} style={linkStyle}>
                    {item.label}
                  </Link>
                )
              }
              return (
                <div
                  key={item.label}
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setOpenMenu(item.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <Link to={item.to} style={{ ...linkStyle, color: isOpen ? '#9A001F' : '#64748B' }}>
                    {item.label}
                    <Chevron open={isOpen} />
                  </Link>
                  {isOpen && (
                    <div style={dropdownPanelStyle}>
                      <div style={dropdownInnerStyle}>
                        {item.children.map((child) => (
                          <DropdownItem key={child.to} child={child} onNavigate={() => setOpenMenu(null)} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 우측 액션 */}
        <div className="flex items-center gap-3 mr-6">
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex', width: '78px', height: '34.5px', flexDirection: 'column',
              justifyContent: 'center', color: '#64748B', textAlign: 'center',
              fontFamily: 'var(--font-roboto)', fontSize: '14px', fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            로그아웃
          </button>

          <Link
            to="/my"
            style={{
              display: 'flex', padding: '8px 20px', justifyContent: 'center', alignItems: 'center',
              borderRadius: '14998.5px', background: '#9A001F', color: '#FFFFFF',
              fontFamily: 'var(--font-roboto)', fontSize: '14px', fontWeight: 600,
              border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(154,0,31,0.35)',
              whiteSpace: 'nowrap', textDecoration: 'none',
            }}
          >
            메시지함
          </Link>

          <div style={{ width: '1.5px', height: '36px', flexShrink: 0, background: '#E2E8F0', margin: '0 4px' }} />

          <Link to="/my" style={{ textDecoration: 'none' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FCF1F1',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px',
            }}>
              👤
            </div>
          </Link>
        </div>

      </div>
    </nav>
  )
}
