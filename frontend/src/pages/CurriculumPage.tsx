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
                  cursor: 'pointer',
                  boxShadow: '0 8px 16px -4px rgba(46, 103, 147, 0.6)',
                }}
              >
                    <CalculatorIcon />
                    커리큘럼 계산하기
                  </button>
                </div>
              </>
            )}
          </div>

          <HomeFooter />
        </div>
      </main>
    </div>
  )
}
