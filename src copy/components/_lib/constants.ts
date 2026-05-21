// ╔══════════════════════════════════════════════════════════════════════╗
// ║  파일: src/components/_lib/constants.ts                             ║
// ║  역할: Navbar의 메가 드롭다운 메뉴에 사용되는 데이터 상수 모음            ║
// ║        학과 목록과 대학 그룹을 정의하고, 각 메뉴 항목의 링크를 생성       ║
// ║                                                                      ║
// ║  내보내기:                                                            ║
// ║    - MegaMenuItem    (타입) : 개별 메뉴 항목 { label, href }           ║
// ║    - MegaMenuGroup   (타입) : 대학 그룹 { title, items }               ║
// ║    - SENIORS_MEGA_MENU      : 선배와의 연결 메뉴 데이터                 ║
// ║    - ROADMAP_MEGA_MENU      : 커리어 로드맵 메뉴 데이터                 ║
// ║                                                                      ║
// ║  사용처:                                                              ║
// ║    - src/components/Navbar.tsx            (메뉴 데이터 소비)           ║
// ║    - src/components/_components/MegaDropdown.tsx (렌더링)             ║
// ╚══════════════════════════════════════════════════════════════════════╝

// ── 공통 타입 ──────────────────────────────────────────────────────────────

/** 메가 드롭다운의 개별 링크 항목 */
export type MegaMenuItem = { label: string; href: string };

/** 메가 드롭다운의 대학 단위 그룹 — 제목(대학명) + 항목(학과) 목록 */
export type MegaMenuGroup = { title: string; items: MegaMenuItem[] };

// ── 선배와의 연결 메가 메뉴 ───────────────────────────────────────────────
// 각 학과를 클릭하면 /seniors?dept=[학과명] 쿼리 파라미터로 이동
// encodeURIComponent: 한글 학과명을 URL-safe 문자열로 인코딩

export const SENIORS_MEGA_MENU: MegaMenuGroup[] = [
  {
    title: "공과대학",
    // 학과 이름 배열을 map으로 { label, href } 객체 배열로 변환
    // dept 쿼리 파라미터를 통해 선배 목록 페이지에서 학과 필터링에 사용
    items: [
      "기계공학부", "산업경영공학과", "원자력공학과", "화학공학과",
      "신소재공학과", "사회기반시스템공학과", "건축공학과", "환경학및환경공학과", "건축학과",
    ].map((d) => ({ label: d, href: `/seniors?dept=${encodeURIComponent(d)}` })),
  },
  {
    title: "예술디자인대학",
    items: [
      "산업디자인학과", "시각디자인학과", "환경조경디자인학과",
      "디지털콘텐츠학과", "도예학과", "연극영화학화학과", "PostModern음악과",
    ].map((d) => ({ label: d, href: `/seniors?dept=${encodeURIComponent(d)}` })),
  },
  {
    title: "소프트웨어융합대학",
    items: [
      "컴퓨터공학과", "소프트웨어융합학과", "인공지능학과",
    ].map((d) => ({ label: d, href: `/seniors?dept=${encodeURIComponent(d)}` })),
  },
];

// ── 커리어 로드맵 메가 메뉴 ───────────────────────────────────────────────
// 선배와의 연결과 동일한 학과 목록을 사용하지만, href는 /roadmap/[학과명] 으로 연결
// 경로 구조가 다르므로(쿼리 파라미터 → 동적 라우트) 별도 상수로 분리

export const ROADMAP_MEGA_MENU: MegaMenuGroup[] = [
  {
    title: "공과대학",
    // /roadmap/[학과명] 동적 라우트를 사용 — 선배 메뉴와 달리 쿼리 파라미터 아닌 경로 세그먼트
    items: [
      "기계공학부", "산업경영공학과", "원자력공학과", "화학공학과",
      "신소재공학과", "사회기반시스템공학과", "건축공학과", "환경학및환경공학과", "건축학과",
    ].map((d) => ({ label: d, href: `/roadmap/${encodeURIComponent(d)}` })),
  },
  {
    title: "예술디자인대학",
    items: [
      "산업디자인학과", "시각디자인학과", "환경조경디자인학과",
      "디지털콘텐츠학과", "도예학과", "연극영화학화학과", "PostModern음악과",
    ].map((d) => ({ label: d, href: `/roadmap/${encodeURIComponent(d)}` })),
  },
  {
    title: "소프트웨어융합대학",
    items: [
      "컴퓨터공학과", "소프트웨어융합학과", "인공지능학과",
    ].map((d) => ({ label: d, href: `/roadmap/${encodeURIComponent(d)}` })),
  },
];
