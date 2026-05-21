import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import HomePage from '../pages/HomePage'

export const Route = createFileRoute('/home')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
  },
  component: HomePage,
})
