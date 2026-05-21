/**
 * @file src/lib/roadmapColors.ts
 * @description 로드맵 과목 유형별 색상 상수 정의
 *
 * 역할:
 *  - 전공기초 / 전공필수 / 전공선택 세 가지 과목 유형에 대한 색상과 레이블을 중앙 관리한다.
 *  - 과목 카드의 border 색상, 범례(legend) dot 색상 등 UI 요소에 자동으로 연동된다.
 *  - 색상 값을 이 파일 한 곳에서만 변경하면 연동된 모든 UI에 반영된다.
 *
 * Export:
 *  - COURSE_TYPE_COLORS  — 과목 유형 → { dot 색상, 표시 레이블 } 매핑 객체
 *
 * 사용처:
 *  - 로드맵 과목 카드 컴포넌트 (border 색상 결정)
 *  - 로드맵 범례(legend) 컴포넌트 (dot 색상 및 레이블 표시)
 */

// @/types 에 정의된 RoadmapCourseType 유니온 타입을 가져온다.
// 이 타입은 "기초" | "필수" | "선택" 세 가지 값을 가진다.
import type { RoadmapCourseType } from "@/types"; // 로드맵 과목 유형 유니온 타입

/** 전공 유형별 색상 — 과목 카드 border, 범례 dot에 자동 연동 */
// Record<RoadmapCourseType, ...> 사용으로 세 유형 모두 빠짐없이 정의하도록 타입이 강제한다.
export const COURSE_TYPE_COLORS: Record<RoadmapCourseType, { dot: string; label: string }> = {
  기초: { dot: "#094F7A", label: "전공기초" }, // 짙은 파란색 — 전공기초 과목
  필수: { dot: "#735B24", label: "전공필수" }, // 갈색 계열 — 전공필수 과목
  선택: { dot: "#9A001F", label: "전공선택" }, // 어두운 빨간색 — 전공선택 과목
};
