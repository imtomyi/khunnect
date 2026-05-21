import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import CurriculumPage from '../pages/CurriculumPage'

export const Route = createFileRoute('/curriculum')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw redirect({ to: '/login' })
  },
  component: CurriculumPage,
})
