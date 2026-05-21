import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import DashboardNav from '../components/dashboard/DashboardNav'
import HomeFooter from '../components/dashboard/HomeFooter'
import { CategoryPanel, CATEGORY_CONFIG, type CourseType } from '../components/curriculum/CategoryPanel'
import { CourseGrid, type CatalogCourse } from '../components/curriculum/CourseGrid'
import { SavedCheckIcon, CalculatorIcon } from '../components/curriculum/Icons'

const CHECKED_STORAGE_KEY = 'curriculum_checked_courses'

function loadCheckedFromStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(CHECKED_STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveCheckedToStorage(checked: Set<string>) {
  localStorage.setItem(CHECKED_STORAGE_KEY, JSON.stringify([...checked]))
}

export default function CurriculumPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const [catalog, setCatalog] = useState<CatalogCourse[]>([])
  const [selectedType, setSelectedType] = useState<CourseType>('전공기초')
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle')
  const [catalogLoading, setCatalogLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) navigate({ to: '/login' })
  }, [user, loading, navigate])

  // localStorage에서 체크 상태 복원
  useEffect(() => {
    setChecked(loadCheckedFromStorage())
  }, [])

  // Supabase에서 course_catalog 로드
  useEffect(() => {
    if (!user) return
    setCatalogLoading(true)
    supabase
      .from('course_catalog')
      .select('id, name, type, credits, code')
      .then(({ data, error }) => {
        if (error) {
          console.error('과목 카탈로그 조회 에러:', error)
          setCatalog([])
        } else {
          setCatalog(
            (data || []).map((c: any) => ({
              id: String(c.id),
              name: c.name as string,
              type: c.type as CourseType,
              credits: Number(c.credits),
              code: (c.code || c.id) as string,
            }))
          )
        }
        setCatalogLoading(false)
      })
  }, [user])

  if (loading || !user) return null

  function toggleCourse(id: string) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      saveCheckedToStorage(next)
      return next
    })
  }

  function handleSave() {
    saveCheckedToStorage(checked)
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 3000)
  }

  const category = CATEGORY_CONFIG.find(c => c.type === selectedType)!
  const currentCourses = catalog.filter(c => c.type === selectedType)
  const completedCredits = currentCourses
    .filter(c => checked.has(c.id))
    .reduce((sum, c) => sum + c.credits, 0)
  const reqTotal = 0 // 졸업 요건은 추후 DB에서 로드 예정

  return (
    <div style={{ fontFamily: 'var(--font-roboto)', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <DashboardNav />

      <main>
        <div
          className="max-w-[1280px] mx-auto w-full px-6"
          style={{ paddingTop: '49.54px', paddingBottom: '49.54px' }}
        >

          {/* 히어로 섹션 — 전폭, Navbar 아래 밀착 */}
          <div style={{
            backgroundColor: '#FFF8F7',
            padding: '72px 0 80px',
            marginLeft: 'calc(-50vw + 50%)',
            marginTop: 'calc(-49.54px)',
            width: '100vw',
          }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 48px' }}>
              <h1 style={{ fontSize: '48px', fontWeight: 700, lineHeight: '1.15', color: '#1F1A1A', marginBottom: '20px' }}>
                지금까지의 여정을<br />
                <span style={{ color: '#9A001F' }}>기록해주세요</span>
              </h1>
              <p style={{ fontSize: '15px', color: '#78716C', lineHeight: '1.7', maxWidth: '440px', margin: 0 }}>
                정확한 졸업 사정을 위해 수강하신 강의들을 각 카테고리에 맞춰 입력해<br />
                주세요. khunnect가 당신의 남은 학기를 설계해 드립니다.
              </p>
            </div>
          </div>

          {/* 본문 */}
          <div style={{ paddingTop: '48px', paddingBottom: '120px' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', minHeight: '560px' }}>

              {/* 왼쪽: 카테고리 탭 패널 */}
              <CategoryPanel selectedType={selectedType} onSelect={setSelectedType} />

              {/* 오른쪽: 과목 체크 그리드 */}
              {catalogLoading ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: '#A8A29E', fontSize: '14px' }}>과목을 불러오는 중...</p>
                </div>
              ) : (
                <CourseGrid
                  categoryLabel={category.label}
                  courses={currentCourses}
                  checked={checked}
                  completedCredits={completedCredits}
                  reqTotal={reqTotal}
                  onToggle={toggleCourse}
                />
              )}

            </div>

            {/* 하단 액션 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button
                onClick={handleSave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px 32px',
                  borderRadius: '999px',
                  border: saveStatus === 'saved' ? '1px solid #2E6793' : 'none',
                  backgroundColor: saveStatus === 'saved' ? '#FFFFFF' : '#2E6793',
                  color: saveStatus === 'saved' ? '#094F7A' : '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 300ms ease, color 300ms ease',
                  boxShadow: '0 8px 16px -4px rgba(46, 103, 147, 0.6)',
                }}
              >
                {saveStatus === 'saved' ? (
                  <>
                    <SavedCheckIcon />
                    저장됨
                  </>
                ) : '저장'}
              </button>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 40px',
                  minWidth: '120px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#2E6793',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 8px 16px -4px rgba(46, 103, 147, 0.6)',
                }}
              >
                <CalculatorIcon />
                커리큘럼 계산하기
              </button>
            </div>
          </div>

          <HomeFooter />
        </div>
      </main>
    </div>
  )
}
