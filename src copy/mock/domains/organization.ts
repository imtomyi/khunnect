/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/mock/domains/organization.ts                                    ║
║  역할: 단과대학 / 학과 / 세부분야 / 직무 mock 데이터                        ║
║                                                                              ║
║  포함 데이터:                                                                ║
║    MOCK_COLLEGES    - 단과대학 목록 (3개: 공과, 경영, 자연과학)              ║
║    MOCK_DEPARTMENTS - 학과 목록 (5개, 각 단과대학에 소속)                   ║
║    MOCK_FIELDS      - 커리어 세부 분야 목록 (6개)                           ║
║    MOCK_JOBS        - 세부 분야별 직무 예시 (3개)                           ║
║                                                                              ║
║  의존성:                                                                     ║
║    - @/types: College, Department, Field, Job 타입                           ║
║                                                                              ║
║  Supabase 연동 시:                                                           ║
║    services/organization.ts에서 실제 DB 데이터로 교체                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

// 단과대학, 학과, 세부분야, 직무 타입 임포트
import type { College, Department, Field, Job } from "@/types";

/**
 * MOCK_COLLEGES
 * 단과대학 목록. 학과는 collegeId로 단과대학을 참조함.
 * 주의: dept-5(산업디자인학과)의 collegeId는 "col-4"인데 여기에 col-4 데이터가 없음.
 * → 예술디자인대학 등 추후 추가 필요한 상태.
 */
export const MOCK_COLLEGES: College[] = [
  { id: "col-1", name: "공과대학" },
  { id: "col-2", name: "경영대학" },
  { id: "col-3", name: "자연과학대학" },
];

/**
 * MOCK_DEPARTMENTS
 * 학과 목록. User.departmentId, Senior.departmentId 등의 참조 대상.
 * - dept-1 ~ dept-4: 공과/경영/자연과학 계열
 * - dept-5: 산업디자인학과 (MOCK_USER의 소속 학과)
 */
export const MOCK_DEPARTMENTS: Department[] = [
  { id: "dept-1", collegeId: "col-1", name: "컴퓨터공학과" },
  { id: "dept-2", collegeId: "col-1", name: "전기전자공학과" },
  { id: "dept-3", collegeId: "col-2", name: "경영학과" },
  { id: "dept-4", collegeId: "col-3", name: "수학과" },
  // col-4가 MOCK_COLLEGES에 없음 — 추후 예술디자인대학 추가 필요
  { id: "dept-5", collegeId: "col-4", name: "산업디자인학과" },
];

/**
 * MOCK_FIELDS
 * 커리어 세부 분야 목록.
 * departmentIds는 해당 분야로 취업 가능한 학과 ID 목록.
 * 여러 학과에서 동일 분야(예: AI/ML)로 갈 수 있어 배열로 표현.
 */
export const MOCK_FIELDS: Field[] = [
  { id: "field-1", name: "프론트엔드",          description: "웹 UI/UX 개발, React/Next.js 등",       departmentIds: ["dept-1"] },
  { id: "field-2", name: "백엔드",              description: "서버, API, 데이터베이스 설계 및 개발",  departmentIds: ["dept-1", "dept-2"] },
  { id: "field-3", name: "AI/ML",               description: "머신러닝, 딥러닝, 데이터 사이언스",     departmentIds: ["dept-1", "dept-4"] },
  { id: "field-4", name: "금융공학",            description: "핀테크, 퀀트, 금융 데이터 분석",        departmentIds: ["dept-3", "dept-4"] },
  { id: "field-5", name: "UX/UI 디자인",        description: "UX 리서치, UI 디자인, 프로토타이핑",    departmentIds: ["dept-5"] },
  { id: "field-6", name: "공간/인테리어 디자인", description: "공간 기획, 인테리어, 환경 디자인",      departmentIds: ["dept-5"] },
];

/**
 * MOCK_JOBS
 * 세부 분야(fieldId)에 연결된 대표 직무 예시.
 * 로드맵 좌측 패널이나 직무 안내 페이지에서 requiredSkills를 배지로 표시.
 * 현재는 field-1, field-2, field-3에 대한 직무만 정의되어 있음.
 */
export const MOCK_JOBS: Job[] = [
  {
    id: "job-1",
    fieldId: "field-1",       // 프론트엔드 분야
    title: "프론트엔드 개발자",
    description: "React/Next.js 기반 웹 서비스를 개발합니다.",
    requiredSkills: ["React", "TypeScript", "CSS", "Next.js"],
  },
  {
    id: "job-2",
    fieldId: "field-2",       // 백엔드 분야
    title: "백엔드 개발자",
    description: "API 서버 설계 및 데이터베이스 관리를 담당합니다.",
    requiredSkills: ["Node.js", "PostgreSQL", "Docker", "AWS"],
  },
  {
    id: "job-3",
    fieldId: "field-3",       // AI/ML 분야
    title: "ML 엔지니어",
    description: "모델 학습, 배포, 데이터 파이프라인을 구축합니다.",
    requiredSkills: ["Python", "PyTorch", "MLflow", "SQL"],
  },
];
