import type { ReactNode, CSSProperties } from 'react'

interface StatCardProps {
  title: string
  icon: string
  children: ReactNode
  style?: CSSProperties
}

export default function StatCard({ title, icon, children, style }: StatCardProps) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #F5EDED',
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxShadow: '0 1px 4px rgba(154, 0, 31, 0.06)',
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <span style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#3D1515',
          letterSpacing: '0.01em',
        }}>{title}</span>
      </div>
      {children}
    </div>
  )
}
