import { lazy } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

const RoadmapExplorePage = lazy(() => import('../pages/RoadmapExplorePage'))

// /roadmaps(복수) = 공개 로드맵 탐색, /roadmap(단수) = 내 로드맵 편집
export const Route = createFileRoute('/roadmaps')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw redirect({ to: '/login' })
  },
  component: RoadmapExplorePage,
})
