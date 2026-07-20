import { TipIcon } from './Icons'
import type { CourseType } from '../../types/index'

export type { CourseType }

type CategoryConfig = {
  type: CourseType
  label: string
  categoryNo: string
  tip: string
}

export const CATEGORY_CONFIG: CategoryConfig[] = [
  {
    type: '전공기초',
    label: '전공기초',
    categoryNo: 'CATEGORY 01',
    tip: '전공기초 강의는 웬만하면 1학년 때 끝내는 것이 나중에 편할거에요!',
  },
  {
    type: '전공필수',
    label: '전공필수',
    categoryNo: 'CATEGORY 02',
    tip: '전공필수 과목들은 졸업 요건에서 빠질 수 없어요. 매 학기 균형 있게 들어두세요!',
  },
  {
    type: '산학필수',
    label: '산학필수',
    categoryNo: 'CATEGORY 03',
    tip: '현장실습 등 산학필수 과목은 학과 졸업요건에 포함돼요. 방학을 활용해 미리 채워두세요!',
  },
  {
    type: '전공선택',
    label: '전공선택',
    categoryNo: 'CATEGORY 04',
    tip: '전공선택은 자신의 커리어 방향에 맞는 과목 위주로 전략적으로 골라보세요.',
  },
]

type CategoryPanelProps = {
  selectedType: CourseType
  onSelect: (type: CourseType) => void
}

export function CategoryPanel({ selectedType, onSelect }: CategoryPanelProps) {
  const activeTip = CATEGORY_CONFIG.find(c => c.type === selectedType)!.tip

  return (
    <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>

      {CATEGORY_CONFIG.map((cat) => {
        const isSelected = cat.type === selectedType
        return (
          <button
            key={cat.type}
            onClick={() => onSelect(cat.type)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '16px 20px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: isSelected ? '#EBE0E0' : '#FCF1F1',
              borderLeft: isSelected ? '3px solid #9A001F' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'background-color 150ms ease',
            }}
          >
            <p style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              marginBottom: '4px',
              color: isSelected ? '#9A001F' : '#5C3F3F99',
            }}>
              {cat.categoryNo}
            </p>
            <p style={{
              fontSize: '16px',
              fontWeight: 600,
              color: isSelected ? '#1F1A1A' : '#78716C',
              margin: 0,
            }}>
              {cat.label}
            </p>
          </button>
        )
      })}

      <div style={{
        marginTop: '16px',
        padding: '20px 28px',
        borderRadius: '14px',
        backgroundColor: '#9A001F',
        color: '#FFFFFF',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <TipIcon />
          <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.6px', color: '#FFFFFF', marginTop: '2px' }}>
            선배의 팁
          </span>
        </div>
        <p style={{ fontSize: '14px', fontWeight: 600, lineHeight: '1.6', opacity: 0.95, margin: 0 }}>
          {activeTip}
        </p>
      </div>

    </div>
  )
}
