// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  SeniorsHero.tsx — 선배 디렉토리 히어로 배너 컴포넌트                       ║
// ║                                                                          ║
// ║  역할:                                                                    ║
// ║    선배 디렉토리 페이지 상단에 표시되는 전폭(full-width) 배너.              ║
// ║    제목("선배 디렉토리")과 부제 문구를 정중앙에 표시한다.                   ║
// ║                                                                          ║
// ║  데이터 흐름:                                                              ║
// ║    Props 없음 — 순수 정적 UI 컴포넌트                                      ║
// ║                                                                          ║
// ║  디자인 특이사항:                                                          ║
// ║    marginLeft: calc(-50vw + 50%)  → 부모의 max-width 제약을 벗어나        ║
// ║    화면 전체 너비로 확장하는 CSS 트릭을 사용한다.                           ║
// ║    marginTop: calc(-49.54px)      → Navbar 높이만큼 올려 배너가             ║
// ║    Navbar 바로 아래 자연스럽게 이어지도록 한다.                             ║
// ╚══════════════════════════════════════════════════════════════════════════╝

"use client";

// CSSProperties: 인라인 스타일 객체에 TypeScript 타입 안전성을 부여
import type { CSSProperties } from "react";

// ── 인라인 스타일 상수 ─────────────────────────────────────────────────────

/**
 * 히어로 섹션 컨테이너 스타일
 * - marginLeft / width 조합으로 부모 컨테이너 너비를 벗어나 뷰포트 전체를 채움
 * - marginTop 음수값으로 Navbar와의 간격을 제거
 */
const heroStyle: CSSProperties = {
  backgroundColor: "#FFF8F7",       // 연한 크림 핑크 배경 — 브랜드 컬러 팔레트
  padding: "80px 0 150px",          // 위 80px / 아래 150px — 넉넉한 여백으로 시선 집중
  textAlign: "center",
  marginBottom: "60px",             // 아래 본문과의 간격
  marginLeft: "calc(-50vw + 50%)",  // 부모 max-width를 무시하고 좌측 끝까지 확장
  marginTop: "calc(-49.54px)",      // Navbar 높이(49.54px)만큼 위로 올려 배너를 Navbar에 밀착
  width: "100vw",                   // 뷰포트 전체 너비
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

/** 메인 제목 스타일 — 굵고 큰 폰트로 섹션 정체성 표현 */
const headingStyle: CSSProperties = {
  fontSize: "36px",
  fontWeight: 700,
  color: "#1F1A1A",
  marginBottom: "16px",
};

/** 부제 설명 문구 스타일 — 세부 안내, 연한 갈색 계열 */
const subTextStyle: CSSProperties = {
  fontSize: "15px",
  color: "#5C3F3F",
  fontWeight: 400,
};

// ── 컴포넌트 ──────────────────────────────────────────────────────────────

/**
 * SeniorsHero
 *
 * 선배 디렉토리 페이지 최상단에 렌더되는 정적 배너.
 * 별도 상태나 Props 없이 항상 동일한 내용을 표시한다.
 */
export default function SeniorsHero() {
  return (
    <div style={heroStyle}>
      {/* 섹션 메인 제목 */}
      <h1 style={headingStyle}>선배 디렉토리</h1>
      {/* 섹션 부제 — 사용자에게 페이지 목적 안내 */}
      <p style={subTextStyle}>
        당신이 가고자 하는 길을 먼저 성공적으로 걸어간 학업 베테랑들을 만나보세요.
      </p>
    </div>
  );
}
