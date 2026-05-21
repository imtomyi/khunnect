// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  mypage/page.tsx — 마이페이지 메인                                         ║
// ║                                                                          ║
// ║  역할:                                                                    ║
// ║    로그인한 사용자의 개인 정보, 달력, 스크랩북을 하나의 페이지에 조합하여     ║
// ║    표시하는 마이페이지 대시보드.                                             ║
// ║                                                                          ║
// ║  데이터 흐름:                                                              ║
// ║    getCurrentUser()                                                       ║
// ║      ├─ getFields()                    → interestedFieldNames 계산        ║
// ║      ├─ getDepartments()               → deptName 계산                    ║
// ║      └─ getSeniorById(scrapedIds[])    → scrapedSeniors 배열              ║
// ║    → ProfileSection / CalendarSection / ScrapbookSection 에 Props 전달    ║
// ║                                                                          ║
// ║  의존성:                                                                  ║
// ║    - @/services/user      : getCurrentUser                               ║
// ║    - @/services/roadmap   : getFields, getDepartments                    ║
// ║    - @/services/seniors   : getSeniorById                                ║
// ║    - ProfileSection       : 프로필 카드 컴포넌트                            ║
// ║    - CalendarSection      : 달력 + 이벤트 컴포넌트                          ║
// ║    - ScrapbookSection     : 스크랩한 선배/로드맵 표시 컴포넌트               ║
// ╚══════════════════════════════════════════════════════════════════════════╝

"use client";

// React 훅 — 상태 관리 및 사이드 이펙트
import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
// 현재 로그인한 사용자 정보 조회 API
import { getCurrentUser } from "@/services/user";
// 관심 분야 목록, 학과 목록 조회 API
import { getFields, getDepartments } from "@/services/roadmap";
// 스크랩한 선배 단건 조회 API
import { getSeniorById } from "@/services/seniors";
// 타입 정의
import type { User, Field, Senior, Department } from "@/types";
// 하위 컴포넌트들
import ProfileSection from "./_components/ProfileSection";
import CalendarSection from "./_components/CalendarSection";
import ScrapbookSection from "./_components/ScrapbookSection";

// ── 인라인 스타일 상수 ─────────────────────────────────────────────────────

/** 페이지 전체 래퍼 — 세로 방향 flex, Roboto 폰트 */
const pageStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  fontFamily: "var(--font-roboto), sans-serif",
};

/** 페이지 메인 타이틀 스타일 */
const titleStyle: CSSProperties = {
  fontSize: "32px",
  fontWeight: 700,
  color: "#1F1A1A",
};

/** 상단 행 — ProfileSection(좌) + CalendarSection(우) 가로 배치 */
const topRowStyle: CSSProperties = {
  display: "flex",
  gap: "24px",
  alignItems: "stretch",  // 두 카드의 높이를 맞춤
};

// ── 컴포넌트 ──────────────────────────────────────────────────────────────

/**
 * MyPage
 *
 * 마이페이지 메인 컴포넌트.
 * 로그인 사용자 데이터를 로드하고 ProfileSection, CalendarSection,
 * ScrapbookSection에 Props로 전달한다.
 */
export default function MyPage() {
  // user: 현재 로그인한 사용자 정보 (로딩 전 null)
  const [user, setUser]               = useState<User | null>(null);
  // fields: 전체 관심 분야 목록 — user.interestedFields(ID 배열)를 이름으로 변환하는 데 사용
  const [fields, setFields]           = useState<Field[]>([]);
  // departments: 전체 학과 목록 — user.departmentId를 이름으로 변환하는 데 사용
  const [departments, setDepartments] = useState<Department[]>([]);
  // scrapedSeniors: 사용자가 스크랩한 선배 상세 데이터 배열
  const [scrapedSeniors, setScrapedSeniors] = useState<Senior[]>([]);

  // ── 초기 데이터 로드 ──
  // 컴포넌트 마운트 시 1회 실행
  useEffect(() => {
    getCurrentUser().then(async (u) => {
      setUser(u);
      // 사용자 데이터를 얻은 후 병렬로 부가 데이터 로드 (성능 최적화)
      const [f, depts, seniors] = await Promise.all([
        getFields(),        // 전체 관심 분야 목록
        getDepartments(),   // 전체 학과 목록
        // 스크랩한 선배 ID: 백엔드 + localStorage 즐겨찾기 병합 (중복 제거)
        (() => {
          const localIds: string[] = (() => { try { return JSON.parse(localStorage.getItem("starred_senior_ids") ?? "[]"); } catch { return []; } })();
          const merged = [...new Set([...u.scrapedSeniorIds, ...localIds])];
          return Promise.all(merged.map((id) => getSeniorById(id)));
        })(),
      ]);
      setFields(f);
      setDepartments(depts);
      setScrapedSeniors(seniors.filter((s): s is Senior => s !== null));
    });
  }, []);

  // 사용자 데이터가 없으면 아무것도 렌더하지 않음 (로딩 중 빈 화면)
  if (!user) return null;

  // ── 파생 데이터 계산 ──

  // user.interestedFields(ID 배열)를 fields 목록에서 name 배열로 변환
  // ProfileSection에서 태그로 표시됨
  const interestedFieldNames = fields
    .filter((f) => user.interestedFields.includes(f.id))
    .map((f) => f.name);

  const deptName = departments.find((d) => d.id === user.department)?.name ?? "";

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>마이페이지</h1>

      {/* 상단 행: 프로필 카드(좌) + 달력(우) */}
      <div style={topRowStyle}>
        {/* ProfileSection: 아바타, 이름, 학과, 관심 분야, 프로필 수정 링크 */}
        <ProfileSection user={user} interestedFieldNames={interestedFieldNames} deptName={deptName} />
        {/* CalendarSection: 월간 달력 + 다음 이벤트 카드 (고정 높이 맞춤) */}
        <CalendarSection />
      </div>

      {/* 스크랩북 섹션: 친한 선배 + 저장한 로드맵 */}
      <ScrapbookSection scrapedSeniors={scrapedSeniors} />
    </div>
  );
}
