import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../lib/supabase'
import DashboardNav from '../components/dashboard/DashboardNav'
import HomeFooter from '../components/dashboard/HomeFooter'
import RoadmapTimeline from '../components/roadmap/RoadmapTimeline'
import AddItemForm from '../components/roadmap/AddItemForm'
import {
  useMyRoadmap,
  useCreateRoadmap,
  useUpdateRoadmap,
  useDeleteRoadmapItem,
  useUpdateRoadmapItem,
} from '../hooks/useRoadmap'
import type { RoadmapItem } from '../types/index'

const cardStyle: CSSProperties = { backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '32px' }
const heroStyle: CSSProperties = { backgroundColor: '#FFF8F7', borderRadius: '20px', padding: '32px', marginBottom: '20px' }
const h1Style: CSSProperties = { fontSize: '28px', fontWeight: 700, color: '#1F1A1A', margin: 0 }
const subStyle: CSSProperties = { fontSize: '14px', color: '#5C3F3F', margin: '8px 0 0', lineHeight: 1.6 }
const sectionTitleStyle: CSSProperties = { fontSize: '20px', fontWeight: 700, color: '#1F1A1A', margin: '0 0 20px' }
const inputStyle: CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E7E5E4',
  fontSize: '14px', color: '#1F1A1A', marginBottom: '10px',
}
const iconBtnStyle: CSSProperties = {
  padding: '4px 8px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent',
  fontSize: '12px', color: '#78716C', cursor: 'pointer',
}
const primaryBtn: CSSProperties = {
  padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#9A001F',
  color: '#FFFFFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
}

/** 공개 여부 토글 — 이 로드맵이 후배들에게 보이는지 결정 */
function PublicToggle({ id, isPublic }: { id: number; isPublic: boolean }) {
  const update = useUpdateRoadmap()
  return (
    <button
      type="button"
      onClick={() => update.mutate({ id, isPublic: !isPublic })}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '10px',
        border: isPublic ? '1px solid #9A001F' : '1px solid #E7E5E4',
        backgroundColor: isPublic ? '#9A001F' : '#FFFFFF',
        color: isPublic ? '#FFFFFF' : '#5C3F3F',
        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: '32px', height: '18px', borderRadius: '9999px', position: 'relative', flexShrink: 0,
          backgroundColor: isPublic ? 'rgba(255,255,255,0.35)' : '#E7E5E4',
        }}
      >
        <span
          style={{
            position: 'absolute', top: '2px', left: isPublic ? '16px' : '2px', width: '14px', height: '14px',
            borderRadius: '50%', backgroundColor: '#FFFFFF', transition: 'left .15s',
          }}
        />
      </span>
      {isPublic ? '후배들에게 공개 중' : '비공개'}
    </button>
  )
}

