import { lazy } from 'react'
import { createFileRoute } from '@tanstack/react-router'

const LandingPage = lazy(() => import('../pages/LandingPage'))

export const Route = createFileRoute('/')({
  component: LandingPage,
})