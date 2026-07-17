import { lazy } from 'react'
import { createFileRoute } from '@tanstack/react-router'

const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'))

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})
