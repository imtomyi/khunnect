import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from '@tanstack/react-router'
import { usePublicRoadmaps } from '../hooks/useRoadmap'
import { formatDepartments } from '../lib/majors'
import { getAvatarVariantForId, AvatarIcon } from '../lib/avatarVariants'
import { TYPE_META } from '../components/roadmap/RoadmapTimeline'
import DashboardNav from '../components/dashboard/DashboardNav'
import HomeFooter from '../components/dashboard/HomeFooter'
import type { PublicRoadmap, RoadmapItemType } from '../types/index'

const heroStyle: CSSProperties = {
  backgroundColor: '#FFF8F7',
  borderRadius: '20px',
  padding: '48px 40px',
  textAlign: 'center',
  marginBottom: '28px',
}
const cardStyle: CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #F3E8E8',
  borderRadius: '16px',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  height: '100%',
  boxSizing: 'border-box',
}
const chipStyle = (active: boolean): CSSProperties => ({
  padding: '8px 16px',
  borderRadius: '9999px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  border: active ? '1px solid #9A001F' : '1px solid #E7E5E4',
  backgroundColor: active ? '#9A001F' : '#FFFFFF',
  color: active ? '#FFFFFF' : '#5C3F3F',
})
const typeBadge = (type: RoadmapItemType): CSSProperties => ({
  padding: '3px 10px',
  borderRadius: '9999px',
  fontSize: '11px',
  fontWeight: 600,
  color: TYPE_META[type].color,
  backgroundColor: TYPE_META[type].bg,
})
const roleBadge = (alumni: boolean): CSSProperties => ({
  padding: '3px 10px',
  borderRadius: '9999px',
  fontSize: '11px',
  fontWeight: 600,
  color: alumni ? '#094F7A' : '#78716C',
  backgroundColor: alumni ? '#DBEAFE' : '#F5F5F4',
  flexShrink: 0,
})

/** 카드에 이 로드맵이 어떤 활동으로 이뤄졌는지 요약 — 후배가 훑어보고 고르는 기준 */
function typeSummary(r: PublicRoadmap): RoadmapItemType[] {
  const seen = new Set<RoadmapItemType>()
  for (const it of r.items) seen.add(it.type)
  return [...seen]
}

function RoadmapCard({ r }: { r: PublicRoadmap }) {
  const v = getAvatarVariantForId(r.userId)
  const done = r.items.filter((i) => i.status === 'done').length
  const planned = r.items.length - done
  const types = typeSummary(r)

  return (
    <Link to="/seniors/$seniorId" params={{ seniorId: r.userId }} style={{ textDecoration: 'none' }}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px', height: '44px', borderRadius: '12px', backgroundColor: v.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <AvatarIcon fill={v.fill} bodyPath={v.bodyPath} size={34} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#1F1A1A' }}>{r.ownerName}</span>
              <span style={roleBadge(r.ownerRole === 'alumni')}>
                {r.ownerRole === 'alumni' ? '졸업생' : '재학생'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#9A001F', margin: '2px 0 0' }}>
              {[
                formatDepartments(r.ownerDepartments),
                r.ownerGraduationYear ? `${r.ownerGraduationYear}년 졸업` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>

        {(r.ownerJobTitle || r.ownerCompany) && (
          <p style={{ fontSize: '13px', color: '#5C3F3F', margin: 0 }}>
            {[r.ownerJobTitle, r.ownerCompany].filter(Boolean).join(' · ')}
          </p>
        )}

        <div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#1F1A1A', margin: 0 }}>{r.title}</p>
          {r.summary && (
            <p style={{ fontSize: '13px', color: '#5C3F3F', margin: '4px 0 0', lineHeight: 1.5 }}>
              {r.summary}
            </p>
          )}
        </div>

        {types.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {types.map((t) => (
              <span key={t} style={typeBadge(t)}>{t}</span>
            ))}
          </div>
        )}

        <p style={{ fontSize: '12px', color: '#78716C', margin: 'auto 0 0' }}>
          완료 {done}개{planned > 0 ? ` · 예정 ${planned}개` : ''}
        </p>
      </div>
    </Link>
  )
}

export default function RoadmapExplorePage() {
  const { data: roadmaps = [], isLoading } = usePublicRoadmaps()
  const [deptFilter, setDeptFilter] = useState('전체')
  const [typeFilter, setTypeFilter] = useState<RoadmapItemType | '전체'>('전체')

  // 공개된 로드맵에 등장하는 학과만 칩으로 노출 (복수전공자는 모든 학과에 집계)
  const departments = useMemo(() => {
    const set = new Set<string>()
    roadmaps.forEach((r) => r.ownerDepartments.forEach((d) => set.add(d)))
    return ['전체', ...Array.from(set).sort()]
  }, [roadmaps])

  const types = useMemo(() => {
    const set = new Set<RoadmapItemType>()
    roadmaps.forEach((r) => r.items.forEach((i) => set.add(i.type)))
    return ['전체', ...Array.from(set)] as const
  }, [roadmaps])

  const filtered = useMemo(
    () =>
      roadmaps.filter((r) => {
        if (deptFilter !== '전체' && !r.ownerDepartments.includes(deptFilter)) return false
        if (typeFilter !== '전체' && !r.items.some((i) => i.type === typeFilter)) return false
        return true
      }),
    [roadmaps, deptFilter, typeFilter],
  )

  return (
    <div style={{ fontFamily: 'var(--font-roboto)', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <DashboardNav />
      <main>
        <div className="max-w-[1280px] mx-auto w-full px-6" style={{ paddingTop: '49.54px', paddingBottom: '49.54px' }}>
          <div style={heroStyle}>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1F1A1A', margin: 0 }}>
              로드맵 탐색
            </h1>
            <p style={{ fontSize: '15px', color: '#5C3F3F', margin: '10px 0 0' }}>
              선배들이 실제로 걸어온 학기별 경로를 살펴보고, 내 방향을 잡아보세요.
            </p>
          </div>

          {isLoading ? (
            <p style={{ fontSize: '14px', color: '#9CA3AF' }}>불러오는 중…</p>
          ) : roadmaps.length === 0 ? (
            <div style={{ ...heroStyle, backgroundColor: '#FAFAF9', padding: '64px 40px' }}>
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#1F1A1A', margin: 0 }}>
                아직 공개된 로드맵이 없습니다
              </p>
              <p style={{ fontSize: '14px', color: '#78716C', margin: '8px 0 20px' }}>
                첫 번째로 여러분의 경로를 공개해 후배들에게 길을 알려주세요.
              </p>
              <Link
                to="/roadmap"
                style={{
                  display: 'inline-block', padding: '10px 20px', borderRadius: '8px',
                  backgroundColor: '#9A001F', color: '#FFFFFF', fontSize: '14px',
                  fontWeight: 600, textDecoration: 'none',
                }}
              >
                내 로드맵 만들기
              </Link>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {departments.map((d) => (
                  <button key={d} type="button" style={chipStyle(deptFilter === d)} onClick={() => setDeptFilter(d)}>
                    {d}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    style={chipStyle(typeFilter === t)}
                    onClick={() => setTypeFilter(t as RoadmapItemType | '전체')}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: '13px', color: '#78716C', margin: '0 0 16px' }}>
                {filtered.length}개의 로드맵
              </p>

              {filtered.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#9CA3AF' }}>조건에 맞는 로드맵이 없습니다.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {filtered.map((r) => (
                    <RoadmapCard key={r.id} r={r} />
                  ))}
                </div>
              )}
            </>
          )}

          <HomeFooter />
        </div>
      </main>
    </div>
  )
}
