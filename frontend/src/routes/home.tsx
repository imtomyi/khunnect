import { lazy } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

const HomePage = lazy(() => import('../pages/HomePage'))

export const Route = createFileRoute('/home')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw redirect({ to: '/login' })
  },
  component: HomePage,
})
