/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: roadmap/[dept]/[field]/_components/TrackBreadcrumb.tsx              ║
║  역할: 트랙 상세 페이지 상단 브레드크럼 네비게이션                           ║
║                                                                              ║
║  표시 형태: CAREER PATHS  /  [트랙 영문명]                                  ║
║             (링크, 회색)    (구분기호)  (현재 위치, 레드)                    ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    부모(page.tsx)에서 deptName과 breadcrumbField를 props로 수신             ║
║    → "CAREER PATHS" 클릭 시 /roadmap/[deptName]으로 이동                   ║
║                                                                              ║
║  의존성:                                                                     ║
║    - next/link: 클라이언트 사이드 라우팅                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

// Next.js Link: 클라이언트 라우팅 (풀 리로드 없이 페이지 이동)
import Link from "next/link";
// 인라인 스타일 타입
import type { CSSProperties } from "react";

/** TrackBreadcrumbProps - 브레드크럼 렌더링에 필요한 props */
type TrackBreadcrumbProps = {
  deptName: string;       // 학과명 (한국어, "CAREER PATHS" 링크 href에 인코딩하여 사용)
  breadcrumbField: string; // 현재 트랙 영문명 (예: "UX/UI TRACK", TRACK_META에서 가져옴)
};

// ── 인라인 스타일 상수 ──────────────────────────────────────────────────────
// 브레드크럼 래퍼: 아이템을 가로로 나열, 하단 여백으로 제목과 간격 확보
const wrapperStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "8px",
};

// "CAREER PATHS" 링크 스타일 (회색, 자간 넓게)
const linkStyle: CSSProperties = {
  fontSize: "12px",
  color: "#9CA3AF",         // 비활성 상태를 나타내는 회색
  textDecoration: "none",
  letterSpacing: "1px",     // 대문자 영문 레이블에 넓은 자간 적용
  fontWeight: 500,
};

// "/" 구분기호 스타일
const separatorStyle: CSSProperties = {
  fontSize: "12px",
  color: "#9CA3AF",
};

// 현재 위치(트랙명) 스타일: 브랜드 레드, 굵게
const currentStyle: CSSProperties = {
  fontSize: "12px",
  color: "#9A001F",         // 현재 위치임을 나타내는 브랜드 레드
  letterSpacing: "1px",
  fontWeight: 600,
};

/**
 * TrackBreadcrumb
 *
 * 트랙 상세 페이지 제목 위에 표시되는 브레드크럼.
 * "CAREER PATHS"를 학과 로드맵 페이지 링크로 표시하고,
 * 현재 트랙명(breadcrumbField)을 강조 색상으로 표시.
 *
 * @param deptName       - 학과명 (상위 페이지 링크 생성에 사용)
 * @param breadcrumbField - 현재 트랙 영문명 (TRACK_META.breadcrumbField)
 */
export default function TrackBreadcrumb({ deptName, breadcrumbField }: TrackBreadcrumbProps) {
  return (
    <div style={wrapperStyle}>
      {/* "CAREER PATHS": 학과 로드맵 목록 페이지로 돌아가는 링크 */}
      <Link href={`/roadmap/${encodeURIComponent(deptName)}`} style={linkStyle}>
        CAREER PATHS
      </Link>
      {/* 경로 구분자 */}
      <span style={separatorStyle}>/</span>
      {/* 현재 트랙명: 링크 없음 (현재 위치이므로) */}
      <span style={currentStyle}>
        {breadcrumbField}
      </span>
    </div>
  );
}
