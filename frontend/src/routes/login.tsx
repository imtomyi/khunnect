import { lazy } from 'react'
import { createFileRoute } from '@tanstack/react-router'

const LoginPage = lazy(() => import('../pages/LoginPage'))

export const Route = createFileRoute('/login')({
  component: LoginPage,
})