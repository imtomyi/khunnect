import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useAddRoadmapItem } from '../../hooks/useRoadmap'
import type { RoadmapItemType, RoadmapItemStatus } from '../../types/index'
import { TYPE_META } from './RoadmapTimeline'

const TYPES = Object.keys(TYPE_META) as RoadmapItemType[]

const wrapStyle: CSSProperties = {
  backgroundColor: '#FFF8F7', border: '1px solid #F3E8E8', borderRadius: '12px', padding: '16px',
}
const rowStyle: CSSProperties = { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }
const labelStyle: CSSProperties = { fontSize: '12px', fontWeight: 600, color: '#5C3F3F', marginBottom: '6px' }
const selectStyle: CSSProperties = {
  padding: '8px 10px', borderRadius: '8px', border: '1px solid #E7E5E4', fontSize: '13px',
  color: '#1F1A1A', backgroundColor: '#FFFFFF',
}
const inputStyle: CSSProperties = {
  flex: 1, minWidth: '180px', padding: '8px 12px', borderRadius: '8px',
  border: '1px solid #E7E5E4', fontSize: '13px', color: '#1F1A1A',
}
const submitStyle = (disabled: boolean): CSSProperties => ({
  padding: '8px 18px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600,
  backgroundColor: disabled ? '#E7E5E4' : '#9A001F', color: disabled ? '#A8A29E' : '#FFFFFF',
  cursor: disabled ? 'not-allowed' : 'pointer',
})
const chipStyle = (active: boolean): CSSProperties => ({
  padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
  border: active ? '1px solid #9A001F' : '1px solid #E7E5E4',
  backgroundColor: active ? '#9A001F' : '#FFFFFF',
  color: active ? '#FFFFFF' : '#5C3F3F',
})

export default function AddItemForm({ roadmapId }: { roadmapId: number }) {
  const add = useAddRoadmapItem()
  const [year, setYear] = useState(1)
  const [semester, setSemester] = useState<1 | 2>(1)
  const [type, setType] = useState<RoadmapItemType>('수강')
  const [status, setStatus] = useState<RoadmapItemStatus>('done')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const canSubmit = title.trim().length > 0 && !add.isPending

  const submit = () => {
    if (!canSubmit) return
    add.mutate(
      { roadmapId, item: { year, semester, type, title, description, status } },
      { onSuccess: () => { setTitle(''); setDescription('') } },
    )
  }

  return (
    <div style={wrapStyle}>
      <p style={{ fontSize: '14px', fontWeight: 700, color: '#1F1A1A', margin: '0 0 14px' }}>항목 추가</p>

      <div style={rowStyle}>
        <div>
          <p style={labelStyle}>학년</p>
          <select style={selectStyle} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6].map((y) => <option key={y} value={y}>{y}학년</option>)}
          </select>
        </div>
        <div>
          <p style={labelStyle}>학기</p>
          <select style={selectStyle} value={semester} onChange={(e) => setSemester(Number(e.target.value) as 1 | 2)}>
            <option value={1}>1학기</option>
            <option value={2}>2학기</option>
          </select>
        </div>
        <div>
          <p style={labelStyle}>종류</p>
          <select style={selectStyle} value={type} onChange={(e) => setType(e.target.value as RoadmapItemType)}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <p style={labelStyle}>상태</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" style={chipStyle(status === 'done')} onClick={() => setStatus('done')}>
            이미 함
          </button>
          <button type="button" style={chipStyle(status === 'planned')} onClick={() => setStatus('planned')}>
            할 예정
          </button>
        </div>
      </div>

      <div style={rowStyle}>
        <input
          style={inputStyle}
          placeholder="무엇을 했나요? (예: 네이버 백엔드 인턴)"
          value={title}
          maxLength={100}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
        />
      </div>
      <div style={rowStyle}>
        <input
          style={inputStyle}
          placeholder="설명 (선택) — 후배에게 도움될 팁을 남겨주세요"
          value={description}
          maxLength={300}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
        />
      </div>

      {add.isError && (
        <p style={{ fontSize: '12px', color: '#9A001F', margin: '0 0 10px' }}>
          저장에 실패했습니다. 다시 시도해 주세요.
        </p>
      )}

      <button type="button" style={submitStyle(!canSubmit)} disabled={!canSubmit} onClick={submit}>
        {add.isPending ? '추가 중…' : '추가'}
      </button>
    </div>
  )
}
