import { lazy } from 'react'
import { createFileRoute } from '@tanstack/react-router'

const LegalPage = lazy(() => import('../pages/LegalPage'))

export const Route = createFileRoute('/privacy')({
  component: () => <LegalPage kind="privacy" />,
})
