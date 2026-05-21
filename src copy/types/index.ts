/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/types/index.ts                                                  ║
║  역할: 프로젝트 전체에서 공유하는 TypeScript 타입 정의                       ║
║                                                                              ║
║  구조:                                                                       ║
║    1. 조직 구조        - College, Department, Field                          ║
║    2. 커리큘럼 계산기  - Course, CourseType, CurriculumStatus 등             ║
║    3. 커리어 로드맵    - RoadmapCourse, TrackSemester, TrackYear             ║
║    4. 직무             - Job                                                 ║
║    5. 선배 프로필      - Senior, TimetableEntry                              ║
║    6. 메시지/연결 요청 - ConnectionRequest, Message                          ║
║    7. 유저             - User                                                ║
║                                                                              ║
║  사용처:                                                                     ║
║    - src/mock/        : 목 데이터 타입 어노테이션                            ║
║    - src/services/    : API 호출 반환 타입                                   ║
║    - src/app/         : 컴포넌트 props 및 상태 타입                          ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

// ============================================================
// 조직 구조 타입
// ============================================================

/** 단과대학 (예: 공과대학, 경영대학) */
export type College = {
  id: string;
  name: string; // 단과대학명
};

/** 학과 (단과대학 소속) */
export type Department = {
  id: string;
  collegeId: string;  // 소속 단과대학 ID (College.id 참조)
  name: string;       // 학과명
};

/**
 * 세부 분야
 * 여러 학과에 걸쳐 연결 가능한 커리어 분야 (예: 프론트엔드, AI, 금융공학).
 * departmentIds는 해당 분야로 취업할 수 있는 학과 목록.
 */
export type Field = {
  id: string;
  name: string;        // 세부 분야 (ex: 프론트엔드, AI, 금융공학)
  description: string;
  departmentIds: string[]; // 해당 분야로 갈 수 있는 학과 ID 목록
};

// ============================================================
// 커리큘럼 계산기 타입
// ============================================================

/**
 * 과목 유형
 * 졸업 요건 계산 시 분류 기준.
 * - 전공필수: 반드시 이수해야 하는 전공 과목
 * - 전공선택: 지정된 학점 이상 이수해야 하는 선택 과목
 * - 전공기초: 전공 이수를 위한 기초 과목
 * - 교양: 비전공 교양 과목
 * - 기타: 분류되지 않는 기타 과목
 */
export type CourseType = "전공필수" | "전공선택" | "전공기초" | "교양" | "기타";

/** 개별 수강 과목 (유저가 이미 수강한 과목 또는 선배 시간표 항목) */
export type Course = {
  id: string;
  name: string;
  credits: number;
  type: CourseType;
  semester: string;    // ex: "2024-1" (연도-학기 형식)
  grade: string | null; // ex: "A+", "B0", null(미이수 또는 수강 중)
};

/** 졸업 요건 충족 현황 (카테고리별 총 학점 vs 이수 학점) */
export type CurriculumStatus = {
  required: { total: number; completed: number }; // 전공필수
  elective: { total: number; completed: number }; // 전공선택
  basic: { total: number; completed: number };    // 전공기초
};

/** 학과에서 제공하는 과목 카탈로그 단위 (수강 여부와 무관한 마스터 목록) */
export type CatalogCourse = {
  id: string;
  name: string;
  credits: number;
  code: string;          // 과목 코드 (예: "FD101", "ID3012")
  type: CourseType;
  department: string;
};

/** 학과별 졸업 요건 (각 카테고리별 최소 이수 학점) */
export type CurriculumRequirement = {
  departmentId: string;
  required: number;   // 전공필수 총 이수 학점
  elective: number;   // 전공선택 총 이수 학점
  basic: number;      // 전공기초 총 이수 학점
  liberal: number;    // 교양 총 이수 학점
};

// ============================================================
// 커리어 로드맵 — 과목 구조
// ============================================================

/**
 * 로드맵 과목 유형
 * 커리어 로드맵 전용 분류 (커리큘럼 계산기의 CourseType과는 별도).
 * - 기초: 해당 분야 입문에 필요한 기초 과목
 * - 필수: 해당 트랙의 핵심 필수 과목
 * - 선택: 선택적으로 이수할 수 있는 보완 과목
 */
export type RoadmapCourseType = "기초" | "필수" | "선택";

/**
 * RoadmapCourse
 * 백엔드(또는 mock)에서 받는 로드맵 과목 단위.
 * buildTrackFromCourses()에 의해 TrackYear[] 구조로 변환되어 UI에 사용됨.
 */
export type RoadmapCourse = {
  id: string;
  name: string;       // 한국어 과목명
  nameEn: string;     // 영어 부제 (카드 하단에 표시)
  type: RoadmapCourseType;
  year: 1 | 2 | 3 | 4;  // 학년 (1~4)
  semester: 1 | 2;        // 학기 (1학기 또는 2학기)
  dept: string;       // 학과명 (ex: "컴퓨터공학과")
  field: string;      // 분야 슬러그 (ex: "ux-ui", "ml")
};

