/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/app/(main)/roadmap/[dept]/_components/DeptHero.tsx              ║
║  역할: 학과 로드맵 페이지 상단 히어로 배너 컴포넌트                          ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    부모(roadmap/[dept]/page.tsx)에서 학과명과 영문명을 props로 수신         ║
║    → 분홍빛 배경 전체 너비 배너로 렌더링                                     ║
║    → deptEn이 빈 문자열이면 영문 서브타이틀 미표시                           ║
║                                                                              ║
║  레이아웃 특이사항:                                                          ║
║    - marginLeft: calc(-50vw + 50%)로 부모 컨테이너 패딩을 뚫고               ║
║      뷰포트 전체 너비로 배치 (fullbleed 기법)                                ║
║    - marginTop: calc(-49.54px)로 네비게이션바 아래 공백을 메움               ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

// 인라인 스타일 타입 임포트
import type { CSSProperties } from "react";

/** DeptHeroProps - 부모에서 전달받는 props 타입 */
type DeptHeroProps = {
  deptName: string; // 한국어 학과명 (예: "산업디자인학과")
  deptEn: string;   // 영문 학과명 (예: "Department of Industrial Design"), 없으면 빈 문자열
};

// ── 인라인 스타일 상수 ──────────────────────────────────────────────────────
// 히어로 섹션 전체 래퍼: 분홍빛 배경, 뷰포트 전체 너비, 세로 중앙 정렬
const heroStyle: CSSProperties = {
  backgroundColor: "#FFF8F7",          // 연한 분홍빛 배경 (브랜드 컬러 계열)
  padding: "80px 0 100px",
  textAlign: "center",
  // fullbleed 기법: 부모 max-width 컨테이너를 벗어나 뷰포트 가득 채움
  marginLeft: "calc(-50vw + 50%)",
  // 네비게이션바 높이(49.54px)만큼 위로 당겨서 네비바 바로 아래에 붙임
  marginTop: "calc(-49.54px)",
  width: "100vw",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
};

// 학과명(한국어) 대형 제목 스타일
const headingStyle: CSSProperties = {
  fontSize: "40px",
  fontWeight: 700,
  color: "#1F1A1A",
};

// 영문 학과명 서브타이틀 스타일 (브랜드 레드 계열 #9A001F)
const subheadingStyle: CSSProperties = {
  fontSize: "15px",
  color: "#9A001F",
  fontWeight: 400,
};

/**
 * DeptHero
 *
 * 학과 로드맵 페이지 최상단에 표시되는 히어로 배너.
 * 학과명을 크게 표시하고, 영문명이 있으면 아래에 부제목으로 표시.
 *
 * @param deptName - 한국어 학과명
 * @param deptEn   - 영문 학과명 (빈 문자열이면 미표시)
 */
export default function DeptHero({ deptName, deptEn }: DeptHeroProps) {
  return (
    <div style={heroStyle}>
      {/* 한국어 학과명 메인 제목 */}
      <h1 style={headingStyle}>
        {deptName}
      </h1>
      {/* 영문 학과명은 데이터가 있을 때만 렌더링 (DEPT_EN에 없는 학과는 미표시) */}
      {deptEn && (
        <p style={subheadingStyle}>
          {deptEn}
        </p>
      )}
    </div>
  );
}
