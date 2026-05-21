/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/app/(main)/roadmap/[dept]/[field]/_lib/constants.ts             ║
║  역할: 트랙(분야)별 메타데이터 및 기본 폴백 정의                             ║
║                                                                              ║
║  포함 상수:                                                                  ║
║    TrackMeta    - 트랙 메타데이터 타입                                       ║
║    TRACK_META   - fieldId → TrackMeta 매핑 (10개 트랙 지원)                 ║
║    DEFAULT_META - 알 수 없는 fieldId에 대한 폴백 메타데이터                  ║
║                                                                              ║
║  TrackMeta 필드 설명:                                                        ║
║    title         : 페이지 좌측 패널 제목                                     ║
║    breadcrumbField: 상단 브레드크럼에 표시되는 영문 트랙명                   ║
║    jobDefinition : 직무 정의 텍스트 (Job Definition 섹션)                   ║
║    coreSkills    : 핵심 기술 스택 배지 목록                                  ║
║    dataInsights  : 선배들의 필수 강의 비율 데이터 (프로그레스 바용)           ║
║                                                                              ║
║  사용처:                                                                     ║
║    - roadmap/[dept]/[field]/page.tsx : fieldId로 메타 조회                  ║
║    - TrackLeftPanel : title, jobDefinition, coreSkills, dataInsights 표시   ║
║    - TrackBreadcrumb : breadcrumbField 표시                                  ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

/**
 * TrackMeta
 *
 * 특정 커리어 트랙(분야)의 UI 표시에 필요한 메타데이터 타입.
 */
export type TrackMeta = {
  title: string;                                     // 좌측 패널 상단 제목 (예: "UX/UI 디자인 트랙 상세 탐색")
  breadcrumbField: string;                           // 브레드크럼 현재 위치 텍스트 (예: "UX/UI TRACK")
  jobDefinition: string;                             // 직무 전문가에 대한 한 문장 정의
  coreSkills: string[];                              // 핵심 기술/역량 태그 목록 (배지로 표시)
  dataInsights: { label: string; percent: number }[]; // 선배 데이터 기반 필수 강의 비율 (프로그레스 바)
};

/**
 * TRACK_META
 *
 * fieldId(슬러그)를 키로 하는 트랙 메타데이터 매핑.
 * roadmap/[dept]/[field]/page.tsx에서 URL 파라미터 fieldId로 조회.
 *
 * 지원 트랙: ux-ui, space, mobility, product (산업디자인)
 *            sw-eng, sys-prog, network (컴퓨터공학)
 *            ml, dl, ai-ethics (인공지능)
 *
 * dataInsights의 percent 값은 선배들의 실제 수강 데이터를 기반으로 한 가상 수치.
 */
