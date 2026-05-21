/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  파일: src/app/(main)/roadmap/[dept]/page.tsx                              ║
║  역할: 학과별 세부 분야 목록 페이지                                         ║
║                                                                              ║
║  데이터 흐름:                                                                ║
║    URL 파라미터 [dept] (한국어 학과명, URL 인코딩됨)                         ║
║    → DEPT_EN 룩업으로 영문 학과명 도출                                       ║
║    → DEPT_FIELDS 룩업으로 해당 학과의 세부 분야 목록 도출                    ║
║    → DeptHero (히어로 섹션) + FieldCard 목록 렌더링                          ║
║                                                                              ║
║  의존성:                                                                     ║
║    - ./_lib/constants    : DEPT_EN, DEPT_FIELDS, DEFAULT_FIELDS 상수         ║
║    - ./_components/DeptHero  : 히어로 배너 컴포넌트                          ║
║    - ./_components/FieldCard : 세부 분야 카드 컴포넌트                       ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

"use client";

// Next.js App Router의 동적 라우트 파라미터를 읽기 위한 훅
import { useParams } from "next/navigation";
// 인라인 스타일 타입 지원을 위해 CSSProperties 임포트
import type { CSSProperties } from "react";
// 학과 영문명 매핑, 세부 분야 데이터, 기본 분야 폴백
import { DEPT_EN, DEPT_FIELDS, DEFAULT_FIELDS } from "./_lib/constants";
// 페이지 상단 히어로 배너 (학과명 + 영문명 표시)
import DeptHero from "./_components/DeptHero";
// 개별 세부 분야 카드 (아이콘, 이름, 설명, "로드맵 보기" 링크)
import FieldCard from "./_components/FieldCard";

// ── 인라인 스타일 상수 ──────────────────────────────────────────────────────
// 페이지 전체 폰트 패밀리 지정 (CSS 변수로 Roboto 적용)
const pageStyle: CSSProperties = {
  fontFamily: "var(--font-roboto), sans-serif",
};

// 전체 너비 섹션: 부모 컨테이너 패딩을 무시하고 뷰포트 전체 너비를 사용
// calc(-50vw + 50%)로 좌측 마진을 음수로 당겨 뷰포트 가득 채움
const fullWidthStyle: CSSProperties = {
  marginLeft: "calc(-50vw + 50%)",
  width: "100vw",
};

// 내용 영역: 최대 너비 제한 후 가운데 정렬, 상하좌우 패딩 적용
const contentStyle: CSSProperties = {
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "80px 24px 100px",
};

// 세부 분야 탐색 섹션 하단 여백
const sectionStyle: CSSProperties = {
  marginBottom: "60px",
};

// 섹션 제목 ("세부 분야 탐색") 스타일
const sectionHeadingStyle: CSSProperties = {
  fontSize: "48px",
  fontWeight: 400,
  fontStyle: "normal",
  color: "#1F1A1A",
  lineHeight: "48px",
  letterSpacing: "-1.2px",
  fontFamily: "var(--font-roboto), sans-serif",
  marginBottom: "12px",
};

// 섹션 설명 텍스트 스타일 (포도주색 계열 #5C3F3F)
const sectionDescStyle: CSSProperties = {
  fontSize: "18px",
  fontWeight: 400,
  fontStyle: "normal",
  color: "#5C3F3F",
  lineHeight: "28px",
  fontFamily: "var(--font-roboto), sans-serif",
  marginBottom: "40px",
};

// 세부 분야 카드 그리드: 3열 균등 배치, 16px 간격
const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "16px",
};

/**
 * RoadmapDeptPage
 *
 * 학과별 커리어 로드맵 분야 선택 페이지.
 * URL: /roadmap/[dept]  (예: /roadmap/산업디자인학과)
 *
 * 동작:
 * 1. URL 파라미터에서 학과명(한국어)을 추출하고 디코딩
 * 2. DEPT_EN 맵에서 영문 학과명 조회 (히어로에 표시)
 * 3. DEPT_FIELDS 맵에서 해당 학과의 세부 분야 목록 조회
 *    (데이터 없으면 DEFAULT_FIELDS로 폴백)
 * 4. 히어로 배너 + 3열 카드 그리드 렌더링
 */
export default function RoadmapDeptPage() {
  // URL 파라미터 [dept]에서 학과명 추출 (인코딩된 한국어)
  const { dept } = useParams<{ dept: string }>();
  // URL 인코딩 해제: "산업디자인학과" 같은 한국어로 복원
  const deptName = decodeURIComponent(dept);
  // 영문 학과명 조회 (없으면 빈 문자열 → 히어로에서 영문 표시 생략)
  const deptEn = DEPT_EN[deptName] ?? "";
  // 해당 학과의 세부 분야 목록 (없으면 기본 폴백 데이터 사용)
  const fields = DEPT_FIELDS[deptName] ?? DEFAULT_FIELDS;

  return (
    <div style={pageStyle}>
      {/* 히어로 배너: 학과명(한국어) + 영문명 표시 */}
      <DeptHero deptName={deptName} deptEn={deptEn} />

      {/* 전체 너비 배경을 유지하면서 내용은 최대 너비로 제한 */}
      <div style={fullWidthStyle}>
        <div style={contentStyle}>
          <div style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>
              세부 분야 탐색
            </h2>
            <p style={sectionDescStyle}>
              우리의 환경, 디지털 경험, 그리고 미래의 모빌리티를 형성하는 구체적인 학문 분야를 깊이 있게 살펴보세요.
            </p>

            {/* 세부 분야 카드 3열 그리드 */}
            <div style={gridStyle}>
              {fields.map((field) => (
                // key로 분야명 사용 (같은 학과 내에서는 고유함)
                <FieldCard key={field.name} field={field} deptName={deptName} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
