import type { CSSProperties } from 'react'
import type { RoadmapItem, RoadmapItemType } from '../../types/index'

/** 항목 종류별 색상 — 타임라인에서 한눈에 구분되도록 */
export const TYPE_META: Record<RoadmapItemType, { color: string; bg: string }> = {
  수강:     { color: '#094F7A', bg: '#DBEAFE' },
  인턴:     { color: '#9A001F', bg: '#FCF1F1' },
  프로젝트: { color: '#166534', bg: '#DCFCE7' },
  대외활동: { color: '#92400E', bg: '#FEF3C7' },
  자격증:   { color: '#5B21B6', bg: '#EDE9FE' },
  취업:     { color: '#FFFFFF', bg: '#9A001F' },
  기타:     { color: '#5C3F3F', bg: '#F3E8E8' },
}

const railStyle: CSSProperties = {
  position: 'absolute', left: '7px', top: '18px', bottom: '-4px', width: '2px', backgroundColor: '#F3E8E8',
}
const dotStyle = (planned: boolean): CSSProperties => ({
  position: 'absolute', left: 0, top: '5px', width: '16px', height: '16px', borderRadius: '50%',
  backgroundColor: planned ? '#FFFFFF' : '#9A001F',
  border: planned ? '2px dashed #C4B5B5' : '2px solid #9A001F',
  boxSizing: 'border-box',
})
const semesterLabelStyle: CSSProperties = {
  fontSize: '13px', fontWeight: 700, color: '#1F1A1A', margin: '0 0 10px',
}
const itemCardStyle = (planned: boolean): CSSProperties => ({
  backgroundColor: planned ? '#FAFAF9' : '#FFF8F7',
  border: planned ? '1px dashed #E7E5E4' : '1px solid #F3E8E8',
  borderRadius: '12px', padding: '12px 14px', marginBottom: '8px',
})
const typeBadge = (type: RoadmapItemType): CSSProperties => ({
  padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600,
  color: TYPE_META[type].color, backgroundColor: TYPE_META[type].bg, flexShrink: 0,
})
const plannedBadge: CSSProperties = {
  padding: '3px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 500,
  color: '#78716C', backgroundColor: '#F5F5F4', flexShrink: 0,
}
const itemTitleStyle: CSSProperties = { fontSize: '14px', fontWeight: 600, color: '#1F1A1A' }
const itemDescStyle: CSSProperties = { fontSize: '13px', color: '#5C3F3F', margin: '6px 0 0', lineHeight: 1.5 }

/** 학년-학기 단위로 묶어 시간순 정렬 */
export function groupBySemester(items: RoadmapItem[]) {
  const map = new Map<string, RoadmapItem[]>()
  for (const it of items) {
    const key = `${it.year}-${it.semester}`
    const arr = map.get(key)
    if (arr) arr.push(it)
    else map.set(key, [it])
  }
  return [...map.entries()]
    .map(([key, group]) => {
      const [year, semester] = key.split('-').map(Number)
      return { year, semester, items: group }
    })
    .sort((a, b) => a.year - b.year || a.semester - b.semester)
}

type Props = {
  items: RoadmapItem[]
  /** 각 항목 우측에 붙일 편집 컨트롤 (내 로드맵에서만 전달) */
  renderActions?: (item: RoadmapItem) => React.ReactNode
  emptyText?: string
}

export default function RoadmapTimeline({ items, renderActions, emptyText = '아직 등록된 항목이 없습니다.' }: Props) {
  if (items.length === 0) {
    return <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>{emptyText}</p>
  }

  const groups = groupBySemester(items)

  return (
    <div>
      {groups.map((g, gi) => (
        <div key={`${g.year}-${g.semester}`} style={{ position: 'relative', paddingLeft: '32px', paddingBottom: gi === groups.length - 1 ? 0 : '20px' }}>
          {gi !== groups.length - 1 && <div style={railStyle} />}
          <div style={dotStyle(g.items.every((i) => i.status === 'planned'))} />
          <p style={semesterLabelStyle}>
            {g.year}학년 {g.semester}학기
          </p>
          {g.items.map((it) => (
            <div key={it.id} style={itemCardStyle(it.status === 'planned')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={typeBadge(it.type)}>{it.type}</span>
                <span style={itemTitleStyle}>{it.title}</span>
                {it.status === 'planned' && <span style={plannedBadge}>예정</span>}
                {renderActions && <div style={{ marginLeft: 'auto', flexShrink: 0 }}>{renderActions(it)}</div>}
              </div>
              {it.description && <p style={itemDescStyle}>{it.description}</p>}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