/**
 * TrackSemester
 * UI에서 사용하는 학기 단위.
 * RoadmapCourse[]을 학기별로 그룹화한 결과.
 */
export type TrackSemester = {
  sem: string;  // 학기 레이블 (예: "1학기", "2학기")
  courses: { name: string; sub: string; type: RoadmapCourseType }[];
};

/**
 * TrackYear
 * UI에서 사용하는 학년 단위.
 * 여러 학기(TrackSemester[])를 포함하며, TrackCurriculum 컴포넌트에 전달됨.
 */
export type TrackYear = {
  year: string;              // 학년 레이블 (예: "1학년", "2학년")
  semesters: TrackSemester[];
};

// ============================================================
// 커리어 로드맵 — 직무 타입
// ============================================================

/** 특정 분야에 속하는 직무 정보 */
export type Job = {
  id: string;
  fieldId: string;           // 소속 분야 ID (Field.id 참조)
  title: string;             // 직무명 (예: "프론트엔드 개발자")
  description: string;
  requiredSkills: string[];  // 해당 직무에 필요한 기술 스택 목록
};

// ============================================================
// 선배 프로필 타입
// ============================================================

/**
 * Senior
 * 선배 멘토 프로필. 선배 목록 페이지, 메시지 헤더, 연결 요청 등 여러 곳에서 사용.
 */
export type Senior = {
  id: string;
  name: string;
  departmentId: string;     // 첫 번째 전공 기준 (선배 목록 필터링에 사용)
  department: string;       // 카드 표시용 텍스트 (예: "산업디자인학과, 경제학과")
  graduationYear: number;   // 졸업연도
  company: string;          // 현 재직 회사
  jobTitle: string;         // 현 직함/포지션
  skills: string[];         // 전문 분야 태그 (선배 카드에 배지로 표시)
  profileImage: string | null;  // 프로필 이미지 경로 (없으면 아이콘 아바타 사용)
  bio: string;              // 자기소개
  tips: string;             // 후배에게 전하는 조언
  timetable: TimetableEntry[];  // 재학 시절 학기별 수강 과목 내역
  isAvailable: boolean;     // 현재 멘토링/커피챗 가능 여부
  scheduledSession?: { datetime: string; title: string; description?: string };
  // 예정된 세션 (선택적): datetime, 제목, 설명
};

/** 선배의 특정 학기 시간표 (과목 목록 포함) */
export type TimetableEntry = {
  semester: string; // ex: "2021-1" (연도-학기 형식)
  courses: Course[];
};

// ============================================================
// 메시지 / 연결 요청 타입
// ============================================================

/** 연결 요청 상태 */
export type ConnectionStatus = "pending" | "accepted" | "rejected";
// pending: 선배 응답 대기 중
// accepted: 연결 수락됨 (메시지 교환 가능)
// rejected: 선배가 거절

/**
 * ConnectionRequest
 * 유저가 선배에게 보내는 연결(커피챗/멘토링) 요청.
 * 수락(accepted) 상태인 것들이 메시지 페이지에 대화 목록으로 표시됨.
 */
export type ConnectionRequest = {
  id: string;
  fromUserId: string;       // 요청 보낸 유저 ID (User.id 참조)
  toSeniorId: string;       // 요청 받은 선배 ID (Senior.id 참조)
  type: "커피챗" | "멘토링"; // 연결 유형
  message: string;          // 최초 연결 요청 메시지 (대화 미리보기 폴백으로도 사용)
  status: ConnectionStatus;
  createdAt: string;        // ISO 8601 형식 타임스탬프
  meetingLink?: string;     // 화상/오프라인 미팅 링크 (선택적)
};

/** 개별 채팅 메시지 */
export type Message = {
  id: string;
  connectionId: string;    // 이 메시지가 속한 연결 요청 ID (ConnectionRequest.id 참조)
  senderId: string;        // 발신자 ID (User.id 또는 Senior.id)
  content: string;         // 메시지 본문
  createdAt: string;       // ISO 8601 형식 타임스탬프
};

// ============================================================
// 유저 (마이페이지) 타입
// ============================================================

/**
 * User
 * 현재 로그인한 학생 유저의 프로필.
 * 커리큘럼 계산기, 관심 분야, 스크랩 목록 등에 사용.
 */
export type User = {
  id: string;
  name: string;
  email: string;
  department: string;
  student_id: number;
  created_at: string;
  is_graduated: boolean;
  grade: number;
  interestedFields: string[]; // fieldId[]
  profileImage: string | null;
  courses: Course[];           // 내가 수강한 과목들
  scrapedSeniorIds: string[];
  scrapedCourseIds: string[];
};
