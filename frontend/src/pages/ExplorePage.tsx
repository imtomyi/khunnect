import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { CSSProperties } from 'react'
import { supabase } from '../lib/supabase'
import type { Senior } from '../types/index'
import DashboardNav from '../components/dashboard/DashboardNav'
import HomeFooter from '../components/dashboard/HomeFooter'
import SeniorsHero from '../components/seniors/SeniorsHero'
import SeniorCard from '../components/seniors/SeniorCard'

const headingStyle: CSSProperties = {
  fontSize: '28px',
  fontWeight: 700,
  color: '#1F1A1A',
  marginBottom: '20px',
}

const emptyTextStyle: CSSProperties = {
  color: '#9CA3AF',
  fontSize: '15px',
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '24px',
}

const filterBarStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '24px',
}

const chipStyle = (active: boolean): CSSProperties => ({
  padding: '8px 18px',
  borderRadius: '9999px',
  border: active ? '1.5px solid #9A001F' : '1.5px solid #E6BDBB',
  backgroundColor: active ? '#9A001F' : '#FFFFFF',
  color: active ? '#FFFFFF' : '#5C3F3F',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 150ms ease',
})

const searchInputStyle: CSSProperties = {
  marginLeft: 'auto',
  padding: '9px 16px',
  borderRadius: '10px',
  border: '1.5px solid #E6BDBB',
  fontSize: '14px',
  fontFamily: 'var(--font-roboto)',
  outline: 'none',
  width: '220px',
  boxSizing: 'border-box',
}

const toggleStyle = (active: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 16px',
  borderRadius: '9999px',
  border: active ? '1.5px solid #094F7A' : '1.5px solid #E6BDBB',
  backgroundColor: active ? '#2E67934D' : '#FFFFFF',
  color: active ? '#094F7A' : '#5C3F3F',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
})

async function fetchSeniors(dept?: string): Promise<Senior[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      name,
      bio,
      job_title,
      company,
      is_available,
      skills,
      user_majors(graduation_year, departments(name))
    `)
    .eq('role', 'alumni')

  if (error) throw error

  const mapped: Senior[] = (data || []).map((row: any) => {
    const majorInfo = Array.isArray(row.user_majors) ? row.user_majors[0] : row.user_majors
    const deptName = majorInfo?.departments?.name as string | undefined
    const gradYear = majorInfo?.graduation_year as number | undefined
    return {
      id: row.id as string,
      name: row.name as string,
      department: deptName,
      graduationYear: gradYear,
      skills: (row.skills as string[] | null) ?? [],
      isAvailable: (row.is_available as boolean | null) ?? true,
      bio: row.bio as string | null,
      jobTitle: row.job_title as string | null,
      company: row.company as string | null,
      profileImage: null,
    }
  })

  return dept ? mapped.filter(s => s.department === dept) : mapped
}

export default function ExplorePage({ dept }: { dept?: string }) {
  const { data: seniors = [], isLoading } = useQuery({
    queryKey: ['seniors'],
    queryFn: () => fetchSeniors(),
  })

  const [deptFilter, setDeptFilter] = useState<string>(dept ?? '전체')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [query, setQuery] = useState('')

  // 선배 목록에서 학과 목록 도출 (전체 + 등장하는 학과들)
  const departments = useMemo(() => {
    const set = new Set<string>()
    seniors.forEach((s) => s.department && set.add(s.department))
    return ['전체', ...Array.from(set).sort()]
  }, [seniors])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return seniors.filter((s) => {
      if (deptFilter !== '전체' && s.department !== deptFilter) return false
      if (availableOnly && !s.isAvailable) return false
      if (q && !s.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [seniors, deptFilter, availableOnly, query])

  return (
    <div style={{ fontFamily: 'var(--font-roboto)', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <DashboardNav />

      <main className="flex-1">
        <div
          className="max-w-[1280px] mx-auto w-full px-6"
          style={{ paddingTop: '49.54px', paddingBottom: '49.54px' }}
        >
          {/* 히어로 배너 — 전폭, Navbar 아래 밀착 */}
          <SeniorsHero />

          {/* 본문 */}
          <h2 style={headingStyle}>
            {deptFilter === '전체' ? '전체 선배' : deptFilter}
            <span style={{ fontSize: '16px', fontWeight: 400, color: '#9CA3AF', marginLeft: '10px' }}>
              {filtered.length}명
            </span>
          </h2>

          {/* 필터 바 */}
          <div style={filterBarStyle}>
            {departments.map((d) => (
              <button key={d} style={chipStyle(d === deptFilter)} onClick={() => setDeptFilter(d)}>
                {d}
              </button>
            ))}
            <button style={toggleStyle(availableOnly)} onClick={() => setAvailableOnly((v) => !v)}>
              {availableOnly ? '✓ ' : ''}상담 가능만
            </button>
            <input
              style={searchInputStyle}
              placeholder="선배 이름 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <p style={emptyTextStyle}>불러오는 중...</p>
          ) : filtered.length === 0 ? (
            <p style={emptyTextStyle}>조건에 맞는 선배가 없습니다.</p>
          ) : (
            <div style={gridStyle}>
              {filtered.map((senior) => (
                <SeniorCard key={senior.id} senior={senior} />
              ))}
            </div>
          )}

          <HomeFooter />
        </div>
      </main>
    </div>
  )
}
