import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/my')({
  component: () => (
    <div style={{ padding: '48px', textAlign: 'center', color: '#78716C' }}>
      내 프로필 페이지 (준비 중)
    </div>
  ),
})