export const TRACK_META: Record<string, TrackMeta> = {
  // ── 산업디자인학과 트랙 ─────────────────────────────────────────────────
  "ux-ui": {
    title: "UX/UI 디자인 트랙 상세 탐색",
    breadcrumbField: "UX/UI TRACK",
    jobDefinition: "사용자 경험을 설계하고 디지털 인터페이스를 시각화하여 비즈니스 가치를 창출하는 창의적 전략가.",
    coreSkills: ["User Research", "Prototyping", "Visual Identity", "Design System"],
    dataInsights: [
      { label: "사용자 경험 디자인", percent: 94 },
      { label: "인터렉션 디자인", percent: 88 },
      { label: "디자인 시스템", percent: 82 },
    ],
  },
  "space": {
    title: "공간 디자인 트랙 상세 탐색",
    breadcrumbField: "SPACE DESIGN TRACK",
    jobDefinition: "인간의 심리와 공간의 상호작용을 고려하여 기능적이고 미적인 물리적 공간을 디자인합니다.",
    coreSkills: ["Interior Design", "BIM", "Lighting", "Spatial Planning"],
    dataInsights: [
      { label: "실내 디자인", percent: 91 },
      { label: "공간 기획", percent: 85 },
      { label: "BIM 설계", percent: 78 },
    ],
  },
  "mobility": {
    title: "모빌리티 디자인 트랙 상세 탐색",
    breadcrumbField: "MOBILITY DESIGN TRACK",
    jobDefinition: "공기역학, 인간공학, 지속가능성에 중점을 둔 혁신적인 차량 디자인으로 미래의 모빌리티를 제안합니다.",
    coreSkills: ["Automotive Design", "CMF", "Ergonomics", "3D Modeling"],
    dataInsights: [
      { label: "자동차 디자인", percent: 90 },
      { label: "CMF 디자인", percent: 83 },
      { label: "미래 모빌리티", percent: 76 },
    ],
  },
  "product": {
    title: "제품 디자인 트랙 상세 탐색",
    breadcrumbField: "PRODUCT DESIGN TRACK",
    jobDefinition: "다양한 소비자의 욕구를 파악하여 우리의 실제 삶에 필요한 디자인 제품 개발을 목표로 합니다.",
    coreSkills: ["Product Design", "Usability", "3D Modeling", "Branding"],
    dataInsights: [
      { label: "제품 디자인", percent: 92 },
      { label: "사용성 연구", percent: 86 },
      { label: "스마트 제품", percent: 79 },
    ],
  },

  // ── 컴퓨터공학과 트랙 ─────────────────────────────────────────────────
  "sw-eng": {
    title: "소프트웨어 공학 트랙 상세 탐색",
    breadcrumbField: "SOFTWARE ENGINEERING TRACK",
    jobDefinition: "효율적이고 유지보수 가능한 소프트웨어 시스템을 설계하고 개발하는 공학자.",
    coreSkills: ["Algorithms", "OS", "Database", "Cloud"],
    dataInsights: [
      { label: "알고리즘", percent: 95 },
      { label: "소프트웨어 공학", percent: 89 },
      { label: "클라우드 컴퓨팅", percent: 80 },
    ],
  },
  "sys-prog": {
    title: "시스템 프로그래밍 트랙 상세 탐색",
    breadcrumbField: "SYSTEMS PROGRAMMING TRACK",
    jobDefinition: "운영체제, 컴파일러, 임베디드 시스템 등 저수준 소프트웨어를 다루는 시스템 엔지니어.",
    coreSkills: ["C/C++", "Assembly", "OS", "Compiler"],
    dataInsights: [
      { label: "운영체제", percent: 93 },
      { label: "시스템 프로그래밍", percent: 87 },
      { label: "컴파일러", percent: 75 },
    ],
  },
  "network": {
    title: "네트워크 / 보안 트랙 상세 탐색",
    breadcrumbField: "NETWORK & SECURITY TRACK",
    jobDefinition: "안전하고 신뢰할 수 있는 네트워크 인프라와 사이버 보안 솔루션을 연구하는 전문가.",
    coreSkills: ["Networking", "Cryptography", "Security", "Cloud"],
    dataInsights: [
      { label: "사이버 보안", percent: 92 },
      { label: "네트워크 프로토콜", percent: 86 },
      { label: "클라우드 보안", percent: 78 },
    ],
  },

  // ── 인공지능학과 트랙 ─────────────────────────────────────────────────
  "ml": {
    title: "머신러닝 트랙 상세 탐색",
    breadcrumbField: "MACHINE LEARNING TRACK",
    jobDefinition: "데이터로부터 패턴을 학습하는 알고리즘을 연구하고 실제 문제에 적용하는 ML 엔지니어.",
    coreSkills: ["Python", "Scikit-learn", "MLOps", "Statistics"],
    dataInsights: [
      { label: "머신러닝", percent: 95 },
      { label: "강화학습", percent: 84 },
      { label: "MLOps", percent: 77 },
    ],
  },
  "dl": {
    title: "딥러닝 트랙 상세 탐색",
    breadcrumbField: "DEEP LEARNING TRACK",
    jobDefinition: "신경망 기반의 모델을 설계하여 이미지, 언어, 음성 등 다양한 분야에 활용하는 연구자.",
    coreSkills: ["PyTorch", "CNN", "Transformer", "Computer Vision"],
    dataInsights: [
      { label: "신경망", percent: 94 },
      { label: "컴퓨터 비전", percent: 88 },
      { label: "생성 모델", percent: 81 },
    ],
  },
  "ai-ethics": {
    title: "AI 윤리 / 정책 트랙 상세 탐색",
    breadcrumbField: "AI ETHICS & POLICY TRACK",
    jobDefinition: "인공지능 기술의 사회적 영향과 책임 있는 AI 개발 방향을 탐구하는 정책 전문가.",
    coreSkills: ["AI Ethics", "Policy", "Governance", "Responsible AI"],
    dataInsights: [
      { label: "AI 윤리", percent: 90 },
      { label: "기술 정책", percent: 83 },
      { label: "AI 거버넌스", percent: 76 },
    ],
  },
};

/**
 * DEFAULT_META
 *
 * TRACK_META에 해당 fieldId가 없을 때 사용하는 폴백 메타데이터.
 * 비어있는 coreSkills와 dataInsights로 좌측 패널이 빈 상태로 렌더링됨.
 */
export const DEFAULT_META: TrackMeta = {
  title: "트랙 상세 탐색",
  breadcrumbField: "TRACK",
  jobDefinition: "이 분야의 전문가로 성장하기 위한 커리큘럼을 탐색하세요.",
  coreSkills: [],    // 빈 배열 → 스킬 배지 섹션이 빈 상태로 표시
  dataInsights: [],  // 빈 배열 → 데이터 인사이트 섹션이 빈 상태로 표시
};
