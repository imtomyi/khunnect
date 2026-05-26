// ════════════════════════════════════════════════════════════════
// 공통 타입 정의
// 새로운 타입은 여기에 추가할 것 — 컴포넌트 파일 안에 정의 금지
// ════════════════════════════════════════════════════════════════

/** 선배 프로필 */
export type Senior = {
  id: string
  name: string
  department?: string
  graduationYear?: number
  skills: string[]
  isAvailable: boolean
  profileImage?: string | null
}

/** 과목 카탈로그 항목 */
export type CourseType = '전공기초' | '전공필수' | '전공선택'

export type CatalogCourse = {
  id: string
  name: string
  type: CourseType
  credits: number
  code: string
}

/** 졸업 요건 */
export type CurriculumRequirement = {
  basic_credits: number
  required_credits: number
  elective_credits: number
}
