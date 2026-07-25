import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { useCurriculum } from '../hooks/useCurriculum'
import { supabase } from '../lib/supabase'
import type { CourseType } from '../types/index'
import DashboardNav from '../components/dashboard/DashboardNav'
import HomeFooter from '../components/dashboard/HomeFooter'
import { CategoryPanel, CATEGORY_CONFIG } from '../components/curriculum/CategoryPanel'
import { CourseGrid } from '../components/curriculum/CourseGrid'
import { SavedCheckIcon, CalculatorIcon } from '../components/curriculum/Icons'

export default function CurriculumPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedType, setSelectedType] = useState<CourseType>('전공기초')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle')
  const [calculating, setCalculating] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // 학과 × 입학년도 → 교육과정 버전(과목·요건·부가조건). 버전 없으면 null.
  const { data: curriculum, isLoading: catalogLoading } = useCurriculum()
  const catalog = curriculum?.courses ?? []
  const requirement = curriculum?.requirement ?? null

  // 체크된 과목 목록 (string[] — course_id 배열)
  const { data: checkedIds = [] } = useQuery<string[]>({
    queryKey: ['checked_courses', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('checked_courses')
        .select('course_id')
        .eq('user_id', user!.id)
      return (data || []).map((r: any) => r.course_id as string)
    },
    enabled: !!user,
  })

  // Set으로 변환 (메모이즈)
  const checked = useMemo(() => new Set(checkedIds), [checkedIds])

  // 과목 체크/언체크 — 캐시 즉시 업데이트 + 백그라운드 Supabase 동기화
  function toggleCourse(id: string) {
    const isChecked = checked.has(id)
    queryClient.setQueryData<string[]>(['checked_courses', user?.id], (prev = []) =>
      isChecked ? prev.filter(x => x !== id) : [...prev, id]
    )
    if (isChecked) {
      supabase.from('checked_courses')
        .delete()
        .eq('user_id', user!.id)
        .eq('course_id', id)
        .then()
    } else {
      supabase.from('checked_courses')
        .insert({ user_id: user!.id, course_id: id })
        .then()
    }
  }

  function handleSave() {
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 3000)
  }

  const category = CATEGORY_CONFIG.find(c => c.type === selectedType)!
  const currentCourses = catalog.filter(c => c.type === selectedType)

  const completedCredits = currentCourses
    .filter(c => checked.has(c.id))
    .reduce((sum, c) => sum + c.credits, 0)

  const reqTotal = requirement
    ? ({
        전공기초: requirement.basicCredits,
        전공필수: requirement.requiredCredits,
        산학필수: requirement.industryCredits,
        전공선택: requirement.electiveCredits,
      })[selectedType] ?? 0
    : 0

  // 로딩 끝났는데 교육과정이 없으면(아직 시드 안 된 학과) 안내를 띄운다
  const noCurriculum = !catalogLoading && !curriculum

  // 카테고리별 이수 학점 요약 (결과 모달용)
  const summary = (['전공기초', '전공필수', '산학필수', '전공선택'] as CourseType[]).map((t) => {
    const done = catalog.filter((c) => c.type === t && checked.has(c.id)).reduce((s, c) => s + c.credits, 0)
    const req = requirement
      ? ({ 전공기초: requirement.basicCredits, 전공필수: requirement.requiredCredits, 산학필수: requirement.industryCredits, 전공선택: requirement.electiveCredits })[t] ?? 0
      : 0
    return { type: t, done, req }
  })
  const totalDone = summary.reduce((s, c) => s + c.done, 0)
  const totalReq = summary.reduce((s, c) => s + c.req, 0)
  const gradTotal = curriculum?.totalCredits ?? totalReq
  const overallPct = totalReq > 0 ? Math.round((totalDone / totalReq) * 100) : 0

  // '커리큘럼 계산하기' → 짧은 로딩 후 결과 모달 (피그마 A2: 로딩/결과 흐름)
  function handleCalculate() {
    setCalculating(true)
    setTimeout(() => { setCalculating(false); setShowResults(true) }, 600)
  }

  return (
    <div style={{ fontFamily: 'var(--font-roboto)', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <DashboardNav />

      <main>
        <div
          className="max-w-[1280px] mx-auto w-full px-6"
          style={{ paddingTop: '49.54px', paddingBottom: '49.54px' }}
        >

          {/* 히어로 섹션 */}
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
            {noCurriculum ? (
              // 아직 교육과정이 등록되지 않은 학과 (소융·컴공 외)
              <div style={{
                backgroundColor: '#FAFAF9', border: '1px solid #E7E5E4', borderRadius: '20px',
                padding: '80px 40px', textAlign: 'center',
              }}>
                <p style={{ fontSize: '18px', fontWeight: 700, color: '#1F1A1A', margin: 0 }}>
                  교육과정을 준비 중입니다
                </p>
                <p style={{ fontSize: '14px', color: '#78716C', margin: '10px auto 0', maxWidth: '460px', lineHeight: 1.6 }}>
                  아직 이 학과의 교육과정이 등록되지 않았어요. 학과별 교육과정을 순차적으로
                  추가하고 있으니 조금만 기다려 주세요. 그동안 선배들의 로드맵을 참고해보는 건 어떨까요?
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', minHeight: '560px' }}>

                  <CategoryPanel selectedType={selectedType} onSelect={setSelectedType} />

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
                {saveStatus === 'saved' ? <><SavedCheckIcon />저장됨</> : '저장'}
              </button>
              <button
                onClick={handleCalculate}
                disabled={calculating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 40px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#2E6793',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: calculating ? 'wait' : 'pointer',
                  opacity: calculating ? 0.7 : 1,
                  boxShadow: '0 8px 16px -4px rgba(46, 103, 147, 0.6)',
                }}
              >
                    <CalculatorIcon />
                    {calculating ? '계산 중…' : '커리큘럼 계산하기'}
                  </button>
                </div>
              </>
            )}
          </div>

          <HomeFooter />
        </div>
      </main>

      {/* 커리큘럼 계산 결과 모달 */}
      {showResults && curriculum && (
        <div
          onClick={() => setShowResults(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '36px', width: '520px', maxWidth: '100%', maxHeight: '86vh', overflowY: 'auto' }}
          >
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#9A001F', letterSpacing: '1px', margin: 0 }}>졸업 사정 결과</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '6px 0 4px' }}>
              <span style={{ fontSize: '44px', fontWeight: 700, color: '#1F1A1A' }}>{overallPct}%</span>
              <span style={{ fontSize: '15px', color: '#5C3F3F' }}>전공 이수 {totalDone} / {totalReq}학점</span>
            </div>
            <p style={{ fontSize: '13px', color: '#78716C', margin: '0 0 24px' }}>졸업 총 이수학점 기준 {gradTotal}학점</p>

            {/* 카테고리별 진행 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {summary.filter((c) => c.req > 0).map((c) => {
                const pct = c.req > 0 ? Math.min(100, Math.round((c.done / c.req) * 100)) : 0
                const met = c.done >= c.req
                return (
                  <div key={c.type}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1F1A1A' }}>
                        {c.type} {met && <span style={{ color: '#166534', fontSize: '12px' }}>✓ 충족</span>}
                      </span>
                      <span style={{ fontSize: '13px', color: met ? '#166534' : '#9A001F' }}>{c.done} / {c.req}학점</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '9999px', backgroundColor: '#F3E8E8', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: '9999px', backgroundColor: met ? '#166534' : '#9A001F', transition: 'width .3s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 부가 졸업조건 */}
            {curriculum.extras.length > 0 && (
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #F3E8E8' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#1F1A1A', margin: '0 0 12px' }}>부가 졸업 요건</p>
                {curriculum.extras.map((e) => (
                  <div key={e.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ color: '#B89B9B', fontSize: '13px', marginTop: '1px' }}>•</span>
                    <span style={{ fontSize: '13px', color: '#5C3F3F', lineHeight: 1.5 }}>{e.label}</span>
                  </div>
                ))}
                <p style={{ fontSize: '11px', color: '#B89B9B', margin: '6px 0 0' }}>※ 부가 요건은 별도 확인이 필요합니다.</p>
              </div>
            )}

            <button
              onClick={() => setShowResults(false)}
              style={{ marginTop: '28px', width: '100%', padding: '14px', borderRadius: '14px', border: 'none', backgroundColor: '#2E6793', color: '#FFFFFF', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
