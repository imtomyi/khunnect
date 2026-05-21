/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/mock/domains/roadmap.ts                                         ║
║  역할: 커리어 로드맵용 학과별/분야별 과목 mock 데이터                        ║
║                                                                              ║
║  포함 데이터:                                                                ║
║    MOCK_ROADMAP_COURSES - 모든 학과/분야의 로드맵 과목 목록 (플랫 배열)     ║
║                                                                              ║
║  커버하는 학과/분야:                                                         ║
║    산업디자인학과: ux-ui, space, mobility, product (4개 트랙)               ║
║    컴퓨터공학과  : sw-eng, sys-prog, network (3개 트랙)                     ║
║    인공지능학과  : ml, dl, ai-ethics (3개 트랙)                             ║
║                                                                              ║
║  데이터 구조:                                                                ║
║    RoadmapCourse의 플랫 배열 → services/roadmap.ts의                        ║
║    buildTrackFromCourses()에 의해 TrackYear[] 계층 구조로 변환               ║
║                                                                              ║
║  ID 명명 규칙:                                                               ║
║    [학과-약어]-[분야-약어]-[학년]-[학기]-[순번]                              ║
║    예: id-ux-2-1-3 = 산업디자인/ux-ui/2학년/1학기/3번째                     ║
║                                                                              ║
║  의존성:                                                                     ║
║    - @/types: RoadmapCourse 타입                                             ║
║                                                                              ║
║  Supabase 연동 시:                                                           ║
║    services/roadmap.ts의 getTrackCourses()에서 DB 쿼리로 교체               ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

// 로드맵 과목 타입 임포트
import type { RoadmapCourse } from "@/types";

/**
 * MOCK_ROADMAP_COURSES
 *
 * 모든 학과/분야 로드맵 과목의 플랫 배열.
 * services/roadmap.ts의 getTrackCourses(dept, field)가
 * 이 배열을 dept와 field로 필터링하여 반환함.
 *
 * 각 과목은 학년(year)과 학기(semester)를 가지며,
 * buildTrackFromCourses()에 의해 연도/학기 계층으로 그룹화됨.
 */
