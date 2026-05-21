import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import ExplorePage from '../pages/ExplorePage'

export const Route = createFileRoute('/explore')({
  validateSearch: (search: Record<string, unknown>) => ({
    dept: typeof search.dept === 'string' ? search.dept : undefined,
  }),
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw redirect({ to: '/login' })
  },
  component: function ExploreRoute() {
    const { dept } = Route.useSearch()
    return <ExplorePage dept={dept} />
  },
})
