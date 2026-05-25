import { lazy } from 'react'
import { createFileRoute } from '@tanstack/react-router'

const RegisterPage = lazy(() => import('../pages/RegisterPage'))

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})