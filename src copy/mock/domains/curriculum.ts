/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/mock/domains/curriculum.ts                                      ║
║  역할: 커리큘럼 계산기용 졸업 요건 및 과목 카탈로그 mock 데이터             ║
║                                                                              ║
║  포함 데이터:                                                                ║
║    MOCK_CURRICULUM_REQUIREMENTS         - 기본 졸업 요건 (dept-1 기준)      ║
║    MOCK_CURRICULUM_REQUIREMENTS_BY_DEPT - 학과별 졸업 요건 맵               ║
║    MOCK_CATALOG_COURSES                 - 산업디자인학과 전체 과목 카탈로그  ║
║                                                                              ║
║  의존성:                                                                     ║
║    - @/types: CatalogCourse 타입                                             ║
║                                                                              ║
║  Supabase 연동 계획:                                                         ║
║    services/curriculum.ts의 함수들로 교체 예정                               ║
║    (project_supabase_plan.md 참조)                                           ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

// 과목 카탈로그 타입 임포트 (CurriculumRequirement는 @/types에 있지만 여기선 직접 인라인 타입 사용)
import type { CatalogCourse } from "@/types";

// ── 졸업 요건 (학과별) ───────────────────────────────────────────────────────

/**
 * MOCK_CURRICULUM_REQUIREMENTS
 *
 * 기본 졸업 요건 (컴퓨터공학과 dept-1 기준).
 * 단일 학과를 가정한 레거시 형태로, 신규 코드는 아래의 BY_DEPT 맵을 사용 권장.
 */
export const MOCK_CURRICULUM_REQUIREMENTS = {
  departmentId: "dept-1",
  required: 36,   // 전공필수 최소 이수 학점
  elective: 21,   // 전공선택 최소 이수 학점
  basic: 12,      // 전공기초 최소 이수 학점
  liberal: 12,    // 교양 최소 이수 학점
};

/**
 * MOCK_CURRICULUM_REQUIREMENTS_BY_DEPT
 *
 * 학과 ID(departmentId)를 키로 하는 졸업 요건 맵.
 * 커리큘럼 계산기에서 MOCK_USER.departmentId를 키로 조회하여 사용.
 *
 * 현재 정의된 학과:
 * - dept-5: 산업디자인학과 (MOCK_USER의 소속 학과)
 * - dept-1: 컴퓨터공학과
 */
export const MOCK_CURRICULUM_REQUIREMENTS_BY_DEPT: Record<
  string,
  { required: number; elective: number; basic: number; liberal: number }
> = {
  // 산업디자인학과: 전공필수 21학점, 전공선택 28학점, 전공기초 18학점, 교양 12학점
  "dept-5": { required: 21, elective: 28, basic: 18, liberal: 12 },
  // 컴퓨터공학과: 전공필수 36학점, 전공선택 21학점, 전공기초 12학점, 교양 12학점
  "dept-1": { required: 36, elective: 21, basic: 12, liberal: 12 },
};

// ── 과목 카탈로그 (학과별) ───────────────────────────────────────────────────

/**
 * MOCK_CATALOG_COURSES
 *
 * 학과에서 개설하는 전체 과목 마스터 목록.
 * 커리큘럼 계산기에서 유저의 수강 과목과 매칭하여 이수 현황을 계산.
 *
 * 현재는 산업디자인학과(dept-5) 과목만 포함.
 * code 필드는 실제 학교 학수번호 형식을 따름 (FD: 기초디자인, ID: 산업디자인).
 */
