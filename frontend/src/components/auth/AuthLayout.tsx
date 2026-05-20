import type { ReactNode } from 'react'
import Logo from '../Logo'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      position: 'relative',
      backgroundColor: '#FFFFFF',
    }}>
      {/* 왼쪽: 폼 영역 */}
      <div style={{
        flex: '0 0 50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
      }}>
        <div style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Logo size={32} />
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1F1A1A', margin: 0, marginTop: '16px' }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: '14px', color: '#78716C', margin: 0 }}>
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>

      {/* 오른쪽: 배경 이미지 영역 */}
      <div style={{
        flex: '0 0 50%',
        background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 50%, #FCA5A5 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />
    </div>
  )
}