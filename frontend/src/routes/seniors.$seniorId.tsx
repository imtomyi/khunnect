import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import SeniorDetailPage from '../pages/SeniorDetailPage'

export const Route = createFileRoute('/seniors/$seniorId')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw redirect({ to: '/login' })
  },
  component: SeniorDetailPage,
})
