/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/app/(main)/roadmap/[dept]/_lib/constants.tsx                   ║
║  역할: 학과별 영문명, 세부 분야 목록, 기본 폴백 데이터 정의                 ║
║                                                                              ║
║  포함 상수:                                                                  ║
║    DEPT_EN      - 한국어 학과명 → 영문 학과명 매핑                           ║
║    DeptField    - 세부 분야 카드 데이터 타입                                 ║
║    DEPT_FIELDS  - 학과별 세부 분야 목록 (아이콘 + 분야명 + 설명 + fieldId)  ║
║    DEFAULT_FIELDS - 학과 데이터가 없을 때 표시할 기본 폴백 분야 목록         ║
║                                                                              ║
║  사용처:                                                                     ║
║    - roadmap/[dept]/page.tsx : 학과명으로 분야 목록 조회                    ║
║    - roadmap/[dept]/_components/FieldCard.tsx : DeptField 타입 사용         ║
║                                                                              ║
║  의존성:                                                                     ║
║    - ../_components/icons/* : 각 분야 카드에 표시할 SVG 아이콘 컴포넌트     ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

// React.createElement 사용을 위해 React 임포트 (JSX 외부에서 아이콘 생성 시 필요)
import React from "react";
// 각 세부 분야 카드에 사용되는 SVG 아이콘 컴포넌트들
import IconUXUI from "../_components/icons/IconUXUI";       // UI 레이아웃 모양 아이콘
import IconCompas from "../_components/icons/IconCompas";   // 나침반 모양 아이콘 (공간/AI 분야)
import IconMobility from "../_components/icons/IconMobility"; // 자동차/모빌리티 아이콘
import IconProduct from "../_components/icons/IconProduct"; // 제품 아이콘

/**
 * DEPT_EN
 *
 * 한국어 학과명을 키로, 영문 학과명을 값으로 하는 매핑.
 * DeptHero 컴포넌트에서 히어로 섹션 하단 영문 서브타이틀 표시에 사용.
 * 키에 없는 학과는 ""(빈 문자열) 폴백 → DeptHero에서 영문 표시 생략.
 */
export const DEPT_EN: Record<string, string> = {
  "기계공학부": "Department of Mechanical Engineering",
  "산업경영공학과": "Department of Industrial & Management Engineering",
  "원자력공학과": "Department of Nuclear Engineering",
  "화학공학과": "Department of Chemical Engineering",
  "신소재공학과": "Department of Advanced Materials Engineering",
  "사회기반시스템공학과": "Department of Civil & Environmental Engineering",
  "건축공학과": "Department of Architectural Engineering",
  "환경학및환경공학과": "Department of Environmental Science & Engineering",
  "건축학과": "Department of Architecture",
  "산업디자인학과": "Department of Industrial Design",
  "시각디자인학과": "Department of Visual Communication Design",
  "환경조경디자인학과": "Department of Environmental Landscape Design",
  "디지털콘텐츠학과": "Department of Digital Contents",
  "도예학과": "Department of Ceramic Arts",
  "연극영화학화학과": "Department of Theater & Film",
  "PostModern음악과": "Department of PostModern Music",
  "컴퓨터공학과": "Department of Computer Science & Engineering",
  "소프트웨어융합학과": "Department of Software Convergence",
  "인공지능학과": "Department of Artificial Intelligence",
};

/**
 * DeptField
 *
 * 세부 분야 카드 하나에 필요한 데이터 구조.
 * icon은 React.ReactNode로 JSX 또는 createElement 결과를 담음.
 * fieldId는 URL 파라미터 [field]로 사용되는 슬러그 (예: "ux-ui", "ml").
 */
export type DeptField = {
  icon: React.ReactNode; // 카드 상단에 표시할 아이콘 (SVG 컴포넌트 인스턴스)
  name: string;          // 분야 표시명 (예: "UX/UI 디자인")
  description: string;   // 카드 본문 설명 텍스트
  fieldId: string;       // URL 슬러그 (예: "ux-ui", "space", "mobility")
};

