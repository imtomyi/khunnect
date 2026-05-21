import type { ReactNode } from 'react'
import Logo from '../Logo'
import { BRAND } from '../../lib/constants'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#FFFFFF' }}>
      {/* 왼쪽: 폼 영역 */}
      <div style={{
        flex: '0 0 50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        overflowY: 'auto',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}>
            <Logo size={32} />
            <h1 style={{
              fontSize: '22px',
              fontWeight: 700,
              color: BRAND,
              margin: '8px 0 0',
              textAlign: 'center',
              lineHeight: 1.3,
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{
                fontSize: '13px',
                color: '#78716C',
                margin: 0,
                textAlign: 'center',
              }}>
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>

      {/* 오른쪽: 그라디언트 */}
      <div style={{
        flex: '0 0 50%',
        background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 50%, #FCA5A5 100%)',
      }} />
    </div>
  )
}