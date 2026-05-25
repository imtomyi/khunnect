import { lazy } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

const SeniorDetailPage = lazy(() => import('../pages/SeniorDetailPage'))

export const Route = createFileRoute('/seniors/$seniorId')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw redirect({ to: '/login' })
  },
  component: SeniorDetailPage,
})