/**
 * DEPT_FIELDS
 *
 * 학과별 세부 분야 목록.
 * 키는 한국어 학과명 (URL 디코딩된 형태와 일치해야 함).
 * 값은 DeptField 배열로 FieldCard 그리드에 순서대로 렌더링됨.
 *
 * 현재 정의된 학과: 산업디자인학과, 컴퓨터공학과, 인공지능학과.
 * 나머지 학과는 DEFAULT_FIELDS로 폴백.
 *
 * 아이콘은 JSX 문법이 아닌 React.createElement로 생성 (일반 .tsx 파일이지만
 * 객체 리터럴 내에서 JSX 직접 사용 대신 createElement 사용).
 */
export const DEPT_FIELDS: Record<string, DeptField[]> = {
  "산업디자인학과": [
    {
      icon: React.createElement(IconUXUI),
      name: "UX/UI 디자인",
      description: "철저한 리서치와 사용자 중심 방법론을 통해 직관적이고 편리한 디지털 경험을 설계합니다.",
      fieldId: "ux-ui",
    },
    {
      icon: React.createElement(IconCompas),
      name: "공간 디자인",
      description: "인간의 심리와 공간의 상호작용을 고려하여 기능적이고 미적인 물리적 공간을 디자인합니다.",
      fieldId: "space",
    },
    {
      icon: React.createElement(IconMobility),
      name: "모빌리티 디자인",
      description: "공기역학, 인간공학, 지속가능성에 중점을 둔 혁신적인 차량 디자인으로 미래의 모빌리티를 제안합니다.",
      fieldId: "mobility",
    },
    {
      icon: React.createElement(IconProduct),
      name: "제품 디자인",
      description: "다양한 소비자의 욕구를 파악하여 우리의 실제 삶에 필요한 디자인 제품을 개발을 목표로 합니다.",
      fieldId: "product",
    },
  ],
  "컴퓨터공학과": [
    {
      icon: React.createElement(IconUXUI),
      name: "소프트웨어 공학",
      description: "효율적이고 유지보수 가능한 소프트웨어 시스템을 설계하고 개발합니다.",
      fieldId: "sw-eng",
    },
    {
      icon: React.createElement(IconCompas),
      name: "시스템 프로그래밍",
      description: "운영체제, 컴파일러, 임베디드 시스템 등 저수준 소프트웨어를 다룹니다.",
      fieldId: "sys-prog",
    },
    {
      icon: React.createElement(IconMobility),
      name: "네트워크 / 보안",
      description: "안전하고 신뢰할 수 있는 네트워크 인프라와 사이버 보안 솔루션을 연구합니다.",
      fieldId: "network",
    },
  ],
  "인공지능학과": [
    {
      icon: React.createElement(IconUXUI),
      name: "머신러닝",
      description: "데이터로부터 패턴을 학습하는 알고리즘을 연구하고 실제 문제에 적용합니다.",
      fieldId: "ml",
    },
    {
      icon: React.createElement(IconCompas),
      name: "딥러닝",
      description: "신경망 기반의 모델을 설계하여 이미지, 언어, 음성 등 다양한 분야에 활용합니다.",
      fieldId: "dl",
    },
    {
      icon: React.createElement(IconMobility),
      name: "AI 윤리 / 정책",
      description: "인공지능 기술의 사회적 영향과 책임 있는 AI 개발 방향을 탐구합니다.",
      fieldId: "ai-ethics",
    },
  ],
};

/**
 * DEFAULT_FIELDS
 *
 * DEPT_FIELDS에 해당 학과 데이터가 없을 때 사용하는 폴백 분야 목록.
 * Supabase 연동 완료 전까지 미지원 학과 방문 시 빈 화면 대신 표시됨.
 * description에 Supabase 연동 예정임을 명시.
 */
export const DEFAULT_FIELDS: DeptField[] = [
  {
    icon: React.createElement(IconUXUI),
    name: "세부 분야 1",
    description: "이 학과의 세부 분야에 대한 설명입니다. Supabase 연동 시 실제 데이터로 교체됩니다.",
    fieldId: "field-1",
  },
  {
    icon: React.createElement(IconCompas),
    name: "세부 분야 2",
    description: "이 학과의 세부 분야에 대한 설명입니다. Supabase 연동 시 실제 데이터로 교체됩니다.",
    fieldId: "field-2",
  },
  {
    icon: React.createElement(IconMobility),
    name: "세부 분야 3",
    description: "이 학과의 세부 분야에 대한 설명입니다. Supabase 연동 시 실제 데이터로 교체됩니다.",
    fieldId: "field-3",
  },
];
