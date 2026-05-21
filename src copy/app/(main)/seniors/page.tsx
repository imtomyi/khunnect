// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  seniors/page.tsx — 선배 디렉토리 목록 페이지                              ║
// ║                                                                          ║
// ║  역할:                                                                    ║
// ║    URL 쿼리 파라미터 ?dept=학과명 을 읽어 해당 학과의 선배 목록을 표시한다.  ║
// ║    SeniorsHero(히어로 배너) + SeniorCard(카드 그리드) 로 구성된다.          ║
// ║                                                                          ║
// ║  데이터 흐름:                                                              ║
// ║    URL ?dept → getDepartments() → getSeniors({departmentId}) → 렌더       ║
// ║                                                                          ║
// ║  의존성:                                                                  ║
// ║    - @/services/seniors   : getSeniors API 호출                           ║
// ║    - @/services/roadmap   : getDepartments API 호출                       ║
// ║    - @/types              : Senior, Department 타입 정의                   ║
// ║    - SeniorsHero          : 상단 배너 컴포넌트                             ║
// ║    - SeniorCard           : 개별 선배 카드 컴포넌트                         ║
// ╚══════════════════════════════════════════════════════════════════════════╝

"use client";

// React 훅: 상태 관리(useState), 사이드 이펙트(useEffect), Suspense 경계용
import { useState, useEffect, Suspense } from "react";
// Next.js 클라이언트 훅: URL 쿼리 파라미터(?dept=…)를 읽기 위해 사용
import { useSearchParams } from "next/navigation";
// 선배 목록 API 서비스 — Supabase 또는 목 데이터를 추상화
import { getSeniors } from "@/services/seniors";
// 학과 목록 API 서비스 — dept ID 조회에 사용
import { getDepartments } from "@/services/roadmap";
// 타입 정의 — API 응답 형태를 보장하기 위해 import
import type { Senior, Department } from "@/types";
import type { CSSProperties } from "react";
// 히어로 배너 컴포넌트 — 제목과 설명 문구를 렌더링
import SeniorsHero from "./_components/SeniorsHero";
// 개별 선배 카드 컴포넌트 — 그리드 내 각 카드에 사용
import SeniorCard from "./_components/SeniorCard";

// ── 인라인 스타일 상수 ─────────────────────────────────────────────────────
// 컴포넌트 외부에 정의해 리렌더링 시 객체 재생성을 방지한다

/** 페이지 전체 래퍼 — Roboto 폰트를 적용 */
const pageWrapperStyle: CSSProperties = {
  fontFamily: "var(--font-roboto), sans-serif",
};

/** 본문 영역 — 최대 너비 1280px, 상하 여백 확보 */
const bodyStyle: CSSProperties = {
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "0 24px 80px",
};

/** 학과명 제목 스타일 */
const headingStyle: CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  color: "#1F1A1A",
  marginBottom: "20px",
};

/** 결과가 없을 때 표시하는 안내 문구 스타일 */
const emptyTextStyle: CSSProperties = {
  color: "#9CA3AF",
  fontSize: "15px",
};

/** 선배 카드를 3열 그리드로 배치 */
const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "24px",
};

// ── 내부 컴포넌트 ─────────────────────────────────────────────────────────
// useSearchParams()는 Suspense 경계 내부에서만 사용 가능하므로
// SeniorsPage(외부)와 SeniorsPageInner(내부)로 분리한다.

/**
 * SeniorsPageInner
 *
 * 실제 데이터 로딩 및 렌더링을 담당하는 내부 컴포넌트.
 * Suspense 경계 안에서 렌더되어야 useSearchParams()가 정상 동작한다.
 */
function SeniorsPageInner() {
  // URL 쿼리 파라미터 객체 — ?dept=컴퓨터공학과 형태로 학과 필터링
  const searchParams = useSearchParams();
  // 쿼리에서 'dept' 값을 추출 (없으면 null)
  const deptName = searchParams.get("dept");

  // seniors: 현재 표시할 선배 목록 — API 응답으로 채워짐
  const [seniors, setSeniors] = useState<Senior[]>([]);
  // departments: 전체 학과 목록 — dept 이름 → ID 변환에 사용
  const [departments, setDepartments] = useState<Department[]>([]);

  // ── 학과 목록 로드 ──
  // 컴포넌트 마운트 시 1회 실행 — 이후 dept ID 조회의 기반 데이터
  useEffect(() => {
    getDepartments().then(setDepartments);
  }, []);

  // ── 선배 목록 로드 ──
  // departments가 로드된 후, deptName이 바뀔 때마다 재실행
  useEffect(() => {
    // departments가 아직 비어 있으면 실행 불가 (dept ID를 모름)
    if (departments.length === 0) return;
    // dept 쿼리가 없으면 빈 목록을 보여줌 (전체 선배를 무분별하게 로드하지 않음)
    if (!deptName) { setSeniors([]); return; }
    // 학과 이름으로 ID를 역조회하여 API에 전달
    const dept = departments.find((d) => d.name === deptName);
    getSeniors({ departmentId: deptName }).then(setSeniors);
  }, [deptName, departments]);

  return (
    <div style={pageWrapperStyle}>

      {/* 상단 히어로 배너 — 제목/설명 표시 */}
      <SeniorsHero />

      {/* ── 본문 ── */}
      <div style={bodyStyle}>

        {/* 현재 선택된 학과명을 제목으로 표시; dept 없으면 '전체 선배' */}
        <h2 style={headingStyle}>
          {deptName ?? "전체 선배"}
        </h2>

        {/* 선배가 없을 때 안내 문구, 있을 때 3열 카드 그리드 렌더 */}
        {seniors.length === 0 ? (
          <p style={emptyTextStyle}>
            조건에 맞는 선배가 없습니다.
          </p>
        ) : (
          <div style={gridStyle}>
            {seniors.map((senior) => (
              // key로 senior.id 사용 — 리스트 재조정 최적화
              <SeniorCard key={senior.id} senior={senior} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 외부(export) 컴포넌트 ───────────────────────────────────────────────────

/**
 * SeniorsPage
 *
 * Next.js App Router의 page 컴포넌트.
 * useSearchParams()를 사용하는 SeniorsPageInner를 Suspense로 감싸
 * 쿼리 파라미터 스트리밍 시 fallback UI를 제공한다.
 */
export default function SeniorsPage() {
  return (
    // fallback={<div />}: 로딩 중에는 빈 div를 표시 (레이아웃 유지)
    <Suspense fallback={<div />}>
      <SeniorsPageInner />
    </Suspense>
  );
}