function RoadmapPage() {
  const { data: roadmap, isLoading } = useMyRoadmap()
  const create = useCreateRoadmap()
  const update = useUpdateRoadmap()
  const del = useDeleteRoadmapItem()
  const updateItem = useUpdateRoadmapItem()
  const [editingMeta, setEditingMeta] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftSummary, setDraftSummary] = useState('')

  const startEdit = () => {
    setDraftTitle(roadmap?.title ?? '')
    setDraftSummary(roadmap?.summary ?? '')
    setEditingMeta(true)
  }

  const saveMeta = () => {
    if (!roadmap) return
    update.mutate({ id: roadmap.id, title: draftTitle.trim() || '나의 커리어 로드맵', summary: draftSummary })
    setEditingMeta(false)
  }

  const done = roadmap?.items.filter((i) => i.status === 'done').length ?? 0
  const planned = roadmap?.items.filter((i) => i.status === 'planned').length ?? 0

  const renderActions = (it: RoadmapItem) => (
    <div style={{ display: 'flex', gap: '2px' }}>
      <button
        type="button"
        style={iconBtnStyle}
        title={it.status === 'done' ? '예정으로 변경' : '완료로 변경'}
        onClick={() => updateItem.mutate({ id: it.id, patch: { status: it.status === 'done' ? 'planned' : 'done' } })}
      >
        {it.status === 'done' ? '↩ 예정' : '✓ 완료'}
      </button>
      <button
        type="button"
        style={{ ...iconBtnStyle, color: '#9A001F' }}
        title="삭제"
        onClick={() => del.mutate(it.id)}
      >
        삭제
      </button>
    </div>
  )

  return (
    <div style={{ fontFamily: 'var(--font-roboto)', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <DashboardNav />
      <main>
        <div className="max-w-[1280px] mx-auto w-full px-6" style={{ paddingTop: '49.54px', paddingBottom: '49.54px' }}>
          {isLoading ? (
            <div style={heroStyle}>
              <p style={{ ...subStyle, margin: 0 }}>불러오는 중…</p>
            </div>
          ) : !roadmap ? (
            // 최초 진입 — 아직 로드맵이 없음
            <div style={{ ...heroStyle, textAlign: 'center', padding: '80px 40px' }}>
              <h1 style={h1Style}>커리어 로드맵</h1>
              <p style={{ ...subStyle, maxWidth: '520px', margin: '12px auto 24px' }}>
                학기별로 무엇을 했고 무엇을 할 계획인지 기록해 보세요.
                공개하면 후배들이 여러분의 경로를 참고할 수 있습니다.
              </p>
              <button type="button" style={primaryBtn} disabled={create.isPending} onClick={() => create.mutate()}>
                {create.isPending ? '만드는 중…' : '내 로드맵 만들기'}
              </button>
            </div>
          ) : (
            <>
              <div style={heroStyle}>
                {editingMeta ? (
                  <>
                    <input
                      style={inputStyle}
                      value={draftTitle}
                      maxLength={60}
                      placeholder="로드맵 제목"
                      onChange={(e) => setDraftTitle(e.target.value)}
                    />
                    <input
                      style={inputStyle}
                      value={draftSummary}
                      maxLength={120}
                      placeholder="한 줄 소개 (예: 게임 개발자가 되기까지)"
                      onChange={(e) => setDraftSummary(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" style={primaryBtn} onClick={saveMeta}>저장</button>
                      <button
                        type="button"
                        style={{ ...primaryBtn, backgroundColor: '#F3E8E8', color: '#5C3F3F' }}
                        onClick={() => setEditingMeta(false)}
                      >
                        취소
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <h1 style={h1Style}>{roadmap.title}</h1>
                      {roadmap.summary && <p style={subStyle}>{roadmap.summary}</p>}
                      <p style={{ fontSize: '13px', color: '#78716C', margin: '10px 0 0' }}>
                        완료 {done}개 · 예정 {planned}개
                      </p>
                      <button
                        type="button"
                        style={{ ...iconBtnStyle, padding: '4px 0', marginTop: '6px', color: '#9A001F' }}
                        onClick={startEdit}
                      >
                        제목·소개 편집
                      </button>
                    </div>
                    <PublicToggle id={roadmap.id} isPublic={roadmap.isPublic} />
                  </div>
                )}
                {!roadmap.isPublic && !editingMeta && (
                  <p style={{ fontSize: '12px', color: '#78716C', margin: '14px 0 0' }}>
                    비공개 상태입니다. 공개하면 선배 탐색에서 후배들이 이 로드맵을 볼 수 있습니다.
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: '20px', alignItems: 'start' }}>
                <div style={cardStyle}>
                  <p style={sectionTitleStyle}>타임라인</p>
                  <RoadmapTimeline
                    items={roadmap.items}
                    renderActions={renderActions}
                    emptyText="오른쪽에서 첫 항목을 추가해 보세요."
                  />
                </div>
                <AddItemForm roadmapId={roadmap.id} />
              </div>
            </>
          )}
          <HomeFooter />
        </div>
      </main>
    </div>
  )
}

export const Route = createFileRoute('/roadmap')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw redirect({ to: '/login' })
  },
  component: RoadmapPage,
})
