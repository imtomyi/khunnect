import { lazy } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

const MyPage = lazy(() => import('../pages/MyPage'))

export const Route = createFileRoute('/my')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw redirect({ to: '/login' })
  },
  component: MyPage,
})
