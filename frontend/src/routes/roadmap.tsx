import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import DashboardNav from '../components/dashboard/DashboardNav'
import HomeFooter from '../components/dashboard/HomeFooter'

export const Route = createFileRoute('/roadmap')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw redirect({ to: '/login' })
  },
  component: function RoadmapPage() {
    return (
      <div style={{ fontFamily: 'var(--font-roboto)', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
        <DashboardNav />
        <main>
          <div
            className="max-w-[1280px] mx-auto w-full px-6"
            style={{ paddingTop: '49.54px', paddingBottom: '49.54px' }}
          >
            <div style={{
              backgroundColor: '#FFF8F7',
              borderRadius: '20px',
              padding: '80px 40px',
              textAlign: 'center',
            }}>
              <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1F1A1A', marginBottom: '12px' }}>
                커리어 로드맵
              </h1>
              <p style={{ fontSize: '15px', color: '#78716C', margin: 0 }}>
                Phase 3에서 구현될 예정입니다.
              </p>
            </div>
            <HomeFooter />
          </div>
        </main>
      </div>
    )
  },
})