export const MOCK_ROADMAP_COURSES: RoadmapCourse[] = [
  // ── 산업디자인학과 / UX/UI 디자인 (field: "ux-ui") ──────────────────────
  // 1학년: 디자인 기초 입문
  { id: "id-ux-1-1-1", dept: "산업디자인학과", field: "ux-ui", year: 1, semester: 1, type: "기초", name: "디자인 기초 1",      nameEn: "Basic Design Theory" },
  { id: "id-ux-1-1-2", dept: "산업디자인학과", field: "ux-ui", year: 1, semester: 1, type: "필수", name: "조형 연출",          nameEn: "Visual Styling" },
  { id: "id-ux-1-2-1", dept: "산업디자인학과", field: "ux-ui", year: 1, semester: 2, type: "기초", name: "디자인 기초 2",      nameEn: "Basic Design Theory II" },
  { id: "id-ux-1-2-2", dept: "산업디자인학과", field: "ux-ui", year: 1, semester: 2, type: "필수", name: "조형 연출 2",        nameEn: "Visual Styling II" },
  // 2학년: 인터랙션 및 사용자 리서치
  { id: "id-ux-2-1-1", dept: "산업디자인학과", field: "ux-ui", year: 2, semester: 1, type: "선택", name: "인터랙션 디자인 1",  nameEn: "Interaction Principles" },
  { id: "id-ux-2-1-2", dept: "산업디자인학과", field: "ux-ui", year: 2, semester: 1, type: "선택", name: "사용자 리서치",      nameEn: "User Research" },
  { id: "id-ux-2-1-3", dept: "산업디자인학과", field: "ux-ui", year: 2, semester: 1, type: "선택", name: "프로토타이핑",       nameEn: "Prototyping Techniques" },
  { id: "id-ux-2-2-1", dept: "산업디자인학과", field: "ux-ui", year: 2, semester: 2, type: "선택", name: "인터랙션 디자인 2",  nameEn: "Interaction Principles II" },
  { id: "id-ux-2-2-2", dept: "산업디자인학과", field: "ux-ui", year: 2, semester: 2, type: "필수", name: "디지털 브랜딩",      nameEn: "Digital Branding" },
  { id: "id-ux-2-2-3", dept: "산업디자인학과", field: "ux-ui", year: 2, semester: 2, type: "선택", name: "사용자 경험 디자인", nameEn: "User Experience Design" },
  { id: "id-ux-2-2-4", dept: "산업디자인학과", field: "ux-ui", year: 2, semester: 2, type: "선택", name: "제품 관리",          nameEn: "Product Management" },
  // 3학년: 전략적 UX 심화
  { id: "id-ux-3-1-1", dept: "산업디자인학과", field: "ux-ui", year: 3, semester: 1, type: "선택", name: "사용자 경험 전략",   nameEn: "User Experience Strategy" },
  { id: "id-ux-3-1-2", dept: "산업디자인학과", field: "ux-ui", year: 3, semester: 1, type: "선택", name: "정보 아키텍처",      nameEn: "Information Architecture" },
  { id: "id-ux-3-1-3", dept: "산업디자인학과", field: "ux-ui", year: 3, semester: 1, type: "선택", name: "디자인 시스템",      nameEn: "Design Systems" },
  { id: "id-ux-3-2-1", dept: "산업디자인학과", field: "ux-ui", year: 3, semester: 2, type: "선택", name: "데이터 시각화",      nameEn: "Data Visualization" },
  { id: "id-ux-3-2-2", dept: "산업디자인학과", field: "ux-ui", year: 3, semester: 2, type: "선택", name: "인공지능",           nameEn: "Artificial Intelligence" },
  { id: "id-ux-3-2-3", dept: "산업디자인학과", field: "ux-ui", year: 3, semester: 2, type: "선택", name: "사용자 경험",        nameEn: "User Experience" },
  { id: "id-ux-3-2-4", dept: "산업디자인학과", field: "ux-ui", year: 3, semester: 2, type: "선택", name: "모바일 애플리케이션", nameEn: "Mobile Applications" },
  // 4학년: 졸업 프로젝트 및 포트폴리오
  { id: "id-ux-4-1-1", dept: "산업디자인학과", field: "ux-ui", year: 4, semester: 1, type: "기초", name: "졸업 프로젝트 1",   nameEn: "Capstone Project I" },
  { id: "id-ux-4-2-1", dept: "산업디자인학과", field: "ux-ui", year: 4, semester: 2, type: "기초", name: "졸업 프로젝트 2",   nameEn: "Capstone Project II" },
  { id: "id-ux-4-2-2", dept: "산업디자인학과", field: "ux-ui", year: 4, semester: 2, type: "필수", name: "포트폴리오 완성",    nameEn: "Portfolio Final" },

  // ── 산업디자인학과 / 공간 디자인 (field: "space") ────────────────────────
  // 1학년: 공간 이론 및 드로잉 기초
  { id: "id-sp-1-1-1", dept: "산업디자인학과", field: "space", year: 1, semester: 1, type: "기초", name: "디자인 기초 1",    nameEn: "Basic Design Theory" },
  { id: "id-sp-1-1-2", dept: "산업디자인학과", field: "space", year: 1, semester: 1, type: "기초", name: "공간 이론",        nameEn: "Spatial Theory" },
  { id: "id-sp-1-2-1", dept: "산업디자인학과", field: "space", year: 1, semester: 2, type: "기초", name: "드로잉",           nameEn: "Design Drawing" },
  { id: "id-sp-1-2-2", dept: "산업디자인학과", field: "space", year: 1, semester: 2, type: "기초", name: "모형 제작",        nameEn: "Model Making" },
  // 2학년: 실내 공간 디자인 핵심
  { id: "id-sp-2-1-1", dept: "산업디자인학과", field: "space", year: 2, semester: 1, type: "필수", name: "실내 디자인",      nameEn: "Interior Design" },
  { id: "id-sp-2-1-2", dept: "산업디자인학과", field: "space", year: 2, semester: 1, type: "필수", name: "가구 디자인",      nameEn: "Furniture Design" },
  { id: "id-sp-2-2-1", dept: "산업디자인학과", field: "space", year: 2, semester: 2, type: "필수", name: "조명 디자인",      nameEn: "Lighting Design" },
  { id: "id-sp-2-2-2", dept: "산업디자인학과", field: "space", year: 2, semester: 2, type: "선택", name: "색채 계획",        nameEn: "Color Planning" },
  // 3학년: 전시 및 BIM 심화
  { id: "id-sp-3-1-1", dept: "산업디자인학과", field: "space", year: 3, semester: 1, type: "필수", name: "전시 공간 디자인", nameEn: "Exhibition Design" },
  { id: "id-sp-3-1-2", dept: "산업디자인학과", field: "space", year: 3, semester: 1, type: "선택", name: "BIM 설계",         nameEn: "BIM Design" },
  { id: "id-sp-3-2-1", dept: "산업디자인학과", field: "space", year: 3, semester: 2, type: "선택", name: "브랜드 공간",      nameEn: "Brand Space" },
  { id: "id-sp-3-2-2", dept: "산업디자인학과", field: "space", year: 3, semester: 2, type: "필수", name: "환경 디자인",      nameEn: "Environmental Design" },
  // 4학년: 졸업 프로젝트
  { id: "id-sp-4-1-1", dept: "산업디자인학과", field: "space", year: 4, semester: 1, type: "기초", name: "졸업 프로젝트 1",  nameEn: "Capstone Project I" },
  { id: "id-sp-4-2-1", dept: "산업디자인학과", field: "space", year: 4, semester: 2, type: "기초", name: "졸업 프로젝트 2",  nameEn: "Capstone Project II" },

  // ── 산업디자인학과 / 모빌리티 디자인 (field: "mobility") ─────────────────
  // 1학년: 스케치 및 형태 연구 기초
  { id: "id-mb-1-1-1", dept: "산업디자인학과", field: "mobility", year: 1, semester: 1, type: "기초", name: "디자인 기초 1",    nameEn: "Basic Design Theory" },
  { id: "id-mb-1-1-2", dept: "산업디자인학과", field: "mobility", year: 1, semester: 1, type: "기초", name: "스케치 기법",      nameEn: "Sketching Techniques" },
  { id: "id-mb-1-2-1", dept: "산업디자인학과", field: "mobility", year: 1, semester: 2, type: "기초", name: "형태 연구",        nameEn: "Form Study" },
  { id: "id-mb-1-2-2", dept: "산업디자인학과", field: "mobility", year: 1, semester: 2, type: "기초", name: "인체공학 기초",    nameEn: "Ergonomics Basics" },
  // 2학년: 자동차/CMF 디자인 입문
  { id: "id-mb-2-1-1", dept: "산업디자인학과", field: "mobility", year: 2, semester: 1, type: "필수", name: "자동차 디자인 1",  nameEn: "Automotive Design I" },
  { id: "id-mb-2-1-2", dept: "산업디자인학과", field: "mobility", year: 2, semester: 1, type: "필수", name: "CMF 디자인",       nameEn: "CMF Design" },
  { id: "id-mb-2-2-1", dept: "산업디자인학과", field: "mobility", year: 2, semester: 2, type: "필수", name: "자동차 디자인 2",  nameEn: "Automotive Design II" },
  { id: "id-mb-2-2-2", dept: "산업디자인학과", field: "mobility", year: 2, semester: 2, type: "선택", name: "디지털 클레이",    nameEn: "Digital Clay Modeling" },
  // 3학년: 미래 모빌리티 및 UX
  { id: "id-mb-3-1-1", dept: "산업디자인학과", field: "mobility", year: 3, semester: 1, type: "필수", name: "미래 모빌리티",    nameEn: "Future Mobility" },
  { id: "id-mb-3-1-2", dept: "산업디자인학과", field: "mobility", year: 3, semester: 1, type: "선택", name: "인테리어 패키징",  nameEn: "Interior Packaging" },
  { id: "id-mb-3-2-1", dept: "산업디자인학과", field: "mobility", year: 3, semester: 2, type: "선택", name: "지속가능 디자인",  nameEn: "Sustainable Design" },
  { id: "id-mb-3-2-2", dept: "산업디자인학과", field: "mobility", year: 3, semester: 2, type: "필수", name: "UX 모빌리티",      nameEn: "Mobility UX" },
  // 4학년: 졸업 프로젝트
  { id: "id-mb-4-1-1", dept: "산업디자인학과", field: "mobility", year: 4, semester: 1, type: "기초", name: "졸업 프로젝트 1",  nameEn: "Capstone Project I" },
  { id: "id-mb-4-2-1", dept: "산업디자인학과", field: "mobility", year: 4, semester: 2, type: "기초", name: "졸업 프로젝트 2",  nameEn: "Capstone Project II" },

  // ── 산업디자인학과 / 제품 디자인 (field: "product") ─────────────────────
  // 1학년: 재료/드로잉/3D 기초
  { id: "id-pd-1-1-1", dept: "산업디자인학과", field: "product", year: 1, semester: 1, type: "기초", name: "디자인 기초 1",    nameEn: "Basic Design Theory" },
  { id: "id-pd-1-1-2", dept: "산업디자인학과", field: "product", year: 1, semester: 1, type: "기초", name: "재료와 공정",      nameEn: "Materials & Process" },
  { id: "id-pd-1-2-1", dept: "산업디자인학과", field: "product", year: 1, semester: 2, type: "기초", name: "제품 드로잉",      nameEn: "Product Drawing" },
  { id: "id-pd-1-2-2", dept: "산업디자인학과", field: "product", year: 1, semester: 2, type: "기초", name: "3D 모델링 기초",   nameEn: "3D Modeling Basics" },
  // 2학년: 제품 디자인 및 사용성 연구
  { id: "id-pd-2-1-1", dept: "산업디자인학과", field: "product", year: 2, semester: 1, type: "필수", name: "제품 디자인 1",    nameEn: "Product Design I" },
  { id: "id-pd-2-1-2", dept: "산업디자인학과", field: "product", year: 2, semester: 1, type: "필수", name: "사용성 연구",      nameEn: "Usability Research" },
  { id: "id-pd-2-2-1", dept: "산업디자인학과", field: "product", year: 2, semester: 2, type: "필수", name: "제품 디자인 2",    nameEn: "Product Design II" },
  { id: "id-pd-2-2-2", dept: "산업디자인학과", field: "product", year: 2, semester: 2, type: "선택", name: "브랜딩 전략",      nameEn: "Branding Strategy" },
  // 3학년: 스마트 제품 및 전략
  { id: "id-pd-3-1-1", dept: "산업디자인학과", field: "product", year: 3, semester: 1, type: "필수", name: "스마트 제품",      nameEn: "Smart Product Design" },
  { id: "id-pd-3-1-2", dept: "산업디자인학과", field: "product", year: 3, semester: 1, type: "선택", name: "포장 디자인",      nameEn: "Packaging Design" },
  { id: "id-pd-3-2-1", dept: "산업디자인학과", field: "product", year: 3, semester: 2, type: "선택", name: "지속가능 디자인",  nameEn: "Sustainable Design" },
  { id: "id-pd-3-2-2", dept: "산업디자인학과", field: "product", year: 3, semester: 2, type: "필수", name: "제품 전략",        nameEn: "Product Strategy" },
  // 4학년: 졸업 프로젝트
  { id: "id-pd-4-1-1", dept: "산업디자인학과", field: "product", year: 4, semester: 1, type: "기초", name: "졸업 프로젝트 1",  nameEn: "Capstone Project I" },
  { id: "id-pd-4-2-1", dept: "산업디자인학과", field: "product", year: 4, semester: 2, type: "기초", name: "졸업 프로젝트 2",  nameEn: "Capstone Project II" },

  // ── 컴퓨터공학과 / 소프트웨어 공학 (field: "sw-eng") ─────────────────────
  // 1학년: 프로그래밍 언어 및 수학 기초
  { id: "cs-sw-1-1-1", dept: "컴퓨터공학과", field: "sw-eng",  year: 1, semester: 1, type: "기초", name: "프로그래밍 기초",    nameEn: "Programming Fundamentals" },
  { id: "cs-sw-1-1-2", dept: "컴퓨터공학과", field: "sw-eng",  year: 1, semester: 1, type: "기초", name: "이산수학",           nameEn: "Discrete Mathematics" },
  { id: "cs-sw-1-2-1", dept: "컴퓨터공학과", field: "sw-eng",  year: 1, semester: 2, type: "기초", name: "객체지향 프로그래밍", nameEn: "Object-Oriented Programming" },
  { id: "cs-sw-1-2-2", dept: "컴퓨터공학과", field: "sw-eng",  year: 1, semester: 2, type: "기초", name: "선형대수",           nameEn: "Linear Algebra" },
  // 2학년: 자료구조, 알고리즘, 소프트웨어 공학 핵심
  { id: "cs-sw-2-1-1", dept: "컴퓨터공학과", field: "sw-eng",  year: 2, semester: 1, type: "필수", name: "자료구조",           nameEn: "Data Structures" },
  { id: "cs-sw-2-1-2", dept: "컴퓨터공학과", field: "sw-eng",  year: 2, semester: 1, type: "필수", name: "알고리즘",           nameEn: "Algorithms" },
  { id: "cs-sw-2-2-1", dept: "컴퓨터공학과", field: "sw-eng",  year: 2, semester: 2, type: "필수", name: "소프트웨어 공학",    nameEn: "Software Engineering" },
  { id: "cs-sw-2-2-2", dept: "컴퓨터공학과", field: "sw-eng",  year: 2, semester: 2, type: "선택", name: "데이터베이스",       nameEn: "Database Systems" },
  // 3학년: 운영체제, 웹/클라우드, 테스팅
  { id: "cs-sw-3-1-1", dept: "컴퓨터공학과", field: "sw-eng",  year: 3, semester: 1, type: "필수", name: "운영체제",           nameEn: "Operating Systems" },
  { id: "cs-sw-3-1-2", dept: "컴퓨터공학과", field: "sw-eng",  year: 3, semester: 1, type: "선택", name: "웹 개발",            nameEn: "Web Development" },
  { id: "cs-sw-3-2-1", dept: "컴퓨터공학과", field: "sw-eng",  year: 3, semester: 2, type: "선택", name: "클라우드 컴퓨팅",    nameEn: "Cloud Computing" },
  { id: "cs-sw-3-2-2", dept: "컴퓨터공학과", field: "sw-eng",  year: 3, semester: 2, type: "필수", name: "소프트웨어 테스팅",  nameEn: "Software Testing" },
  // 4학년: 캡스톤 디자인
  { id: "cs-sw-4-1-1", dept: "컴퓨터공학과", field: "sw-eng",  year: 4, semester: 1, type: "기초", name: "캡스톤 디자인 1",   nameEn: "Capstone Design I" },
  { id: "cs-sw-4-2-1", dept: "컴퓨터공학과", field: "sw-eng",  year: 4, semester: 2, type: "기초", name: "캡스톤 디자인 2",   nameEn: "Capstone Design II" },

  // ── 컴퓨터공학과 / 시스템 프로그래밍 (field: "sys-prog") ─────────────────
  // 저수준 프로그래밍: 어셈블리, 컴파일러, 임베디드 시스템
  { id: "cs-sp-1-1-1", dept: "컴퓨터공학과", field: "sys-prog", year: 1, semester: 1, type: "기초", name: "프로그래밍 기초",   nameEn: "Programming Fundamentals" },
  { id: "cs-sp-1-2-1", dept: "컴퓨터공학과", field: "sys-prog", year: 1, semester: 2, type: "기초", name: "컴퓨터 구조",      nameEn: "Computer Architecture" },
  { id: "cs-sp-2-1-1", dept: "컴퓨터공학과", field: "sys-prog", year: 2, semester: 1, type: "필수", name: "시스템 프로그래밍", nameEn: "Systems Programming" },
  { id: "cs-sp-2-1-2", dept: "컴퓨터공학과", field: "sys-prog", year: 2, semester: 1, type: "필수", name: "어셈블리 언어",    nameEn: "Assembly Language" },
  { id: "cs-sp-2-2-1", dept: "컴퓨터공학과", field: "sys-prog", year: 2, semester: 2, type: "필수", name: "운영체제",         nameEn: "Operating Systems" },
  { id: "cs-sp-2-2-2", dept: "컴퓨터공학과", field: "sys-prog", year: 2, semester: 2, type: "선택", name: "임베디드 시스템",  nameEn: "Embedded Systems" },
  { id: "cs-sp-3-1-1", dept: "컴퓨터공학과", field: "sys-prog", year: 3, semester: 1, type: "필수", name: "컴파일러",         nameEn: "Compiler Design" },
  { id: "cs-sp-3-2-1", dept: "컴퓨터공학과", field: "sys-prog", year: 3, semester: 2, type: "선택", name: "실시간 시스템",    nameEn: "Real-Time Systems" },
  { id: "cs-sp-4-1-1", dept: "컴퓨터공학과", field: "sys-prog", year: 4, semester: 1, type: "기초", name: "캡스톤 디자인 1",  nameEn: "Capstone Design I" },
  { id: "cs-sp-4-2-1", dept: "컴퓨터공학과", field: "sys-prog", year: 4, semester: 2, type: "기초", name: "캡스톤 디자인 2",  nameEn: "Capstone Design II" },

  // ── 컴퓨터공학과 / 네트워크·보안 (field: "network") ──────────────────────
  // 네트워크 프로토콜, 사이버 보안, 암호학
  { id: "cs-nw-1-1-1", dept: "컴퓨터공학과", field: "network", year: 1, semester: 1, type: "기초", name: "프로그래밍 기초",   nameEn: "Programming Fundamentals" },
  { id: "cs-nw-1-2-1", dept: "컴퓨터공학과", field: "network", year: 1, semester: 2, type: "기초", name: "컴퓨터 네트워크",  nameEn: "Computer Networks" },
  { id: "cs-nw-2-1-1", dept: "컴퓨터공학과", field: "network", year: 2, semester: 1, type: "필수", name: "네트워크 프로토콜", nameEn: "Network Protocols" },
  { id: "cs-nw-2-2-1", dept: "컴퓨터공학과", field: "network", year: 2, semester: 2, type: "필수", name: "정보 보안",        nameEn: "Information Security" },
  { id: "cs-nw-2-2-2", dept: "컴퓨터공학과", field: "network", year: 2, semester: 2, type: "선택", name: "암호학",           nameEn: "Cryptography" },
  { id: "cs-nw-3-1-1", dept: "컴퓨터공학과", field: "network", year: 3, semester: 1, type: "필수", name: "사이버 보안",      nameEn: "Cybersecurity" },
  { id: "cs-nw-3-2-1", dept: "컴퓨터공학과", field: "network", year: 3, semester: 2, type: "선택", name: "클라우드 보안",    nameEn: "Cloud Security" },
  { id: "cs-nw-4-1-1", dept: "컴퓨터공학과", field: "network", year: 4, semester: 1, type: "기초", name: "캡스톤 디자인 1",  nameEn: "Capstone Design I" },
  { id: "cs-nw-4-2-1", dept: "컴퓨터공학과", field: "network", year: 4, semester: 2, type: "기초", name: "캡스톤 디자인 2",  nameEn: "Capstone Design II" },

  // ── 인공지능학과 / 머신러닝 (field: "ml") ───────────────────────────────
  // Python, 통계, 선형대수 기초 → 지도/비지도/강화학습 → MLOps
  { id: "ai-ml-1-1-1", dept: "인공지능학과", field: "ml",        year: 1, semester: 1, type: "기초", name: "파이썬 프로그래밍", nameEn: "Python Programming" },
  { id: "ai-ml-1-1-2", dept: "인공지능학과", field: "ml",        year: 1, semester: 1, type: "기초", name: "통계학 기초",      nameEn: "Statistics Fundamentals" },
  { id: "ai-ml-1-2-1", dept: "인공지능학과", field: "ml",        year: 1, semester: 2, type: "기초", name: "선형대수",         nameEn: "Linear Algebra" },
  { id: "ai-ml-1-2-2", dept: "인공지능학과", field: "ml",        year: 1, semester: 2, type: "기초", name: "확률과 통계",      nameEn: "Probability & Statistics" },
  { id: "ai-ml-2-1-1", dept: "인공지능학과", field: "ml",        year: 2, semester: 1, type: "필수", name: "머신러닝 기초",    nameEn: "Machine Learning Basics" },
  { id: "ai-ml-2-1-2", dept: "인공지능학과", field: "ml",        year: 2, semester: 1, type: "필수", name: "데이터 전처리",    nameEn: "Data Preprocessing" },
  { id: "ai-ml-2-2-1", dept: "인공지능학과", field: "ml",        year: 2, semester: 2, type: "필수", name: "지도학습",         nameEn: "Supervised Learning" },
  { id: "ai-ml-2-2-2", dept: "인공지능학과", field: "ml",        year: 2, semester: 2, type: "선택", name: "비지도학습",       nameEn: "Unsupervised Learning" },
  { id: "ai-ml-3-1-1", dept: "인공지능학과", field: "ml",        year: 3, semester: 1, type: "필수", name: "강화학습",         nameEn: "Reinforcement Learning" },
  { id: "ai-ml-3-1-2", dept: "인공지능학과", field: "ml",        year: 3, semester: 1, type: "선택", name: "MLOps",           nameEn: "MLOps" },
  { id: "ai-ml-3-2-1", dept: "인공지능학과", field: "ml",        year: 3, semester: 2, type: "선택", name: "추천 시스템",      nameEn: "Recommendation Systems" },
  { id: "ai-ml-3-2-2", dept: "인공지능학과", field: "ml",        year: 3, semester: 2, type: "필수", name: "모델 최적화",      nameEn: "Model Optimization" },
  { id: "ai-ml-4-1-1", dept: "인공지능학과", field: "ml",        year: 4, semester: 1, type: "기초", name: "졸업 연구 1",      nameEn: "Graduate Research I" },
  { id: "ai-ml-4-2-1", dept: "인공지능학과", field: "ml",        year: 4, semester: 2, type: "기초", name: "졸업 연구 2",      nameEn: "Graduate Research II" },

  // ── 인공지능학과 / 딥러닝 (field: "dl") ─────────────────────────────────
  // 신경망 → CNN → 생성 모델 → 컴퓨터 비전
  { id: "ai-dl-1-1-1", dept: "인공지능학과", field: "dl",        year: 1, semester: 1, type: "기초", name: "파이썬 프로그래밍", nameEn: "Python Programming" },
  { id: "ai-dl-1-2-1", dept: "인공지능학과", field: "dl",        year: 1, semester: 2, type: "기초", name: "선형대수",         nameEn: "Linear Algebra" },
  { id: "ai-dl-2-1-1", dept: "인공지능학과", field: "dl",        year: 2, semester: 1, type: "필수", name: "신경망 기초",      nameEn: "Neural Networks" },
  { id: "ai-dl-2-2-1", dept: "인공지능학과", field: "dl",        year: 2, semester: 2, type: "필수", name: "합성곱 신경망",    nameEn: "Convolutional Neural Networks" },
  { id: "ai-dl-2-2-2", dept: "인공지능학과", field: "dl",        year: 2, semester: 2, type: "선택", name: "자연어 처리",      nameEn: "Natural Language Processing" },
  { id: "ai-dl-3-1-1", dept: "인공지능학과", field: "dl",        year: 3, semester: 1, type: "필수", name: "생성 모델",        nameEn: "Generative Models" },
  { id: "ai-dl-3-2-1", dept: "인공지능학과", field: "dl",        year: 3, semester: 2, type: "선택", name: "컴퓨터 비전",      nameEn: "Computer Vision" },
  { id: "ai-dl-4-1-1", dept: "인공지능학과", field: "dl",        year: 4, semester: 1, type: "기초", name: "졸업 연구 1",      nameEn: "Graduate Research I" },
  { id: "ai-dl-4-2-1", dept: "인공지능학과", field: "dl",        year: 4, semester: 2, type: "기초", name: "졸업 연구 2",      nameEn: "Graduate Research II" },

  // ── 인공지능학과 / AI 윤리·정책 (field: "ai-ethics") ─────────────────────
  // AI 개론 → 윤리/정책 → 거버넌스
  { id: "ai-et-1-1-1", dept: "인공지능학과", field: "ai-ethics", year: 1, semester: 1, type: "기초", name: "AI 개론",          nameEn: "Introduction to AI" },
  { id: "ai-et-1-2-1", dept: "인공지능학과", field: "ai-ethics", year: 1, semester: 2, type: "기초", name: "데이터와 사회",    nameEn: "Data & Society" },
  { id: "ai-et-2-1-1", dept: "인공지능학과", field: "ai-ethics", year: 2, semester: 1, type: "필수", name: "AI 윤리",          nameEn: "AI Ethics" },
  { id: "ai-et-2-2-1", dept: "인공지능학과", field: "ai-ethics", year: 2, semester: 2, type: "필수", name: "기술 정책",        nameEn: "Technology Policy" },
  { id: "ai-et-3-1-1", dept: "인공지능학과", field: "ai-ethics", year: 3, semester: 1, type: "필수", name: "책임 있는 AI",     nameEn: "Responsible AI" },
  { id: "ai-et-3-2-1", dept: "인공지능학과", field: "ai-ethics", year: 3, semester: 2, type: "선택", name: "AI 거버넌스",      nameEn: "AI Governance" },
  { id: "ai-et-4-1-1", dept: "인공지능학과", field: "ai-ethics", year: 4, semester: 1, type: "기초", name: "졸업 연구 1",      nameEn: "Graduate Research I" },
  { id: "ai-et-4-2-1", dept: "인공지능학과", field: "ai-ethics", year: 4, semester: 2, type: "기초", name: "졸업 연구 2",      nameEn: "Graduate Research II" },
];
