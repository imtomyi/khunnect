/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/app/(main)/roadmap/[dept]/_components/FieldCard.tsx             ║
║  역할: 세부 분야 카드 컴포넌트 (아이콘 + 분야명 + 설명 + 로드맵 링크)       ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    부모(roadmap/[dept]/page.tsx)에서 field 객체와 deptName을 props로 수신   ║
║    → 카드 형태로 렌더링                                                      ║
║    → "로드맵 보기" 버튼: /roadmap/[deptName]/[fieldId]로 이동               ║
║                                                                              ║
║  의존성:                                                                     ║
║    - next/link         : 클라이언트 사이드 네비게이션                        ║
║    - ./_lib/constants  : DeptField 타입                                      ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

// Next.js Link: 페이지 이동 시 풀 리로드 없이 클라이언트 라우팅
import Link from "next/link";
// 인라인 스타일 타입
import type { CSSProperties } from "react";
// 세부 분야 데이터 타입 (icon, name, description, fieldId)
import type { DeptField } from "../_lib/constants";

/** FieldCardProps - 카드 하나에 필요한 props */
type FieldCardProps = {
  field: DeptField;    // 분야 메타데이터 (아이콘, 이름, 설명, fieldId)
  deptName: string;    // 부모 학과명 (URL 생성에 사용, 한국어 그대로 인코딩)
};

// ── 인라인 스타일 상수 ──────────────────────────────────────────────────────
// 카드 컨테이너: 흰 배경, 둥근 모서리, 세로 flexbox, 고정 높이 360px
const cardStyle: CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  display: "flex",
  height: "360px",
  padding: "24px",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "space-between", // 아이콘/이름/설명/버튼을 균등 분배
  alignSelf: "start",
  justifySelf: "stretch",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  boxSizing: "border-box",
};

// 아이콘 래퍼: 연한 분홍빛 배경의 64x64 정사각형 (SVG 아이콘 중앙 배치)
const iconWrapStyle: CSSProperties = {
  display: "flex",
  width: "64px",
  height: "64px",
  justifyContent: "center",
  alignItems: "center",
  flexShrink: 0,
  borderRadius: "12px",
  backgroundColor: "#FCF1F1",  // 연한 분홍빛 배경 (아이콘 배경)
  fontSize: "28px",
  color: "#9A001F",            // 아이콘 색상 (SVG fill="currentColor"인 경우)
};

// 분야명 텍스트 스타일 (굵고 큰 제목)
const fieldNameStyle: CSSProperties = {
  fontSize: "24px",
  fontWeight: 600,
  fontStyle: "normal",
  color: "#1F1A1A",
  lineHeight: "100%",
  fontFamily: "var(--font-roboto), sans-serif",
  alignSelf: "stretch",
};

// 설명 텍스트 스타일 (중간 크기, 포도주 계열 회색)
const descriptionStyle: CSSProperties = {
  fontSize: "16px",
  fontWeight: 400,
  fontStyle: "normal",
  color: "#5C3F3F",
  lineHeight: "26px",
  fontFamily: "var(--font-roboto), sans-serif",
  alignSelf: "stretch",
};

// "로드맵 보기" 링크 버튼: 브랜드 레드 배경, 흰 텍스트, 그림자
const roadmapLinkStyle: CSSProperties = {
  display: "flex",
  alignSelf: "stretch",        // 카드 너비에 맞춰 가득 채움
  padding: "18px 0",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#9A001F",  // 브랜드 딥 레드
  color: "#FFFFFF",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 600,
  textDecoration: "none",
  boxShadow: "0 4px 12px rgba(154,0,31,0.25)", // 레드 그림자 효과
};

/**
 * FieldCard
 *
 * 세부 분야 하나를 표현하는 카드 컴포넌트.
 * 그리드 내에서 3열 배치되며, 클릭 시 해당 트랙 상세 페이지로 이동.
 *
 * @param field    - 분야 메타데이터
 * @param deptName - 부모 학과명 (URL 인코딩 후 사용)
 */
export default function FieldCard({ field, deptName }: FieldCardProps) {
  return (
    <div style={cardStyle}>
      {/* 아이콘: DeptField.icon은 React.ReactNode이므로 타입 단언으로 렌더링 */}
      <div style={iconWrapStyle}>
        {field.icon as React.ReactNode}
      </div>

      {/* 분야명 제목 */}
      <p style={fieldNameStyle}>
        {field.name}
      </p>

      {/* 분야 설명 텍스트 */}
      <p style={descriptionStyle}>
        {field.description}
      </p>

      {/* 로드맵 보기 링크: 한국어 학과명과 fieldId 슬러그를 URL 인코딩하여 사용 */}
      <Link
        href={`/roadmap/${encodeURIComponent(deptName)}/${field.fieldId}`}
        style={roadmapLinkStyle}
      >
        로드맵 보기
      </Link>
    </div>
  );
}