export const MOCK_CATALOG_COURSES: CatalogCourse[] = [
  // ── 산업디자인학과 (dept-5) ─────────────────────────────────────────────

  // 전공기초
  { id: "fd101", department: "산업디자인학과", name: "드로잉",              credits: 3, code: "FD101", type: "전공기초" },
  { id: "fd103", department: "산업디자인학과", name: "평면디자인",           credits: 3, code: "FD103", type: "전공기초" },
  { id: "fd105", department: "산업디자인학과", name: "디지털디자인",         credits: 3, code: "FD105", type: "전공기초" },
  { id: "fd109", department: "산업디자인학과", name: "현대미술사",           credits: 3, code: "FD109", type: "전공기초" },
  { id: "fd110", department: "산업디자인학과", name: "예술과 디자인의 이해", credits: 3, code: "FD110", type: "전공기초" },
  { id: "fd111", department: "산업디자인학과", name: "입체디자인",           credits: 3, code: "FD111", type: "전공기초" },
  { id: "fd112", department: "산업디자인학과", name: "산업디자인리서치",     credits: 3, code: "FD112", type: "전공기초" },

  // 전공필수
  { id: "id2020", department: "산업디자인학과", name: "디자인 프로토타입",  credits: 3, code: "ID2020", type: "전공필수" },
  { id: "id2013", department: "산업디자인학과", name: "조형디자인 1",       credits: 3, code: "ID2013", type: "전공필수" },
  { id: "id2014", department: "산업디자인학과", name: "조형디자인 2",       credits: 3, code: "ID2014", type: "전공필수" },
  { id: "id3010", department: "산업디자인학과", name: "디자인 비즈니스",    credits: 3, code: "ID3010", type: "전공필수" },
  { id: "id2003", department: "산업디자인학과", name: "기초산업디자인 1",   credits: 3, code: "ID2003", type: "전공필수" },
  { id: "id2004", department: "산업디자인학과", name: "기초산업디자인 2",   credits: 3, code: "ID2004", type: "전공필수" },
  { id: "id3012", department: "산업디자인학과", name: "UX 디자인",          credits: 3, code: "ID3012", type: "전공필수" },
  { id: "id4012", department: "산업디자인학과", name: "졸업논문",           credits: 3, code: "ID4012", type: "전공필수" },

  // 전공선택
  { id: "id2001", department: "산업디자인학과", name: "산업디자인사",         credits: 3, code: "ID2001", type: "전공선택" },
  { id: "id2002", department: "산업디자인학과", name: "디지털이미징",         credits: 3, code: "ID2002", type: "전공선택" },
  { id: "id2019", department: "산업디자인학과", name: "디지털입체디자인1",    credits: 3, code: "ID2019", type: "전공선택" },
  { id: "id2022", department: "산업디자인학과", name: "디지털입체디자인2",    credits: 3, code: "ID2022", type: "전공선택" },
  { id: "id2023", department: "산업디자인학과", name: "리빙제품디자인",       credits: 3, code: "ID2023", type: "전공선택" },
  { id: "id3013", department: "산업디자인학과", name: "모빌리티디자인 1",     credits: 3, code: "ID3013", type: "전공선택" },
  { id: "id3014", department: "산업디자인학과", name: "실내공간디자인 1",     credits: 3, code: "ID3014", type: "전공선택" },
  { id: "id3015", department: "산업디자인학과", name: "이노베이티브디자인 1", credits: 3, code: "ID3015", type: "전공선택" },
  { id: "id3017", department: "산업디자인학과", name: "서비스디자인",         credits: 3, code: "ID3017", type: "전공선택" },
  { id: "id3018", department: "산업디자인학과", name: "모빌리티디자인 2",     credits: 3, code: "ID3018", type: "전공선택" },
  { id: "id3019", department: "산업디자인학과", name: "실내공간디자인 2",     credits: 3, code: "ID3019", type: "전공선택" },
  { id: "id3020", department: "산업디자인학과", name: "이노베이티브디자인 2", credits: 3, code: "ID3020", type: "전공선택" },
  { id: "id4014", department: "산업디자인학과", name: "인공지능증강디자인 1", credits: 3, code: "ID4014", type: "전공선택" },
  { id: "id4015", department: "산업디자인학과", name: "스마트융합디자인 1",   credits: 3, code: "ID4015", type: "전공선택" },
  { id: "id4017", department: "산업디자인학과", name: "미래공간디자인 1",     credits: 3, code: "ID4017", type: "전공선택" },
  { id: "id4019", department: "산업디자인학과", name: "산업디자인종합설계 1", credits: 3, code: "ID4019", type: "전공선택" },
  { id: "id4020", department: "산업디자인학과", name: "인공지능증강디자인 2", credits: 3, code: "ID4020", type: "전공선택" },
  { id: "id4021", department: "산업디자인학과", name: "스마트융합디자인 2",   credits: 3, code: "ID4021", type: "전공선택" },
  { id: "id4023", department: "산업디자인학과", name: "미래공간디자인 2",     credits: 3, code: "ID4023", type: "전공선택" },
  { id: "id4024", department: "산업디자인학과", name: "산업디자인종합설계 2", credits: 3, code: "ID4024", type: "전공선택" },
];
