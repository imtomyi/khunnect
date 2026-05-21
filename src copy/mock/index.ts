/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/mock/index.ts                                                   ║
║  역할: mock 데이터의 중앙 진입점 — 도메인별 파일에서 re-export              ║
║                                                                              ║
║  구조:                                                                       ║
║    mock/                                                                     ║
║    ├── index.ts          ← 이 파일 (모든 mock 데이터를 한 곳에서 내보냄)    ║
║    └── domains/                                                              ║
║        ├── organization.ts  : 단과대학, 학과, 분야, 직무 데이터             ║
║        ├── seniors.ts       : 선배 프로필 목록                              ║
║        ├── user.ts          : 현재 유저, 연결 요청, 메시지 데이터           ║
║        ├── curriculum.ts    : 졸업 요건, 과목 카탈로그                      ║
║        └── roadmap.ts       : 로드맵 과목 목록                              ║
║                                                                              ║
║  사용 방법:                                                                  ║
║    import { MOCK_SENIORS, MOCK_USER } from "@/mock";                        ║
║                                                                              ║
║  Supabase 연동 계획:                                                         ║
║    각 도메인의 mock 데이터는 추후 services/ 레이어의 실제 API 호출로 교체.   ║
║    index.ts는 그대로 유지하고, 각 services/ 함수가 직접 호출됨.             ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

// 실제 데이터는 domains/ 폴더 내 각 파일에 있음
// 이 파일은 외부 코드가 "@/mock"에서 일괄 임포트할 수 있도록 re-export만 담당

// 단과대학(College), 학과(Department), 세부분야(Field), 직무(Job) 목 데이터
export { MOCK_COLLEGES, MOCK_DEPARTMENTS, MOCK_FIELDS, MOCK_JOBS } from "./domains/organization";

// 선배 프로필 목 데이터
export { MOCK_SENIORS } from "./domains/seniors";

// 현재 로그인 유저, 연결 요청 목록, 메시지 목 데이터
export { MOCK_USER, MOCK_CONNECTIONS, MOCK_MESSAGES } from "./domains/user";

// 커리큘럼 졸업 요건 (기본값, 학과별), 과목 카탈로그 목 데이터
export { MOCK_CURRICULUM_REQUIREMENTS, MOCK_CURRICULUM_REQUIREMENTS_BY_DEPT, MOCK_CATALOG_COURSES } from "./domains/curriculum";

// 커리어 로드맵 과목 목 데이터
export { MOCK_ROADMAP_COURSES } from "./domains/roadmap";
