// ════════════════════════════════════════════════════════════════
// 공통 타입 정의
// 새로운 타입은 여기에 추가할 것 — 컴포넌트 파일 안에 정의 금지
// ════════════════════════════════════════════════════════════════

/** 선배 프로필 */
export type Senior = {
  id: string
  name: string
  /** 전공 학과 (주전공 우선, 복수전공·부전공 포함). 표시는 formatDepartments 사용 */
  departments: string[]
  graduationYear?: number
  skills: string[]
  isAvailable: boolean
  bio?: string | null
  jobTitle?: string | null
  company?: string | null
  profileImage?: string | null
}

/** 커피챗 신청 (Phase 4) */
export type CoffeeChatStatus = 'pending' | 'accepted' | 'declined' | 'cancelled'

export type CoffeeChat = {
  id: number
  studentId: string
  seniorId: string
  message: string | null
  status: CoffeeChatStatus
  createdAt: string
  counterpartName?: string
}

/** 채팅 메시지 (Phase 5) */
export type Message = {
  id: number
  coffeeChatId: number
  senderId: string
  content: string
  createdAt: string
}

/** 커리어 로드맵 */
export type RoadmapItemType = '수강' | '인턴' | '프로젝트' | '대외활동' | '자격증' | '취업' | '기타'

/** done = 이미 한 일(회고), planned = 앞으로 할 일(계획) */
export type RoadmapItemStatus = 'done' | 'planned'

export type RoadmapItem = {
  id: number
  roadmapId: number
  year: number
  semester: 1 | 2
  type: RoadmapItemType
  title: string
  description: string | null
  status: RoadmapItemStatus
}

export type Roadmap = {
  id: number
  userId: string
  title: string
  summary: string | null
  isPublic: boolean
  items: RoadmapItem[]
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
