import { lazy } from 'react'
import { createFileRoute } from '@tanstack/react-router'

const LegalPage = lazy(() => import('../pages/LegalPage'))

export const Route = createFileRoute('/terms')({
  component: () => <LegalPage kind="terms" />,
})
